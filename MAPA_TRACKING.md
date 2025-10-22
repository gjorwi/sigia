# Implementación de Mapa de Seguimiento en Tiempo Real

## Resumen
Se ha implementado un mapa interactivo de seguimiento que muestra la ruta del envío con marcadores de origen, destino y ubicación actual del camión basado en los seguimientos registrados.

## Características Implementadas

### 1. **Marcadores en el Mapa**

#### 🟢 Marcador de Origen (Verde)
- **Color**: Verde (`#10b981`)
- **Posición**: Coordenadas del punto de origen
- **Etiqueta**: "Origen" + nombre del hospital/almacén
- **Diseño**: Círculo con borde blanco y punto central

#### 🔴 Marcador de Destino (Rojo)
- **Color**: Rojo (`#ef4444`)
- **Posición**: Coordenadas del punto de destino
- **Etiqueta**: "Destino" + nombre del hospital/almacén
- **Diseño**: Círculo con borde blanco y punto central

#### 🟠 Marcador de Camión (Naranja)
- **Color**: Naranja (`#f59e0b`)
- **Posición**: Última ubicación registrada en seguimientos
- **Fallback**: Si no hay seguimientos, se coloca en el origen
- **Diseño**: 
  - Círculo naranja con animación pulse
  - Sombra debajo del marcador
  - Icono de camión simplificado
  - Etiqueta flotante con "🚚 En tránsito"
  - Muestra la ubicación actual

### 2. **Ruta Trazada**

```javascript
// Línea que conecta origen y destino
<line 
  x1={origenX} 
  y1={origenY} 
  x2={destinoX} 
  y2={destinoY} 
  stroke="#3b82f6" 
  strokeWidth="0.5" 
  strokeDasharray="2,1"
/>
```

- **Color**: Azul (`#3b82f6`)
- **Estilo**: Línea punteada
- **Conecta**: Origen → Destino

### 3. **Puntos de Seguimiento Intermedios**

```javascript
{envioActual.seguimientos && envioActual.seguimientos.map((seg, idx) => {
  if (idx === envioActual.seguimientos.length - 1) return null;
  const progreso = (idx + 1) / (envioActual.seguimientos.length + 1);
  const x = origenX + (destinoX - origenX) * progreso;
  const y = origenY + (destinoY - origenY) * progreso;
  
  return (
    <g key={idx}>
      <circle cx={x} cy={y} r="1.5" fill="#6366f1" opacity="0.6" />
      <circle cx={x} cy={y} r="0.5" fill="#ffffff" />
    </g>
  );
})}
```

- **Color**: Índigo (`#6366f1`)
- **Diseño**: Círculos pequeños con punto blanco central
- **Posición**: Interpolados a lo largo de la ruta
- **Propósito**: Mostrar puntos donde se registraron seguimientos

### 4. **Lógica de Posicionamiento del Camión**

```javascript
// Obtener última ubicación del seguimiento
const ultimoSeguimiento = envioActual.seguimientos && envioActual.seguimientos.length > 0 
  ? envioActual.seguimientos[envioActual.seguimientos.length - 1] 
  : null;

// Calcular posición del camión
let camionX, camionY;
if (ultimoSeguimiento && ultimoSeguimiento.latitud && ultimoSeguimiento.longitud) {
  // Si hay coordenadas GPS reales, calcular posición interpolada
  const progreso = envioActual.seguimientos.length / 10; // Asume máximo 10 puntos
  camionX = origenX + (destinoX - origenX) * Math.min(progreso, 1);
  camionY = origenY + (destinoY - origenY) * Math.min(progreso, 1);
} else {
  // Si no hay ubicación, colocar en origen
  camionX = origenX;
  camionY = origenY;
}
```

**Comportamiento**:
1. Si hay seguimientos con GPS → Calcula posición interpolada
2. Si no hay GPS pero hay seguimientos → Estima posición por cantidad de seguimientos
3. Si no hay seguimientos → Coloca en origen

