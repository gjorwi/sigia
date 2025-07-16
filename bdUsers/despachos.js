export const despachos = [
    {
        id: 1,
        rif: 'J-12345678',
        nombre: 'Hospital General',
        direccion: 'Calle 123',
        tipo: 'Hospital',
        telefono: '12345678',
        ubicacion: {
            lat: '123.456',
            lng: '789.012',
        },
        email: 'hospital@gmail.com',
        cantidad: '10',
        fechaDespacho: '2022-01-01',
        insumos: [
          {
            id: 1,
            nombre: 'inyectadora 20ml',
            codigo: 'IN001',
            cantidad: '10',
          },
        ],
        lotes:[
          {
            id: 1,
            insumoId: 'IN001',
            numeroLote: "L001",
            fechaVencimiento: "2025-01-01",
            cantidad: 50,
            fechaIngreso: "2025-01-01",
            estado: "Activo"
          },
          {
            id: 2,
            insumoId: 'IN001',
            numeroLote: "L002",
            fechaVencimiento: "2026-01-01",
            cantidad: 140,
            fechaIngreso: "2025-01-01",
            estado: "Activo"
          }
        ],
        estado: 'Activo',
        hospitalId: 'J-12345678',
    },
    {
        id: 2,
        rif: 'J-12345679',
        nombre: 'Hospital 2',
        direccion: 'Calle 123',
        tipo: 'tipo 2',
        telefono: '12345678',
        ubicacion: {
            lat: '123.456',
            lng: '789.012',
        },
        email: 'hospital@gmail.com',
        cantidad: '10',
        fechaDespacho: '2022-01-01',
        insumos: [
          {
            id: 1,
            nombre: 'inyectadora 20ml',
            codigo: 'IN001',
            cantidad: '10',
          },
        ],
        lotes:[
          {
            id: 1,
            insumoId: 'IN001',
            numeroLote: "L001",
            fechaVencimiento: "2025-01-01",
            cantidad: 50,
            fechaIngreso: "2025-01-01",
            estado: "Activo"
          },
          {
            id: 2,
            insumoId: 'IN001',
            numeroLote: "L002",
            fechaVencimiento: "2026-01-01",
            cantidad: 140,
            fechaIngreso: "2025-01-01",
            estado: "Activo"
          }
        ],
        estado: 'Activo',
        hospitalId: 'J-12345679',
    },
];