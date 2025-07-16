export const fichas = [
  {
    id: 1,
    idHospital: 'G33333333',
    insumos: [
      {
        id: 1,
        nombre: "Inyectadora 20 ml",
        descripcion: "Inyectadora de 20 ml",
        tipo: "quirurgico",
        codigo: "IN001",
        medida: "paquete",
        cantidadPorPaquete: 1,
        cantidadDespacho: 100,
        lotes: [
          {
            id: 1,
            insumoId: 'IN001',
            numeroLote: "L001",
            fechaVencimiento: "2025-01-01",
            cantidad: 500,
            fechaIngreso: "2025-01-01",
            estado: "Activo"
          },
          {
            id: 2,
            insumoId: 'IN001',
            numeroLote: "L002",
            fechaVencimiento: "2026-01-01",
            cantidad: 500,
            fechaIngreso: "2025-01-01",
            estado: "Activo"
          }
        ],
        estado: "Activo"
    },
    {
        id: 2,
        nombre: "Inyectadora 50 ml",
        descripcion: "Inyectadora de 50 ml",
        tipo: "quirurgico",
        codigo: "IN002",
        medida: "unidad",
        cantidadPorPaquete: 1, 
        cantidadDespacho: 200,
        lotes: [
          {
            id: 1,
            insumoId: 'IN002',
            numeroLote: "L001",
            fechaVencimiento: "2025-01-01",
            cantidad: 50,
            fechaIngreso: "2025-01-01",
            estado: "Activo"
          },
          {
            id: 2,
            insumoId: 'IN002',
            numeroLote: "L002",
            fechaVencimiento: "2026-01-01",
            cantidad: 500,
            fechaIngreso: "2025-01-01",
            estado: "Activo"
          }
        ],
        estado: "Activo"
    },
    {
        id: 3,
        nombre: "Mascarilla N95",
        descripcion: "Mascarilla N95",
        tipo: "medico",
        codigo: "IN003",
        medida: "unidad",
        cantidadPorPaquete: 1,
        cantidadDespacho: 300,
        lotes: [
          {
            id: 1,
            insumoId: 'IN003',
            numeroLote: "L001",
            fechaVencimiento: "2025-01-01",
            cantidad: 500,
            fechaIngreso: "2025-01-01",
            estado: "Activo"
          },
          {
            id: 2,
            insumoId: 'IN003',
            numeroLote: "L002",
            fechaVencimiento: "2026-01-01",
            cantidad: 500,
            fechaIngreso: "2025-01-01",
            estado: "Activo"
          }
        ],
        estado: "Activo"
    }
    ]
  }
]