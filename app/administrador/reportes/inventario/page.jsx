'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, Download, Building2, ChevronDown, ChevronRight, Warehouse, Box, Calendar, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Modal from '@/components/Modal';
import ModalSeleccionHospitales from '@/components/ModalSeleccionHospitales';
import { getInventarioHospital } from '@/servicios/inventario/get';

export default function ReporteInventario() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [hospitalSeleccionado, setHospitalSeleccionado] = useState(null);
  const [showModalHospitales, setShowModalHospitales] = useState(false);
  const [inventario, setInventario] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [expandedAlmacenes, setExpandedAlmacenes] = useState({});
  const [expandedInsumos, setExpandedInsumos] = useState({});
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
    handleInventarioHospital(hospital.id);
    setHospitalSeleccionado(hospital);
    setShowModalHospitales(false);
  };

  const handleInventarioHospital = async (hospitalId) => {
    const {token} = user;
    const response = await getInventarioHospital(token, hospitalId);
    console.log("InventarioHospital: "+JSON.stringify(response, null, 2));
    if(!response.status){
      if(response.autenticacion === 1 || response.autenticacion === 2){
        showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
        logout();
        router.replace('/');
        return;
      }
      showMessage('Error', response.message, 'error', 3000);
      return;
    }
    console.log("Inventario: "+JSON.stringify(response.data, null, 2));
    if (response.data) {
      setInventario(response.data);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleAlmacen = (almacenKey) => {
    setExpandedAlmacenes(prev => ({
      ...prev,
      [almacenKey]: !prev[almacenKey]
    }));
  };

  const toggleInsumo = (insumoId) => {
    setExpandedInsumos(prev => ({
      ...prev,
      [insumoId]: !prev[insumoId]
    }));
  };

  const handleGenerarReporte = () => {
    if (!hospitalSeleccionado) {
      showMessage('Advertencia', 'Por favor selecciona un hospital', 'warning', 3000);
      return;
    }
    // Aquí iría la lógica para generar el reporte
    console.log('Generando reporte de inventario para:', hospitalSeleccionado);
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
            {/* <div className="mt-4 flex md:mt-0 md:ml-4">
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
                className="ml-3 inline-flex items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150 ease-in-out"
              >
                <Download className="-ml-1 mr-2 h-5 w-5" />
                Generar Reporte
              </button>
            </div> */}
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                <Package className="h-5 w-5 inline-block mr-2 text-purple-500" />
                Reporte de Inventario
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Estado actual del inventario por sede y almacén
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
                      className="block w-full px-4 text-gray-700 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 cursor-pointer bg-white"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Building2 className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Selecciona el hospital para el cual deseas generar el reporte de inventario
                  </p>
                </div>

                {/* Información adicional */}
                {hospitalSeleccionado && (
                  <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Building2 className="h-5 w-5 text-purple-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-purple-700">
                          <span className="font-medium">Hospital seleccionado:</span> {hospitalSeleccionado.nombre}
                        </p>
                        {hospitalSeleccionado.rif && (
                          <p className="text-sm text-purple-600 mt-1">
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

          {/* Reporte de Inventario */}
          {inventario && inventario.por_almacen ? (
            <div className="mt-6 space-y-6">
              {/* Resumen General */}
              {inventario.total_general && (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div 
                    className="px-4 py-5 sm:px-6 bg-purple-50 border-b border-purple-200 cursor-pointer hover:bg-purple-100 transition-colors"
                    onClick={() => toggleSection('total_general')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {expandedSections.total_general ? (
                          <ChevronDown className="h-5 w-5 mr-2 text-purple-700" />
                        ) : (
                          <ChevronRight className="h-5 w-5 mr-2 text-purple-700" />
                        )}
                        <Package className="h-5 w-5 mr-2 text-purple-700" />
                        <div>
                          <h3 className="text-lg leading-6 font-medium text-purple-900">
                            Resumen General del Inventario
                          </h3>
                          <p className="mt-1 text-sm text-purple-700">
                            Total de insumos diferentes: {inventario.total_general.total_insumos_diferentes} | Cantidad total: {inventario.total_general.cantidad_total}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {expandedSections.total_general && (
                    <div className="px-4 py-5 sm:p-6 bg-purple-25">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insumo</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Presentación</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad Total</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distribución</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {inventario.total_general.insumos.map((insumo) => (
                              <tr key={insumo.insumo_id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{insumo.codigo}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{insumo.nombre}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{insumo.presentacion}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-purple-600">{insumo.cantidad_total}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                  {Object.entries(insumo.por_almacen).map(([almacen, cantidad]) => (
                                    <div key={almacen} className="text-xs">
                                      <span className="font-medium">{almacen}:</span> {cantidad}
                                    </div>
                                  ))}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Inventario por Almacén */}
              {Object.entries(inventario.por_almacen).map(([almacenKey, almacenData]) => (
                almacenData.total_insumos_diferentes > 0 && (
                  <div key={almacenKey} className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div 
                      className="px-4 py-5 sm:px-6 bg-indigo-50 border-b border-indigo-200 cursor-pointer hover:bg-indigo-100 transition-colors"
                      onClick={() => toggleAlmacen(almacenKey)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {expandedAlmacenes[almacenKey] ? (
                            <ChevronDown className="h-5 w-5 mr-2 text-indigo-700" />
                          ) : (
                            <ChevronRight className="h-5 w-5 mr-2 text-indigo-700" />
                          )}
                          <Warehouse className="h-5 w-5 mr-2 text-indigo-700" />
                          <div>
                            <h3 className="text-lg leading-6 font-medium text-indigo-900">
                              {almacenData.nombre_almacen}
                            </h3>
                            <p className="mt-1 text-sm text-indigo-700">
                              Insumos diferentes: {almacenData.total_insumos_diferentes} | Cantidad total: {almacenData.cantidad_total}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {expandedAlmacenes[almacenKey] && (
                      <div className="px-4 py-5 sm:p-6 bg-indigo-25">
                        <div className="space-y-4">
                          {almacenData.insumos.map((insumo) => (
                            <div key={insumo.insumo_id} className="border border-gray-200 rounded-lg overflow-hidden">
                              <div 
                                className="bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => toggleInsumo(`${almacenKey}-${insumo.insumo_id}`)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3 flex-1">
                                    {expandedInsumos[`${almacenKey}-${insumo.insumo_id}`] ? (
                                      <ChevronDown className="h-4 w-4 text-gray-500" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-gray-500" />
                                    )}
                                    <Box className="h-4 w-4 text-gray-400" />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-900">{insumo.nombre}</p>
                                      <p className="text-xs text-gray-500">Código: {insumo.codigo} | {insumo.presentacion}</p>
                                    </div>
                                  </div>
                                  <span className="px-3 py-1 text-sm font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                    {insumo.cantidad_total}
                                  </span>
                                </div>
                              </div>

                              {expandedInsumos[`${almacenKey}-${insumo.insumo_id}`] && (
                                <div className="px-4 py-4 bg-indigo-50 border-l-4 border-indigo-500">
                                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Lotes ({insumo.lotes.length})</p>
                                  <div className="space-y-2">
                                    {insumo.lotes.map((lote) => (
                                      <div key={lote.lote_id} className="bg-white p-3 rounded-lg border border-gray-200">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                          <div>
                                            <span className="text-gray-500">Lote:</span>
                                            <span className="ml-1 font-medium text-gray-900">{lote.numero_lote}</span>
                                          </div>
                                          <div>
                                            <span className="text-gray-500">Cantidad:</span>
                                            <span className="ml-1 font-medium text-indigo-600">{lote.cantidad}</span>
                                          </div>
                                          <div>
                                            <span className="text-gray-500">Vencimiento:</span>
                                            <span className="ml-1 text-gray-900">
                                              {new Date(lote.fecha_vencimiento).toLocaleDateString()}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-gray-500">Sede:</span>
                                            <span className="ml-1 text-gray-900">{lote.sede_nombre}</span>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              ))}

              {/* Ingresos Directos */}
              {inventario.ingresos_directos && inventario.ingresos_directos.total_insumos_diferentes > 0 && (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div 
                    className="px-4 py-5 sm:px-6 bg-green-50 border-b border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
                    onClick={() => toggleSection('ingresos_directos')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {expandedSections.ingresos_directos ? (
                          <ChevronDown className="h-5 w-5 mr-2 text-green-700" />
                        ) : (
                          <ChevronRight className="h-5 w-5 mr-2 text-green-700" />
                        )}
                        <Package className="h-5 w-5 mr-2 text-green-700" />
                        <div>
                          <h3 className="text-lg leading-6 font-medium text-green-900">
                            Ingresos Directos
                          </h3>
                          <p className="mt-1 text-sm text-green-700">
                            Insumos diferentes: {inventario.ingresos_directos.total_insumos_diferentes} | Cantidad total: {inventario.ingresos_directos.cantidad_total}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {expandedSections.ingresos_directos && (
                    <div className="px-4 py-5 sm:p-6 bg-green-25">
                      <div className="space-y-3">
                        {inventario.ingresos_directos.insumos.map((insumo) => (
                          <div key={insumo.insumo_id} className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{insumo.nombre}</p>
                                <p className="text-xs text-gray-500">Código: {insumo.codigo} | {insumo.presentacion}</p>
                              </div>
                              <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                                {insumo.cantidad_total}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : hospitalSeleccionado && (
            <div className="mt-6">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-12 sm:px-6 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                    <Package className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    No se encontró inventario
                  </h3>
                  <p className="text-sm text-gray-500 mb-1">
                    No hay inventario registrado para <span className="font-semibold">{hospitalSeleccionado.nombre}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Consulta realizada exitosamente
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
