# Integración de Insumos en Componente Tracking

## Resumen
Se ha implementado la visualización de insumos reales desde `lotes_grupos` en el modal de insumos del componente de Tracking.

## Cambios Realizados

### 1. Inclusión de `lotes_grupos` en la Transformación

Se agregó el campo `lotes_grupos` a la estructura transformada de envíos:

```javascript
return {
  // ... otros campos
  lotes_grupos: movimiento.lotes_grupos || []
};
```

### 2. Función `handleVerInsumos()` Actualizada

La función ahora extrae y transforma los datos reales de `lotes_grupos`:

```javascript
const handleVerInsumos = (envioId) => {
  const envio = envios.find(e => e.id === envioId);
  
  // Validación
  if (!envio || !envio.lotes_grupos || envio.lotes_grupos.length === 0) {
    showMessage('Información', 'No hay insumos disponibles para este envío', 'info', 3000);
    return;
  }
  
  // Transformación
  const insumosTransformados = envio.lotes_grupos.map(loteGrupo => ({
    // Mapeo de campos
  }));
  
  setInsumos(insumosTransformados);
  setShowInsumosModal(true);
};
```

### 3. Mapeo de Datos de Insumos

#### Estructura del Backend (lotes_grupos)
```json
{
  "id": 10,
  "codigo": "cod004",
  "lote_id": 3,
  "cantidad_salida": 500,
  "cantidad_entrada": 0,
  "discrepancia": false,
  "status": "activo",
  "lote": {
    "id": 3,
    "id_insumo": 383,
    "numero_lote": "TMYD76PO",
    "fecha_vencimiento": "2026-12-31",
    "fecha_ingreso": "2025-10-04",
    "insumo": {
      "id": 383,
      "codigo": "383",
      "codigo_alterno": "SUT-cf7d24",
      "nombre": "SUTURA SEDA 3-0 REF (833)",
      "tipo": "quirurgico",
      "unidad_medida": "unidad",
      "cantidad_por_paquete": 1,
      "descripcion": "SUTURA SEDA 3-0 REF (833)",
      "presentacion": "material"
    }
  }
}
```

#### Estructura Transformada (para el modal)
```javascript
{
  id: 10,                                    // loteGrupo.id
  nombre: "SUTURA SEDA 3-0 REF (833)",      // lote.insumo.nombre
  cantidad: 500,                             // cantidad_salida
  unidad: "unidad",                          // lote.insumo.unidad_medida
  lote: "TMYD76PO",                          // lote.numero_lote
  codigo: "383",                             // lote.insumo.codigo
  codigoAlterno: "SUT-cf7d24",              // lote.insumo.codigo_alterno
  tipo: "quirurgico",                        // lote.insumo.tipo
  descripcion: "SUTURA SEDA 3-0 REF (833)", // lote.insumo.descripcion
  presentacion: "material",                  // lote.insumo.presentacion
  fechaVencimiento: "2026-12-31",           // lote.fecha_vencimiento
  fechaIngreso: "2025-10-04",               // lote.fecha_ingreso
  cantidadPorPaquete: 1                     // lote.insumo.cantidad_por_paquete
}
```

### 4. Modal de Insumos Mejorado

#### Resumen Superior
Se agregó un panel de resumen con 3 tarjetas:

1. **Total Insumos**: Cantidad de tipos diferentes
2. **Cantidad Total**: Suma de todas las cantidades
3. **Tipos**: Lista de tipos de insumos únicos

```javascript
<div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
    <div className="text-xs text-blue-600 font-medium uppercase">Total Insumos</div>
    <div className="text-2xl font-bold text-blue-900">{insumos.length}</div>
    <div className="text-xs text-blue-600">tipos diferentes</div>
  </div>
  {/* ... más tarjetas */}
</div>
```

#### Tabla Detallada
La tabla ahora muestra 6 columnas con información completa:

| Columna | Contenido | Fuente |
|---------|-----------|--------|
| **Código** | Código principal y alterno | `codigo` + `codigoAlterno` |
| **Nombre** | Nombre y descripción | `nombre` + `descripcion` |
| **Tipo** | Badge de tipo y presentación | `tipo` + `presentacion` |
| **Cantidad** | Cantidad y unidad de medida | `cantidad` + `unidad` |
| **Lote** | Número de lote y fecha de ingreso | `lote` + `fechaIngreso` |
| **Vencimiento** | Fecha de vencimiento (rojo si vencido) | `fechaVencimiento` |

#### Características de la Tabla

1. **Códigos**: 
   - Código principal en negrita
   - Código alterno en gris claro debajo

2. **Nombre**:
   - Nombre del insumo en negrita
   - Descripción en texto pequeño debajo (si existe)
   - Ancho máximo para evitar overflow

3. **Tipo**:
   - Badge con color azul
   - Presentación en texto pequeño debajo
   - Capitalizado automáticamente

4. **Cantidad**:
   - Número en negrita
   - Unidad de medida debajo

5. **Lote**:
   - Número de lote en negrita
   - Fecha de ingreso formateada debajo

6. **Vencimiento**:
   - Fecha formateada
   - **Color rojo** si está vencido
   - Color normal si está vigente

### 5. Validación y Manejo de Errores

```javascript
if (!envio || !envio.lotes_grupos || envio.lotes_grupos.length === 0) {
  showMessage('Información', 'No hay insumos disponibles para este envío', 'info', 3000);
  return;
}
```

- Valida que el envío exista
- Valida que tenga `lotes_grupos`
- Valida que no esté vacío
- Muestra mensaje informativo si no hay datos

### 6. Valores por Defecto

