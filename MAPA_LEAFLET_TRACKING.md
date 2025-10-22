# Integración de Mapa Real con Leaflet en Tracking

## Resumen
Se ha reemplazado el mapa SVG simulado por un mapa interactivo real usando **Leaflet** y **React-Leaflet**, mostrando ubicaciones GPS reales de origen, destino y seguimientos del envío.

## Componentes Creados

### 1. **MapaTracking.jsx**
Componente dedicado para el mapa de seguimiento con Leaflet.

**Ubicación**: `app/cliente/components/MapaTracking.jsx`

#### Características Principales

##### **Importación Dinámica**
```javascript
// En Tracking.jsx
const MapaTracking = dynamic(() => import('./MapaTracking'), { 
  ssr: false,  // Desactiva Server-Side Rendering
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-gray-600">Cargando mapa...</div>
    </div>
  )
});
```

**Razón**: Leaflet no es compatible con SSR (Server-Side Rendering) de Next.js. La importación dinámica con `ssr: false` evita errores.

##### **Iconos Personalizados con Lucide**
```javascript
const makeLucideIcon = (IconComp, { strokeColor, bgColor, borderColor, size }) => {
  const svg = renderToStaticMarkup(
    <IconComp size={size} color={strokeColor} strokeWidth={2.5} />
  )
  return L.divIcon({
    html: `<div style="...border:2px solid ${borderColor};background:${bgColor}...">${svg}</div>`,
    className: 'lucide-custom-icon',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  })
}
```

**Iconos Creados**:
- 🏭 **Origen**: `Warehouse` verde (`#10b981`)
- 🏭 **Destino**: `Warehouse` rojo (`#ef4444`)
- 🚚 **Camión**: `Truck` naranja (`#f59e0b`)
- 📍 **Puntos**: `MapPin` índigo (`#6366f1`)

##### **Extracción de Coordenadas**
```javascript
const getCoords = (hospital) => {
  if (!hospital?.ubicacion) return null
  const lat = parseFloat(hospital.ubicacion.lat || hospital.ubicacion.latitud)
  const lng = parseFloat(hospital.ubicacion.lng || hospital.ubicacion.longitud)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return [lat, lng]
}
```

**Soporta múltiples formatos**:
- `ubicacion.lat` / `ubicacion.lng`
- `ubicacion.latitud` / `ubicacion.longitud`

##### **Lógica de Ubicación del Camión**
```javascript
// 1. Obtener último seguimiento
const ultimoSeguimiento = envio.seguimientos?.[envio.seguimientos.length - 1]

// 2. Extraer coordenadas GPS
let camionCoords = null
if (ultimoSeguimiento?.latitud && ultimoSeguimiento?.longitud) {
  const lat = parseFloat(ultimoSeguimiento.latitud)
  const lng = parseFloat(ultimoSeguimiento.longitud)
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    camionCoords = [lat, lng]
  }
}

// 3. Fallback: Si no hay GPS, usar origen
if (!camionCoords && origenCoords) {
  camionCoords = origenCoords
}
```

##### **Puntos de Seguimiento Intermedios**
```javascript
const puntosIntermedios = envio.seguimientos
  ?.filter((seg, idx) => idx !== envio.seguimientos.length - 1) // Excluir último
  ?.map(seg => {
    const lat = parseFloat(seg.latitud)
    const lng = parseFloat(seg.longitud)
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { coords: [lat, lng], seg }
    }
    return null
  })
  .filter(Boolean) || []
```

**Comportamiento**:
- Filtra el último seguimiento (ya mostrado como camión)
- Solo incluye seguimientos con coordenadas GPS válidas
- Cada punto muestra popup con detalles

