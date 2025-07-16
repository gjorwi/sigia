'use client';

import { useState } from 'react';
import { Search, Package, Filter, Download, Plus, AlertCircle } from 'lucide-react';

const Inventario = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('todos');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  
  // Categorías de ejemplo
  const categorias = [
    { id: 'todos', nombre: 'Todos los productos' },
    { id: 'medicamentos', nombre: 'Medicamentos' },
    { id: 'material_medico', nombre: 'Material Médico' },
    { id: 'insumos', nombre: 'Insumos' },
    { id: 'equipos', nombre: 'Equipos' },
  ];

  // Filtros de estado de inventario
  const filters = [
    { id: 'todos', name: 'Todos', count: 45 },
    { id: 'bajo_stock', name: 'Bajo Stock', count: 12 },
    { id: 'agotado', name: 'Agotado', count: 5 },
    { id: 'stock_optimo', name: 'Stock Óptimo', count: 28 },
  ];

  // Datos de ejemplo para el inventario
  const inventario = [
    {
      id: 'MED-001',
      nombre: 'Paracetamol 500mg',
      categoria: 'medicamentos',
      descripcion: 'Analgésico y antipirético',
      stock: 45,
      stockMinimo: 30,
      unidad: 'cajas',
      ubicacion: 'Estante A1',
      proveedor: 'Farmacéutica Nacional',
      estado: 'stock_optimo'
    },
    {
      id: 'MAT-045',
      nombre: 'Jeringas Desechables 5ml',
      categoria: 'material_medico',
      descripcion: 'Jeringas estériles de un solo uso',
      stock: 12,
      stockMinimo: 50,
      unidad: 'unidades',
      ubicacion: 'Estante B3',
      proveedor: 'Suministros Médicos S.A.',
      estado: 'bajo_stock'
    },
    {
      id: 'EQU-012',
      nombre: 'Tensiómetro Digital',
      categoria: 'equipos',
      descripcion: 'Tensiómetro de brazo automático',
      stock: 3,
      stockMinimo: 5,
      unidad: 'unidades',
      ubicacion: 'Almacén de Equipos',
      proveedor: 'TecnoSalud',
      estado: 'bajo_stock'
    },
    {
      id: 'INS-078',
      nombre: 'Guantes de Látex Talla M',
      categoria: 'insumos',
      descripcion: 'Guantes estériles desechables',
      stock: 0,
      stockMinimo: 20,
      unidad: 'paquetes',
      ubicacion: 'Estante C2',
      proveedor: 'ProveMed',
      estado: 'agotado'
    },
  ];

  // Filtrar inventario según búsqueda y filtros
  const filteredItems = inventario.filter(item => {
    const matchesSearch = item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = activeFilter === 'todos' || item.estado === activeFilter;
    const matchesCategory = selectedCategory === 'todos' || item.categoria === selectedCategory;
    
    return matchesSearch && matchesFilter && matchesCategory;
  });

  const getStatusBadge = (stock, stockMinimo) => {
    if (stock === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertCircle className="h-3 w-3 mr-1" />
          Agotado
        </span>
      );
    } else if (stock <= stockMinimo) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertCircle className="h-3 w-3 mr-1" />
          Bajo Stock
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Package className="h-3 w-3 mr-1" />
          En Stock
        </span>
      );
    }
  };

  const getStockPercentage = (stock, stockMinimo) => {
    const optimalStock = stockMinimo * 3; // Consideramos el stock óptimo como 3 veces el mínimo
    const percentage = Math.min(Math.round((stock / optimalStock) * 100), 100);
    return percentage;
  };

  const getCategoryName = (categoryId) => {
    const category = categorias.find(cat => cat.id === categoryId);
    return category ? category.nombre : categoryId;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Inventario de Almacén</h2>
            <p className="text-sm text-gray-300">Gestiona y consulta los artículos en inventario</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Artículo
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-200 bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-white/50" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-white/50 rounded-lg bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Buscar artículos por nombre o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-white/50" />
            </div>
            <select
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id} className="bg-gray-800 text-white">
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                activeFilter === filter.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {filter.name}
              <span className="ml-1.5 inline-flex items-center justify-center h-5 w-5 rounded-full bg-white/10 text-xs">
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg border-8 border-white/80 p-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5 text-white">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Código
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Artículo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Categoría
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Stock
                </th>
                {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Ubicación
                </th> */}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Estado
                </th>
                {/* <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Acciones</span>
                </th> */}
              </tr>
            </thead>
            <tbody className="bg-white/5 divide-y divide-white/10">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-white/50">
                    No se encontraron artículos que coincidan con los criterios de búsqueda.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-white/10">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {item.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{item.nombre}</div>
                      <div className="text-xs text-white/50">{item.descripcion}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {getCategoryName(item.categoria)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {item.stock} {item.unidad}
                        {item.stock > 0 && (
                          <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                            <div 
                              className={`h-2 rounded-full ${
                                item.stock <= item.stockMinimo ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${getStockPercentage(item.stock, item.stockMinimo)}%` }}
                            ></div>
                          </div>
                        )}
                        <div className="text-xs text-white/50 mt-1">
                          Mínimo: {item.stockMinimo} {item.unidad}
                        </div>
                      </div>
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-white/50">
                      {item.ubicacion}
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(item.stock, item.stockMinimo)}
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-amber-400 hover:text-amber-300 mr-3">
                        Editar
                      </button>
                      <button className="text-teal-400 hover:text-teal-300">
                        Ver
                      </button>
                    </td> */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 flex items-center justify-between border-t border-white/10">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-200 bg-white/5 hover:bg-white/10">
              Anterior
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-200 bg-white/5 hover:bg-white/10">
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-white/50">
                Mostrando <span className="font-medium">1</span> a <span className="font-medium">4</span> de{' '}
                <span className="font-medium">4</span> resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white/5 text-sm font-medium text-gray-400 hover:bg-white/10">
                  <span className="sr-only">Anterior</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-indigo-500 bg-indigo-600 text-sm font-medium text-white">
                  1
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white/5 text-sm font-medium text-gray-400 hover:bg-white/10">
                  2
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white/5 text-sm font-medium text-gray-400 hover:bg-white/10">
                  <span className="sr-only">Siguiente</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventario;