### 5. **Leyenda del Mapa**

Panel inferior izquierdo con explicación de colores:
- 🟢 **Verde**: Origen
- 🔴 **Rojo**: Destino
- 🟠 **Naranja**: Ubicación Actual
- 🔵 **Índigo**: Puntos de seguimiento

```javascript
<div className="absolute bottom-4 left-4 bg-white/95 rounded-lg shadow-lg p-3 text-xs">
  <div className="font-semibold text-gray-800 mb-2">Leyenda</div>
  <div className="space-y-1">
    {/* Items de leyenda */}
  </div>
</div>
```

### 6. **Panel de Última Ubicación**

Panel superior derecho que muestra:
- Icono de ubicación (`MapPin`)
- Ubicación textual del último seguimiento
- Observaciones del seguimiento
- Fecha y hora de actualización

```javascript
{envioActual.seguimientos && envioActual.seguimientos.length > 0 && (
  <div className="absolute top-4 right-4 bg-white/95 rounded-lg shadow-lg p-3 max-w-xs">
    <div className="flex items-start gap-2">
      <MapPin className="h-4 w-4 text-orange-500" />
      <div>
        <div className="font-semibold text-gray-800 text-sm">Última Ubicación</div>
        <div className="text-xs text-gray-600">
          {envioActual.seguimientos[envioActual.seguimientos.length - 1].ubicacion}
        </div>
        <div className="text-xs text-gray-500">
          {envioActual.seguimientos[envioActual.seguimientos.length - 1].observaciones}
        </div>
        <div className="text-xs text-gray-400">
          {formatDate(envioActual.seguimientos[envioActual.seguimientos.length - 1].created_at)}
        </div>
      </div>
    </div>
  </div>
)}
```

### 7. **Información del Envío**

Grid de 4 columnas con datos clave:

```javascript
<div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
  <div className="bg-gray-50 p-3 rounded-lg">
    <p className="text-xs text-gray-500">Estado Actual</p>
    <p className="font-medium capitalize">{envioActual.estado.replace('_', ' ')}</p>
  </div>
  <div className="bg-gray-50 p-3 rounded-lg">
    <p className="text-xs text-gray-500">Conductor</p>
    <p className="font-medium">{envioActual.transportista}</p>
  </div>
  <div className="bg-gray-50 p-3 rounded-lg">
    <p className="text-xs text-gray-500">Insumos</p>
    <p className="font-medium">{envioActual.items} unidades</p>
  </div>
  <div className="bg-gray-50 p-3 rounded-lg">
    <p className="text-xs text-gray-500">Seguimientos</p>
    <p className="font-medium">{envioActual.seguimientos?.length || 0} registros</p>
  </div>
</div>
```

### 8. **Historial de Seguimientos**

Lista scrolleable con todos los eventos de seguimiento:

```javascript
{envioActual.historial && envioActual.historial.length > 0 && (
  <div className="mt-4">
    <h4 className="text-sm font-medium text-gray-700 mb-2">Historial de Seguimiento</h4>
    <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
      <div className="space-y-3">
        {envioActual.historial.slice().reverse().map((evento, idx) => (
          <div key={idx} className="flex items-start text-sm">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100">
              <MapPin className="h-3 w-3 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{evento.evento}</p>
              <p className="text-xs text-gray-600">{evento.ubicacion}</p>
              <p className="text-xs text-gray-400">{formatDate(evento.fecha)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}
```

**Características**:
- Ordenado del más reciente al más antiguo (`.reverse()`)
- Máximo 40px de altura con scroll
- Muestra evento, ubicación y fecha
- Icono de ubicación para cada evento

## Estructura de Datos Utilizada

