# Troubleshooting - Mapa de Tracking No Se Muestra

## Problema
El mapa de Leaflet no se muestra en el modal de seguimiento.

## Soluciones Implementadas

### 1. **Altura Explícita del Contenedor**

**Problema**: Leaflet requiere que el contenedor tenga una altura definida.

**Solución**:
```javascript
// ANTES (No funciona)
<div className="bg-white rounded-lg shadow-xl w-full max-h-[90vh] flex flex-col">

// DESPUÉS (Funciona)
<div className="bg-white rounded-lg shadow-xl w-full h-[90vh] flex flex-col">
```

**Cambios**:
- `max-h-[90vh]` → `h-[90vh]` (altura fija)
- `max-w-4xl` → `max-w-6xl` (más ancho para mejor visualización)
- Agregado `flex-shrink-0` al header
- Agregado `style={{ minHeight: '400px' }}` al contenedor del mapa

### 2. **Estructura de Flexbox Correcta**

```javascript
<div className="h-[90vh] flex flex-col">
  {/* Header */}
  <div className="flex-shrink-0">...</div>
  
  {/* Contenedor del mapa */}
  <div className="flex-1 overflow-hidden flex flex-col">
    <div className="flex-1 relative" style={{ minHeight: '400px' }}>
      <MapaTracking envio={envioActual} />
    </div>
  </div>
  
  {/* Footer con info */}
  <div className="flex-shrink-0">...</div>
</div>
```

### 3. **Validación de Coordenadas**

**Problema**: Si no hay coordenadas GPS, el mapa no puede centrarse.

**Solución**: Mensaje de fallback
```javascript
if (!origenCoords && !destinoCoords && !camionCoords) {
  return (
    <div className="flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-center p-8">
        <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3>No hay coordenadas GPS disponibles</h3>
        <p>Este envío no tiene información de ubicación registrada.</p>
      </div>
    </div>
  )
}
```

### 4. **Logs de Debug**

Agregados logs para identificar problemas:
```javascript
console.log('MapaTracking - Envío recibido:', envio)
console.log('Origen coords:', origenCoords)
console.log('Destino coords:', destinoCoords)
```

## Checklist de Verificación

### En el Navegador

1. **Abrir DevTools** (F12)
2. **Ir a Console**
3. **Buscar errores**:
   - ❌ `window is not defined` → Problema de SSR
   - ❌ `Cannot read property 'lat' of undefined` → Falta ubicación
   - ❌ `Map container is already initialized` → Problema de re-render
   - ❌ CSS no carga → Falta import de leaflet.css

4. **Verificar logs**:
   ```
   MapaTracking - Envío recibido: {...}
   Origen coords: [10.4806, -66.9036]
   Destino coords: [10.2513, -67.5958]
   ```

5. **Inspeccionar elemento**:
   - El contenedor del mapa debe tener altura > 0
   - Debe existir `<div class="leaflet-container">`
   - Los tiles deben estar cargando

### Estructura de Datos

Verificar que el envío tenga:

```javascript
{
  origen_hospital: {
    ubicacion: {
      lat: 10.4806,  // o latitud
      lng: -66.9036  // o longitud
    }
  },
  destino_hospital: {
    ubicacion: {
      lat: 10.2513,
      lng: -67.5958
    }
  }
}
```

## Problemas Comunes

### 1. Mapa Gris (Tiles No Cargan)

**Síntomas**: Mapa se muestra pero está completamente gris.

**Causas**:
- No hay conexión a internet
- URL de tiles incorrecta
- Problema de CORS

**Solución**:
```javascript
// Verificar en Network tab si los tiles están cargando
// URL correcta: https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

### 2. Mapa No Visible (Altura 0)

**Síntomas**: El espacio del mapa está colapsado.

**Causas**:
- Contenedor sin altura definida
- Flexbox mal configurado

**Solución**:
```javascript
// Asegurar altura explícita
<div style={{ height: '500px' }}>
  <MapContainer style={{ height: '100%', width: '100%' }}>
