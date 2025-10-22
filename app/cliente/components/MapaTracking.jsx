"use client"
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useEffect, useRef } from 'react'
import { Warehouse, MapPin, Truck } from 'lucide-react'
import { renderToStaticMarkup } from 'react-dom/server'

// Configurar el icono por defecto de Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

export default function MapaTracking({ envio }) {
  const mapRef = useRef(null)
  const wrapperRef = useRef(null)

  console.log('MapaTracking - Envío recibido:', envio)
  console.log('MapaTracking - Seguimientos:', envio.seguimientos)

  // Función para crear iconos personalizados
  const makeLucideIcon = (IconComp, { strokeColor = '#1f2937', bgColor = 'white', borderColor = 'gray', size = 24 } = {}) => {
    const svg = renderToStaticMarkup(
      <IconComp size={size} color={strokeColor} strokeWidth={2.5} />
    )
    return L.divIcon({
      html: `<div style="display:flex;align-items:center;justify-content:center;width:38px;height:38px;border:2px solid ${borderColor};background:${bgColor};border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${svg}</div>`,
      className: '', // Clase vacía para evitar estilos por defecto
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -38],
    })
  }

  // Iconos personalizados
  const origenIcon = makeLucideIcon(Warehouse, { strokeColor: '#10b981', bgColor: '#ffffff', borderColor: '#10b981', size: 22 })
  const destinoIcon = makeLucideIcon(Warehouse, { strokeColor: '#ef4444', bgColor: '#ffffff', borderColor: '#ef4444', size: 22 })
  const camionIcon = makeLucideIcon(Truck, { strokeColor: '#f59e0b', bgColor: '#ffffff', borderColor: '#f59e0b', size: 24 })
  const puntoIcon = makeLucideIcon(MapPin, { strokeColor: '#6366f1', bgColor: '#ffffff', borderColor: '#6366f1', size: 18 })

  // Obtener coordenadas
  const getCoords = (hospital) => {
    if (!hospital?.ubicacion) return null
    const lat = parseFloat(hospital.ubicacion.lat || hospital.ubicacion.latitud)
    const lng = parseFloat(hospital.ubicacion.lng || hospital.ubicacion.longitud)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
    return [lat, lng]
  }

  // Coordenadas de origen y destino
  const origenCoords = getCoords(envio.origen_hospital || envio.origen_sede)
  const destinoCoords = getCoords(envio.destino_hospital || envio.destino_sede)

  console.log('Origen coords:', origenCoords)
  console.log('Destino coords:', destinoCoords)

  // Función auxiliar para extraer coordenadas de un seguimiento
  const getCoordsFromSeguimiento = (seg) => {
    let lat, lng
    
    // Soportar nuevo formato con objeto ubicacion
    if (seg.ubicacion && typeof seg.ubicacion === 'object') {
      lat = parseFloat(seg.ubicacion.lat || seg.ubicacion.latitud)
      lng = parseFloat(seg.ubicacion.lng || seg.ubicacion.longitud)
    }
    // Soportar formato antiguo con latitud/longitud directas
    else if (seg.latitud && seg.longitud) {
      lat = parseFloat(seg.latitud)
      lng = parseFloat(seg.longitud)
    }
    
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return [lat, lng]
    }
    return null
  }

  // Obtener todos los seguimientos con ubicación válida
  const seguimientosConUbicacion = envio.seguimientos
    ?.map(seg => ({
      seg,
      coords: getCoordsFromSeguimiento(seg)
    }))
    .filter(item => item.coords !== null) || []

  // El último seguimiento con ubicación es donde está el camión
  const ultimoConUbicacion = seguimientosConUbicacion.length > 0 
    ? seguimientosConUbicacion[seguimientosConUbicacion.length - 1]
    : null

  const camionCoords = ultimoConUbicacion?.coords || null
  const ultimoSeguimiento = ultimoConUbicacion?.seg || null

  // Puntos de seguimiento intermedios (todos excepto el último con ubicación)
  const puntosIntermedios = seguimientosConUbicacion.slice(0, -1)

  // Si no hay coordenadas del camión, usar origen como fallback
  const camionCoordsDisplay = camionCoords || origenCoords

  // Ruta para la polilínea
  const rutaCoords = []
  if (origenCoords) rutaCoords.push(origenCoords)
  puntosIntermedios.forEach(p => rutaCoords.push(p.coords))
  if (camionCoords && camionCoords !== origenCoords) rutaCoords.push(camionCoords)
  if (destinoCoords) rutaCoords.push(destinoCoords)

  // Centro del mapa (por defecto Venezuela)
  const defaultCenter = [8.530260, -66.246810]
  const center = origenCoords || camionCoordsDisplay || defaultCenter

  // Componente para ajustar el mapa a los bounds
  function FitBounds() {
    const map = useMap()
    
    useEffect(() => {
      mapRef.current = map
      
      // Ajustar el mapa a todos los marcadores
      const allCoords = []
      if (origenCoords) allCoords.push(origenCoords)
      if (destinoCoords) allCoords.push(destinoCoords)
      if (camionCoordsDisplay) allCoords.push(camionCoordsDisplay)
      puntosIntermedios.forEach(p => allCoords.push(p.coords))

      if (allCoords.length > 0) {
        try {
          const bounds = L.latLngBounds(allCoords)
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 })
        } catch (e) {
          console.error('Error ajustando bounds:', e)
        }
      }

      // Invalidar tamaño del mapa
      setTimeout(() => {
        try {
          map.invalidateSize()
        } catch (e) {
          console.error('Error invalidando tamaño:', e)
        }
      }, 100)

      // Listener para resize
      const handleResize = () => {
        try {
          map.invalidateSize()
        } catch (e) {}
      }
      window.addEventListener('resize', handleResize)

      // Observer para cambios de tamaño
      let observer
      if (wrapperRef.current && typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver(() => {
          try {
            map.invalidateSize()
          } catch (e) {}
        })
        observer.observe(wrapperRef.current)
      }

      return () => {
        window.removeEventListener('resize', handleResize)
        if (observer) observer.disconnect()
      }
    }, [map])

    return null
  }

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Si no hay coordenadas, mostrar mensaje
  if (!origenCoords && !destinoCoords && !camionCoords) {
    return (
      <div ref={wrapperRef} style={{ height: '100%', width: '100%', position: 'relative' }} className="flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center p-8">
          <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay coordenadas GPS disponibles</h3>
          <p className="text-sm text-gray-600">
            Este envío no tiene información de ubicación registrada.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Las ubicaciones de origen y destino no tienen coordenadas GPS configuradas.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div ref={wrapperRef} style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer 
        center={center} 
        zoom={8} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
        preferCanvas={false}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds />

        {/* Marcador de Origen */}
        {origenCoords && (
          <Marker position={origenCoords} icon={origenIcon}>
            <Popup>
              <div className="text-sm">
                <h3 className="font-bold text-green-700 mb-1">📍 Origen</h3>
                <p className="font-semibold">{envio.origen}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Fecha de despacho: {formatDate(envio.fechaEnvio)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marcador de Destino */}
        {destinoCoords && (
          <Marker position={destinoCoords} icon={destinoIcon}>
            <Popup>
              <div className="text-sm">
                <h3 className="font-bold text-red-700 mb-1">🎯 Destino</h3>
                <p className="font-semibold">{envio.destino}</p>
                {envio.fechaEstimada && (
                  <p className="text-xs text-gray-600 mt-1">
                    Estimado: {formatDate(envio.fechaEstimada)}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marcador del Camión (ubicación actual) */}
        {camionCoordsDisplay && (
          <Marker position={camionCoordsDisplay} icon={camionIcon} zIndexOffset={1000}>
            <Popup>
              <div className="text-sm">
                <h3 className="font-bold text-orange-600 mb-1">🚚 Ubicación Actual</h3>
                <p className="font-semibold">{envio.transportista}</p>
                <p className="text-xs text-gray-700 mt-1">
                  {ultimoSeguimiento?.ubicacion 
                    ? (typeof ultimoSeguimiento.ubicacion === 'object' 
                        ? (ultimoSeguimiento.ubicacion.direccion || `Lat: ${ultimoSeguimiento.ubicacion.lat}, Lng: ${ultimoSeguimiento.ubicacion.lng}`)
                        : ultimoSeguimiento.ubicacion)
                    : 'En tránsito'}
                </p>
                {ultimoSeguimiento?.observaciones && (
                  <p className="text-xs text-gray-600 mt-1">
                    {ultimoSeguimiento.observaciones}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Actualizado: {formatDate(ultimoSeguimiento?.created_at)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Puntos de seguimiento intermedios */}
        {puntosIntermedios.map((punto, idx) => (
          <Marker key={idx} position={punto.coords} icon={puntoIcon}>
            <Popup>
              <div className="text-xs">
                <h3 className="font-bold text-indigo-700 mb-1">📌 Punto de Seguimiento #{idx + 1}</h3>
                <p className="text-gray-700">
                  {punto.seg.ubicacion 
                    ? (typeof punto.seg.ubicacion === 'object' 
                        ? (punto.seg.ubicacion.direccion || `Lat: ${punto.seg.ubicacion.lat}, Lng: ${punto.seg.ubicacion.lng}`)
                        : punto.seg.ubicacion)
                    : 'Ubicación no especificada'}
                </p>
                {punto.seg.observaciones && (
                  <p className="text-gray-600 mt-1">{punto.seg.observaciones}</p>
                )}
                <p className="text-gray-500 mt-1">{formatDate(punto.seg.created_at)}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Polilínea de la ruta */}
        {rutaCoords.length > 1 && (
          <Polyline 
            positions={rutaCoords} 
            pathOptions={{ 
              color: '#3b82f6', 
              weight: 3, 
              opacity: 0.7,
              dashArray: '10, 10'
            }} 
          />
        )}
      </MapContainer>

      {/* Leyenda del mapa - compacta */}
      <div className="absolute bottom-2 left-2 bg-white/95 rounded-lg shadow-lg p-2 text-[10px] z-[1000]">
        <div className="font-bold text-gray-800 mb-1.5 text-xs">Leyenda</div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 border border-green-600"></div>
            <span className="text-gray-700">Origen</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 border border-red-600"></div>
            <span className="text-gray-700">Destino</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500 border border-orange-600"></div>
            <span className="text-gray-700">Actual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 border border-indigo-600"></div>
            <span className="text-gray-700">Puntos</span>
          </div>
        </div>
      </div>

      {/* Info de última actualización - compacta */}
      {ultimoSeguimiento && (
        <div className="absolute top-2 right-2 bg-white/95 rounded-lg shadow-lg p-2 max-w-[200px] z-[1000]">
          <div className="flex items-start gap-1.5">
            <MapPin className="h-3 w-3 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-gray-800 text-[10px]">Última Ubicación</div>
              <div className="text-[10px] text-gray-600 mt-0.5 line-clamp-2">
                {ultimoSeguimiento.ubicacion 
                  ? (typeof ultimoSeguimiento.ubicacion === 'object' 
                      ? (ultimoSeguimiento.ubicacion.direccion || `Lat: ${ultimoSeguimiento.ubicacion.lat}, Lng: ${ultimoSeguimiento.ubicacion.lng}`)
                      : ultimoSeguimiento.ubicacion)
                  : 'No especificada'}
              </div>
              {ultimoSeguimiento.observaciones && (
                <div className="text-[9px] text-gray-500 mt-0.5 line-clamp-1">
                  {ultimoSeguimiento.observaciones}
                </div>
              )}
              <div className="text-[9px] text-gray-400 mt-0.5">
                {formatDate(ultimoSeguimiento.created_at)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
