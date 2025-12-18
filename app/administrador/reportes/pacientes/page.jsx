'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, Download, Building2, Calendar, Search, Package, FileText, User, Phone, MapPin, Stethoscope, ClipboardList, Pill, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Modal from '@/components/Modal';
import ModalSeleccionHospitales from '@/components/ModalSeleccionHospitales';
import { getPacientesHospital } from '@/servicios/pacientes/get';

export default function ReportePacientes() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [hospitalSeleccionado, setHospitalSeleccionado] = useState(null);
  const [showModalHospitales, setShowModalHospitales] = useState(false);
  const [pacientes, setPacientes] = useState([]);
  const [fecha, setFecha] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('dia');
  const [expandedPacientes, setExpandedPacientes] = useState({});
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

  const handleGetPacientesHospital = async () => {
    if (!hospitalSeleccionado) {
      showMessage('Advertencia', 'Por favor selecciona un hospital', 'warning', 3000);
      return;
    }
    if (!fecha) {
      showMessage('Advertencia', 'Por favor selecciona una fecha', 'warning', 3000);
      return;
    }

    const { token } = user;
    const response = await getPacientesHospital(token, hospitalSeleccionado.id, fecha, tipoFiltro);
    console.log("PacientesHospital: "+JSON.stringify(response, null, 2));
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
    console.log("Pacientes: "+JSON.stringify(response.data, null, 2));
    if (response.data) {
      setPacientes(response.data);
    }
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

  const togglePaciente = (pacienteIdx) => {
    setExpandedPacientes(prev => ({
      ...prev,
      [pacienteIdx]: !prev[pacienteIdx]
    }));
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
                onClick={handleGetPacientesHospital}
                className="ml-3 inline-flex items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-150 ease-in-out"
              >
                <Search className="h-5 w-5 mr-2" />
                Buscar Pacientes
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
                      className="block w-full text-gray-700 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 cursor-pointer bg-white"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Building2 className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Selecciona el hospital para el cual deseas generar el reporte de pacientes
                  </p>
                </div>

                {/* Filtros de búsqueda */}
                {hospitalSeleccionado && (
                  <>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Campo de fecha */}
                      <div>
                        <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha *
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            id="fecha"
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                            className="block w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-white"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <Calendar className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          Selecciona la fecha para filtrar los datos
                        </p>
                      </div>

                      {/* Campo de tipo de filtro */}
                      <div>
                        <label htmlFor="tipoFiltro" className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de Búsqueda *
                        </label>
                        <select
                          id="tipoFiltro"
                          value={tipoFiltro}
                          onChange={(e) => setTipoFiltro(e.target.value)}
                          className="block w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-white"
                        >
                          <option value="dia">Día</option>
                          <option value="mes">Mes</option>
                          <option value="año">Año</option>
                        </select>
                        <p className="mt-2 text-sm text-gray-500">
                          Define el rango temporal de la búsqueda
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sección de resultados */}
          {pacientes && pacientes.despachos_por_paciente && pacientes.despachos_por_paciente.length > 0 && (
            <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      <FileText className="h-5 w-5 inline-block mr-2 text-orange-500" />
                      Resultados del Reporte
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Período: {pacientes.filtro?.fecha} ({pacientes.filtro?.tipo})
                    </p>
                  </div>
                  <div className="flex gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div className="bg-white px-3 py-2 rounded-lg shadow-sm border border-orange-200 flex-1 sm:flex-none">
                      <div className="text-gray-600">Total Pacientes:</div>
                      <div className="font-bold text-orange-600 text-lg">{pacientes.total_pacientes}</div>
                    </div>
                    <div className="bg-white px-3 py-2 rounded-lg shadow-sm border border-orange-200 flex-1 sm:flex-none">
                      <div className="text-gray-600">Total Despachos:</div>
                      <div className="font-bold text-orange-600 text-lg">{pacientes.total_despachos}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-6">
                  {pacientes.despachos_por_paciente.map((paciente, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Información del paciente */}
                      <div 
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors"
                        onClick={() => togglePaciente(idx)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {expandedPacientes[idx] ? (
                                <ChevronDown className="h-5 w-5 text-blue-600" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-blue-600" />
                              )}
                            </div>
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-500 flex items-center justify-center">
                                <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                                {paciente.paciente_nombres} {paciente.paciente_apellidos}
                              </h4>
                              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mt-1 space-y-1 sm:space-y-0">
                                <span className="text-xs sm:text-sm text-gray-600">
                                  <strong>Cédula:</strong> {paciente.paciente_cedula}
                                </span>
                                {paciente.paciente_telefono && (
                                  <span className="text-xs sm:text-sm text-gray-600 flex items-center">
                                    <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    {paciente.paciente_telefono}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="bg-white px-3 py-1 rounded-full border border-blue-300 self-start sm:self-center">
                            <span className="text-xs sm:text-sm font-medium text-blue-700 whitespace-nowrap">
                              {paciente.total_despachos} despacho{paciente.total_despachos !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Lista de despachos */}
                      {expandedPacientes[idx] && (
                      <div className="divide-y divide-gray-200">
                        {paciente.despachos.map((despacho, despachoIdx) => (
                          <div key={despacho.id} className="p-4 hover:bg-gray-50 transition-colors">
                            {/* Encabezado del despacho */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                <div className="bg-orange-100 px-3 py-1 rounded-lg self-start">
                                  <span className="text-xs sm:text-sm font-semibold text-orange-700">
                                    {despacho.codigo_despacho}
                                  </span>
                                </div>
                                <div className="text-xs sm:text-sm text-gray-600">
                                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                                  {new Date(despacho.fecha_despacho).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-600">
                                  <Building2 className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                                  {despacho.sede?.nombre}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                                  despacho.estado === 'despachado' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {despacho.estado}
                                </span>
                              </div>
                            </div>

                            {/* Información adicional del despacho */}
                            {(despacho.medico_tratante || despacho.diagnostico || despacho.indicaciones_medicas || despacho.observaciones) && (
                              <div className="bg-blue-50 rounded-lg p-3 mb-3 space-y-2">
                                {despacho.medico_tratante && (
                                  <div className="flex items-start">
                                    <Stethoscope className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
                                    <div className="text-sm">
                                      <span className="font-medium text-gray-700">Médico Tratante:</span>
                                      <span className="text-gray-600 ml-1">{despacho.medico_tratante}</span>
                                    </div>
                                  </div>
                                )}
                                {despacho.diagnostico && (
                                  <div className="flex items-start">
                                    <ClipboardList className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
                                    <div className="text-sm">
                                      <span className="font-medium text-gray-700">Diagnóstico:</span>
                                      <span className="text-gray-600 ml-1">{despacho.diagnostico}</span>
                                    </div>
                                  </div>
                                )}
                                {despacho.indicaciones_medicas && (
                                  <div className="flex items-start">
                                    <FileText className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
                                    <div className="text-sm">
                                      <span className="font-medium text-gray-700">Indicaciones:</span>
                                      <span className="text-gray-600 ml-1">{despacho.indicaciones_medicas}</span>
                                    </div>
                                  </div>
                                )}
                                {despacho.observaciones && (
                                  <div className="flex items-start">
                                    <FileText className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
                                    <div className="text-sm">
                                      <span className="font-medium text-gray-700">Observaciones:</span>
                                      <span className="text-gray-600 ml-1">{despacho.observaciones}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Tabla de insumos despachados */}
                            <div className="mt-3">
                              <div className="flex items-center mb-2">
                                <Pill className="h-4 w-4 text-purple-600 mr-2" />
                                <h5 className="text-sm font-semibold text-gray-700">
                                  Insumos Despachados ({despacho.total_insumos_diferentes})
                                </h5>
                              </div>
                              
                              {/* Vista de tabla para desktop */}
                              <div className="hidden md:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Código
                                      </th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Insumo
                                      </th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Presentación
                                      </th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Lote
                                      </th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Vencimiento
                                      </th>
                                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cantidad
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {despacho.insumos_despachados.map((insumo, insumoIdx) => (
                                      <tr key={insumoIdx} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                                          {insumo.insumo_codigo}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-900">
                                          {insumo.insumo_nombre}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-600">
                                          {insumo.presentacion}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-600">
                                          {insumo.numero_lote}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-600">
                                          {new Date(insumo.fecha_vencimiento).toLocaleDateString('es-ES')}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-center">
                                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                            {insumo.cantidad_salida}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              {/* Vista de tarjetas para móvil */}
                              <div className="md:hidden space-y-3">
                                {despacho.insumos_despachados.map((insumo, insumoIdx) => (
                                  <div key={insumoIdx} className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-gray-900 mb-1">
                                          {insumo.insumo_nombre}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                          <span className="font-medium">Código:</span> {insumo.insumo_codigo}
                                        </div>
                                      </div>
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 ml-2">
                                        {insumo.cantidad_salida}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div>
                                        <span className="text-gray-500">Presentación:</span>
                                        <div className="text-gray-900 font-medium">{insumo.presentacion}</div>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Lote:</span>
                                        <div className="text-gray-900 font-medium">{insumo.numero_lote}</div>
                                      </div>
                                      <div className="col-span-2">
                                        <span className="text-gray-500">Vencimiento:</span>
                                        <div className="text-gray-900 font-medium">
                                          {new Date(insumo.fecha_vencimiento).toLocaleDateString('es-ES')}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Usuario que realizó el despacho */}
                            <div className="mt-3 pt-3 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-500">
                              <div className="flex items-center">
                                <User className="h-3 w-3 mr-1 flex-shrink-0" />
                                <span className="truncate">Despachado por: <strong>{despacho.usuario?.nombre} {despacho.usuario?.apellido}</strong></span>
                              </div>
                              <div className="text-xs">
                                <span>Registrado: {new Date(despacho.created_at).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mensaje cuando no hay resultados */}
          {pacientes && pacientes.despachos_por_paciente && pacientes.despachos_por_paciente.length === 0 && (
            <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-12 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron resultados</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No hay despachos registrados para los criterios de búsqueda seleccionados.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