```

### 3. Error "window is not defined"

**Síntomas**: Error en consola al cargar la página.

**Causas**:
- Leaflet se ejecuta en SSR

**Solución**:
```javascript
// Importación dinámica con ssr: false
const MapaTracking = dynamic(() => import('./MapaTracking'), { 
  ssr: false 
});
```

### 4. Iconos No Aparecen

**Síntomas**: Marcadores son cuadrados azules por defecto.

**Causas**:
- Iconos personalizados no se crean correctamente
- Error en renderToStaticMarkup

**Solución**:
```javascript
// Verificar que lucide-react esté instalado
// Verificar que renderToStaticMarkup funcione
const svg = renderToStaticMarkup(<Warehouse size={24} />)
console.log('SVG:', svg)
```

### 5. Mapa No Se Centra

**Síntomas**: Mapa muestra ubicación incorrecta.

**Causas**:
- Coordenadas inválidas
- Bounds no se calculan correctamente

**Solución**:
```javascript
// Verificar coordenadas
console.log('Center:', center)
console.log('All coords:', allCoords)

// Verificar que FitBounds se ejecute
useEffect(() => {
  console.log('FitBounds ejecutándose')
  // ...
}, [map])
```

### 6. CSS de Leaflet No Carga

**Síntomas**: Mapa sin estilos, controles mal posicionados.

**Causas**:
- Falta import de CSS
- CSS no se procesa en build

**Solución**:
```javascript
// En MapaTracking.jsx
import 'leaflet/dist/leaflet.css'

// Verificar en DevTools > Sources que leaflet.css esté cargado
```

## Comandos de Verificación

### 1. Verificar Instalación de Dependencias
```bash
npm list leaflet react-leaflet
```

**Esperado**:
```
├── leaflet@1.9.4
└── react-leaflet@5.0.0
```

### 2. Verificar Importaciones
```bash
grep -r "import.*leaflet" app/cliente/components/
```

**Esperado**:
```
MapaTracking.jsx:import 'leaflet/dist/leaflet.css'
MapaTracking.jsx:import { MapContainer, TileLayer, ... } from 'react-leaflet'
MapaTracking.jsx:import L from 'leaflet'
```

### 3. Verificar Build
```bash
npm run build
```

**Buscar errores** relacionados con Leaflet o SSR.

## Solución Rápida

Si el mapa no se muestra, seguir estos pasos:

1. **Abrir DevTools Console**
2. **Buscar errores en rojo**
3. **Verificar logs**:
   ```
   MapaTracking - Envío recibido: {...}
   Origen coords: [lat, lng] o null
   Destino coords: [lat, lng] o null
   ```

4. **Si coords son null**:
   - El problema es que no hay coordenadas GPS
   - Debe mostrarse el mensaje de fallback
   - Verificar que origen_hospital/destino_hospital tengan ubicacion

5. **Si coords son válidas pero mapa no aparece**:
   - Inspeccionar elemento del contenedor
   - Verificar que tenga altura > 0
   - Verificar que exista `.leaflet-container`

6. **Si aparece error de SSR**:
   - Verificar importación dinámica en Tracking.jsx
   - Debe tener `ssr: false`

## Datos de Prueba

Para probar el mapa, asegurar que el movimiento tenga:

```javascript
{
  origen_hospital: {
    id: 1,
    nombre: "Hospital Central",
    ubicacion: {
      lat: "10.4806",  // Caracas
      lng: "-66.9036"
    }
  },
  destino_hospital: {
    id: 2,
    nombre: "Hospital Regional",
    ubicacion: {
      lat: "10.2513",  // Valencia
      lng: "-67.5958"
    }
  },
  seguimientos: [
    {
      latitud: "10.4806",
      longitud: "-66.9036",
      ubicacion: "Caracas",
      observaciones: "Salida",
      created_at: "2025-10-15T08:00:00"
    }
  ]
}
```

## Contacto y Soporte

Si el problema persiste:

1. **Capturar screenshot** del error en console
2. **Copiar logs** de MapaTracking
3. **Verificar estructura** del objeto envio
4. **Revisar** que las coordenadas sean válidas

## Referencias

- [Leaflet Docs](https://leafletjs.com/)
- [React-Leaflet Docs](https://react-leaflet.js.org/)
- [Next.js Dynamic Import](https://nextjs.org/docs/advanced-features/dynamic-import)
- [OpenStreetMap Tiles](https://wiki.openstreetmap.org/wiki/Tile_servers)
