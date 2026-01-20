'use client';
import { hospiActions } from '@/constantes/hospiActions';
import { useEffect, useState, useRef, useCallback } from 'react';
import { getHospitales } from '@/servicios/hospitales/get';
import Modal from '@/components/Modal';
import { useRouter } from 'next/navigation';
import { Filter, Hospital } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
 

export default function Hospitales() {
  const router = useRouter();
  const { user, selectHospital, logout } = useAuth();
  const [hospitales, setHospitales] = useState([]);
  const [allHospitales, setAllHospitales] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [displayedCount, setDisplayedCount] = useState(10); // Cantidad inicial a mostrar
  const observerTarget = useRef(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    tipo: '',
    dependencia: '',
    status: '',
    estado: '',
    municipio: '',
    parroquia: ''
  });
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info', // 'info', 'error', 'success', 'warning'
    time: null
  });

  useEffect(() => {
    handleGetHospitales();
  }, []);
  
  const showMessage = (title, message, type = 'info', time = null) => {
    setModal({isOpen: true, title, message, type, time});
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  

  const handleGetHospitales = async () => {
    setIsLoading(true);
    const response = await getHospitales(user.token);
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
    console.log(JSON.stringify(response?.data, null, 2));
    setAllHospitales(response?.data);
    setHospitales(response?.data);
    setIsLoading(false);
  };

  

  const uniqueSorted = (values) => {
    return Array.from(
      new Set(
        values
          .map(v => (v == null ? '' : String(v).trim()))
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));
  };

  const normalizeText = (value) => String(value || '').trim().toLowerCase();

  const capitalizeFirst = (value) => {
    const str = String(value || '').trim();
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const getTipoLabel = (tipo) => {
    const normalized = normalizeText(tipo);
    const match = normalized.match(/^hospital_tipo(\d+)$/);
    if (match) {
      const n = Number(match[1]);
      const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][n - 1];
      return roman ? `Tipo ${roman}` : `Tipo ${n}`;
    }
    if (normalized === 'almacen') return 'Almacen';
    if (normalized === 'aus') return 'AUS';
    return 'No especificado';
  };

  const tipoOptions = (() => {
    const tiposRaw = Array.isArray(allHospitales) ? allHospitales.map(h => h?.tipo) : [];
    const numericTipos = new Set();

    for (const t of tiposRaw) {
      const normalized = normalizeText(t);
      const match = normalized.match(/^hospital_tipo(\d+)$/);
      if (match) {
        numericTipos.add(Number(match[1]));
      }
    }

    const sortedNumeric = Array.from(numericTipos).sort((a, b) => a - b);
    const mappedNumeric = sortedNumeric.map(n => `hospital_tipo${n}`);

    return [...mappedNumeric, 'almacen', 'aus'];
  })();

  const dependenciaOptions = uniqueSorted(Array.isArray(allHospitales) ? allHospitales.map(h => h?.dependencia) : []);

  const statusOptions = ['activo', 'inactivo'];
  const estadoOptions = uniqueSorted(Array.isArray(allHospitales) ? allHospitales.map(h => h?.estado) : []);

  const municipioOptions = uniqueSorted(
    Array.isArray(allHospitales)
      ? allHospitales
          .filter(h => !filters.estado || String(h?.estado || '').toLowerCase() === String(filters.estado).toLowerCase())
          .map(h => h?.municipio)
      : []
  );

  const parroquiaOptions = uniqueSorted(
    Array.isArray(allHospitales)
      ? allHospitales
          .filter(h => !filters.estado || String(h?.estado || '').toLowerCase() === String(filters.estado).toLowerCase())
          .filter(h => !filters.municipio || String(h?.municipio || '').toLowerCase() === String(filters.municipio).toLowerCase())
          .map(h => h?.parroquia)
      : []
  );

  // Filtrar hospitales basado en el término de búsqueda
  const filteredHospitales = Array.isArray(allHospitales)
    ? allHospitales.filter(hospital => {
        const matchesText = (() => {
          if (!searchTerm.trim()) return true;
          const term = searchTerm.toLowerCase();
          return (
            (hospital?.nombre && String(hospital.nombre).toLowerCase().includes(term)) ||
            (hospital?.rif && String(hospital.rif).toLowerCase().includes(term)) ||
            (hospital?.email && String(hospital.email).toLowerCase().includes(term))
          );
        })();

        if (!matchesText) return false;

        const matchesTipo = (() => {
          if (!filters.tipo) return true;
          if (filters.tipo === '__none__') return !hospital?.tipo;
          return normalizeText(hospital?.tipo) === normalizeText(filters.tipo);
        })();

        if (!matchesTipo) return false;

        const equalsFilter = (value, selected) => {
          if (!selected) return true;
          return String(value || '').toLowerCase() === String(selected).toLowerCase();
        };

        return (
          equalsFilter(hospital?.dependencia, filters.dependencia) &&
          equalsFilter(hospital?.status, filters.status) &&
          equalsFilter(hospital?.estado, filters.estado) &&
          equalsFilter(hospital?.municipio, filters.municipio) &&
          equalsFilter(hospital?.parroquia, filters.parroquia)
        );
      })
    : [];

  // Hospitales a mostrar según el scroll
  const displayedHospitales = filteredHospitales.slice(0, displayedCount);
  const hasMore = displayedCount < filteredHospitales.length;

  // Cargar más hospitales cuando se hace scroll
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

  // Resetear el contador cuando cambia el filtro
  useEffect(() => {
    setDisplayedCount(10);
  }, [searchTerm, filters]);

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
          {/* <h1 className="text-2xl font-semibold text-gray-900">Gestión de Hospitales</h1> */}
          {/* <p className="mt-2 text-sm text-gray-600">
            Administra los hospitales del sistema y sus fichas de insumos
          </p> */}
          
          {/* Quick Actions Grid */}
          <div className="mt-2">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {hospiActions.map((action, index) => (
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
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Lista de Hospitales</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Vista previa de los hospitales registrados en el sistema
                    </p>
                  </div>
                  <div className="mt-4 sm:mt-0 w-full sm:w-80">
                    <label htmlFor="search" className="sr-only">Buscar</label>
                    <div className="flex items-center gap-2">
                      <div className="relative rounded-md shadow-sm flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          name="search"
                          id="search"
                          className="focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 text-gray-700 block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-md py-2"
                          placeholder="Buscar por nombre, RIF o email"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setSearchTerm('')}
                          >
                            <span className="text-gray-400 hover:text-gray-500">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </span>
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white p-2 text-gray-600 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onClick={() => setIsFilterModalOpen(true)}
                        title="Filtrar"
                      >
                        <Filter className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200">
                {isLoading ? (
                  <LoadingSpinner message="Cargando hospitales..." />
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredHospitales.length === 0 ? (
                      <div className="px-4 py-12 text-center">
                        <p className="text-sm text-gray-500">
                          {searchTerm ? 'No se encontraron hospitales con ese criterio' : 'No hay hospitales registrados'}
                        </p>
                      </div>
                    ) : (
                      <>
                        {displayedHospitales.map((hospital) => (
                          <div key={hospital.id} className="px-4 py-5 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12">
                                  <Hospital className="h-8 w-8 text-gray-600" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm text-gray-500 uppercase">SICM: {hospital.cod_sicm}</div>
                                  <div className="text-sm text-gray-500 uppercase">{hospital.rif}</div>
                                  <div className="text-sm font-medium text-gray-900">{hospital.nombre}</div>
                                  <div className="text-sm text-gray-500">{hospital.email_contacto}</div>
                                </div>
                              </div>
                              <div className="ml-4 flex-shrink-0">
                                <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      selectHospital(hospital);
                                      router.push('/administrador/hospitales/editar');
                                    }}
                                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                  >
                                    Editar
                                  </button>
                                </div>
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
                              <span className="text-sm text-gray-500">Cargando más hospitales...</span>
                            </div>
                          </div>
                        )}
                        {!hasMore && filteredHospitales.length > 10 && (
                          <div className="px-4 py-4 text-center">
                            <p className="text-sm text-gray-500">
                              Mostrando {displayedHospitales.length} de {filteredHospitales.length} hospitales
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

      {isFilterModalOpen && (
        <div className="fixed inset-0 z-[10002] overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsFilterModalOpen(false)}
          />
          <div className="flex min-h-screen items-center justify-center p-4 text-center">
            <div
              className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:items-center sm:justify-between sm:px-6 sm:py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Filtros</h3>
                <button
                  type="button"
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={() => setIsFilterModalOpen(false)}
                >
                  <span className="sr-only">Cerrar</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de hospital</label>
                    <select
                      className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={filters.tipo}
                      onChange={(e) => setFilters(prev => ({ ...prev, tipo: e.target.value }))}
                    >
                      <option value="">Todos</option>
                      <option value="__none__">No especificado</option>
                      {tipoOptions.map(opt => (
                        <option key={opt} value={opt}>{getTipoLabel(opt)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dependencia</label>
                    <select
                      className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={filters.dependencia}
                      onChange={(e) => setFilters(prev => ({ ...prev, dependencia: e.target.value }))}
                    >
                      <option value="">Todos</option>
                      {dependenciaOptions.map(opt => (
                        <option key={opt} value={opt}>{capitalizeFirst(opt)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="">Todos</option>
                      {statusOptions.map(opt => (
                        <option key={opt} value={opt}>{capitalizeFirst(opt)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                    <select
                      className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={filters.estado}
                      onChange={(e) => {
                        const estado = e.target.value;
                        setFilters(prev => ({ ...prev, estado, municipio: '', parroquia: '' }));
                      }}
                    >
                      <option value="">Todos</option>
                      {estadoOptions.map(opt => (
                        <option key={opt} value={opt}>{capitalizeFirst(opt)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Municipio</label>
                    <select
                      className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400 sm:text-sm"
                      value={filters.municipio}
                      onChange={(e) => {
                        const municipio = e.target.value;
                        setFilters(prev => ({ ...prev, municipio, parroquia: '' }));
                      }}
                      disabled={!filters.estado}
                    >
                      <option value="">Todos</option>
                      {municipioOptions.map(opt => (
                        <option key={opt} value={opt}>{capitalizeFirst(opt)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Parroquia</label>
                    <select
                      className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400 sm:text-sm"
                      value={filters.parroquia}
                      onChange={(e) => setFilters(prev => ({ ...prev, parroquia: e.target.value }))}
                      disabled={!filters.estado || !filters.municipio}
                    >
                      <option value="">Todos</option>
                      {parroquiaOptions.map(opt => (
                        <option key={opt} value={opt}>{capitalizeFirst(opt)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-gray-200 gap-2">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsFilterModalOpen(false)}
                >
                  Aplicar
                </button>
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm"
                  onClick={() => setFilters({ tipo: '', dependencia: '', status: '', estado: '', municipio: '', parroquia: '' })}
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}