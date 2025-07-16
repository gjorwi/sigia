'use client';
import { userActions } from '@/constantes/userActions';
import { useEffect, useState } from 'react';
import { getUsers } from '@/servicios/users/get';
import Modal from '@/components/Modal';
import { useRouter } from 'next/navigation';

export default function Usuarios() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info', // 'info', 'error', 'success', 'warning'
    time: null
  });

  useEffect(() => {
    handleGetUsers();
  }, []);
  
  const showMessage = (title, message, type = 'info', time = null) => {
    setModal({isOpen: true, title, message, type, time});
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };
  
  const handleGetUsers = async () => {
    const response = await getUsers();
    if (!response.success) {
      console.error('Error al obtener usuarios:', response.message);
      showMessage('Error', response.message, 'error', 4000);
      return;
    }
    // showMessage('Éxito', response.message, 'success', 2000);
    setUsers(response.data);
  };

  

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
                <h3 className="text-lg font-medium leading-6 text-gray-900">Lista de Usuarios</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Vista previa de los usuarios registrados en el sistema
                </p>
              </div>
              <div className="border-t border-gray-200">
                {users.length === 0 ? (
                  <div className="px-4 py-12 text-center">
                    <p className="text-sm text-gray-500">
                      No hay usuarios registrados
                    </p>
                  </div>
                ) : (
                  <div className="px-4 py-12 text-center">
                    {users.map((user) => (
                      <div key={user.id} className="px-4 py-5 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              <img className="h-12 w-12 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <button
                              type="button"
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}