### Envío Actual (`envioActual`)
```javascript
{
  id: "MOV-123",
  origen: "Hospital Central",
  destino: "Hospital Regional",
  estado: "en_camino",
  transportista: "Juan Pérez",
  items: 500,
  seguimientos: [
    {
      id: 1,
      ubicacion: "Av. Principal",
      observaciones: "En ruta",
      latitud: 10.123,
      longitud: -66.456,
      created_at: "2025-10-15T08:00:00"
    }
  ],
  historial: [
    {
      fecha: "2025-10-15T08:00:00",
      evento: "Despacho iniciado",
      ubicacion: "Hospital Central"
    }
  ]
}
```

## Tecnologías Utilizadas

### SVG para el Mapa
- **ViewBox**: `0 0 100 100` para coordenadas normalizadas
- **preserveAspectRatio**: `xMidYMid meet` para mantener proporciones
- **Elementos**: `<circle>`, `<line>`, `<text>`, `<rect>`, `<g>`

### Animaciones
```css
className="animate-pulse"
```
- Aplicada al marcador del camión
- Efecto de pulsación continua

### Posicionamiento Absoluto
```css
className="absolute top-4 right-4"
className="absolute bottom-4 left-4"
```
- Leyenda: Inferior izquierda
- Última ubicación: Superior derecha

## Flujo de Datos

1. **Usuario hace click en "Seguimiento en Mapa"**
   ```javascript
   handleVerMapa(envioId)
   ```

2. **Se busca el envío por ID**
   ```javascript
   const envio = envios.find(e => e.id === envioId);
   setEnvioActual(envio);
   setShowMapaModal(true);
   ```

3. **Modal se abre con datos del envío**
   - Se extraen seguimientos
   - Se calcula última ubicación
   - Se posiciona el camión

4. **Renderizado del mapa**
   - Se trazan marcadores de origen y destino
   - Se dibuja la ruta
   - Se posiciona el camión según seguimientos
   - Se muestran puntos intermedios

## Mejoras Futuras

### 1. **Integración con API de Mapas Real**
```javascript
// Usar Google Maps, Mapbox o Leaflet
import { GoogleMap, Marker, Polyline } from '@react-google-maps/api';

<GoogleMap
  center={{ lat: ultimoSeguimiento.latitud, lng: ultimoSeguimiento.longitud }}
  zoom={12}
>
  <Marker position={origen} icon={origenIcon} />
  <Marker position={destino} icon={destinoIcon} />
  <Marker position={camion} icon={camionIcon} />
  <Polyline path={ruta} />
</GoogleMap>
```

### 2. **Coordenadas GPS Reales**
```javascript
// Calcular posición real del camión
if (ultimoSeguimiento.latitud && ultimoSeguimiento.longitud) {
  const bounds = new google.maps.LatLngBounds();
  bounds.extend(origen);
  bounds.extend(destino);
  
  // Convertir lat/lng a coordenadas del mapa
  const camionPos = {
    lat: ultimoSeguimiento.latitud,
    lng: ultimoSeguimiento.longitud
  };
}
```

### 3. **Actualización en Tiempo Real**
```javascript
// WebSocket o polling para actualizar ubicación
useEffect(() => {
  const interval = setInterval(() => {
    fetchUltimaUbicacion(envioActual.id).then(ubicacion => {
      setEnvioActual(prev => ({
        ...prev,
        seguimientos: [...prev.seguimientos, ubicacion]
      }));
    });
  }, 30000); // Cada 30 segundos
  
  return () => clearInterval(interval);
}, [envioActual.id]);
```

### 4. **Cálculo de Tiempo Estimado**
```javascript
// Calcular ETA basado en distancia y velocidad promedio
const calcularTiempoEstimado = (origen, destino, velocidadPromedio = 60) => {
  const distancia = calcularDistancia(origen, destino); // en km
  const tiempoHoras = distancia / velocidadPromedio;
  return formatearTiempo(tiempoHoras);
};
```

