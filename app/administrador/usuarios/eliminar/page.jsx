'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Search, UserSearch } from 'lucide-react';
import Modal from '@/components/Modal';
import { getUserById } from '@/servicios/users/get';
import { deleteUser } from '@/servicios/users/delete';
import { useAuth } from '@/contexts/AuthContext';

export default function Eliminar() {
  const router = useRouter();
  const {user, logout} = useAuth();
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchError, setSearchError] = useState('');
  const [dataSetForm, setDataSetForm] = useState({});
  const [userFound, setUserFound] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState('');
  
  // Texto requerido para habilitar la eliminación
  const requiredText = dataSetForm?.cedula ? `ELIMINAR ${dataSetForm.cedula}` : '';
  const canDelete = confirmDelete === requiredText;
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
    const {token} = user;
    setSearching(true);
    setUserFound(false);
    const result = await getUserById(searchTerm, token);
    if (!result.status) {
      if (result.autenticacion === 1 || result.autenticacion === 2) {
        showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
        logout();
        router.replace('/');
        setSearching(false);
        return;
      }
      showMessage('Error', result.mensaje, 'error', 4000);
      setSearching(false);
      return;   
    }
    setDataSetForm(result.data);
    const type=result.data? 'success': 'info';
    const title=result.data? 'Éxito': 'Info';
    showMessage(title, result.mensaje, type, 2000);
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
    setConfirmDelete('');
  };

  const handleDelete = async () => {
    if (!userFound) return;
    setIsSaving(true);
    if (!canDelete) {
      showMessage('Error', 'Por favor ingrese el texto correcto para eliminar', 'error', 4000);
      setIsSaving(false);
      return;
    }
    const {token} = user;
    const result = await deleteUser(dataSetForm, token);
    if (!result.status) {
      if (result.autenticacion === 1 || result.autenticacion === 2) {
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
                  onClick={handleDelete}
                  disabled={isSaving || !canDelete}
                  className={`ml-3 inline-flex items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${isSaving || !canDelete ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out`}
                >
                  {isSaving ? (
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  ) : (
                    <Save className="-ml-1 mr-2 h-5 w-5" />
                  )}
                  Eliminar
                </button>
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  <UserSearch className="h-5 w-5 inline-block mr-2 text-blue-500" />
                  {userFound ? 'Eliminar Usuario' : 'Buscar Usuario'}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {userFound 
                    ? 'Revise y elimine el usuario.'
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
                  {/* agregar un campo para que el ingrese la palabra eliminar + la cedula para confirmar que quiere eliminar */}
                  <div className="border-t border-red-300 bg-red-50 px-4 py-6 sm:p-0 rounded-b-lg">
                    <dl className="sm:divide-y sm:divide-gray-200">
                      <div className="py-6 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-md font-extrabold text-red-700 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.366-.446.957-.704 1.568-.704.61 0 1.201.258 1.567.704l5.857 7.146c.573.699.573 1.76 0 2.459l-5.857 7.147c-.366.446-.957.704-1.567.704-.611 0-1.202-.258-1.568-.704L2.4 12.704a1.75 1.75 0 010-2.459L8.257 3.1z" clipRule="evenodd" /></svg>
                          ¡Atención! Esta acción eliminará al usuario de forma permanente.
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            <p>Ingrese la palabra "eliminar" + la cédula para confirmar que quiere eliminar</p>
                          <input
                            type="text"
                            value={confirmDelete}
                            placeholder="ELIMINAR 12345678"
                            onChange={(e) => setConfirmDelete(e.target.value)}
                            className="w-full bg-red-100 border-2 px-3 py-2 border-red-500 text-red-700 placeholder-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
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
    </>
  );
}