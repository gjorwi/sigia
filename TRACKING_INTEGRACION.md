# Integración de Datos de Tracking en Componente Tracking.jsx

## Resumen
Se ha implementado la transformación de datos del backend al componente de Tracking para mostrar los movimientos en tránsito con toda su información de seguimiento.

## Cambios Realizados

### 1. Función `handleRastrear()` Actualizada

La función ahora transforma los datos del backend a la estructura que espera el componente:

```javascript
const handleRastrear = async () => {
  const {token, sede_id} = user;
  const response = await getEnTransito(token, sede_id);
  
  // Validación de respuesta
  if (!response.status) {
    // Manejo de errores (sesión expirada, etc.)
    return;
  }
  
  // Transformación de datos
  const enviosTransformados = response.data.map(movimiento => {
    // Mapeo de campos del backend a estructura del componente
  });
  
  setEnvios(enviosTransformados);
}
```

### 2. Mapeo de Datos

#### Estructura del Backend (entrada)
```json
{
  "id": 4,
  "tipo": "transferencia",
  "tipo_movimiento": "despacho",
  "destino_hospital_id": 2,
  "destino_sede_id": 2,
  "origen_almacen_tipo": "almacenCent",
  "destino_almacen_tipo": "almacenPrin",
  "origen_hospital_id": 1,
  "origen_sede_id": 1,
  "cantidad_salida_total": 500,
  "fecha_despacho": "2025-10-04T00:00:00.000000Z",
  "fecha_recepcion": null,
  "estado": "en_camino",
  "codigo_grupo": "cod004",
  "origen_hospital": { "id": 1, "nombre": "..." },
  "destino_hospital": { "id": 2, "nombre": "..." },
  "seguimientos": [...]
}
```

#### Estructura Transformada (salida)
```javascript
{
  id: "cod004",                           // codigo_grupo
  origen: "Almacén Robotizado...",        // origen_hospital.nombre
  destino: "IVSS Hospital...",            // destino_hospital.nombre
  fechaEnvio: "2025-10-04T00:00:00...",  // fecha_despacho
  fechaEstimada: null,                    // fecha_recepcion
  fechaEntrega: null,                     // fecha_recepcion
  estado: "en_camino",                    // estado
  transportista: "flor maria",            // seguimientos[0].despachador.nombre
  guia: "cod004",                         // codigo_grupo
  items: 500,                             // cantidad_salida_total
  ubicacionActual: "En tránsito",         // seguimientos[0].ubicacion
  receptor: null,                         // user_id_receptor
  historial: [...],                       // seguimientos transformados
  // Datos adicionales
  movimientoId: 4,
  tipo: "transferencia",
  tipoMovimiento: "despacho",
  origenAlmacenTipo: "almacenCent",
  destinoAlmacenTipo: "almacenPrin",
  observaciones: null,
  seguimientos: [...]
}
```

### 3. Transformación del Historial

Los seguimientos se transforman en eventos de historial:

```javascript
const historial = movimiento.seguimientos.map(seg => ({
  fecha: seg.created_at,
  evento: seg.observaciones || `Estado: ${seg.estado}`,
  ubicacion: seg.ubicacion || `Actualización por ${seg.despachador?.nombre}`
})).reverse(); // Del más antiguo al más reciente
```

### 4. Estados Agregados al Badge

Se agregaron los estados del sistema SIGIA:

- `en_camino`: Rosa (En Camino)
- `despachado`: Índigo (Despachado)
- `recibido`: Verde (Recibido)
- `en_transito`: Azul (En Tránsito) - ya existía
- `entregado`: Verde (Entregado) - ya existía
- `pendiente`: Amarillo (Pendiente) - ya existía

### 5. Estado `envioActual` Agregado

Se agregó el estado faltante para el modal de mapa:

```javascript
const [envioActual, setEnvioActual] = useState(null);
```

### 6. Función `handleVerMapa()` Actualizada

Ahora busca en el array plano de envíos:

```javascript
const handleVerMapa = (envioId) => {
  const envio = envios.find(e => e.id === envioId);
  setEnvioActual(envio);
  setShowMapaModal(true);
};
```

## Flujo de Datos

