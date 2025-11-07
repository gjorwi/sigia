'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, Download, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Modal from '@/components/Modal';
import ModalSeleccionHospitales from '@/components/ModalSeleccionHospitales';

export default function ReportePacientes() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [hospitalSeleccionado, setHospitalSeleccionado] = useState(null);
  const [showModalHospitales, setShowModalHospitales] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    time: null
  });

  const showMessage = (title, message, type = 'info', time = null) => {
    setModal({ isOpen: true, title, message, type, time });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleSelectHospital = (hospital) => {
    setHospitalSeleccionado(hospital);
    setShowModalHospitales(false);
  };

  const handleGenerarReporte = () => {
    if (!hospitalSeleccionado) {
      showMessage('Advertencia', 'Por favor selecciona un hospital', 'warning', 3000);
      return;
    }
    // Aquí iría la lógica para generar el reporte
    console.log('Generando reporte de pacientes para:', hospitalSeleccionado);
    showMessage('Éxito', 'Generando reporte...', 'success', 2000);
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

      <ModalSeleccionHospitales
        isOpen={showModalHospitales}
        onClose={() => setShowModalHospitales(false)}
        onSelect={handleSelectHospital}
      />

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate">
                <button 
                  onClick={() => router.replace('/administrador/reportes')} 
                  className="mr-3 text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft className="h-6 w-6 inline" />
                </button>
                Atrás
              </h2>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button
                type="button"
                onClick={() => router.push('/administrador/reportes')}
                className="ml-3 inline-flex items-center px-5 py-2.5 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGenerarReporte}
                className="ml-3 inline-flex items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-150 ease-in-out"
              >
                <Download className="-ml-1 mr-2 h-5 w-5" />
                Generar Reporte
              </button>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                <Users className="h-5 w-5 inline-block mr-2 text-orange-500" />
                Reporte de Pacientes
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Información sobre pacientes y consumo de insumos
              </p>
            </div>
            
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-6">
                {/* Campo de selección de hospital */}
                <div>
                  <label htmlFor="hospital" className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar Hospital *
                  </label>
                  <div 
                    onClick={() => setShowModalHospitales(true)}
                    className="relative cursor-pointer"
                  >
                    <input
                      type="text"
                      readOnly
                      value={hospitalSeleccionado ? hospitalSeleccionado.nombre : ''}
                      placeholder="Haz clic para seleccionar un hospital"
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 cursor-pointer bg-white"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Building2 className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Selecciona el hospital para el cual deseas generar el reporte de pacientes
                  </p>
                </div>

                {/* Información adicional */}
                {hospitalSeleccionado && (
                  <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Building2 className="h-5 w-5 text-orange-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-orange-700">
                          <span className="font-medium">Hospital seleccionado:</span> {hospitalSeleccionado.nombre}
                        </p>
                        {hospitalSeleccionado.rif && (
                          <p className="text-sm text-orange-600 mt-1">
                            RIF: {hospitalSeleccionado.rif}
                          </p>
                        )}
                      </div>
                    </div>
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
