'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Search, UserSearch } from 'lucide-react';
import Modal from '@/components/Modal';
import { getUserById } from '@/servicios/users/get';
import { putChangePassword } from '@/servicios/users/put';

export default function Clave() {
  const router = useRouter();
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchError, setSearchError] = useState('');
  const [dataSetForm, setDataSetForm] = useState({});
  const [userFound, setUserFound] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const passwordMatch = password === confirmPassword && password.length >= 6;
  const canUpdate = (autoGenerate || passwordMatch) && userFound && !isSaving;
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info', // 'info', 'error', 'success', 'warning'
    time: null
  });

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
    const result = await getUserById(searchTerm);
    
    if (!result.success) {
      showMessage('Error', 'No se encontró ningún usuario con esta cédula', 'error', 4000);
      setDataSetForm({});
    }
    setDataSetForm(result.data);
    const type=result.data? 'success': 'info';
    const title=result.data? 'Éxito': 'Info';
    showMessage(title, result.message, type, 2000);
    if (result.data) {
      setUserFound(true);
    }
    setSearching(false);
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
    setPassword('');
    setConfirmPassword('');
    setAutoGenerate(false);
  };

  const handleUpdatePassword = async () => {
    if (!canUpdate) return;
    if (!userFound) return;
    setIsSaving(true);
    const newPassword = autoGenerate ? password : confirmPassword;
    const result = await putChangePassword({...dataSetForm, newPassword});
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

  const handleSelectedState=(state)=>{
    setDataSetForm({...dataSetForm, estado: state});
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
                  type="button"
                  onClick={handleUpdatePassword}
                  disabled={!canUpdate}
                  className="ml-3 inline-flex items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                >
                  {isSaving ? (
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
                  {userFound ? 'Resetear Clave' : 'Buscar Usuario'}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {userFound 
                    ? 'Revise y actualice la clave del usuario.'
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
                      Usuario
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Usuario: {dataSetForm?.nombre} {dataSetForm?.apellido}
                    </p>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Cédula: {dataSetForm?.cedula}
                    </p>
                  </div>
                  {/* Sección para actualizar la contraseña */}
                  <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                    <dl className="sm:divide-y sm:divide-gray-200">
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          Generar automáticamente
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center gap-2">
                          <input
                            id="auto-generate"
                            type="checkbox"
                            checked={autoGenerate}
                            onChange={(e) => {
                              setAutoGenerate(e.target.checked);
                              if (e.target.checked) {
                                // Generar clave según regla solicitada
                                const random = `${(dataSetForm?.nombre || '').charAt(0).toUpperCase()}${(dataSetForm?.apellido || '').charAt(0).toLowerCase()}${dataSetForm?.cedula || ''}.`;
                                setPassword(random);
                                setConfirmPassword('');
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="auto-generate" className="text-sm text-gray-700">
                            Auto-generar contraseña segura
                          </label>
                        </dd>
                      </div>
                      {!autoGenerate && (
                        <>
                          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Nueva contraseña</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Mínimo 6 caracteres"
                              />
                            </dd>
                          </div>
                          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Confirmar contraseña</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                              />
                              {password && confirmPassword && !passwordMatch && (
                                <p className="text-sm text-red-600 mt-1">Las contraseñas no coinciden o son muy cortas.</p>
                              )}
                            </dd>
                          </div>
                        </>
                      )}
                    </dl>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}