##### **Polilínea de Ruta**
```javascript
const rutaCoords = []
if (origenCoords) rutaCoords.push(origenCoords)
puntosIntermedios.forEach(p => rutaCoords.push(p.coords))
if (camionCoords && camionCoords !== origenCoords) rutaCoords.push(camionCoords)
if (destinoCoords) rutaCoords.push(destinoCoords)

<Polyline 
  positions={rutaCoords} 
  pathOptions={{ 
    color: '#3b82f6', 
    weight: 3, 
    opacity: 0.7,
    dashArray: '10, 10'  // Línea punteada
  }} 
/>
```

**Conecta**:
1. Origen
2. Puntos intermedios (en orden)
3. Ubicación actual del camión
4. Destino

##### **Ajuste Automático de Bounds**
```javascript
function FitBounds() {
  const map = useMap()
  
  useEffect(() => {
    const allCoords = []
    if (origenCoords) allCoords.push(origenCoords)
    if (destinoCoords) allCoords.push(destinoCoords)
    if (camionCoords) allCoords.push(camionCoords)
    puntosIntermedios.forEach(p => allCoords.push(p.coords))

    if (allCoords.length > 0) {
      const bounds = L.latLngBounds(allCoords)
      map.fitBounds(bounds, { 
        padding: [50, 50],  // Margen de 50px
        maxZoom: 13         // No hacer zoom excesivo
      })
    }
  }, [map])
  
  return null
}
```

**Funcionalidad**:
- Calcula el área que contiene todos los marcadores
- Ajusta el zoom y centro automáticamente
- Mantiene margen visual de 50px
- Limita zoom máximo a 13 para no acercarse demasiado

##### **Popups Informativos**

**Origen**:
```javascript
<Popup>
  <div className="text-sm">
    <h3 className="font-bold text-green-700 mb-1">📍 Origen</h3>
    <p className="font-semibold">{envio.origen}</p>
    <p className="text-xs text-gray-600 mt-1">
      Fecha de despacho: {formatDate(envio.fechaEnvio)}
    </p>
  </div>
</Popup>
```

**Destino**:
```javascript
<Popup>
  <div className="text-sm">
    <h3 className="font-bold text-red-700 mb-1">🎯 Destino</h3>
    <p className="font-semibold">{envio.destino}</p>
    <p className="text-xs text-gray-600 mt-1">
      Estimado: {formatDate(envio.fechaEstimada)}
    </p>
  </div>
</Popup>
```

**Camión**:
```javascript
<Popup>
  <div className="text-sm">
    <h3 className="font-bold text-orange-600 mb-1">🚚 Ubicación Actual</h3>
    <p className="font-semibold">{envio.transportista}</p>
    <p className="text-xs text-gray-700 mt-1">
      {ultimoSeguimiento?.ubicacion || 'En tránsito'}
    </p>
    <p className="text-xs text-gray-600 mt-1">
      {ultimoSeguimiento?.observaciones}
    </p>
    <p className="text-xs text-gray-500 mt-1">
      Actualizado: {formatDate(ultimoSeguimiento?.created_at)}
    </p>
  </div>
</Popup>
```

**Puntos Intermedios**:
```javascript
<Popup>
  <div className="text-xs">
    <h3 className="font-bold text-indigo-700 mb-1">
      📌 Punto de Seguimiento #{idx + 1}
    </h3>
    <p className="text-gray-700">{punto.seg.ubicacion}</p>
    <p className="text-gray-600 mt-1">{punto.seg.observaciones}</p>
    <p className="text-gray-500 mt-1">{formatDate(punto.seg.created_at)}</p>
  </div>
</Popup>
```

##### **Paneles Flotantes**

**Leyenda (inferior izquierda)**:
```javascript
<div className="absolute bottom-4 left-4 bg-white/95 rounded-lg shadow-lg p-3 text-xs z-[1000]">
  <div className="font-semibold text-gray-800 mb-2">Leyenda</div>
  <div className="space-y-1.5">
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-600"></div>
      <span className="text-gray-700">Origen</span>
    </div>
    {/* ... más items */}
  </div>
</div>
```

