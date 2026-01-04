'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Download, Building2, Package, Calendar, X, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Modal from '@/components/Modal';
import ModalSeleccionHospitales from '@/components/ModalSeleccionHospitales';
import { getTrazabilidadInsumo } from '@/servicios/insumos/get';
import { getInsumos } from '@/servicios/insumos/get';

export default function ReporteTrazaInsumo() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [hospitalSeleccionado, setHospitalSeleccionado] = useState(null);
  const [showModalHospitales, setShowModalHospitales] = useState(false);
  const [insumos, setInsumos] = useState([]);
  const [insumoSeleccionado, setInsumoSeleccionado] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInsumosList, setShowInsumosList] = useState(false);
  const [isLoadingInsumos, setIsLoadingInsumos] = useState(false);
  const [fecha, setFecha] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('dia');
  const [trazabilidad, setTrazabilidad] = useState(null);
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
    // Cargar insumos cuando se selecciona un hospital
    handleGetInsumos();
  };

  const handleGetInsumos = async () => {
    setIsLoadingInsumos(true);
    const { token } = user;
    const response = await getInsumos(token);
    
    if (!response.status || response.status === 500) {
      setIsLoadingInsumos(false);
      if (response.autenticacion === 1 || response.autenticacion === 2) {
        showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
        logout();
        router.replace('/');
        return;
      }
      showMessage('Error', response.mensaje || 'Error al cargar insumos', 'error', 4000);
      return;
    }
    console.log("Response Insumos: "+JSON.stringify(response, null, 2));
    setInsumos(response?.data || []);
    setIsLoadingInsumos(false);
  };

  const handleSelectInsumo = (insumo) => {
    setInsumoSeleccionado(insumo);
    setShowInsumosList(false);
    setSearchTerm('');
  };

  const handleClearInsumo = () => {
    setInsumoSeleccionado(null);
    setSearchTerm('');
    setTrazabilidad(null);
  };

  // Filtrar insumos según el término de búsqueda
  const filteredInsumos = Array.isArray(insumos) ? insumos.filter(insumo => {
    const searchLower = searchTerm.toLowerCase();
    return (
      insumo.codigo?.toLowerCase().includes(searchLower) ||
      insumo.nombre?.toLowerCase().includes(searchLower) ||
      insumo.descripcion?.toLowerCase().includes(searchLower)
    );
  }) : [];

  const handleGenerarReporte = async () => {
    if (!hospitalSeleccionado) {
      showMessage('Advertencia', 'Por favor selecciona un hospital', 'warning', 3000);
      return;
    }
    if (!insumoSeleccionado) {
      showMessage('Advertencia', 'Por favor selecciona un insumo', 'warning', 3000);
      return;
    }
    if (!fecha) {
      showMessage('Advertencia', 'Por favor selecciona una fecha', 'warning', 3000);
      return;
    }

    console.log('Generando reporte de traza:', {
      hospital_id: hospitalSeleccionado.id,
      insumo_id: insumoSeleccionado.id,
      fecha: fecha,
      tipo_filtro: tipoFiltro
    });

    const { token } = user;
    const response = await getTrazabilidadInsumo(token, hospitalSeleccionado.id, insumoSeleccionado.id, fecha, tipoFiltro);
    console.log('Response Trazabilidad:', JSON.stringify(response, null, 2));

    if (!response.status || response.status === 500) {
      if (response.autenticacion === 1 || response.autenticacion === 2) {
        showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
        logout();
        router.replace('/');
        return;
      }
      showMessage('Error', response.mensaje || 'Error al obtener la trazabilidad del insumo', 'error', 4000);
      setTrazabilidad(null);
      return;
    }

    setTrazabilidad(response?.data?.trazabilidad || null);
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
          <button
            onClick={() => router.replace('/administrador/reportes')}
            className="mb-6 inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </button>
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate">
                Reporte de Trazabilidad
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
                className="ml-3 inline-flex items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-150 ease-in-out"
              >
                <Download className="-ml-1 mr-2 h-5 w-5" />
                Generar Reporte
              </button>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                <Search className="h-5 w-5 inline-block mr-2 text-teal-500" />
                Reporte Traza de Insumo
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Seguimiento completo de la trazabilidad de insumos
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
                      className="block w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 cursor-pointer bg-white"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Building2 className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Selecciona el hospital para el cual deseas generar el reporte de trazabilidad
                  </p>
                </div>

                {/* Información del hospital y búsqueda de insumo */}
                {hospitalSeleccionado && (
                  <>
                    <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded-r-lg">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <Building2 className="h-5 w-5 text-teal-500" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-teal-700">
                            <span className="font-medium">Hospital seleccionado:</span> {hospitalSeleccionado.nombre}
                          </p>
                          {hospitalSeleccionado.rif && (
                            <p className="text-sm text-teal-600 mt-1">
                              RIF: {hospitalSeleccionado.rif}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Búsqueda y selección de insumo */}
                    <div>
                      <label htmlFor="insumo" className="block text-sm font-medium text-gray-700 mb-2">
                        Seleccionar Insumo *
                      </label>
                      
                      {!insumoSeleccionado ? (
                        <div className="space-y-2">
                          {/* Campo de búsqueda */}
                          <div className="relative">
                            <input
                              type="text"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              placeholder="Buscar por código o nombre del insumo..."
                              className="block w-full px-4 py-3 pl-10 border text-gray-700 border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 bg-white"
                              disabled={isLoadingInsumos}
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <Search className="h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                          
                          {/* Contador de resultados */}
                          {!isLoadingInsumos && insumos.length > 0 && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-teal-600 font-medium">
                                {searchTerm 
                                  ? `${filteredInsumos.length} resultado${filteredInsumos.length !== 1 ? 's' : ''} encontrado${filteredInsumos.length !== 1 ? 's' : ''}`
                                  : `${insumos.length} insumo${insumos.length !== 1 ? 's' : ''} disponible${insumos.length !== 1 ? 's' : ''}`
                                }
                              </span>
                              {searchTerm && (
                                <button
                                  onClick={() => setSearchTerm('')}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  Limpiar búsqueda
                                </button>
                              )}
                            </div>
                          )}
                          
                          {/* Lista de insumos */}
                          <div className="border border-gray-300 rounded-lg bg-white shadow-sm">
                            {isLoadingInsumos ? (
                              <div className="p-8 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                                <p className="text-sm text-gray-500 mt-3">Cargando insumos...</p>
                              </div>
                            ) : filteredInsumos.length > 0 ? (
                              <div className="max-h-96 overflow-y-auto">
                                {filteredInsumos.map((insumo, idx) => (
                                  <div
                                    key={insumo.id}
                                    onClick={() => handleSelectInsumo(insumo)}
                                    className={`px-4 py-3 hover:bg-teal-50 cursor-pointer transition-colors ${
                                      idx !== filteredInsumos.length - 1 ? 'border-b border-gray-100' : ''
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <Package className="h-5 w-5 text-teal-500 flex-shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">
                                          {insumo.nombre}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1">
                                          <p className="text-xs text-gray-500">
                                            Código: {insumo.codigo}
                                          </p>
                                          {insumo.presentacion && (
                                            <p className="text-xs text-gray-400">
                                              • {insumo.presentacion}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-8 text-center">
                                <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm text-gray-500">
                                  {searchTerm 
                                    ? 'No se encontraron insumos con ese criterio de búsqueda'
                                    : 'No hay insumos disponibles'
                                  }
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <Package className="h-6 w-6 text-teal-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-teal-900">
                                  {insumoSeleccionado.nombre}
                                </p>
                                <p className="text-xs text-teal-700">
                                  Código: {insumoSeleccionado.codigo}
                                </p>
                                {insumoSeleccionado.presentacion && (
                                  <p className="text-xs text-teal-600">
                                    Presentación: {insumoSeleccionado.presentacion}
                                  </p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={handleClearInsumo}
                              className="ml-3 p-2 text-teal-600 hover:text-teal-800 hover:bg-teal-100 rounded-lg transition-colors flex-shrink-0"
                              title="Seleccionar otro insumo"
                            >
                              <RefreshCw className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {!insumoSeleccionado && (
                        <p className="mt-2 text-sm text-gray-500">
                          Busca y selecciona el insumo del cual deseas ver la trazabilidad. Puedes hacer scroll en la lista para ver todos los insumos disponibles.
                        </p>
                      )}
                    </div>

                    {/* Filtros de fecha y tipo */}
                    {insumoSeleccionado && (
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
                              className="block w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 bg-white"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <Calendar className="h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                          <p className="mt-2 text-sm text-gray-500">
                            Selecciona la fecha para filtrar la trazabilidad
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
                            className="block w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 bg-white"
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
                    )}

                    {trazabilidad && (
                      <div className="mt-8 space-y-8 border-t border-gray-200 pt-6">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Insumo</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Nombre</p>
                              <p className="font-medium text-gray-900">{trazabilidad.insumo?.nombre}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Código</p>
                              <p className="font-medium text-gray-900">{trazabilidad.insumo?.codigo}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Presentación</p>
                              <p className="font-medium text-gray-900">{trazabilidad.insumo?.presentacion}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Resumen</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="bg-teal-50 border border-teal-100 rounded-lg p-4">
                              <p className="text-xs uppercase tracking-wide text-teal-600 font-semibold">Entrada al hospital</p>
                              <p className="mt-2 text-2xl font-bold text-teal-800">{trazabilidad.resumen?.cantidad_entrada_hospital ?? 0}</p>
                            </div>
                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                              <p className="text-xs uppercase tracking-wide text-amber-600 font-semibold">Despachado a pacientes</p>
                              <p className="mt-2 text-2xl font-bold text-amber-800">{trazabilidad.resumen?.cantidad_despachada_pacientes ?? 0}</p>
                            </div>
                            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
                              <p className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">Actualmente en hospital</p>
                              <p className="mt-2 text-2xl font-bold text-emerald-800">{trazabilidad.resumen?.cantidad_rodando_hospital ?? 0}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-gray-900">Movimientos de entrada</h4>
                            <p className="text-sm text-gray-500">Total: {trazabilidad.movimientos_entrada?.total ?? 0} · Cantidad: {trazabilidad.movimientos_entrada?.cantidad_total_entrada ?? 0}</p>
                          </div>
                          {trazabilidad.movimientos_entrada?.detalle?.length ? (
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Fecha recepción</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Origen</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Destino</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Cantidad</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Lote</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Usuario</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {trazabilidad.movimientos_entrada.detalle.map((mov) => (
                                    <tr key={mov.movimiento_id}>
                                      <td className="px-4 py-2 whitespace-nowrap text-gray-900">{mov.fecha_recepcion || mov.fecha_despacho}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-gray-900">{mov.origen_hospital_nombre} - {mov.origen_sede_nombre}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-gray-900">{mov.destino_hospital_nombre} - {mov.destino_sede_nombre}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-gray-900">{mov.cantidad_entrada}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-gray-900">{mov.numero_lote}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-gray-900">{mov.usuario_receptor_nombre || mov.usuario_nombre}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No se registran movimientos de entrada.</p>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-gray-900">Movimientos internos</h4>
                            <p className="text-sm text-gray-500">Total: {trazabilidad.movimientos_internos?.total ?? 0} · Cantidad: {trazabilidad.movimientos_internos?.cantidad_total_salida ?? 0}</p>
                          </div>
                          {trazabilidad.movimientos_internos?.detalle?.length ? (
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Fecha recepción</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Origen</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Destino</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Cantidad</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Lote</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Usuario</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {trazabilidad.movimientos_internos.detalle.map((mov) => (
                                    <tr key={mov.movimiento_id}>
                                      <td className="px-4 py-2 whitespace-nowrap text-gray-900">{mov.fecha_recepcion || mov.fecha_despacho}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-gray-900">{mov.origen_hospital_nombre} - {mov.origen_sede_nombre}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-gray-900">{mov.destino_hospital_nombre} - {mov.destino_sede_nombre}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-gray-900">{mov.cantidad_salida}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-gray-900">{mov.numero_lote}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-gray-900">{mov.usuario_receptor_nombre || mov.usuario_nombre}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No se registran movimientos internos.</p>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-gray-900">Despachos a pacientes</h4>
                            <p className="text-sm text-gray-500">Total: {trazabilidad.despachos_pacientes?.total ?? 0} · Pacientes: {trazabilidad.despachos_pacientes?.total_pacientes ?? 0}</p>
                          </div>
                          {trazabilidad.despachos_pacientes?.detalle?.length ? (
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Fecha despacho</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Paciente</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Cédula</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Diagnóstico</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Cantidad</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Lote</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Servicio</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Usuario</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {trazabilidad.despachos_pacientes.detalle.map((d) => (
                                    <tr key={d.despacho_id}>
                                      <td className="px-4 py-2 whitespace-nowrap text-gray-900">{d.fecha_despacho}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-gray-900">{d.paciente_nombres} {d.paciente_apellidos}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-gray-900">{d.paciente_cedula}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-gray-900">{d.diagnostico}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-gray-900">{d.cantidad_salida}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-gray-900">{d.numero_lote}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-gray-900">{d.sede_nombre}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-gray-900">{d.usuario_nombre}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No se registran despachos a pacientes.</p>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-gray-900">Ingresos directos</h4>
                            <p className="text-sm text-gray-500">Total: {trazabilidad.ingresos_directos?.total ?? 0}</p>
                          </div>
                          {trazabilidad.ingresos_directos?.detalle?.length ? (
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Fecha</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Cantidad</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Lote</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Usuario</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {trazabilidad.ingresos_directos.detalle.map((ing, index) => (
                                    <tr key={index}>
                                      <td className="px-4 py-2 whitespace-nowrap text-gray-900">{ing.fecha}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-gray-900">{ing.cantidad}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-gray-900">{ing.numero_lote}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-gray-900">{ing.usuario_nombre}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No se registran ingresos directos.</p>
                          )}
                        </div>
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