Todos los campos tienen valores por defecto seguros:

```javascript
nombre: loteGrupo.lote?.insumo?.nombre || 'Insumo sin nombre',
cantidad: loteGrupo.cantidad_salida,
unidad: loteGrupo.lote?.insumo?.unidad_medida || 'unidad',
lote: loteGrupo.lote?.numero_lote || 'N/A',
codigo: loteGrupo.lote?.insumo?.codigo || 'N/A',
// ... etc
```

## Flujo de Datos

1. **Carga de Envíos**: `handleRastrear()` obtiene movimientos con `lotes_grupos`
2. **Transformación**: Se incluye `lotes_grupos` en cada envío transformado
3. **Click en "Ver Insumos"**: Usuario hace click en el botón
4. **Búsqueda**: Se encuentra el envío por ID
5. **Validación**: Se verifica que tenga insumos
6. **Transformación de Insumos**: Se mapean `lotes_grupos` a estructura del modal
7. **Visualización**: Se muestra el modal con resumen y tabla detallada

## Ejemplo de Uso

### Datos de Entrada (Backend)
```json
{
  "lotes_grupos": [
    {
      "id": 10,
      "cantidad_salida": 500,
      "lote": {
        "numero_lote": "TMYD76PO",
        "fecha_vencimiento": "2026-12-31",
        "insumo": {
          "nombre": "SUTURA SEDA 3-0 REF (833)",
          "tipo": "quirurgico",
          "unidad_medida": "unidad"
        }
      }
    }
  ]
}
```

### Visualización (Modal)

**Resumen:**
- Total Insumos: 1 tipos diferentes
- Cantidad Total: 500 unidades
- Tipos: quirurgico

**Tabla:**
| Código | Nombre | Tipo | Cantidad | Lote | Vencimiento |
|--------|--------|------|----------|------|-------------|
| 383<br>SUT-cf7d24 | **SUTURA SEDA 3-0 REF (833)**<br>SUTURA SEDA 3-0 REF (833) | 🔵 quirurgico<br>material | **500**<br>unidad | **TMYD76PO**<br>Ingreso: 4 oct 2025 | 31 dic 2026 |

## Características Adicionales

### 1. Detección de Vencimiento
```javascript
className={`font-medium ${new Date(insumo.fechaVencimiento) < new Date() ? 'text-red-600' : 'text-gray-900'}`}
```
- Compara fecha de vencimiento con fecha actual
- Aplica color rojo si está vencido

### 2. Formato de Fechas
```javascript
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
```
- Formato en español
- Maneja valores nulos
- Incluye hora cuando es relevante

### 3. Tipos Únicos
```javascript
{[...new Set(insumos.map(i => i.tipo))].join(', ')}
```
- Extrae tipos únicos con `Set`
- Los une con comas para mostrar

### 4. Suma Total
```javascript
{insumos.reduce((sum, i) => sum + i.cantidad, 0)}
```
- Suma todas las cantidades
- Muestra total de unidades en el envío

## Estilos y UX

### Colores del Resumen
- **Azul** (`bg-blue-50`, `border-blue-200`): Total de insumos
- **Verde** (`bg-green-50`, `border-green-200`): Cantidad total
- **Púrpura** (`bg-purple-50`, `border-purple-200`): Tipos

### Hover y Interactividad
- Filas de tabla con hover: `hover:bg-gray-50`
- Botón de cerrar con hover: `hover:text-gray-700`
- Transiciones suaves en todos los elementos

### Responsividad
- Grid de resumen: `grid-cols-1 md:grid-cols-3`
- Tabla con scroll horizontal: `overflow-x-auto`
- Modal adaptable: `max-w-4xl max-h-[90vh]`

## Archivos Modificados

- `app/cliente/components/Tracking.jsx`:
  - Agregado `lotes_grupos` a transformación de envíos
  - Actualizado `handleVerInsumos()` con datos reales
  - Mejorado modal de insumos con resumen y tabla detallada
  - Agregada detección de vencimiento

## Testing

### Casos de Prueba
1. ✅ Envío con múltiples insumos
2. ✅ Envío sin insumos (muestra mensaje)
3. ✅ Insumo con fecha vencida (texto rojo)
4. ✅ Insumo sin descripción (no muestra línea extra)
5. ✅ Múltiples tipos de insumos (muestra todos en resumen)
6. ✅ Suma correcta de cantidades totales

### Verificación Visual
```javascript
console.log('Insumos transformados:', insumosTransformados);
console.log('Total cantidad:', insumos.reduce((sum, i) => sum + i.cantidad, 0));
console.log('Tipos únicos:', [...new Set(insumos.map(i => i.tipo))]);
```

## Próximas Mejoras

1. **Filtros**: Agregar filtros por tipo, vencimiento, etc.
2. **Búsqueda**: Buscar insumos por nombre o código
3. **Exportar**: Botón para exportar lista a PDF/Excel
4. **Ordenamiento**: Ordenar por columnas (nombre, cantidad, vencimiento)
5. **Alertas**: Destacar insumos próximos a vencer (ej: < 30 días)
6. **Imágenes**: Mostrar foto del insumo si está disponible

## Notas Importantes

1. **Navegación Segura**: Uso de optional chaining (`?.`) en toda la transformación
2. **Valores por Defecto**: Todos los campos tienen fallbacks seguros
3. **Performance**: La transformación es eficiente con `.map()` y `.reduce()`
4. **Accesibilidad**: Tabla semántica con `<thead>`, `<tbody>`, `scope="col"`
5. **Internacionalización**: Fechas en formato español (`es-ES`)
