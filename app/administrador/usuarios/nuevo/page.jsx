'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, ArrowLeft, Save, Loader2 } from 'lucide-react';
import UserForm from '@/components/userForm';
import Modal from '@/components/Modal';
import { postUser } from '@/servicios/users/post';
import { useAuth } from '@/contexts/AuthContext';
import { getHospitales } from '@/servicios/hospitales/get';
import { useEffect } from 'react';
import SelectHospiModal from '@/components/SelectHospiModal';
import SelectSedeModal from '@/components/SelectSedeModal';
import { getSedeByHospitalId } from '@/servicios/sedes/get';

const initialFormData = {
  cedula: '',
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  direccion: '',
  genero: '',
  tipo: '',
  hospital_id: '',
  hospital_nombre: '',
  hospital: null,
  sede_id: '',
  sede_nombre: '',
  sede: null,
  rol: '',
  password: '',
  confirm_password: '',
  can_view: false,
  can_create: false,
  can_update: false,
  can_delete: false,
  can_crud_user: false,
};

export default function NuevoUsuario() {
  const {user, logout} = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info', // 'info', 'error', 'success', 'warning'
    time: null
  });
  const [hospitals, setHospitals] = useState([]);
  const [showHospitalModal, setShowHospitalModal] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [showSedeModal, setShowSedeModal] = useState(false);
  const [allSedes, setAllSedes] = useState([]);
  const [selectedSede, setSelectedSede] = useState(null);
  
  // Cargar lista de hospitales al montar el componente
  useEffect(() => {
    if (!user?.token) return;
    const fetchHospitals = async () => {
      try {
        const response = await getHospitales(user.token);
        if (response.data && response.data.data) {
          setHospitals(response.data.data);
        }
      } catch (error) {
        console.log('Error al cargar hospitales:', error);
      }
    };
    
    fetchHospitals();
  }, [user?.token]);

  const handleFormDataChange = (newData) => {
    setFormData(newData);
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    const {token} = user;
    const result = await postUser(formData,token); 
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
    clearForm();
    showMessage('Éxito', result.mensaje, 'success', 2000);
    setLoading(false);
  };

  const clearForm = () => {
    setFormData(initialFormData);
  };

  const showMessage = (title, message, type, time) => {
    setModal({
      isOpen: true,
      title,
      message,
      type,
      time
    });
  };

  const handleSelectHospital = (hospital) => {
    setSelectedHospital(hospital);
    setFormData(prev => ({
      ...prev,
      hospital_id: hospital.id,
      hospital_nombre: hospital.nombre,
      hospital: hospital // Guardar el objeto completo por si se necesita
    }));
    handleSede(hospital.id);
    setShowHospitalModal(false);
  };

  const handleSelectSede = (sede) => {
    setSelectedSede(sede);
    setFormData(prev => ({
      ...prev,
      rol:sede.tipo_almacen,
      sede_id: sede.id,
      sede_nombre: sede.nombre,
      sede: sede // Guardar el objeto completo por si se necesita
    }));
    setShowSedeModal(false);
  };

  const handleSede = async (hospitalId) => {
    const {token} = user;
    const sede = await getSedeByHospitalId(hospitalId,token);
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
    if(sede.data&&sede.data.data){
      setAllSedes(sede.data.data);
    }
  };

  const openHospitalModal = () => {
    setShowHospitalModal(true);
  };

  const openSedeModal = () => {
    setShowSedeModal(true);
  };

  return (
    <>
      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        time={modal.time}
        onClose={() => setModal({ isOpen: false })}
      />
      <div className="md:pl-64 flex flex-col">
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
                  Guardar
                </button>
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  <UserPlus className="h-5 w-5 inline-block mr-2 text-blue-500" />
                  Información del Usuario
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Complete todos los campos requeridos para registrar un nuevo usuario.
                </p>
              </div>
              
              <UserForm 
                id="user-form" 
                onSubmit={handleSubmit} 
                onFormDataChange={handleFormDataChange}
                formData={formData}
                loading={loading}
                openHospitalModal={openHospitalModal}
                selectedHospital={selectedHospital}
                openSedeModal={openSedeModal}
                selectedSede={selectedSede}
                setSelectedHospital={setSelectedHospital}
                setSelectedSede={setSelectedSede}
                setAllSedes={setAllSedes}
                menu="nuevo"
              />
            </div>
          </div>
        </div>
      </div>
      <SelectHospiModal
        isOpen={showHospitalModal}
        onClose={() => setShowHospitalModal(false)}
        onSelect={handleSelectHospital}
        hospitals={hospitals}
        tipo={formData?.tipo}
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