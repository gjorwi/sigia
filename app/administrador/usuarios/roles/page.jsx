'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Search, UserSearch } from 'lucide-react';
import UserForm from '@/components/userForm';
import Modal from '@/components/Modal';
import { getUserById } from '@/servicios/users/get';
import { postUserRoles } from '@/servicios/roles/post';
import { getHospitales } from '@/servicios/hospitales/get';
import SelectHospiModal from '@/components/SelectHospiModal';
import { useAuth } from '@/contexts/AuthContext';

const initialFormData = {
  cedula: '',
  rol: '',
  id_hospital: '',
  id_sede: '',
  permissions: {
    leer: false,
    crear: false,
    actualizar: false,
    eliminar: false
  }
};

const permisos={
  leer: false,
  crear: false,
  actualizar: false,
  eliminar: false
};

const roles=[
  {idType: 'admin', id: 'supervisor', nombre: 'Supervisor' },
  {idType: 'cliente', id: 'almacenp', nombre: 'Almacén Principal' },
  {idType: 'cliente', id: 'farmacia', nombre: 'Farmacia' },
  {idType: 'cliente', id: 'minialmacen', nombre: 'Mini Almacén' },
];

export default function Roles() {
  const router = useRouter();
  const {user,logout}=useAuth();
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchError, setSearchError] = useState('');
  const [dataSetForm, setDataSetForm] = useState({});
  const [userFound, setUserFound] = useState(false);
  const [selectedRole, setSelectedRole] = useState('usuario');
  const [permissions, setPermissions] = useState(permisos);
  const [isSaving, setIsSaving] = useState(false);
  const [showHospitalModal, setShowHospitalModal] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info', // 'info', 'error', 'success', 'warning'
    time: null
  });

  // Cargar lista de hospitales al montar el componente
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await getHospitales(user.token);
        // alert(JSON.stringify(response.data));
        if (response.status && response.data) {
          setHospitals(response.data);
        }
      } catch (error) {
        console.error('Error al cargar hospitales:', error);
      }
    };
    
    fetchHospitals();
  }, [user.token]);

  // Actualizar el rol, hospital y permisos cuando se encuentra un usuario
  useEffect(() => {
    if (dataSetForm && dataSetForm.rol) {
      setSelectedRole(dataSetForm.rol);  
      // Establecer el hospital seleccionado si existe en dataSetForm
      if (dataSetForm.hospital) {
        setSelectedHospital(dataSetForm.hospital);
      }
      // Cargar permisos existentes si los hay
      if (dataSetForm.permissions) {
        setPermissions(dataSetForm.permissions);
      } else {
        setPermissions(permisos);
      }
    }
  }, [dataSetForm]);

  const showMessage = (title, message, type = 'info', time = null) => {
    setModal({isOpen: true, title, message, type, time});
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchTerm.trim()) {
      showMessage('Error', 'Por favor ingrese un número de cédula', 'error', 4000);
      return;
    }
    setSearching(true);
    setUserFound(false);
    const {token} = user;
    const result = await getUserById(searchTerm,token);
    
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
      setDataSetForm({});
    }
    setDataSetForm(result.data);
    const type=result.data? 'success': 'info';
    const title=result.data? 'Éxito': 'Info';
    showMessage(title, result.mensaje, type, 2000);
    if (result.data) {
      setUserFound(true);
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
    setDataSetForm({});
    setUserFound(false);
    setSelectedRole('usuario');
    setPermissions(permisos);
  };

  const togglePermission = (permission) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: !prev[permission]
    }));
  };

  const handleSavePermissions = async () => {
    if (!userFound) return;
    setIsSaving(true);
    const result = await postUserRoles(dataSetForm, permissions);
    if (!result.success) {
      showMessage('Error', result.message, 'error', 4000);
      setIsSaving(false);
      return;
    }
    showMessage(
      'Éxito', 
      result.message, 
      'success', 
      2000
    );
    clearSearch();
    setIsSaving(false);
  };

  const handleSelectedRole = (role) => {
    setDataSetForm({...dataSetForm, rol: role});
    setSelectedRole(role);
  };

  const handleSelectHospital = (hospital) => {
    setSelectedHospital(hospital);
    setDataSetForm(prev => ({
      ...prev,
      hospital_id: hospital.id,
      hospital_nombre: hospital.nombre,
      hospital: hospital // Guardar el objeto completo por si se necesita
    }));
    setShowHospitalModal(false);
  };

  const openHospitalModal = () => {
    setShowHospitalModal(true);
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
                  type="button"
                  onClick={handleSavePermissions}
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
                  {userFound ? 'Asignar Roles y Permisos' : 'Buscar Usuario'}
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
              {/* User Data and Role Management Section */}
              {userFound && (
                <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Gestión de Roles y Permisos
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Cédula: {dataSetForm.cedula}
                    </p>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Usuario: {dataSetForm.nombre} {dataSetForm.apellido}
                    </p>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500 capitalize">
                      Tipo: {dataSetForm.tipo}
                    </p>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                    <dl className="sm:divide-y sm:divide-gray-200">
                      {/* Campo de selección de hospital */}
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          Hospital
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <div onClick={openHospitalModal} className="flex cursor-pointer rounded-md shadow-sm">
                            <input
                              type="text"
                              readOnly
                              value={selectedHospital ? `${selectedHospital.nombre} (${selectedHospital.rif})` : ''}
                              className="flex-1 min-w-0 block w-full px-3 py-2 cursor-pointer rounded-none rounded-l-md border border-gray-300 focus:outline-0 focus:ring-0 sm:text-sm"
                              placeholder="Seleccionar hospital"
                            />
                            <button
                              type="button"
                              onClick={openHospitalModal}
                              className="inline-flex items-center px-3 py-2 cursor-pointer border border-l-0 border-gray-300 bg-gray-50 text-gray-700 text-sm rounded-r-md hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <Search className="h-4 w-4" />
                            </button>
                          </div>
                        </dd>
                      </div>
                      
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
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
                      </div>
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          Permisos
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <div className="space-y-2">
                            {Object.entries(permissions).map(([permission, value]) => (
                              <div key={permission} className="flex items-center">
                                <input
                                  id={`permission-${permission}`}
                                  name={`permission-${permission}`}
                                  type="checkbox"
                                  checked={value}
                                  onChange={() => togglePermission(permission)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor={`permission-${permission}`} className="ml-2 block text-sm text-gray-700">
                                  {permission.charAt(0).toUpperCase() + permission.slice(1)}
                                </label>
                              </div>
                            ))}
                          </div>
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de selección de hospital */}
      <SelectHospiModal
        isOpen={showHospitalModal}
        onClose={() => setShowHospitalModal(false)}
        onSelect={handleSelectHospital}
        hospitals={hospitals}
      />
    </>
  );
}