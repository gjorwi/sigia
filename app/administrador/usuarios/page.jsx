'use client';
import { userActions } from '@/constantes/userActions';
import { useEffect, useState } from 'react';
import { getUsers } from '@/servicios/users/get';
import Modal from '@/components/Modal';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { User } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Usuarios() {
  const pathname = usePathname();
  const router = useRouter();
  const {user, selectUser, logout} = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info', // 'info', 'error', 'success', 'warning'
    time: null
  });

  useEffect(() => {
    if(user){
      if(/usuarios/i.test(pathname)){
        console.log('user data Usuario:'+JSON.stringify(user,null,2));
        if(!user.can_crud_user){
          router.replace('/administrador');
          return;
        }
      }
      handleGetUsers();
    }
  }, [user]);
  
  const showMessage = (title, message, type = 'info', time = null) => {
    setModal({isOpen: true, title, message, type, time});
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };
  
  const handleGetUsers = async () => {
    setLoading(true);
    const {token} = user;
    const response = await getUsers(token); 
    if (!response.status) {
      if (response.autenticacion === 1 || response.autenticacion === 2) {
        showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
        logout();
        router.replace('/');
        return;
      }
      showMessage('Error', response.mensaje, 'error', 4000);
      return;   
    }
    if(!response.data){
      showMessage('Error', 'Error en la solicitud', 'error', 4000);
      setLoading(false);
      return;
    }
    setAllUsers(response.data.data);
    setUsers(response.data.data);
    setLoading(false);
  };

  

  // Filtrar usuarios basado en el término de búsqueda
  const filteredUsers = Array.isArray(users) ? users.filter(user => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (user?.nombre && user.nombre.toLowerCase().includes(term)) ||
      (user?.apellido && user.apellido.toLowerCase().includes(term)) ||
      (user?.email && user.email.toLowerCase().includes(term)) ||
      (user?.cedula && user.cedula.toString().toLowerCase().includes(term))
    );
  }) : [];

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
          {/* <h1 className="text-2xl font-semibold text-gray-900">Gestión de Usuarios</h1>
          <p className="mt-2 text-sm text-gray-600">
            Administra los usuarios del sistema y sus permisos
          </p> */}
          
          {/* Quick Actions Grid */}
          <div className="mt-2">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {userActions.map((action, index) => (
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
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Lista de Usuarios</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Vista previa de los usuarios registrados en el sistema
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
                        placeholder="Buscar por nombre, apellido, cédula o email"
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
                {loading ? (
                  <LoadingSpinner message="Cargando usuarios..." />
                ) : (
                  <>
                  {users.length === 0 ? (
                    <div className="px-4 py-12 text-center">
                      <p className="text-sm text-gray-500">
                        No hay usuarios registrados
                      </p>
                    </div>
                  ) : (
                    <div className="px-4 py-12 text-center">
                      {filteredUsers.map((user) => (
                        <div key={user?.id} className="px-4 py-5 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12">
                                <User className="h-8 w-8 text-gray-600" />
                              </div>
                              <div className="ml-4 flex flex-col items-start">
                                <div className="text-sm text-gray-500">{user?.cedula}</div>
                                <div className="text-sm font-medium text-gray-900  capitalize">{user?.nombre&&user.nombre.toLowerCase()} {user?.apellido&&user.apellido.toLowerCase()}</div>
                                <div className="text-sm text-gray-500">{user?.email}</div>
                              </div>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  selectUser(user);
                                  router.push('/administrador/usuarios/editar');
                                }}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                Editar
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}