**Última Ubicación (superior derecha)**:
```javascript
<div className="absolute top-4 right-4 bg-white/95 rounded-lg shadow-lg p-3 max-w-xs z-[1000]">
  <div className="flex items-start gap-2">
    <MapPin className="h-4 w-4 text-orange-500" />
    <div>
      <div className="font-semibold text-gray-800 text-sm">Última Ubicación</div>
      <div className="text-xs text-gray-600 mt-1">
        {ultimoSeguimiento.ubicacion}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {ultimoSeguimiento.observaciones}
      </div>
      <div className="text-xs text-gray-400 mt-1">
        {formatDate(ultimoSeguimiento.created_at)}
      </div>
    </div>
  </div>
</div>
```

**z-index**: `z-[1000]` para estar sobre el mapa de Leaflet (que usa z-index 400-600)

## Integración en Tracking.jsx

### 1. **Importación Dinámica**
```javascript
import dynamic from 'next/dynamic';

const MapaTracking = dynamic(() => import('./MapaTracking'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-gray-600">Cargando mapa...</div>
    </div>
  )
});
```

### 2. **Datos Adicionales en Transformación**
```javascript
return {
  // ... campos existentes
  // Datos completos para el mapa
  origen_hospital: movimiento.origen_hospital,
  origen_sede: movimiento.origen_sede,
  destino_hospital: movimiento.destino_hospital,
  destino_sede: movimiento.destino_sede
};
```

**Incluye**:
- Objetos completos de hospitales/sedes
- Con sus ubicaciones GPS
- Necesarios para el componente MapaTracking

### 3. **Reemplazo del SVG por Leaflet**
```javascript
// ANTES: SVG simulado con 200+ líneas
<div className="bg-gray-200 rounded-lg flex-1 relative overflow-hidden min-h-[400px]">
  <svg>...</svg>
</div>

// AHORA: Componente Leaflet
<div className="rounded-lg flex-1 relative overflow-hidden min-h-[500px]">
  <MapaTracking envio={envioActual} />
</div>
```

## Estructura de Datos Esperada

### Envío (`envioActual`)
```javascript
{
  id: "MOV-123",
  origen: "Hospital Central",
  destino: "Hospital Regional",
  fechaEnvio: "2025-10-15T08:00:00",
  fechaEstimada: "2025-10-15T12:00:00",
  estado: "en_camino",
  transportista: "Juan Pérez",
  items: 500,
  
  // Objetos completos con ubicaciones
  origen_hospital: {
    id: 1,
    nombre: "Hospital Central",
    ubicacion: {
      lat: 10.4806,
      lng: -66.9036
    }
  },
  destino_hospital: {
    id: 2,
    nombre: "Hospital Regional",
    ubicacion: {
      lat: 10.2513,
      lng: -67.5958
    }
  },
  
  // Seguimientos con GPS
  seguimientos: [
    {
      id: 1,
      latitud: 10.4806,
      longitud: -66.9036,
      ubicacion: "Av. Principal",
      observaciones: "Salida del origen",
      created_at: "2025-10-15T08:00:00",
      despachador: {
        nombre: "Juan Pérez"
      }
    },
    {
      id: 2,
      latitud: 10.3660,
      longitud: -67.2495,
      ubicacion: "Autopista Centro-Occidental",
      observaciones: "En ruta",
      created_at: "2025-10-15T10:00:00"
    }
  ]
}
```

### Formato de Ubicación Soportado
```javascript
// Opción 1
ubicacion: {
  lat: 10.4806,
  lng: -66.9036
}

// Opción 2
ubicacion: {
  latitud: 10.4806,
  longitud: -66.9036
}
```

## Dependencias

