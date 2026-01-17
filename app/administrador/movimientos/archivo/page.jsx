'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, FileSpreadsheet, Save, X, Upload } from 'lucide-react';
import Modal from '@/components/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { postMovimientoEstados } from '@/servicios/despachos/post';
import { provincias } from '@/constantes/provincias';


export default function Despachos() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [invFile, setInvFile] = useState(null);
  const [despFile, setDespFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
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

  const handleDespChange = (e) => {
    const file = e.target.files?.[0] || null;
    setDespFile(file);
  };

  const procesarDespachos = async () => {
    if (!despFile) return;
    setLoading(true);
    // TODO: enviar al backend
    console.log('[Despachos] Procesar archivo:', despFile.name);
    const {token} = user;
    const formData = new FormData();
    formData.append('file', despFile);
    const result = await postMovimientoEstados( token, formData);
    console.log("Resultado import antes del if: "+JSON.stringify(result, null, 2));
    if(!result.status){
      if(result.autenticacion==1||result.autenticacion==2){
        showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
        logout();
        router.replace('/');
        return;
      }
      showMessage('Error', result.mensaje || 'Error al procesar el archivo de despachos', 'error', 4000);
      setLoading(false);
      return;
    }
    console.log("Resultado import: "+JSON.stringify(result, null, 2));
    showMessage('Éxito', 'Archivo de despachos procesado correctamente', 'success', 4000);
    setLoading(false);
  };

  const handleCancelar = () => {
    setInvFile(null);
    setDespFile(null);
    router.push('/administrador/movimientos');
  };

  const limpiarArchivo = () => {
    setDespFile(null);
  };

  return (
    <>
      <Modal 
        isOpen={modal.isOpen} 
        onClose={closeModal} 
        title={modal.title} 
        message={modal.message} 
        type={modal.type} 
        time={modal.time}
      />
      <div className="md:pl-64 flex flex-col">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            {/* Header con botón atrás y acciones */}
            <button
              onClick={() => router.push('/administrador/movimientos')}
              className="mb-6 inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </button>
            <div className="md:flex md:items-center md:justify-between mb-6">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate">
                  Nuevo Movimiento por Archivo
                </h2>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <button
                  type="button"
                  onClick={handleCancelar}
                  disabled={loading || downloadingTemplate}
                  className="ml-3 inline-flex items-center px-5 py-2.5 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                {/* <button
                  type="button"
                  onClick={descargarPlantillaExcel}
                  disabled={loading || downloadingTemplate}
                  className="ml-3 inline-flex items-center px-5 py-2.5 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloadingTemplate ? (
                    <>
                      <Upload className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Download className="-ml-1 mr-2 h-5 w-5" />
                      Descargar Plantilla
                    </>
                  )}
                </button> */}
                <button
                  type="button"
                  onClick={procesarDespachos}
                  disabled={!despFile || loading || downloadingTemplate}
                  className="ml-3 inline-flex items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Upload className="-ml-1 mr-2 h-5 w-5" />
                      Procesar
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  <FileSpreadsheet className="h-5 w-5 inline-block mr-2 text-blue-500" />
                  Cargar Archivo de Despachos
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Seleccione un archivo CSV o Excel para procesar los despachos
                </p>
              </div>

              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-6">

                  {/* Despachos por Archivo */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        Seleccionar archivo
                      </label>
                      {despFile && (
                        <button
                          type="button"
                          onClick={limpiarArchivo}
                          className="text-sm text-red-600 hover:text-red-800 flex items-center"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Limpiar
                        </button>
                      )}
                    </div>
                    
                    {!despFile ? (
                      // Estado inicial: zona de carga
                      <label
                        htmlFor="file-upload"
                        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
                      >
                        <div className="space-y-1 text-center">
                          <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <span className="font-medium text-gray-700">Cargar un archivo</span>
                            <p className="pl-1">o arrastrar y soltar</p>
                          </div>
                          <p className="text-xs text-gray-500">CSV, XLS, XLSX hasta 10MB</p>
                        </div>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept=".csv,text/csv,.xlsx,.xls"
                          onChange={handleDespChange}
                          className="sr-only"
                        />
                      </label>
                    ) : (
                      // Estado con archivo cargado: confirmación en el mismo cuadro
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-green-400 bg-green-50 rounded-md transition-all">
                        <div className="space-y-3 text-center w-full">
                          <div className="flex justify-center">
                            <div className="rounded-full bg-green-100 p-3">
                              <svg className="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-green-900">
                              Archivo cargado correctamente
                            </h3>
                          </div>
                          <div className=" rounded-md p-4 pt-0 text-left">
                            <div className="space-y-2 text-sm text-gray-700">
                              <div className="flex justify-center gap-1">
                                <span className="font-medium text-gray-500">Nombre:</span>
                                <span className="text-gray-900 font-medium">{despFile.name}</span>
                              </div>
                              <div className="flex justify-center gap-1">
                                <span className="font-medium text-gray-500">Tamaño:</span>
                                <span className="text-gray-900">{(despFile.size / 1024).toFixed(2)} KB</span>
                              </div>
                              <div className="flex justify-center gap-1">
                                <span className="font-medium text-gray-500">Tipo:</span>
                                <span className="text-gray-900">{despFile.type || 'Archivo de hoja de cálculo'}</span>
                              </div>
                            </div>
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

        
      </div>
    </>
  );
}