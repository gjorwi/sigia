'use client';
import { sedesActions } from '@/constantes/sedesActions';
import { useEffect, useState } from 'react';
import { getSedes } from '@/servicios/sedes/get';
import Modal from '@/components/Modal';
import { useRouter } from 'next/navigation';
import { Hospital } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { sedesTipos } from '@/constantes/sedesTipos';
import { provincias } from '@/constantes/provincias';

export default function Sede() {
  const router = useRouter();
  const { user, selectSede, logout } = useAuth();
  const [sedes, setSedes] = useState([]);
  const [allSedes, setAllSedes] = useState([]);
  const [groupedSedes, setGroupedSedes] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info', // 'info', 'error', 'success', 'warning'
    time: null
  });

  useEffect(() => {
    handleGetSedes();
  }, []);
  
  const showMessage = (title, message, type = 'info', time = null) => {
    setModal({isOpen: true, title, message, type, time});
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const toggleGroup = (hospitalId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [hospitalId]: !prev[hospitalId]
    }));
  };

  const handleGetSedes = async () => {
      setIsLoading(true);
      const {token} = user;
      const response = await getSedes(token);
      if (!response.status) {
        if (response.autenticacion === 1 || response.autenticacion === 2) {
          showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
          logout();
          router.replace('/');
          setIsLoading(false);
          return;
        }
        showMessage('Error', response.mensaje, 'error', 4000);
        setIsLoading(false);
        return;
      }
      console.log(JSON.stringify(response.data.data,null,2));
      // Agrupar las sedes por hospital con datos del hospital incluidos
      const groupedSedes = response.data.data.reduce((acc, sede) => {
        const hospitalId = sede.hospital_id;
        
        // Buscar si ya existe un grupo para este hospital
        const existingGroup = acc.find(group => group.datosHospital.id === hospitalId);
        
        if (existingGroup) {
          // Si el grupo ya existe, agregar la sede al array
          existingGroup.data.push(sede);
        } else {
          // Si no existe, crear un nuevo grupo con los datos del hospital
          // Manejar caso donde hospital sea null o undefined
          const hospitalData = sede.hospital || {
            id: hospitalId,
            nombre: 'Hospital no encontrado',
            rif: 'N/A',
            estado: null
          };
          
          acc.push({
            datosHospital: hospitalData,
            data: [sede]
          });
        }
        
        return acc;
      }, []);
      console.log(JSON.stringify(groupedSedes,null,2));

      setAllSedes(response.data.data);
      setSedes(response.data.data);
      setGroupedSedes(groupedSedes);
      setIsLoading(false);
  };

  // Filtrar grupos basado en el término de búsqueda
  const filteredGroups = Array.isArray(groupedSedes) ? groupedSedes.filter(grupo => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    
    // Buscar en los datos del hospital
    const hospitalMatch = (
      (grupo.datosHospital?.nombre && grupo.datosHospital.nombre.toLowerCase().includes(term)) ||
      (grupo.datosHospital?.rif && grupo.datosHospital.rif.toLowerCase().includes(term)) ||
      (grupo.datosHospital?.email && grupo.datosHospital.email.toLowerCase().includes(term))
    );
    
    // Buscar en las sedes del grupo
    const sedesMatch = grupo.data.some(sede => (
      (sede?.nombre && sede.nombre.toLowerCase().includes(term))
    ));
    
    return hospitalMatch || sedesMatch;
  }) : [];
  
  // // Debug: Verificar el estado de los datos
  // console.log('Estado actual:', {
  //   allSedesLength: allSedes.length,
  //   groupedSedesLength: groupedSedes.length,
  //   filteredGroupsLength: filteredGroups.length,
  //   searchTerm: searchTerm,
  //   groupedSedes: groupedSedes
  // });

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
              {sedesActions.map((action, index) => (
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
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Lista de Sedes por Hospital</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Vista previa de las sedes registradas en el sistema
                    </p>
                  </div>
                  <div className="mt-4 sm:mt-0 w-full sm:w-64">
                    <label htmlFor="search" className="sr-only">Buscar</label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="search"
                        id="search"
                        className="focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 text-gray-700 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
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
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200">
                {isLoading ? (
                  <LoadingSpinner message="Cargando hospitales..." />
                ) : (
                  <div className="divide-y divide-gray-200">
                    {allSedes.length === 0 ? (
                      <div className="px-4 py-12 text-center">
                        <p className="text-sm text-gray-500">
                          No hay sedes registradas
                        </p>
                      </div>
                    ) : searchTerm && filteredGroups.length === 0 ? (
                      <div className="px-4 py-12 text-center">
                        <p className="text-sm text-gray-500">
                          No se encontraron resultados para la búsqueda
                        </p>
                      </div>
                    ) : (
                      (searchTerm ? filteredGroups : groupedSedes).map((grupo) => (
                        <div key={grupo.datosHospital.id} className="border-b border-gray-200 last:border-b-0">
                          {/* Header del hospital */}
                          <div 
                            className="px-4 py-5 sm:px-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                            onClick={() => toggleGroup(grupo.datosHospital.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12">
                                  <Hospital className="h-8 w-8 text-gray-600" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-md font-bold text-gray-700">{grupo.datosHospital.nombre}</div>
                                  <div className="text-sm font-medium text-gray-500 uppercase">RIF: {grupo.datosHospital.rif}</div>
                                  <div className="text-sm font-medium text-gray-500 uppercase">SICM: {grupo.datosHospital.codigo_sicm}</div>
                                  <div className="text-sm text-gray-500">Estado: {provincias.find((provincia) => provincia.id === grupo.datosHospital.estado)?.nombre}</div>
                                  <div className="text-sm text-gray-500">{grupo.data.length} sede(s)</div>
                                </div>
                              </div>
                              <div className="ml-4 flex-shrink-0">
                                <svg 
                                  className={`h-5 w-5 text-gray-400 transform transition-transform duration-200 ${expandedGroups[grupo.datosHospital.id] ? 'rotate-180' : ''}`}
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          
                          {/* Lista de sedes desplegable */}
                          {expandedGroups[grupo.datosHospital.id] && (
                            <div className="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200">
                              <div className="space-y-3">
                                {grupo.data.map((sede) => (
                                  <div key={sede.id} className="bg-white rounded-lg border border-gray-200 p-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                            <span className="text-xs font-medium text-indigo-600">{sede.id}</span>
                                          </div>
                                        </div>
                                        <div className="ml-3">
                                          <div className="text-sm font-bold text-gray-700">{sede.nombre}</div>
                                          <div className="text-sm text-gray-500">Tipo: {sedesTipos[sede.tipo_almacen]}</div>
                                        </div>
                                      </div>
                                      <div className="ml-4 flex-shrink-0">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            selectSede(sede);
                                            router.push('/administrador/sedes/editar');
                                          }}
                                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                          Editar
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
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