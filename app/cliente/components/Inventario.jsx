'use client';

import { useState, useEffect } from 'react';
import { Search, Package, Filter, Download, Plus, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getInventario } from '@/servicios/inventario/get';
import Modal from '@/components/Modal';

const Inventario = ({setMenuActivo}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('todos');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [insumos, setInsumos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    time: null
  });

  useEffect(() => {
    fetchInventario();
  }, []);

  const fetchInventario = async () => {
    setLoading(true);
    const { token, sede_id } = user;
    const response = await getInventario(token, sede_id);
    console.log("Response Insumos: "+JSON.stringify(response, null, 2));
    if (!response.status) {
      setLoading(false);
      if (response.autenticacion === 1 || response.autenticacion === 2) {
        showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
        logout();
        return;
      }
      // showMessage('Error', response.mensaje || 'Error al cargar inventario', 'error', 4000);
      return;
    }

    if (response.data && Array.isArray(response.data)) {
      // Transformar datos para el componente
      const insumosConLotes = response.data
        .filter(item => item.cantidad_total > 0) // Solo insumos con stock
        .map(item => {
          // Eliminar lotes duplicados basándose en lote_id
          const lotesUnicos = (item.lotes || [])
            .filter(lote => lote.cantidad > 0)
            .reduce((acc, lote) => {
              const existe = acc.find(l => l.lote_id === lote.lote_id);
              if (!existe) {
                acc.push({
                  ...lote,
                  cantidad_seleccionada: 0
                });
              }
              return acc;
            }, []);

          return {
            id: item.id || item.insumo_id,
            nombre: item?.insumo?.nombre || 'Sin nombre',
            codigo: item.codigo || item.insumo?.codigo || 'Sin código',
            cantidad_total: item.cantidad_total || 0,
            lotes: lotesUnicos
          };
        });
      console.log("Insumos con lotes: "+JSON.stringify(insumosConLotes, null, 2));
      setInsumos(insumosConLotes);
    }
    setLoading(false);
  };

  const showMessage = (title, message, type = 'info', time = null) => {
    setModal({ isOpen: true, title, message, type, time });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };
  
  // Categorías dinámicas basadas en los datos
  const categorias = [
    { id: 'todos', nombre: 'Todos los productos' },
    { id: 'medicamentos', nombre: 'Medicamentos' },
    { id: 'material_medico', nombre: 'Material Médico' },
    { id: 'insumos', nombre: 'Insumos' },
    { id: 'equipos', nombre: 'Equipos' },
  ];

  // Filtros de estado de inventario basados en datos reales
  const getFilters = () => {
    const todos = insumos.length;
    const bajoStock = insumos.filter(item => item.cantidad_total <= 10).length;
    const agotado = insumos.filter(item => item.cantidad_total === 0).length;
    const stockOptimo = insumos.filter(item => item.cantidad_total > 10).length;
    
    return [
      { id: 'todos', name: 'Todos', count: todos },
      { id: 'bajo_stock', name: 'Bajo Stock', count: bajoStock },
      { id: 'agotado', name: 'Agotado', count: agotado },
      { id: 'stock_optimo', name: 'Stock Óptimo', count: stockOptimo },
    ];
  };

  // Función para determinar el estado del stock
  const getEstadoStock = (cantidad) => {
    if (cantidad === 0) return 'agotado';
    if (cantidad <= 10) return 'bajo_stock';
    return 'stock_optimo';
  };

  // Función para filtrar insumos
  const getInsumosFiltrados = () => {
    let filtrados = insumos;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtrados = filtrados.filter(insumo =>
        insumo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        insumo.codigo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (activeFilter !== 'todos') {
      filtrados = filtrados.filter(insumo => {
        const estado = getEstadoStock(insumo.cantidad_total);
        return estado === activeFilter;
      });
    }

    return filtrados;
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  // Función para determinar si un lote está próximo a vencer (30 días)
  const isProximoAVencer = (fechaVencimiento) => {
    if (!fechaVencimiento) return false;
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diasRestantes = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
    return diasRestantes <= 30 && diasRestantes > 0;
  };

  // Función para determinar si un lote está vencido
  const isVencido = (fechaVencimiento) => {
    if (!fechaVencimiento) return false;
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    return vencimiento < hoy;
  };

  // Obtener insumos filtrados
  const filteredItems = getInsumosFiltrados();

  const getStatusBadge = (cantidad) => {
    const estado = getEstadoStock(cantidad);
    
    if (estado === 'agotado') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertCircle className="h-3 w-3 mr-1" />
          Agotado
        </span>
      );
    } else if (estado === 'bajo_stock') {
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
    <>
    <Modal
      isOpen={modal.isOpen}
      onClose={closeModal}
      title={modal.title}
      message={modal.message}
      type={modal.type}
      time={modal.time}
    />
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Inventario de Almacén</h2>
            <p className="text-sm text-gray-300">Gestiona y consulta los artículos en inventario</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button onClick={() => setMenuActivo('registro')} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Artículo
            </button>
            {/* <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-200 bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </button> */}
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
          
          {/* <div className="relative">
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
          </div> */}
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {getFilters().map((filter) => (
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
                  Stock Total
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Lotes
                </th>
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
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-white/50">
                    {loading ? 'Cargando inventario...' : 'No se encontraron insumos que coincidan con los criterios de búsqueda.'}
                  </td>
                </tr>
              ) : (
                filteredItems.map((insumo) => (
                  <tr key={insumo.id} className="hover:bg-white/10">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {insumo.codigo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{insumo.nombre}</div>
                      <div className="text-xs text-white/50">ID: {insumo.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white font-semibold">
                        {insumo.cantidad_total} unidades
                      </div>
                      {insumo.cantidad_total > 0 && (
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                          <div 
                            className={`h-2 rounded-full ${
                              insumo.cantidad_total <= 10 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(100, (insumo.cantidad_total / 50) * 100)}%` }}
                          ></div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-white w-48">
                        <div className="font-medium mb-2 flex items-center gap-2">
                          <span className="bg-white/20 px-2 py-0.5 rounded text-xs">
                            {insumo.lotes.length} lote{insumo.lotes.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                          {insumo.lotes.map((lote, idx) => (
                            <div key={`${insumo.id}-${lote.lote_id}-${idx}`} className="text-xs bg-white/10 rounded px-2 py-1.5">
                              <div className="flex justify-between items-center gap-2">
                                <span className="font-medium truncate">{lote.numero_lote}</span>
                                <span className="text-white/70 whitespace-nowrap text-[10px]">{lote.cantidad} u.</span>
                              </div>
                              <div className="flex justify-between items-center gap-2 mt-0.5">
                                <span className="text-white/50 text-[10px]">Vence:</span>
                                <span className={`text-[10px] whitespace-nowrap ${
                                  isVencido(lote.fecha_vencimiento) ? 'text-red-400 font-bold' :
                                  isProximoAVencer(lote.fecha_vencimiento) ? 'text-yellow-400 font-medium' :
                                  'text-white/70'
                                }`}>
                                  {formatDate(lote.fecha_vencimiento)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(insumo.cantidad_total)}
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
                Mostrando <span className="font-medium">{filteredItems.length}</span> de{' '}
                <span className="font-medium">{insumos.length}</span> insumos
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
    </>
  );
};

export default Inventario;
