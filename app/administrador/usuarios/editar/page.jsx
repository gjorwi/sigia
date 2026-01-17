'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Search, UserSearch } from 'lucide-react';
import UserForm from '@/components/userForm';
import Modal from '@/components/Modal';
import { getUserById } from '@/servicios/users/get';
import { putUser } from '@/servicios/users/put';
import { useAuth } from '@/contexts/AuthContext';
import SelectHospiModal from '@/components/SelectHospiModal';
import SelectSedeModal from '@/components/SelectSedeModal';
import { getHospitales } from '@/servicios/hospitales/get';
import { getSedeByHospitalId } from '@/servicios/sedes/get';
import { useEffect } from 'react';

const initialFormData = {
  cedula: '',
  nombre: '',
  apellido: '',
  genero: '',
  email: '',
  telefono: '',
  direccion: '',
  tipo: '',
  hospital_id: '',
  hospital_nombre: '',
  hospital: null,
  sede_id: '',
  sede_nombre: '',
  sede: null,
  rol: '',
  is_root: false,
  can_view: false,
  can_create: false,
  can_update: false,
  can_delete: false,
  can_crud_user: false,
};

export default function EditarUsuario() {
  const router = useRouter();
  const {user, selectUser, logout, selectedUser, clearSelectedUser} = useAuth();
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchError, setSearchError] = useState('');
  const [dataSetForm, setDataSetForm] = useState(initialFormData);
  const [userFound, setUserFound] = useState(false);
  const [showHospitalModal, setShowHospitalModal] = useState(false);
  const [showSedeModal, setShowSedeModal] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [selectedSede, setSelectedSede] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [allSedes, setAllSedes] = useState([]);
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info', // 'info', 'error', 'success', 'warning'
    time: null
  });
  // Cargar automáticamente los datos del hospital si hay uno seleccionado
  useEffect(() => {
    if (selectedUser) {
      setSearchTerm(selectedUser.cedula);
      handleSearch(null, true);
    }
    
    // Limpiar el hospital seleccionado al desmontar el componente
    return () => {
      clearSelectedUser();
    };
  }, [selectedUser]);

  // Cargar lista de hospitales al montar el componente
  useEffect(() => {
    if (!user?.token) return;
    const fetchHospitals = async () => {
      try {
        const result = await getHospitales(user?.token);
        console.log('getHospitales result: ' + JSON.stringify(result, null, 2));
        if (result?.autenticacion === 1 || result?.autenticacion === 2) {
          showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
          logout();
          router.replace('/');
          return;
        }
        const hospitalsData = result?.data?.data || result?.data || result;
        if (Array.isArray(hospitalsData)) {
          setHospitals(hospitalsData);
        }
      } catch (error) {
        console.error('Error al cargar hospitales:', error);
      }
    };
    
    fetchHospitals();
  }, [user?.token]);

  const showMessage = (title, message, type = 'info', time = null) => {
    setModal({isOpen: true, title, message, type, time});
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleSubmit = async (formData) => {
    if (!userFound) {
      setSearchError('Por favor busque un usuario primero');
      return;
    }
    console.log('Datos del formulario: ' + JSON.stringify(formData, null, 2));
    setLoading(true);
    const {token} = user;
    const result = await putUser(formData, token);
    if (!result.status || result?.name==='AxiosError') {
      if(result.autenticacion==1||result.autenticacion==2){
        showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
        logout();
        router.replace('/');
        setLoading(false);
        return;
      }
      showMessage('Error', result.mensaje||'Error de servidor', 'error', 4000);
      setLoading(false);
      return;
    }
    console.log('Resultado: ' + JSON.stringify(result, null, 2));
    showMessage('Éxito', result.mensaje, 'success', 2000);
    setLoading(false);
    clearSearch();
  };

  const handleSearch = async (e, skipValidation = false) => {
    e?.preventDefault();
    if (!skipValidation && !searchTerm.trim()) {
      showMessage('Error', 'Por favor ingrese un número de cédula', 'error', 4000);
      return;
    }
    const {token} = user;

    const cedulaToSearch = skipValidation ? selectedUser.cedula : searchTerm.trim();

    setSearching(true);
    setUserFound(false);
    const result = await getUserById(cedulaToSearch, token);
    if (!result.status) {
      if(result.autenticacion==1||result.autenticacion==2){
        showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
        logout();
        router.replace('/');
        setSearching(false);
        setLoading(false);
        return;
      }
      showMessage('Error', result.mensaje, 'error', 4000);
      setDataSetForm(initialFormData);
      setSearching(false);
      setLoading(false);
      return;
    }
    console.log('Usuario encontrado: '+JSON.stringify(result.data,null,2));
    setDataSetForm(result.data);
    const type=result.data? 'success': 'info';
    const title=result.data? 'Éxito': 'Información';
    showMessage(title, result.mensaje, type, 2000);
    if (result.data) {
      setUserFound(true);
      setDataSetForm(prev => ({
        ...prev,
        hospital_id: result.data?.hospital?.id,
        hospital_nombre: result.data?.hospital?.nombre,
        hospital: result.data?.hospital,
        sede_id: result.data?.sede?.id,
        sede_nombre: result.data?.sede?.nombre,
        sede: result.data?.sede,
      }));
      if(result.data?.hospital&&result.data?.hospital?.id){
        setSelectedHospital(result.data?.hospital);
        handleSede(result.data?.hospital?.id);
      }
      if(result.data?.sede&&result.data?.sede?.id){
        setSelectedSede(result.data?.sede);
      }
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
    setUserFound(false);
  };
  const openHospitalModal = () => {
    setShowHospitalModal(true);
  };

  const openSedeModal = () => {
    setShowSedeModal(true);
  };

  const handleSelectHospital = (hospital) => {
    setSelectedHospital(hospital);
    setSelectedSede('');
    setDataSetForm(prev => ({
      ...prev,
      hospital_id: hospital.id,
      hospital_nombre: hospital.nombre,
      hospital: hospital,
      sede_id: '',
      sede_nombre: '',
      sede: null,
    }));
    handleSede(hospital.id);
    setShowHospitalModal(false);
  };

  const handleSelectSede = (sede) => {
    setSelectedSede(sede);
    setDataSetForm(prev => ({
      ...prev,
      sede_id: sede.id,
      sede_nombre: sede.nombre,
      sede: sede,
    }));
    setShowSedeModal(false);
  };
  const handleSede = async (hospitalId) => {
    const {token} = user;
    const sede = await getSedeByHospitalId(hospitalId,token);
    // alert(JSON.stringify(sede));
    if (!sede.status) {
      if (sede.autenticacion === 1 || sede.autenticacion === 2) {
        showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
        logout();
        router.replace('/');
        return;
      }
      showMessage('Error', sede.mensaje, 'error', 4000);
      setLoading(false);
      return;   
    }
    console.log('sede.data: ' + JSON.stringify(sede.data,null,2));
    setAllSedes(sede?.data?.data);
  };

  return (
    <>
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
            <div className="md:flex md:items-center md:justify-between mb-6">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate">
                  <button 
                    onClick={() => router.replace('/administrador/usuarios')} 
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
                  onClick={() => router.push('/administrador/usuarios')}
                  className="ml-3 inline-flex items-center px-5 py-2.5 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="user-form"
                  disabled={loading}
                  className="ml-3 inline-flex items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                >
                  {loading ? (
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  ) : (
                    <Save className="-ml-1 mr-2 h-5 w-5" />
                  )}
                  Actualizar
                </button>
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  <UserSearch className="h-5 w-5 inline-block mr-2 text-blue-500" />
                  {userFound ? 'Editar Usuario' : 'Buscar Usuario'}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {userFound 
                    ? 'Revise y actualice la información del usuario.'
                    : 'Ingrese el número de cédula para buscar un usuario.'}
                </p>
                
                {/* Campo de búsqueda de cédula */}
                <div className="mt-4">
                  <form onSubmit={handleSearch} className="flex space-x-2 text-gray-700">
                    <div className="flex-1">
                      <label htmlFor="cedula" className="sr-only">Cédula</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="text"
                          id="cedula"
                          value={searchTerm}
                          onChange={handleSearchChange}
                          placeholder="Ingrese el número de cédula"
                          className={`block w-full px-4 py-2 text-base border ${
                            searchError 
                              ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                          } rounded-md shadow-sm placeholder-gray-400`}
                          disabled={searching || userFound}
                        />
                      </div>
                      {searchError && (
                        <p className="mt-1 text-sm text-red-600">{searchError}</p>
                      )}
                    </div>
                    
                    {!userFound ? (
                      <button
                        type="submit"
                        disabled={searching || !searchTerm.trim()}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                          searching || !searchTerm.trim() 
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
              
              {userFound && (
                <UserForm 
                  id="user-form" 
                  onSubmit={handleSubmit} 
                  loading={loading}
                  formData={dataSetForm}
                  onFormDataChange={setDataSetForm}
                  openHospitalModal={openHospitalModal}
                  selectedHospital={selectedHospital}
                  openSedeModal={openSedeModal}
                  selectedSede={selectedSede}
                  setSelectedHospital={setSelectedHospital}
                  setSelectedSede={setSelectedSede}
                  setAllSedes={setAllSedes}
                  menu="editar"
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <SelectHospiModal
        isOpen={showHospitalModal}
        onClose={() => setShowHospitalModal(false)}
        onSelect={handleSelectHospital}
        hospitals={hospitals}
        tipo={dataSetForm?.tipo}
      />
      <SelectSedeModal
        isOpen={showSedeModal}
        onClose={() => setShowSedeModal(false)}
        onSelect={handleSelectSede}
        sedes={allSedes}
      />
    </>
  );
}