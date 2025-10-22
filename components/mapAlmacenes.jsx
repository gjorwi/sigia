"use client"
import 'leaflet/dist/leaflet.css'
import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'
import { useMap } from 'react-leaflet/hooks'
import { Marker } from 'react-leaflet/Marker'
import { Polyline } from 'react-leaflet/Polyline'
import { Popup } from 'react-leaflet/Popup'
import L from 'leaflet'
import { useEffect, useRef, useState } from 'react'
import { Warehouse, MapPin, Route } from 'lucide-react'
import { renderToStaticMarkup } from 'react-dom/server'
import { useMapEvents } from 'react-leaflet/hooks'
import LoadingSpinner from '@/components/LoadingSpinner'

// Configurar el icono por defecto de Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

export default function MapAlmacenes({almacenes}) {
  const [loading, setLoading] = useState(true)
  const wrapperRef = useRef(null)
  const mapRef = useRef(null)
  const [start] = useState([8.530260, -66.246810]) // Caracas por defecto
  const DEFAULT_ZOOM = 6
  const [filteredAlmacenes, setFilteredAlmacenes] = useState([])

  useEffect(() => {
    if (almacenes && almacenes.length > 0) {
      const toNumber = (v) => {
        if (v == null) return NaN
        if (typeof v === 'number') return v
        if (typeof v === 'string') return parseFloat(v.replace(',', '.'))
        return NaN
      }

      const inVenezuela = (lat, lng) => lat >= 0 && lat <= 15 && lng <= -59 && lng >= -75

      const norm = almacenes
        .map(a => {
          let lat = toNumber(a?.ubicacion?.lat ?? a?.ubicacion?.latitud)
          let lng = toNumber(a?.ubicacion?.lng ?? a?.ubicacion?.longitud)
          console.log('lat: '+lat+', lng: '+lng)
          // Si no es válido, descartar
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

          // Si parece invertido (lat fuera de rango o swap mejora), intentamos swap
          if (Math.abs(lat) > 90 || (Math.abs(lng) <= 90 && Math.abs(lat) > 90)) {
            const t = lat; lat = lng; lng = t
          }
          // Heurística: si no cae en VE pero al invertir sí, invertimos
          if (!inVenezuela(lat, lng) && inVenezuela(lng, lat)) {
            const t = lat; lat = lng; lng = t
          }

          return { ...a, _lat: lat, _lng: lng }
        })
        .filter(a => Number.isFinite(a?._lat) && Number.isFinite(a?._lng))
      setLoading(false)
      setFilteredAlmacenes(norm)

      // Enfocar el mapa a los marcadores disponibles sin exceder el zoom por defecto
      try {
        if (mapRef.current && norm.length > 0) {
          const bounds = L.latLngBounds(norm.map(a => [a._lat, a._lng]))
          const padding = L.point(30, 30)
          // Calcular el zoom ideal para los bounds
          let targetZoom
          try {
            // getBoundsZoom(bounds, inside=false, padding)
            targetZoom = mapRef.current.getBoundsZoom(bounds, false, padding)
          } catch { targetZoom = DEFAULT_ZOOM }
          // No exceder el zoom por defecto
          const zoom = Math.min(targetZoom ?? DEFAULT_ZOOM, DEFAULT_ZOOM)
          const center = bounds.getCenter()
          mapRef.current.setView(center, zoom, { animate: true })
        }
      } catch {}
    } else {
      setLoading(false)
      setFilteredAlmacenes([])
    }
  }, [almacenes])

  // Genera un icono de almacén con colores dinámicos
  const makeWarehouseIcon = (strokeColor = '#1f2937', bgColor = 'white', borderColor = 'gray') => {
    const svg = renderToStaticMarkup(
      <Warehouse size={18} color={strokeColor} strokeWidth={2.2} />
    )
    return L.divIcon({
      html: `<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border:1px solid ${borderColor};background:${bgColor};border-radius:100px;box-shadow:0 1px 3px rgba(0,0,0,0.25)">${svg}</div>`,
      className: 'lucide-warehouse-icon',
      iconSize: [20, 20],
      iconAnchor: [16, 28],
      popupAnchor: [0, -28],
    })
  }
  // Genera un icono genérico de Lucide para markers (por ejemplo destino y punto medio)
  const makeLucideIcon = (IconComp, { strokeColor = '#1f2937', bgColor = 'white', borderColor = 'gray', size = 22 } = {}) => {
    const svg = renderToStaticMarkup(
      <IconComp size={size} color={strokeColor} strokeWidth={2.2} />
    )
    return L.divIcon({
      html: `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border:1px solid ${borderColor};background:${bgColor};border-radius:9999px;box-shadow:0 1px 3px rgba(0,0,0,0.25)">${svg}</div>`,
      className: 'lucide-generic-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 28],
      popupAnchor: [0, -28],
    })
  }
  function InvalidateSizeOnMount() {
    const map = useMap()
    useEffect(() => {
      // guardar ref al mapa
      mapRef.current = map
      // Función segura para invalidar tamaño evitando errores de Leaflet
      const invalidateSafely = () => {
        try {
          const panes = typeof map.getPanes === 'function' ? map.getPanes() : null
          const pane = panes?.mapPane || map._mapPane
          if (!pane || !pane._leaflet_pos) {
            // Si aún no está posicionado, intenta en el próximo frame
            requestAnimationFrame(() => {
              try {
                const p2 = (typeof map.getPanes === 'function' ? map.getPanes() : null)?.mapPane || map._mapPane
                if (!p2 || !p2._leaflet_pos) return
                map.invalidateSize()
              } catch {}
            })
            return
          }
          map.invalidateSize()
        } catch {}
      }

      // Recalcular tamaño una vez que el contenedor esté renderizado
      setTimeout(invalidateSafely, 0)

      // Recalcular al redimensionar ventana
      const onResize = () => invalidateSafely()
      window.addEventListener('resize', onResize)

      // Observar cambios de tamaño del contenedor
      let observer
      if (wrapperRef.current && typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver(() => {
          invalidateSafely()
        })
        observer.observe(wrapperRef.current)
      }

      return () => {
        window.removeEventListener('resize', onResize)
        if (observer) observer.disconnect()
      }
    }, [map])
    return null
  }

  return (
    <div ref={wrapperRef} style={{ height: '60vh', width: '100%', position: 'relative' }}>
      <MapContainer center={start} zoom={DEFAULT_ZOOM} maxZoom={14} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <InvalidateSizeOnMount />
        {/* Origen */}
        {filteredAlmacenes && filteredAlmacenes.map((almacen) => (
          <Marker key={almacen?.id || `${almacen?._lat},${almacen?._lng}`} position={[almacen._lat, almacen._lng]} icon={makeWarehouseIcon((almacen?.dependencia&&almacen?.dependencia.toLowerCase() === 'ivss' ? '#2563eb' : '#D93850'), '#ffffff','gray')}>
            <Popup>
              <div className='text-xs'>
                <h2 className='text-lg font-bold'>{almacen?.nombre}</h2>
                Correo: <span className='text-green-600'>{almacen?.email}</span>
                <p>Dependencia: {almacen?.dependencia}</p>
                <p>Tipo: {almacen?.tipo}</p>
                Director: <span className='text-green-600'>{almacen?.nombre_contacto}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {(!almacenes || (Array.isArray(almacenes) && almacenes.length === 0)) && (
        <div aria-live="polite" style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.6)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <LoadingSpinner />
            <span className="text-sm text-gray-600">Cargando hospitales...</span>
          </div>
        </div>
      )}
    </div>
  );
}