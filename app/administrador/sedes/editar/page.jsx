'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Search, UserSearch } from 'lucide-react';
import Modal from '@/components/Modal';
import { getSedeById } from '@/servicios/sedes/get';
import { updateSede } from '@/servicios/sedes/put';
import { useAuth } from '@/contexts/AuthContext';
import { provincias } from '@/constantes/provincias';

const initialFormData = {
  nombre: '',
  tipo_almacen:'',
};
const tipo=[
  {idSede:'almacenAUS',nombre:'Alamacen AUS'},
  {idSede:'almacenCent',nombre:'Alamacen Central'},
  {idSede:'almacenPrin',nombre:'Alamacen Principal'},
  {idSede:'almacenFarm',nombre:'Almacen Farmacia'},
  {idSede:'almacenPar',nombre:'Almacen Paralelo'},
  {idSede:'almacenServAtenciones',nombre:'Almacen Servicios de Atenciones'},
  {idSede:'almacenServApoyo',nombre:'Almacen Servicios de Apoyo'},
]

export default function SedeEditar() {
  const router = useRouter();
  const {user,logout,clearSelectedSede,selectedSede}=useAuth();
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [dataSetForm, setDataSetForm] = useState(initialFormData);
  const [sedeFound, setSedeFound] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info', // 'info', 'error', 'success', 'warning'
    time: null
  });

  // Cargar automáticamente los datos del sede si hay uno seleccionado
  useEffect(() => {
    if (selectedSede) {
      setSearchTerm(selectedSede.id);
      handleSearch(null, true);
    }
    
    // Limpiar el hospital seleccionado al desmontar el componente
    return () => {
      clearSelectedSede();
    };
  }, [selectedSede]);

  const showMessage = (title, message, type = 'info', time = null) => {
    setModal({isOpen: true, title, message, type, time});
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleSearch = async (e, skipValidation = false) => {
    e?.preventDefault();
    if (!searchTerm.trim() && !skipValidation) {
      showMessage('Error', 'Por favor ingrese un id de sede', 'error', 4000);
      return;
    }

    const idSedeToSearch = skipValidation ? selectedSede.id : searchTerm.trim();

    setSearching(true);
    setSedeFound(false);
    const {token} = user;
    const result = await getSedeById(idSedeToSearch,token);
    console.log('Sede encontrada: '+JSON.stringify(result,null,2));
    if (!result.status) {
      if(result.autenticacion==1||result.autenticacion==2){
        showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
        logout();
        router.replace('/');
        setSearching(false);
        setLoading(false);
        return;
      }
      setSearching(false);
      setLoading(false);
      showMessage('Error', result.mensaje, 'error', 4000);
      setDataSetForm(initialFormData);
    }
    setDataSetForm(result.data);
    const type=result.data? 'success': 'info';
    const title=result.data? 'Éxito': 'Info';
    showMessage(title, result.mensaje, type, 2000);
    if(result.data){
      setSedeFound(true);
    }
    setSearching(false);
    setLoading(false);
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (searchError) setSearchError('');
  };
  
  const clearSearch = () => {
    setSearchTerm('');
    setSearchError('');
    setDataSetForm(initialFormData);
    setSedeFound(false);
  };

  const handleSaveSede = async () => {
    if (!sedeFound) return;
    setIsSaving(true);
    const {token} = user;
    const result = await updateSede(dataSetForm, token);
    if (!result.status) {
      if(result.autenticacion==1||result.autenticacion==2){
        showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
        logout();
        router.replace('/');
        setIsSaving(false);
        return;
      }
      showMessage('Error', result.mensaje, 'error', 4000);
      setIsSaving(false);
      return;
    }
    showMessage(
      'Éxito', 
      result.mensaje, 
      'success', 
      2000
    );
    clearSearch();
    setIsSaving(false);
  };

  return (
    <>
      
      <div className="md:pl-64 mt-16 flex flex-col">
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
            <div className="md:flex md:items-center md:justify-between mb-6">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate">
                  <button 
                    onClick={() => router.replace('/administrador/sedes')} 
                    className="mr-3 text-gray-500 hover:text-gray-700"
                  >
                    <ArrowLeft className="h-6 w-6 inline" />
                  </button>
                  Atras
                </h2>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <button
                  type="button"
                  onClick={() => router.push('/administrador/sedes')}
                  className="ml-3 inline-flex items-center px-5 py-2.5 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveSede}
                  disabled={loading || isSaving}
                  className="ml-3 inline-flex items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                >
                  {loading || isSaving ? (
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  ) : (
                    <Save className="-ml-1 mr-2 h-5 w-5" />
                  )}
                  Asignar
                </button>
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  <UserSearch className="h-5 w-5 inline-block mr-2 text-blue-500" />
                  {sedeFound ? 'Asignar Sede' : 'Buscar Sede'}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {sedeFound 
                    ? 'Revise y actualice la información de la sede.'
                    : 'Ingrese el número de id para buscar una sede.'}
                </p>
                
                {/* Campo de búsqueda de cédula */}
                <div className="mt-4">
                  <form onSubmit={handleSearch} className="flex space-x-2 text-gray-700">
                    <div className="flex-1">
                      <label htmlFor="rif" className="sr-only">Rif</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="text"
                          id="rif"
                          value={searchTerm}
                          onChange={handleSearchChange}
                          placeholder="Ingrese el número de rif"
                          className={`block w-full px-4 py-2 text-base border ${
                            searchError 
                              ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                          } rounded-md shadow-sm placeholder-gray-400`}
                          disabled={searching || sedeFound}
                        />
                      </div>
                      {searchError && (
                        <p className="mt-1 text-sm text-red-600">{searchError}</p>
                      )}
                    </div>
                    
                    {!sedeFound ? (
                      <button
                        type="submit"
                        disabled={searching || !searchTerm}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                          searching || !searchTerm 
                            ? 'bg-blue-400' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                      >
                        {searching ? (
                          <>
                            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                            Buscando...
                          </>
                        ) : (
                          <>
                            <Search className="-ml-1 mr-2 h-4 w-4" />
                            Buscar
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Nueva Búsqueda
                      </button>
                    )}
                  </form>
                </div>
              </div>
              {/* User Data and Role Management Section */}
              {sedeFound && (
                <div className=" bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 ">
                    <div className="text-lg font-medium text-gray-900">
                      Datos de hospital
                    </div>
                    <div className="text-sm text-gray-500 flex flex-col">
                      <div>{dataSetForm?.hospital?.nombre}</div>
                      <div>{dataSetForm?.hospital?.rif}</div>
                      <div>{provincias.find(provincia => provincia.id === dataSetForm?.hospital?.estado)?.nombre}</div>

                    </div>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                    <dl className="sm:divide-y sm:divide-gray-200">
                      {/* campo para agregar nombre de la sede */}
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          Nombre de la Sede
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <input
                            type="text"
                            value={dataSetForm.nombre||''}
                            onChange={(e) => setDataSetForm({ ...dataSetForm, nombre: e.target.value })}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          />
                        </dd>
                      </div>
                      {/* campo para seleccionar tipo de sede */}
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          Tipo de Sede
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <select
                            value={dataSetForm.tipo_almacen||''}
                            onChange={(e) => setDataSetForm({ ...dataSetForm, tipo_almacen: e.target.value })}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option value="">Seleccione un tipo de sede</option>
                            {tipo.map((tipo) => (
                              <option key={tipo.idSede} value={tipo.idSede}>
                                {tipo.nombre}
                              </option>
                            ))}
                          </select>
                        </dd>
                      </div>
                      
                      {/* <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          Rol
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <select
                            value={selectedRole}
                            onChange={(e) => handleSelectedRole(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option value="">Seleccionar rol</option>
                            {roles.filter(role => role.idType === dataSetForm.tipo).map((role) => (
                              <option key={role.id} value={role.id}>
                                {role.nombre}
                              </option>
                            ))}
                          </select>
                        </dd>
                      </div> */}
                      
                    </dl>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de selección de hospital
      <SelectHospiModal
        isOpen={showHospitalModal}
        onClose={() => setShowHospitalModal(false)}
        onSelect={handleSelectHospital}
        hospitals={hospitals}
      /> */}
    </>
  );
}