### package.json
```json
{
  "dependencies": {
    "leaflet": "^1.9.4",
    "react-leaflet": "^5.0.0",
    "lucide-react": "^0.525.0",
    "next": "15.3.4",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

### CSS de Leaflet
```javascript
import 'leaflet/dist/leaflet.css'
```

**Importante**: Debe importarse en el componente que usa Leaflet.

## Características del Mapa

### 1. **Tiles de OpenStreetMap**
```javascript
<TileLayer
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
/>
```

**Gratis y sin API key requerida**

### 2. **Controles Interactivos**
- **Zoom**: Botones +/- y scroll del mouse
- **Pan**: Arrastrar el mapa
- **Popups**: Click en marcadores
- **Responsive**: Se adapta al tamaño del contenedor

### 3. **Invalidación de Tamaño**
```javascript
useEffect(() => {
  setTimeout(() => map.invalidateSize(), 100)
  
  window.addEventListener('resize', () => map.invalidateSize())
  
  const observer = new ResizeObserver(() => map.invalidateSize())
  observer.observe(wrapperRef.current)
}, [map])
```

**Previene problemas de renderizado** cuando el mapa se carga en un modal o contenedor dinámico.

## Casos de Uso

### Caso 1: Envío con GPS Completo
```javascript
// Origen, destino y seguimientos tienen coordenadas
✅ Muestra todos los marcadores
✅ Traza ruta completa
✅ Ajusta bounds automáticamente
```

### Caso 2: Envío sin GPS en Seguimientos
```javascript
// Solo origen y destino tienen coordenadas
✅ Muestra origen y destino
✅ Camión en origen (fallback)
✅ Línea directa entre origen-destino
⚠️ No muestra puntos intermedios
```

### Caso 3: Envío sin Coordenadas
```javascript
// Ninguna ubicación tiene GPS
✅ Mapa centrado en Venezuela (default)
⚠️ No muestra marcadores
⚠️ Mensaje: "No hay coordenadas disponibles"
```

### Caso 4: Coordenadas Parciales
```javascript
// Algunos seguimientos tienen GPS, otros no
✅ Muestra solo los que tienen coordenadas
✅ Ruta conecta puntos disponibles
✅ Ajusta bounds a puntos existentes
```

## Mejoras Implementadas vs SVG

| Característica | SVG Simulado | Leaflet Real |
|----------------|--------------|--------------|
| **Ubicaciones** | Simuladas (%) | GPS reales |
| **Interactividad** | Ninguna | Zoom, pan, popups |
| **Precisión** | Aproximada | Exacta |
| **Tiles** | Gradiente estático | OpenStreetMap |
| **Ruta** | Línea recta | Puntos GPS reales |
| **Escalabilidad** | Limitada | Ilimitada |
| **Información** | Texto fijo | Popups dinámicos |

## Problemas Conocidos y Soluciones

### 1. **Error: "window is not defined"**
**Causa**: Leaflet intenta acceder a `window` en SSR

**Solución**:
```javascript
const MapaTracking = dynamic(() => import('./MapaTracking'), { 
  ssr: false  // ✅ Desactiva SSR
});
```

### 2. **Iconos por defecto no cargan**
**Causa**: Webpack no encuentra las imágenes de Leaflet

**Solución**:
```javascript
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})
```

### 3. **Mapa no se renderiza correctamente**
**Causa**: Contenedor no tiene tamaño definido

**Solución**:
```javascript
<div style={{ height: '100%', width: '100%' }}>
  <MapContainer style={{ height: '100%', width: '100%' }}>
