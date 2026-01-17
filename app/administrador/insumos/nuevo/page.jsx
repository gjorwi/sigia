'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, ArrowLeft, Save, Loader2 } from 'lucide-react';
import InsumoForm from '@/components/insumoForm';
import { postInsumo } from '@/servicios/insumos/post';
import Modal from '@/components/Modal';
import { useAuth } from '@/contexts/AuthContext';

const initialFormData = {
  codigo: '',
  nombre: '',
  tipo: '',
  presentacion: '',
  unidad_medida: '',
  cantidad_por_paquete: 1,
  descripcion: ''
};

export default function NuevoInsumo() {
  const router = useRouter();
  const {user,logout} = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
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

  const handleSubmit = async (formData) => {
    setLoading(true);
    const {token} = user;
    console.log('Datos del formulario:', formData);
    const result = await postInsumo(formData,token);      
    // Mostrar mensaje de éxito y redirigir
    if (!result.status) {
      if (result.autenticacion === 1 || result.autenticacion === 2) {
        showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
        logout();
        router.replace('/');
        return;
      }
      showMessage('Error', result.mensaje, 'error', 4000);
      setLoading(false);
      return;
    }
    showMessage('Éxito', result.mensaje, 'success', 2000);
    // Redirigir a la lista de hospitales
    // router.push('/hospitales');
    setLoading(false);
    clearForm();
  };

  const clearForm = () => {
    setFormData(initialFormData);
  };

  return (
    <div className="md:pl-64 flex flex-col">
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
          <button
            onClick={() => router.replace('/administrador/insumos')}
            className="mb-6 inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </button>
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate">
                Nuevo Insumo
              </h2>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button
                type="button"
                onClick={() => router.push('/administrador/insumos')}
                className="ml-3 inline-flex items-center px-5 py-2.5 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="insumo-form"
                disabled={loading}
                className="ml-3 inline-flex items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
              >
                {loading ? (
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                ) : (
                  <Save className="-ml-1 mr-2 h-5 w-5" />
                )}
                Guardar
              </button>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                <UserPlus className="h-5 w-5 inline-block mr-2 text-blue-500" />
                Información del Insumo
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Complete todos los campos requeridos para registrar un nuevo insumo.
              </p>
            </div>
            
            <InsumoForm 
              id="insumo-form" 
              onSubmit={handleSubmit} 
              formData={formData}
              onFormDataChange={setFormData}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}