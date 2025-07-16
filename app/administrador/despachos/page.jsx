'use client';
import { despachoActions } from '@/constantes/despachoActions';
import { useEffect, useState } from 'react';
import { getDespachos } from '@/servicios/despachos/get';
import Modal from '@/components/Modal';
import { useRouter } from 'next/navigation';
import { Package } from 'lucide-react';

export default function Insumos() {
  const router = useRouter();
  const [despachos, setDespachos] = useState([]);
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info', // 'info', 'error', 'success', 'warning'
    time: null
  });

  useEffect(() => {
    handleGetDespachos();
  }, []);
  
  const showMessage = (title, message, type = 'info', time = null) => {
    setModal({isOpen: true, title, message, type, time});
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };
  
  const handleGetDespachos = async () => {
    const response = await getDespachos();
    if (!response.success) {
      console.error('Error al obtener despachos:', response.message);
      showMessage('Error', response.message, 'error', 4000);
      return;
    }
    // showMessage('Éxito', response.message, 'success', 2000);
    setDespachos(response.data);
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
          {/* <h1 className="text-2xl font-semibold text-gray-900">Gestión de Insumos</h1> */}
          {/* <p className="mt-2 text-sm text-gray-600">
            Administra los despachos del sistema
          </p> */}
          
          {/* Quick Actions Grid */}
          <div className="mt-2">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {despachoActions.map((action, index) => (
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
                <h3 className="text-lg font-medium leading-6 text-gray-900">Lista de Despachos</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Vista previa de los despachos registrados en el sistema
                </p>
              </div>
              <div className="border-t border-gray-200">
                {despachos.length === 0 ? (
                  <div className="px-4 py-12 text-center">
                    <p className="text-sm text-gray-500">
                      No hay despachos registrados
                    </p>
                  </div>
                ) : (
                  <div className="px-4 py-12 text-center">
                    {despachos.map((despacho) => (
                      <div key={despacho.id} className="px-4 py-5 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex justify-start items-start">
                            <div className="flex-shrink-0 h-12 w-12 text-gray-900">
                              <Package className="h-12 w-12 rounded-full" />
                            </div>
                            <div className="ml-4 flex flex-col items-start justify-start">
                              <div className="text-sm font-medium text-gray-900">{despacho.nombre}</div>
                              <div className="text-sm text-gray-500">{despacho.fechaDespacho}</div>
                            </div>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <button
                              type="button"
                              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Detalle
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