```

### 4. **Tiles grises o no cargan**
**Causa**: Mapa se inicializa antes de que el contenedor esté visible

**Solución**:
```javascript
setTimeout(() => map.invalidateSize(), 100)
```

### 5. **z-index de paneles flotantes**
**Causa**: Leaflet usa z-index alto para sus controles

**Solución**:
```javascript
className="... z-[1000]"  // Mayor que z-index de Leaflet (600)
```

## Testing

### Verificación Visual
1. ✅ Abrir modal de mapa
2. ✅ Ver marcadores de origen (verde) y destino (rojo)
3. ✅ Ver marcador de camión (naranja) en última ubicación
4. ✅ Ver puntos intermedios (índigo) si hay seguimientos
5. ✅ Ver línea punteada conectando todos los puntos
6. ✅ Hacer zoom in/out
7. ✅ Arrastrar el mapa (pan)
8. ✅ Click en marcadores para ver popups
9. ✅ Verificar leyenda inferior izquierda
10. ✅ Verificar panel de última ubicación superior derecha

### Comandos de Debug
```javascript
console.log('Envío:', envioActual);
console.log('Origen coords:', getCoords(envioActual.origen_hospital));
console.log('Destino coords:', getCoords(envioActual.destino_hospital));
console.log('Camión coords:', camionCoords);
console.log('Puntos intermedios:', puntosIntermedios);
console.log('Ruta completa:', rutaCoords);
```

## Próximas Mejoras

### 1. **Geocodificación Inversa**
```javascript
// Si no hay coordenadas, obtenerlas de la dirección
const geocode = async (address) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${address}&format=json`
  );
  const data = await response.json();
  return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
};
```

### 2. **Ruta Optimizada con OSRM**
```javascript
// Obtener ruta real por carreteras
const getRoute = async (start, end) => {
  const response = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
  );
  const data = await response.json();
  return data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
};
```

### 3. **Actualización en Tiempo Real**
```javascript
useEffect(() => {
  const interval = setInterval(async () => {
    const updated = await fetchUltimaUbicacion(envio.id);
    // Actualizar posición del camión
  }, 30000); // Cada 30 segundos
  
  return () => clearInterval(interval);
}, [envio.id]);
```

### 4. **Animación del Camión**
```javascript
// Animar movimiento entre puntos
const animateMarker = (marker, from, to, duration) => {
  const start = Date.now();
  const animate = () => {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    const lat = from[0] + (to[0] - from[0]) * progress;
    const lng = from[1] + (to[1] - from[1]) * progress;
    marker.setLatLng([lat, lng]);
    if (progress < 1) requestAnimationFrame(animate);
  };
  animate();
};
```

### 5. **Clustering de Puntos**
```javascript
import MarkerClusterGroup from 'react-leaflet-cluster';

<MarkerClusterGroup>
  {puntosIntermedios.map(punto => (
    <Marker position={punto.coords} />
  ))}
</MarkerClusterGroup>
```

### 6. **Capas Adicionales**
```javascript
// Capa de tráfico, satélite, etc.
<LayersControl>
  <BaseLayer checked name="OpenStreetMap">
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  </BaseLayer>
  <BaseLayer name="Satélite">
    <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
  </BaseLayer>
</LayersControl>
```

## Archivos Modificados/Creados

### Creados
- ✅ `app/cliente/components/MapaTracking.jsx` - Componente del mapa con Leaflet

### Modificados
- ✅ `app/cliente/components/Tracking.jsx`:
  - Importación dinámica de MapaTracking
  - Agregados datos completos de origen/destino en transformación
  - Reemplazado SVG por componente Leaflet en modal

## Notas Importantes

1. **SSR**: Siempre usar importación dinámica con `ssr: false` para Leaflet
2. **Coordenadas**: Validar que sean números finitos antes de usar
3. **Fallback**: Siempre tener un centro por defecto (Venezuela)
4. **z-index**: Paneles flotantes deben tener z-index > 1000
5. **Invalidación**: Llamar `map.invalidateSize()` después de cambios de tamaño
6. **Performance**: Leaflet maneja bien hasta ~1000 marcadores sin clustering

## Resultado Final

El mapa ahora muestra:
- 🗺️ **Mapa interactivo real** de OpenStreetMap
- 📍 **Ubicaciones GPS precisas** de origen, destino y seguimientos
- 🚚 **Posición actual del camión** basada en último seguimiento
- 📊 **Ruta visual** conectando todos los puntos
- 💬 **Popups informativos** con detalles de cada ubicación
- 🎨 **Iconos personalizados** con Lucide React
- 📱 **Responsive** y adaptable a cualquier tamaño
- ⚡ **Performante** con carga dinámica y optimizaciones
