'use client';
import { inventActions } from '@/constantes/inventActions';
import { useEffect, useState } from 'react';
import Modal from '@/components/Modal';
import { useRouter } from 'next/navigation';
import { Package, Search, X } from 'lucide-react';
import { getInventario } from '@/servicios/inventario/get';
import { useAuth } from '@/contexts/AuthContext';

export default function Inventario() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [inventario, setInventario] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState({});
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info', // 'info', 'error', 'success', 'warning'
    time: null
  });

  useEffect(() => {
    handleGetLotes();
  }, []);
  
  const showMessage = (title, message, type = 'info', time = null) => {
    setModal({isOpen: true, title, message, type, time});
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleToggleDetalle = (index) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  const handleGetLotes = async () => {
    const { token,sede_id } = user;
    const response = await getInventario(token,sede_id);
    console.log('lotes: ' + JSON.stringify(response,null,2));
    if (!response.status) {
      if(response.autenticacion==1||response.autenticacion==2){
        showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
        logout();
        router.replace('/');
        return;
      }
      showMessage('Error', response.mensaje||'Error en la solicitud', 'error', 4000);
      return;
    }
    if(response.data&&response.data.length > 0){
      setInventario(response?.data);
    }
  };

  // Filtrar inventario según el término de búsqueda
  const filteredInventario = inventario.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item?.insumo?.nombre?.toLowerCase().includes(searchLower) ||
      item?.insumo?.codigo?.toLowerCase().includes(searchLower) ||
      item?.insumo?.descripcion?.toLowerCase().includes(searchLower) ||
      item?.unidad_medida?.toLowerCase().includes(searchLower) ||
      item?.categoria?.toLowerCase().includes(searchLower) ||
      item?.cantidad_total?.toString().includes(searchLower)
    );
  });

  return (
    <div className="md:pl-64 flex flex-col">
      {/* Modal de mensajes */}
      <Modal 
        isOpen={modal.isOpen} 
        onClose={closeModal} 
        title={modal.title} 
        message={modal.message} 
        type={modal.type} 
        time={modal.time}
      />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* <h1 className="text-2xl font-semibold text-gray-900">Gestión de Insumos</h1>
          <p className="mt-2 text-sm text-gray-600">
            Administra los insumos del sistema
          </p> */}
          
          {/* Quick Actions Grid */}
          <div className="mt-2">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {inventActions.map((action, index) => (
                <div 
                  key={index}
                  className={`bg-white border-l-4 ${action.color.split(' ')[3]} overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer`}
                  onClick={() => router.push(action.href)}
                >
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-md ${action.color.split(' ')[0]}`}>
                        {action.icon}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">{action.title}</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Users List - Placeholder for future implementation */}
          <div className="mt-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Lista de lotes de insumos</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Vista previa de los lotes de insumos registrados en el sistema
                    </p>
                  </div>
                  <div className="mt-4 sm:mt-0 sm:ml-4">
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 block w-full pl-10 pr-10 py-2 sm:text-sm border-gray-300 rounded-md"
                        placeholder="Buscar lotes..."
                      />
                      {searchTerm && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <button
                            type="button"
                            onClick={() => setSearchTerm('')}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200">
                {inventario.length === 0 ? (
                  <div className="px-4 py-12 text-center">
                    <p className="text-sm text-gray-500">
                      No hay lotes registrados
                    </p>
                  </div>
                ) : filteredInventario.length === 0 ? (
                  <div className="px-4 py-12 text-center">
                    <p className="text-sm text-gray-500">
                      No se encontraron lotes que coincidan con &quot;{searchTerm}&quot;
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredInventario.map((inventario,index) => (
                      <div key={index} className="px-4 py-5 sm:px-6">
                        {/* Información principal del item */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              <Package className='h-12 w-12 text-gray-600'/>
                            </div>
                            <div className="flex flex-col items-start ml-4">
                              <div className="text-sm font-medium text-gray-900">{inventario?.insumo?.nombre}</div>
                              <div className="text-sm text-gray-500">Cantidad total: <span className="font-bold text-gray-900">{inventario?.cantidad_total}</span></div>
                            </div>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleDetalle(index)}
                              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              {expandedItems[index] ? 'Ocultar' : 'Detalle'}
                            </button>
                          </div>
                        </div>

                        {/* Detalle expandible del item */}
                        {expandedItems[index] && (
                          <div className="mt-6 pt-6 border-t border-gray-100">
                            {/* Información general */}
                            {/* <div className="mb-6">
                              <div className="flex items-center mb-4">
                                <Package className="h-8 w-8 text-indigo-600 mr-3" />
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-900">{selectedInsumo.nombre}</h4>
                                  <p className="text-sm text-gray-600">
                                    Cantidad Total: <span className="font-bold text-indigo-600">{selectedInsumo.cantidad_total}</span>
                                  </p>
                                </div>
                              </div>
                            </div> */}

                            {/* Información adicional si está disponible */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                              {inventario?.unidad_medida && (
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <h5 className="text-sm font-medium text-gray-900 mb-1">Unidad de Medida</h5>
                                  <p className="text-sm text-gray-600">{inventario?.unidad_medida}</p>
                                </div>
                              )}
                              {inventario?.categoria && (
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <h5 className="text-sm font-medium text-gray-900 mb-1">Categoría</h5>
                                  <p className="text-sm text-gray-600">{inventario?.categoria}</p>
                                </div>
                              )}
                              {inventario?.insumo?.descripcion && (
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <h5 className="text-sm font-medium text-gray-900 mb-1">Descripción</h5>
                                  <p className="text-sm text-gray-600">{inventario?.insumo?.descripcion}</p>
                                </div>
                              )}
                            </div>

                            {/* Lotes si están disponibles */}
                            {inventario.lotes && inventario.lotes.length > 0 && (
                              <div>
                                <h4 className="text-md font-semibold text-gray-900 mb-3">Lotes Disponibles</h4>
                                <div className="space-y-3">
                                  {inventario.lotes.map((lote, loteIndex) => (
                                    <div key={loteIndex} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <div className="flex items-center mb-2">
                                            <span className="text-sm font-medium text-gray-900">
                                              Lote: {lote.numero_lote || lote.id || `Lote ${loteIndex + 1}`}
                                            </span>
                                          </div>
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                                            <div className="flex items-center">
                                              <Package className="h-4 w-4 mr-1" />
                                              <span>Cantidad: <strong>{lote.cantidad || 'N/A'}</strong></span>
                                            </div>
                                            {lote.fecha_vencimiento && (
                                              <div className="flex items-center">
                                                <span>Vence: <strong>{new Date(lote.fecha_vencimiento).toLocaleDateString()}</strong></span>
                                              </div>
                                            )}
                                            {lote.proveedor && (
                                              <div className="flex items-center">
                                                <span>Proveedor: <strong>{lote.proveedor}</strong></span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        <div className="ml-4">
                                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            (lote.cantidad && lote.cantidad > 0) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                          }`}>
                                            {(lote.cantidad && lote.cantidad > 0) ? 'Disponible' : 'Agotado'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Mensaje si no hay lotes específicos */}
                            {(!inventario.lotes || inventario.lotes.length === 0) && (
                              <div className="text-center py-8 bg-gray-50 rounded-lg">
                                <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500">
                                  La información de lotes específicos no está disponible en este momento.
                                </p>
                                <p className="text-sm text-gray-400 mt-1">
                                  Cantidad total disponible: <strong>{inventario.cantidad_total}</strong>
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}