1. **Carga Inicial**: `useEffect` llama a `handleRastrear()` al montar el componente
2. **Petición API**: Se llama a `getEnTransito(token, sede_id)`
3. **Validación**: Se verifica `response.status` y autenticación
4. **Transformación**: Los datos se mapean a la estructura del componente
5. **Actualización Estado**: `setEnvios(enviosTransformados)`
6. **Renderizado**: El componente muestra los envíos transformados

## Datos Mostrados en la UI

### Card de Envío
- **ID**: Código de grupo (`codigo_grupo`)
- **Estado**: Badge con color según estado
- **Origen**: Nombre del hospital/sede origen
- **Destino**: Nombre del hospital/sede destino
- **Transportista**: Nombre del despachador del último seguimiento
- **Items**: Cantidad total de salida
- **Fecha Envío**: Fecha de despacho formateada
- **Ubicación Actual**: Del último seguimiento o "En tránsito"

### Historial de Seguimiento
- **Evento**: Observaciones del seguimiento
- **Fecha**: Timestamp formateado
- **Ubicación**: Ubicación o nombre del despachador

## Funcionalidades Disponibles

### Botones de Acción
1. **Ver Insumos**: Muestra modal con lista de insumos (pendiente integrar con backend)
2. **Seguimiento en Mapa**: Muestra modal con mapa de ubicación (pendiente integrar coordenadas)

### Tabs
- **Envíos Activos**: Muestra todos los movimientos en tránsito
- **Historial**: Pendiente implementar filtro de completados

## Próximos Pasos

### 1. Integrar Lista de Insumos
Modificar `handleVerInsumos()` para obtener los insumos del movimiento:

```javascript
const handleVerInsumos = async (envioId) => {
  const envio = envios.find(e => e.id === envioId);
  // Llamar API para obtener detalles de insumos
  // const response = await getInsumosMovimiento(token, envio.movimientoId);
  setInsumos(response.data);
  setShowInsumosModal(true);
};
```

### 2. Integrar Mapa con Coordenadas
Si los seguimientos incluyen `latitud` y `longitud`, mostrarlas en el mapa:

```javascript
const ubicaciones = envio.seguimientos
  .filter(s => s.latitud && s.longitud)
  .map(s => ({
    lat: parseFloat(s.latitud),
    lng: parseFloat(s.longitud),
    timestamp: s.created_at
  }));
```

### 3. Implementar Tab de Historial
Filtrar movimientos completados:

```javascript
const enviosActivos = envios.filter(e => 
  ['en_camino', 'despachado', 'en_transito'].includes(e.estado)
);

const enviosHistorial = envios.filter(e => 
  ['entregado', 'recibido'].includes(e.estado)
);
```

### 4. Búsqueda por Código
Implementar filtro en `trackingNumber`:

```javascript
const enviosFiltrados = envios.filter(e => 
  e.guia.toLowerCase().includes(trackingNumber.toLowerCase()) ||
  e.id.toLowerCase().includes(trackingNumber.toLowerCase())
);
```

## Notas Importantes

1. **Seguimientos Ordenados**: Los seguimientos vienen del más reciente al más antiguo. Se invierten para el historial.

2. **Datos Opcionales**: Se usan valores por defecto cuando faltan datos:
   - `transportista`: "No asignado"
   - `ubicacionActual`: "En tránsito"
   - `origen/destino`: "No especificado"

3. **ID del Envío**: Se usa `codigo_grupo` como ID principal, con fallback a `MOV-{id}`

4. **Compatibilidad**: La estructura transformada es compatible con el componente existente sin cambios en el renderizado.

## Testing

### Verificar Transformación
```javascript
console.log('Datos recibidos:', JSON.stringify(response, null, 2));
console.log('Datos transformados:', enviosTransformados);
```

### Casos de Prueba
1. ✅ Movimiento con seguimientos completos
2. ✅ Movimiento sin seguimientos
3. ✅ Movimiento sin despachador asignado
4. ✅ Múltiples movimientos en tránsito
5. ⏳ Movimiento con coordenadas GPS
6. ⏳ Movimiento completado/recibido

## Archivos Modificados

- `app/cliente/components/Tracking.jsx`: Transformación de datos y estados
- `servicios/despachos/get.js`: Endpoint `getEnTransito()`

## Dependencias

- `@/servicios/despachos/get`: Servicio de API
- `@/contexts/AuthContext`: Contexto de autenticación
- `@/components/Modal`: Componente de modal
- `lucide-react`: Iconos
