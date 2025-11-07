'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, Download, Building2, Package, ArrowRight, ArrowDown, ArrowUp, Calendar, User, AlertTriangle, CheckCircle, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Modal from '@/components/Modal';
import ModalSeleccionHospitales from '@/components/ModalSeleccionHospitales';
import { getMovimientosHospital } from '@/servicios/despachos/get';

export default function ReporteMovimientos() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [hospitalSeleccionado, setHospitalSeleccionado] = useState(null);
  const [showModalHospitales, setShowModalHospitales] = useState(false);
  const [movimientos, setMovimientos] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    recibidos: false,
    despachados: false
  });
  const [expandedMovimientos, setExpandedMovimientos] = useState({});
  const [expandedSedes, setExpandedSedes] = useState({});
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
    handleMovimientosHospital(hospital.id);
    setHospitalSeleccionado(hospital);
    setShowModalHospitales(false);
  };

  const handleMovimientosHospital = async (hospitalId) => {
    const {token} = user;
    const response = await getMovimientosHospital(token, hospitalId);
    console.log("MovimientosHospital: "+JSON.stringify(response, null, 2));
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
    console.log("Movimientos: "+JSON.stringify(response.data, null, 2));
    if (response.data) {
      setMovimientos(response.data);
    }
  };

  const handleGenerarReporte = () => {
    if (!hospitalSeleccionado) {
      showMessage('Advertencia', 'Por favor selecciona un hospital', 'warning', 3000);
      return;
    }
    // Aquí iría la lógica para generar el reporte
    console.log('Generando reporte de movimientos para:', hospitalSeleccionado);
    showMessage('Éxito', 'Generando reporte...', 'success', 2000);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleMovimiento = (movimientoId) => {
    setExpandedMovimientos(prev => ({
      ...prev,
      [movimientoId]: !prev[movimientoId]
    }));
  };

  const toggleSede = (sedeId) => {
    setExpandedSedes(prev => ({
      ...prev,
      [sedeId]: !prev[sedeId]
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
                className="ml-3 inline-flex items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
              >
                <Download className="-ml-1 mr-2 h-5 w-5" />
                Generar Reporte
              </button>
            </div> */}
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                <TrendingUp className="h-5 w-5 inline-block mr-2 text-green-500" />
                Reporte de Movimientos
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Historial detallado de todos los movimientos de inventario
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
                      className="block w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 cursor-pointer bg-white"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Building2 className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Selecciona el hospital para el cual deseas generar el reporte de movimientos
                  </p>
                </div>

                {/* Información adicional */}
                {hospitalSeleccionado && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Building2 className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700">
                          <span className="font-medium">Hospital seleccionado:</span> {hospitalSeleccionado.nombre}
                        </p>
                        {hospitalSeleccionado.rif && (
                          <p className="text-sm text-green-600 mt-1">
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

          {/* Reporte de Movimientos */}
          {movimientos && Object.keys(movimientos).length > 0 ? (
            <div className="mt-6 space-y-6">
              {/* Movimientos Recibidos */}
              {movimientos.movimientos_recibidos && movimientos.movimientos_recibidos.movimientos && movimientos.movimientos_recibidos.movimientos.length > 0 ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div 
                    className="px-4 py-5 sm:px-6 bg-blue-50 border-b border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => toggleSection('recibidos')}
                  >
                    <h3 className="text-lg leading-6 font-medium text-blue-900 flex items-center">
                      {expandedSections.recibidos ? (
                        <ChevronDown className="h-5 w-5 mr-2" />
                      ) : (
                        <ChevronRight className="h-5 w-5 mr-2" />
                      )}
                      <ArrowDown className="h-5 w-5 mr-2" />
                      Movimientos Recibidos ({movimientos.movimientos_recibidos.total})
                    </h3>
                    <p className="mt-1 text-sm text-blue-700">
                      {movimientos.movimientos_recibidos.descripcion}
                    </p>
                  </div>
                  {expandedSections.recibidos && (
                    <div className="px-4 py-5 sm:p-6 bg-blue-25">
                      <div className="space-y-6">
                        {movimientos.movimientos_recibidos.movimientos.map((movimiento, index) => (
                          <div key={movimiento.id} className="border border-gray-200 rounded-lg overflow-hidden">
                            {/* Encabezado del Movimiento */}
                            <div 
                              className="bg-gray-50 px-4 py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                              onClick={() => toggleMovimiento(`recibido-${movimiento.id}`)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  {expandedMovimientos[`recibido-${movimiento.id}`] ? (
                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-gray-500" />
                                  )}
                                  <span className="text-sm font-semibold text-gray-700">
                                    #{movimiento.id} - {movimiento.codigo_grupo}
                                  </span>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  movimiento.estado === 'recibido' ? 'bg-green-100 text-green-800' :
                                  movimiento.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {movimiento.estado.toUpperCase()}
                                </span>
                                {movimiento.discrepancia_total && (
                                  <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Con Discrepancias
                                  </span>
                                )}
                                </div>
                                <span className="text-xs text-gray-500">
                                  {movimiento.tipo_movimiento}
                                </span>
                              </div>
                            </div>

                            {/* Información del Movimiento */}
                            {expandedMovimientos[`recibido-${movimiento.id}`] && (
                              <div className="px-4 py-4 space-y-3 bg-blue-50 border-l-4 border-blue-500">
                            {/* Origen y Destino */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <p className="text-xs font-semibold text-gray-500 uppercase">Origen</p>
                                <div className="bg-orange-50 p-3 rounded-lg">
                                  <p className="text-sm font-medium text-gray-900">
                                    {movimiento.origen_hospital?.nombre}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {movimiento.origen_sede?.nombre}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {movimiento.origen_almacen_nombre}
                                  </p>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <p className="text-xs font-semibold text-gray-500 uppercase">Destino</p>
                                <div className="bg-green-50 p-3 rounded-lg">
                                  <p className="text-sm font-medium text-gray-900">
                                    {movimiento.destino_hospital?.nombre}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {movimiento.destino_sede?.nombre}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {movimiento.destino_almacen_nombre}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Fechas y Cantidades */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-gray-200">
                              <div>
                                <p className="text-xs text-gray-500">Fecha Despacho</p>
                                <p className="text-sm font-medium text-gray-900 flex items-center mt-1">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {new Date(movimiento.fecha_despacho).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Fecha Recepción</p>
                                <p className="text-sm font-medium text-gray-900 flex items-center mt-1">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {movimiento.fecha_recepcion ? new Date(movimiento.fecha_recepcion).toLocaleDateString() : 'Pendiente'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Cant. Despachada</p>
                                <p className="text-sm font-medium text-blue-600">
                                  {movimiento.cantidad_salida_total}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Cant. Recibida</p>
                                <p className="text-sm font-medium text-green-600">
                                  {movimiento.cantidad_entrada_total}
                                </p>
                              </div>
                            </div>

                            {/* Usuarios */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Usuario Despachador</p>
                                <p className="text-sm text-gray-900 flex items-center">
                                  <User className="h-3 w-3 mr-1" />
                                  {movimiento.usuario?.nombre} {movimiento.usuario?.apellido}
                                </p>
                              </div>
                              {movimiento.usuario_receptor && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Usuario Receptor</p>
                                  <p className="text-sm text-gray-900 flex items-center">
                                    <User className="h-3 w-3 mr-1" />
                                    {movimiento.usuario_receptor?.nombre} {movimiento.usuario_receptor?.apellido}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Observaciones */}
                            {(movimiento.observaciones || movimiento.observaciones_recepcion) && (
                              <div className="pt-3 border-t border-gray-200">
                                {movimiento.observaciones && (
                                  <div className="mb-2">
                                    <p className="text-xs text-gray-500">Observaciones:</p>
                                    <p className="text-sm text-gray-700">{movimiento.observaciones}</p>
                                  </div>
                                )}
                                {movimiento.observaciones_recepcion && (
                                  <div>
                                    <p className="text-xs text-gray-500">Observaciones de Recepción:</p>
                                    <p className="text-sm text-gray-700">{movimiento.observaciones_recepcion}</p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Lotes */}
                            {movimiento.lotes_grupos && movimiento.lotes_grupos.length > 0 && (
                              <div className="pt-3 border-t border-gray-200">
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Lotes ({movimiento.lotes_grupos.length})</p>
                                <div className="space-y-2">
                                  {movimiento.lotes_grupos.map((loteGrupo) => (
                                    <div key={loteGrupo.id} className={`p-3 rounded-lg border ${
                                      loteGrupo.discrepancia ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                                    }`}>
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center space-x-2">
                                            <Package className="h-4 w-4 text-gray-400" />
                                            <p className="text-sm font-medium text-gray-900">
                                              {loteGrupo.lote?.insumo?.nombre}
                                            </p>
                                          </div>
                                          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                            <div>
                                              <span className="text-gray-500">Código:</span>
                                              <span className="ml-1 text-gray-900">{loteGrupo.lote?.insumo?.codigo}</span>
                                            </div>
                                            <div>
                                              <span className="text-gray-500">Lote:</span>
                                              <span className="ml-1 text-gray-900">{loteGrupo.lote?.numero_lote}</span>
                                            </div>
                                            <div>
                                              <span className="text-gray-500">Vencimiento:</span>
                                              <span className="ml-1 text-gray-900">
                                                {new Date(loteGrupo.lote?.fecha_vencimiento).toLocaleDateString()}
                                              </span>
                                            </div>
                                            <div>
                                              <span className="text-gray-500">Presentación:</span>
                                              <span className="ml-1 text-gray-900">{loteGrupo.lote?.insumo?.presentacion}</span>
                                            </div>
                                          </div>
                                          <div className="mt-2 flex items-center space-x-4 text-xs">
                                            <div className="flex items-center">
                                              <span className="text-gray-500">Despachado:</span>
                                              <span className="ml-1 font-medium text-blue-600">{loteGrupo.cantidad_salida}</span>
                                            </div>
                                            <div className="flex items-center">
                                              <span className="text-gray-500">Recibido:</span>
                                              <span className="ml-1 font-medium text-green-600">{loteGrupo.cantidad_entrada}</span>
                                            </div>
                                            {loteGrupo.discrepancia && (
                                              <span className="flex items-center text-red-600 font-medium">
                                                <AlertTriangle className="h-3 w-3 mr-1" />
                                                Discrepancia: {loteGrupo.cantidad_salida - loteGrupo.cantidad_entrada}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : hospitalSeleccionado && (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6 bg-blue-50 border-b border-blue-200">
                    <h3 className="text-lg leading-6 font-medium text-blue-900 flex items-center">
                      <ArrowDown className="h-5 w-5 mr-2" />
                      Movimientos Recibidos (0)
                    </h3>
                  </div>
                  <div className="px-4 py-12 sm:px-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                      <Package className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No hay movimientos recibidos
                    </h3>
                    <p className="text-sm text-gray-500">
                      Este hospital no ha recibido ningún despacho de otros almacenes.
                    </p>
                  </div>
                </div>
              )}

              {/* Movimientos Despachados por Almacén */}
              {movimientos.movimientos_despachados_por_almacen && movimientos.movimientos_despachados_por_almacen.agrupados_por_tipo_almacen && movimientos.movimientos_despachados_por_almacen.agrupados_por_tipo_almacen.length > 0 ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div 
                    className="px-4 py-5 sm:px-6 bg-orange-50 border-b border-orange-200 cursor-pointer hover:bg-orange-100 transition-colors"
                    onClick={() => toggleSection('despachados')}
                  >
                    <h3 className="text-lg leading-6 font-medium text-orange-900 flex items-center">
                      {expandedSections.despachados ? (
                        <ChevronDown className="h-5 w-5 mr-2" />
                      ) : (
                        <ChevronRight className="h-5 w-5 mr-2" />
                      )}
                      <ArrowUp className="h-5 w-5 mr-2" />
                      Movimientos Despachados por Almacén ({movimientos.movimientos_despachados_por_almacen.total})
                    </h3>
                    <p className="mt-1 text-sm text-orange-700">
                      {movimientos.movimientos_despachados_por_almacen.descripcion}
                    </p>
                  </div>
                  {expandedSections.despachados && (
                    <div className="px-4 py-5 sm:p-6 bg-orange-25">
                      <div className="space-y-8">
                        {movimientos.movimientos_despachados_por_almacen.agrupados_por_tipo_almacen.map((almacenData) => (
                          <div key={almacenData.tipo_almacen} className="border border-gray-200 rounded-lg overflow-hidden">
                            {/* Encabezado de Almacén */}
                            <div 
                              className="bg-gray-100 px-4 py-3 border-b border-gray-300 cursor-pointer hover:bg-gray-200 transition-colors"
                              onClick={() => toggleSede(almacenData.tipo_almacen)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  {expandedSedes[almacenData.tipo_almacen] ? (
                                    <ChevronDown className="h-5 w-5 text-gray-700" />
                                  ) : (
                                    <ChevronRight className="h-5 w-5 text-gray-700" />
                                  )}
                                  <div>
                                    <h4 className="text-base font-semibold text-gray-900">
                                      {almacenData.nombre_almacen}
                                    </h4>
                                    <p className="text-xs text-gray-600 mt-1">
                                      Movimientos: {almacenData.total_movimientos}
                                    </p>
                                  </div>
                                </div>
                                <span className="px-3 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                                  {almacenData.tipo_almacen}
                                </span>
                              </div>
                            </div>

                            {/* Movimientos del Almacén */}
                            {expandedSedes[almacenData.tipo_almacen] && (
                              <div className="px-4 py-4 space-y-4 bg-gray-50">
                                {almacenData.movimientos && almacenData.movimientos.map((movimiento) => (
                                  <div key={movimiento.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                    {/* Encabezado del Movimiento */}
                                    <div 
                                      className="bg-gray-50 px-4 py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleMovimiento(`despachado-${movimiento.id}`);
                                      }}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                          {expandedMovimientos[`despachado-${movimiento.id}`] ? (
                                            <ChevronDown className="h-4 w-4 text-gray-500" />
                                          ) : (
                                            <ChevronRight className="h-4 w-4 text-gray-500" />
                                          )}
                                          <span className="text-sm font-semibold text-gray-700">
                                            #{movimiento.id} - {movimiento.codigo_grupo}
                                          </span>
                                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            movimiento.estado === 'recibido' ? 'bg-green-100 text-green-800' :
                                            movimiento.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                          }`}>
                                            {movimiento.estado.toUpperCase()}
                                          </span>
                                          {movimiento.discrepancia_total && (
                                            <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                              <AlertTriangle className="h-3 w-3 mr-1" />
                                              Con Discrepancias
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-xs text-gray-500">
                                          {movimiento.tipo_movimiento}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Información del Movimiento */}
                                    {expandedMovimientos[`despachado-${movimiento.id}`] && (
                                      <div className="px-4 py-4 space-y-3 bg-orange-50 border-l-4 border-orange-500">
                                        {/* Origen y Destino */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                            <p className="text-xs font-semibold text-gray-500 uppercase">Origen</p>
                                            <div className="bg-orange-50 p-3 rounded-lg">
                                              <p className="text-sm font-medium text-gray-900">
                                                {movimiento.origen_hospital?.nombre}
                                              </p>
                                              <p className="text-xs text-gray-600 mt-1">
                                                {movimiento.origen_sede?.nombre}
                                              </p>
                                              <p className="text-xs text-gray-500 mt-1">
                                                {movimiento.origen_almacen_nombre}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="space-y-2">
                                            <p className="text-xs font-semibold text-gray-500 uppercase">Destino</p>
                                            <div className="bg-green-50 p-3 rounded-lg">
                                              <p className="text-sm font-medium text-gray-900">
                                                {movimiento.destino_hospital?.nombre}
                                              </p>
                                              <p className="text-xs text-gray-600 mt-1">
                                                {movimiento.destino_sede?.nombre}
                                              </p>
                                              <p className="text-xs text-gray-500 mt-1">
                                                {movimiento.destino_almacen_nombre}
                                              </p>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Fechas y Cantidades */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-gray-200">
                                          <div>
                                            <p className="text-xs text-gray-500">Fecha Despacho</p>
                                            <p className="text-sm font-medium text-gray-900 flex items-center mt-1">
                                              <Calendar className="h-3 w-3 mr-1" />
                                              {new Date(movimiento.fecha_despacho).toLocaleDateString()}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-xs text-gray-500">Fecha Recepción</p>
                                            <p className="text-sm font-medium text-gray-900 flex items-center mt-1">
                                              <Calendar className="h-3 w-3 mr-1" />
                                              {movimiento.fecha_recepcion ? new Date(movimiento.fecha_recepcion).toLocaleDateString() : 'Pendiente'}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-xs text-gray-500">Cant. Despachada</p>
                                            <p className="text-sm font-medium text-blue-600">
                                              {movimiento.cantidad_salida_total}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-xs text-gray-500">Cant. Recibida</p>
                                            <p className="text-sm font-medium text-green-600">
                                              {movimiento.cantidad_entrada_total}
                                            </p>
                                          </div>
                                        </div>

                                        {/* Usuarios */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                                          <div>
                                            <p className="text-xs text-gray-500 mb-1">Usuario Despachador</p>
                                            <p className="text-sm text-gray-900 flex items-center">
                                              <User className="h-3 w-3 mr-1" />
                                              {movimiento.usuario?.nombre} {movimiento.usuario?.apellido}
                                            </p>
                                          </div>
                                          {movimiento.usuario_receptor && (
                                            <div>
                                              <p className="text-xs text-gray-500 mb-1">Usuario Receptor</p>
                                              <p className="text-sm text-gray-900 flex items-center">
                                                <User className="h-3 w-3 mr-1" />
                                                {movimiento.usuario_receptor?.nombre} {movimiento.usuario_receptor?.apellido}
                                              </p>
                                            </div>
                                          )}
                                        </div>

                                        {/* Observaciones */}
                                        {(movimiento.observaciones || movimiento.observaciones_recepcion) && (
                                          <div className="pt-3 border-t border-gray-200">
                                            {movimiento.observaciones && (
                                              <div className="mb-2">
                                                <p className="text-xs text-gray-500">Observaciones:</p>
                                                <p className="text-sm text-gray-700">{movimiento.observaciones}</p>
                                              </div>
                                            )}
                                            {movimiento.observaciones_recepcion && (
                                              <div>
                                                <p className="text-xs text-gray-500">Observaciones de Recepción:</p>
                                                <p className="text-sm text-gray-700">{movimiento.observaciones_recepcion}</p>
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        {/* Lotes */}
                                        {movimiento.lotes_grupos && movimiento.lotes_grupos.length > 0 && (
                                          <div className="pt-3 border-t border-gray-200">
                                            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Lotes ({movimiento.lotes_grupos.length})</p>
                                            <div className="space-y-2">
                                              {movimiento.lotes_grupos.map((loteGrupo) => (
                                                <div key={loteGrupo.id} className={`p-3 rounded-lg border ${
                                                  loteGrupo.discrepancia ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                                                }`}>
                                                  <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                      <div className="flex items-center space-x-2">
                                                        <Package className="h-4 w-4 text-gray-400" />
                                                        <p className="text-sm font-medium text-gray-900">
                                                          {loteGrupo.lote?.insumo?.nombre}
                                                        </p>
                                                      </div>
                                                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                                        <div>
                                                          <span className="text-gray-500">Código:</span>
                                                          <span className="ml-1 text-gray-900">{loteGrupo.lote?.insumo?.codigo}</span>
                                                        </div>
                                                        <div>
                                                          <span className="text-gray-500">Lote:</span>
                                                          <span className="ml-1 text-gray-900">{loteGrupo.lote?.numero_lote}</span>
                                                        </div>
                                                        <div>
                                                          <span className="text-gray-500">Vencimiento:</span>
                                                          <span className="ml-1 text-gray-900">
                                                            {new Date(loteGrupo.lote?.fecha_vencimiento).toLocaleDateString()}
                                                          </span>
                                                        </div>
                                                        <div>
                                                          <span className="text-gray-500">Presentación:</span>
                                                          <span className="ml-1 text-gray-900">{loteGrupo.lote?.insumo?.presentacion}</span>
                                                        </div>
                                                      </div>
                                                      <div className="mt-2 flex items-center space-x-4 text-xs">
                                                        <div className="flex items-center">
                                                          <span className="text-gray-500">Despachado:</span>
                                                          <span className="ml-1 font-medium text-blue-600">{loteGrupo.cantidad_salida}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                          <span className="text-gray-500">Recibido:</span>
                                                          <span className="ml-1 font-medium text-green-600">{loteGrupo.cantidad_entrada}</span>
                                                        </div>
                                                        {loteGrupo.discrepancia && (
                                                          <span className="flex items-center text-red-600 font-medium">
                                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                                            Discrepancia: {loteGrupo.cantidad_salida - loteGrupo.cantidad_entrada}
                                                          </span>
                                                        )}
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : hospitalSeleccionado && (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6 bg-orange-50 border-b border-orange-200">
                    <h3 className="text-lg leading-6 font-medium text-orange-900 flex items-center">
                      <ArrowUp className="h-5 w-5 mr-2" />
                      Movimientos Despachados por Sede (0)
                    </h3>
                  </div>
                  <div className="px-4 py-12 sm:px-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
                      <Package className="h-8 w-8 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No hay movimientos despachados
                    </h3>
                    <p className="text-sm text-gray-500">
                      Este hospital no ha despachado ningún movimiento desde sus almacenes.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : hospitalSeleccionado && (
            <div className="mt-6">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-12 sm:px-6 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                    <TrendingUp className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    No se encontraron movimientos
                  </h3>
                  <p className="text-sm text-gray-500 mb-1">
                    No hay movimientos registrados para <span className="font-semibold">{hospitalSeleccionado.nombre}</span>
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
