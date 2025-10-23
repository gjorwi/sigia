'use client';
import { insumoActions } from '@/constantes/insumoActions';
import { useEffect, useState, useRef, useCallback } from 'react';
import { getInsumos } from '@/servicios/insumos/get';
import Modal from '@/components/Modal';
import { useRouter } from 'next/navigation';
import { Package, Search, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Insumos() {
  const router = useRouter();
  const { user, logout, selectInsumo } = useAuth();
  const [insumos, setInsumos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(10); // Cantidad inicial a mostrar
  const observerTarget = useRef(null);
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info', // 'info', 'error', 'success', 'warning'
    time: null
  });

  useEffect(() => {
    handleGetInsumos();
  }, []);
  
  const showMessage = (title, message, type = 'info', time = null) => {
    setModal({isOpen: true, title, message, type, time});
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };
  
  const handleGetInsumos = async () => {
    setIsLoading(true);
    const {token} = user;
    const response = await getInsumos(token);
    console.log("Response: "+JSON.stringify(response,null,2));
    if (!response.status||response.status===500) {
      setIsLoading(false);
      if (response.autenticacion === 1 || response.autenticacion === 2) {
        showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
        logout();
        router.replace('/');
        return;
      }
      showMessage('Error', response.mensaje||"Error en la solicitud", 'error', 4000);
      return;
    }
    setInsumos(response?.data);
    setIsLoading(false);
    
  }; 

  // Filtrar insumos según el término de búsqueda
  const filteredInsumos = Array.isArray(insumos) ? insumos.filter(insumo => {
    const searchLower = searchTerm.toLowerCase();
    return (
      insumo.codigo?.toLowerCase().includes(searchLower) ||
      insumo.nombre?.toLowerCase().includes(searchLower) ||
      insumo.descripcion?.toLowerCase().includes(searchLower) ||
      insumo.unidad_medida?.toLowerCase().includes(searchLower)
    );
  }) : [];

  // Insumos a mostrar según el scroll
  const displayedInsumos = filteredInsumos.slice(0, displayedCount);
  const hasMore = displayedCount < filteredInsumos.length;

  // Resetear displayedCount cuando cambia el término de búsqueda
  useEffect(() => {
    setDisplayedCount(10);
  }, [searchTerm]);

  // Cargar más insumos cuando se hace scroll
  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setDisplayedCount(prev => prev + 10);
    }
  }, [hasMore, isLoading]);

  // Intersection Observer para detectar cuando llega al final
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMore]);

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
              {insumoActions.map((action, index) => (
                <div 
                  key={index}
                  className={`bg-white border-l-4 ${action.color.split(' ')[3]} overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer`}
                  onClick={() => router.push(action.href)}
                >
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-md ${action.color.split(' ')[0]} `}>
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
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Lista de Insumos</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Vista previa de los insumos registrados en el sistema
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
                        placeholder="Buscar insumos..."
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
                {isLoading ? (
                  <LoadingSpinner message="Cargando insumos..." />
                ) : (
                  <div className="divide-y divide-gray-200">
                    {!Array.isArray(insumos) || insumos.length === 0 ? (
                      <div className="px-4 py-12 text-center">
                        <p className="text-sm text-gray-500">
                          No hay insumos registrados
                        </p>
                      </div>
                    ) : filteredInsumos.length === 0 ? (
                      <div className="px-4 py-12 text-center">
                        <p className="text-sm text-gray-500">
                          No se encontraron insumos que coincidan con &quot;{searchTerm}&quot;
                        </p>
                      </div>
                    ) : (
                      <>
                        {displayedInsumos.map((insumo) => (
                          <div key={insumo.id} className="px-4 py-5 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12 text-gray-900">
                                  <Package className="h-12 w-12 rounded-full" />
                                </div>
                                <div className="ml-4 flex flex-col items-start capitalize">
                                  {/* <div className="text-sm font-medium text-gray-900">{insumo.id}</div> */}
                                  <div className="text-sm font-medium text-gray-900">{insumo.codigo}</div>
                                  <div className="text-sm font-medium text-gray-900">{insumo.nombre}</div>
                                  <div className="text-sm text-gray-500">{insumo.unidad_medida}</div>
                                  <div className="text-sm text-gray-500">{insumo.descripcion}</div>
                                </div>
                              </div>
                              <div className="ml-4 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => { selectInsumo(insumo); router.push('/administrador/insumos/editar'); }}
                                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                  Editar
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {/* Elemento observador para infinite scroll */}
                        {hasMore && (
                          <div ref={observerTarget} className="px-4 py-4 text-center">
                            <div className="inline-flex items-center">
                              <svg className="animate-spin h-5 w-5 text-indigo-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span className="text-sm text-gray-500">Cargando más insumos...</span>
                            </div>
                          </div>
                        )}
                        {!hasMore && filteredInsumos.length > 10 && (
                          <div className="px-4 py-4 text-center">
                            <p className="text-sm text-gray-500">
                              Mostrando {displayedInsumos.length} de {filteredInsumos.length} insumos{searchTerm && ` (filtrados de ${insumos.length} totales)`}
                            </p>
                          </div>
                        )}
                      </>
                    )}
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