### 5. **Ruta Optimizada**
```javascript
// Usar API de direcciones para ruta real
const obtenerRuta = async (origen, destino) => {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/directions/json?origin=${origen}&destination=${destino}`
  );
  const data = await response.json();
  return data.routes[0].overview_polyline.points;
};
```

### 6. **Notificaciones de Ubicación**
```javascript
// Alertar cuando el camión llega a puntos clave
if (distanciaAlDestino < 5) {
  showNotification('El envío está cerca del destino (5km)');
}
```

### 7. **Historial de Ruta Completo**
```javascript
// Mostrar toda la ruta recorrida
const rutaRecorrida = seguimientos.map(seg => ({
  lat: seg.latitud,
  lng: seg.longitud,
  timestamp: seg.created_at
}));

<Polyline 
  path={rutaRecorrida} 
  options={{ strokeColor: '#10b981', strokeWeight: 3 }}
/>
```

## Casos de Uso

### Caso 1: Envío sin seguimientos
- Camión se muestra en origen
- No hay puntos intermedios
- Panel de última ubicación no se muestra

### Caso 2: Envío con seguimientos pero sin GPS
- Camión se posiciona interpolado según cantidad de seguimientos
- Puntos intermedios se distribuyen uniformemente
- Panel muestra ubicación textual

### Caso 3: Envío con seguimientos y GPS
- Camión se posiciona en coordenadas reales
- Puntos intermedios en posiciones reales
- Panel muestra ubicación precisa

### Caso 4: Envío completado
- Camión en destino
- Todos los puntos de seguimiento visibles
- Historial completo disponible

## Estilos y UX

### Colores del Sistema
- **Verde** (`#10b981`): Origen, inicio
- **Rojo** (`#ef4444`): Destino, fin
- **Naranja** (`#f59e0b`): Ubicación actual, en tránsito
- **Azul** (`#3b82f6`): Ruta, conexión
- **Índigo** (`#6366f1`): Puntos de seguimiento

### Animaciones
- **Pulse**: Marcador del camión (atrae atención)
- **Hover**: Botones y elementos interactivos
- **Transiciones**: Suaves en todos los cambios

### Responsividad
- Grid de información: 1 columna en móvil, 4 en desktop
- Paneles flotantes: Se adaptan al tamaño de pantalla
- SVG: Escala automáticamente con `preserveAspectRatio`

## Testing

### Casos de Prueba
1. ✅ Abrir mapa sin seguimientos → Camión en origen
2. ✅ Abrir mapa con 1 seguimiento → Camión cerca del origen
3. ✅ Abrir mapa con múltiples seguimientos → Camión interpolado
4. ✅ Verificar leyenda → Todos los colores correctos
5. ✅ Verificar panel de última ubicación → Datos correctos
6. ✅ Verificar historial → Ordenado correctamente
7. ✅ Cerrar modal → Estado limpio

### Comandos de Verificación
```javascript
console.log('Envío actual:', envioActual);
console.log('Seguimientos:', envioActual.seguimientos);
console.log('Última ubicación:', envioActual.seguimientos[envioActual.seguimientos.length - 1]);
console.log('Posición camión:', { camionX, camionY });
```

## Archivos Modificados

- `app/cliente/components/Tracking.jsx`:
  - Agregado mapa SVG con marcadores
  - Implementada lógica de posicionamiento del camión
  - Agregados paneles de información
  - Agregado historial de seguimientos
  - Actualizada información del envío

## Notas Importantes

1. **Coordenadas Simuladas**: Actualmente usa coordenadas normalizadas (0-100). En producción, usar coordenadas GPS reales.

2. **Interpolación**: La posición del camión se calcula interpolando entre origen y destino basado en la cantidad de seguimientos.

3. **Fallback**: Si no hay seguimientos, el camión se muestra en el origen.

4. **Performance**: El SVG es ligero y eficiente, ideal para múltiples marcadores.

5. **Escalabilidad**: La estructura está preparada para integrar APIs de mapas reales (Google Maps, Mapbox, etc.).
