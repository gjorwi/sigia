'use client';
import React, { useEffect, useState } from 'react';
import { despachoActions } from '@/constantes/despachoActions';
import { getMovimientos } from '@/servicios/despachos/get';
import Modal from '@/components/Modal';
import { useRouter } from 'next/navigation';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Movimientos() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [movimientos, setMovimientos] = useState([]);
  const [movimientosFiltrados, setMovimientosFiltrados] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: '',
    tipo: '',
    tipoMovimiento: ''
  });
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info', // 'info', 'error', 'success', 'warning'
    time: null
  });

  useEffect(() => {
    handleGetMovimientos();
  }, []);

  // Efecto para aplicar filtros
  useEffect(() => {
    aplicarFiltros();
  }, [movimientos, filtros]);

  const aplicarFiltros = () => {
    let movimientosFiltrados = [...movimientos];

    // Filtro por búsqueda de texto
    if (filtros.busqueda.trim()) {
      const busqueda = filtros.busqueda.toLowerCase();
      movimientosFiltrados = movimientosFiltrados.filter(mov => 
        mov?.origen_hospital?.nombre?.toLowerCase().includes(busqueda) ||
        mov?.destino_hospital?.nombre?.toLowerCase().includes(busqueda) ||
        mov?.codigo_grupo?.toLowerCase().includes(busqueda) ||
        mov?.observaciones?.toLowerCase().includes(busqueda) ||
        mov?.usuario?.nombre?.toLowerCase().includes(busqueda) ||
        mov?.usuario?.apellido?.toLowerCase().includes(busqueda)
      );
    }

    // Filtro por estado
    if (filtros.estado) {
      movimientosFiltrados = movimientosFiltrados.filter(mov => 
        mov?.estado === filtros.estado
      );
    }

    // Filtro por tipo
    if (filtros.tipo) {
      movimientosFiltrados = movimientosFiltrados.filter(mov => 
        mov?.tipo === filtros.tipo
      );
    }

    // Filtro por tipo de movimiento
    if (filtros.tipoMovimiento) {
      movimientosFiltrados = movimientosFiltrados.filter(mov => 
        mov?.tipo_movimiento === filtros.tipoMovimiento
      );
    }

    setMovimientosFiltrados(movimientosFiltrados);
  };

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      estado: '',
      tipo: '',
      tipoMovimiento: ''
    });
  };
  
  const showMessage = (title, message, type = 'info', time = null) => {
    setModal({isOpen: true, title, message, type, time});
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };
  
  const handleGetMovimientos = async () => {
    const { token, sede_id } = user;
    console.log("sede_id: "+sede_id);
    const response = await getMovimientos(token,sede_id);
    if (!response.status) {
      if(response.autenticacion==1||response.autenticacion==2){
        showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
        logout();
        router.replace('/');
        return;
      }
      showMessage('Error', response.mensaje, 'error', 4000);
      return;
    }
    console.log("Movimientos: "+JSON.stringify(response.data, null, 2));
    if(response.data&&response.data.data){
      setMovimientos(response.data.data);
      setMovimientosFiltrados(response.data.data);
    }
  };

  const toggleExpand = (index) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="md:pl-64 flex flex-col">
      {/* Modal de mensajes */}
      <Modal 
        isOpen={modal.isOpen} 
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

          {/* Filtros */}
          <div className="mt-4">
            <div className="bg-white shadow sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Filtros de Búsqueda</h3>
                
              </div>
              <div className="px-4 py-5 sm:px-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Búsqueda por texto */}
                  <div>
                    <label htmlFor="busqueda" className="block text-sm font-medium text-gray-700 mb-1">
                      Búsqueda
                    </label>
                    <input
                      type="text"
                      id="busqueda"
                      placeholder="Hospital, código, usuario..."
                      value={filtros.busqueda}
                      onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
                      className="block w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* Filtro por estado */}
                  <div>
                    <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      id="estado"
                      value={filtros.estado}
                      onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
                      className="block w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Todos los estados</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="en_transito">En Tránsito</option>
                      <option value="completado">Completado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>

                  {/* Filtro por tipo de movimiento */}
                  <div className='flex items-center justify-start'>
                    <div className="flex space-x-2 md:mt-5">
                      <button
                        type="button"
                        onClick={limpiarFiltros}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Limpiar Filtros
                      </button>
                    </div>
                  </div>
                </div>

                {/* Botones de acción y resumen */}
                <div className="mt-4 flex justify-between items-center">
                  
                  <div className="text-sm text-gray-500">
                    Mostrando <span className="font-semibold text-gray-900">{movimientosFiltrados.length}</span> de <span className="font-semibold text-gray-900">{movimientos.length}</span> movimientos
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Movimientos */}
          <div className="mt-2">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Lista de Movimientos</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Vista previa de los movimientos registrados en el sistema
                </p>
              </div>
              <div className="border-t border-gray-200">
                {movimientosFiltrados.length === 0 ? (
                  <div className="px-4 py-12 text-center">
                    <p className="text-sm text-gray-500">
                      {movimientos.length === 0 ? 'No hay movimientos registrados' : 'No se encontraron movimientos con los filtros aplicados'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {movimientosFiltrados.map((movimiento,i) => (
                      <div key={i} className="px-4 py-5 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex justify-start items-start">
                            <div className="flex-shrink-0 h-12 w-12 text-gray-900">
                              <Package className="h-12 w-12 rounded-full" />
                            </div>
                            <div className="ml-4 flex flex-col items-start justify-start">
                              <div className="text-sm font-medium text-gray-900">
                                {movimiento?.tipo_movimiento?.toUpperCase()} - {movimiento?.tipo?.toUpperCase()}
                              </div>
                              <div className="text-sm text-gray-500">
                                {movimiento?.origen_hospital?.nombre} → {movimiento?.destino_hospital?.nombre}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                Cantidad: {movimiento?.cantidad_salida} | Código: {movimiento?.codigo_grupo}
                              </div>
                              <div className="mt-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  movimiento?.estado === 'pendiente' 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : movimiento?.estado === 'completado'
                                    ? 'bg-green-100 text-green-800'
                                    : movimiento?.estado === 'en_transito'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {movimiento?.estado}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => toggleExpand(i)}
                              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              {expandedItems[i] ? (
                                <>
                                  Ocultar
                                  <ChevronUp className="ml-2 h-4 w-4" />
                                </>
                              ) : (
                                <>
                                  Detalle
                                  <ChevronDown className="ml-2 h-4 w-4" />
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                        
                        {/* Collapsible Details Section */}
                        {expandedItems[i] && (
                          <div className="mt-4 border-t border-gray-200 pt-4">
                            <div className="bg-gray-50 rounded-lg p-4 space-y-6">
                              
                              {/* Información General del Movimiento */}
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">Información del Movimiento</h4>
                                <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-3">
                                  <div>
                                    <dt className="text-xs font-medium text-gray-500">ID</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{movimiento?.id}</dd>
                                  </div>
                                  <div>
                                    <dt className="text-xs font-medium text-gray-500">Fecha Despacho</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                      {movimiento?.fecha_despacho ? new Date(movimiento.fecha_despacho).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      }) : 'No definida'}
                                    </dd>
                                  </div>
                                  <div>
                                    <dt className="text-xs font-medium text-gray-500">Fecha Recepción</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                      {movimiento?.fecha_recepcion ? new Date(movimiento.fecha_recepcion).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      }) : 'Pendiente'}
                                    </dd>
                                  </div>
                                  <div className="sm:col-span-2">
                                    <dt className="text-xs font-medium text-gray-500">Observaciones</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{movimiento?.observaciones || 'Sin observaciones'}</dd>
                                  </div>
                                  <div>
                                    <dt className="text-xs font-medium text-gray-500">Usuario Responsable</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{movimiento?.usuario?.nombre} {movimiento?.usuario?.apellido}</dd>
                                  </div>
                                </dl>
                              </div>

                              {/* Información de Origen y Destino */}
                              <div className="border-t border-gray-200 pt-4">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">Origen y Destino</h4>
                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                  {/* Origen */}
                                  <div className="bg-white rounded-md p-3 border border-gray-200">
                                    <h5 className="text-xs font-semibold text-gray-700 mb-2">ORIGEN</h5>
                                    <dl className="space-y-2">
                                      <div>
                                        <dt className="text-xs font-medium text-gray-500">Hospital/Almacén</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{movimiento?.origen_hospital?.nombre}</dd>
                                      </div>
                                      <div>
                                        <dt className="text-xs font-medium text-gray-500">Sede</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{movimiento?.origen_sede?.nombre}</dd>
                                      </div>
                                      <div>
                                        <dt className="text-xs font-medium text-gray-500">Tipo Almacén</dt>
                                        <dd className="mt-1 text-sm text-gray-900 capitalize">{movimiento?.origen_almacen_tipo}</dd>
                                      </div>
                                    </dl>
                                  </div>
                                  
                                  {/* Destino */}
                                  <div className="bg-white rounded-md p-3 border border-gray-200">
                                    <h5 className="text-xs font-semibold text-gray-700 mb-2">DESTINO</h5>
                                    <dl className="space-y-2">
                                      <div>
                                        <dt className="text-xs font-medium text-gray-500">Hospital/Almacén</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{movimiento?.destino_hospital?.nombre}</dd>
                                      </div>
                                      <div>
                                        <dt className="text-xs font-medium text-gray-500">Sede</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{movimiento?.destino_sede?.nombre}</dd>
                                      </div>
                                      <div>
                                        <dt className="text-xs font-medium text-gray-500">Tipo Almacén</dt>
                                        <dd className="mt-1 text-sm text-gray-900 capitalize">{movimiento?.destino_almacen_tipo}</dd>
                                      </div>
                                    </dl>
                                  </div>
                                </div>
                              </div>

                              {/* Lotes e Insumos - Vista Agrupada */}
                              {movimiento?.lotes_grupos && movimiento.lotes_grupos.length > 0 && (
                                <div className="border-t border-gray-200 pt-4">
                                  <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-sm font-semibold text-gray-900">Insumos y Lotes</h4>
                                    <span className="text-xs text-gray-500">
                                      {new Set(movimiento.lotes_grupos.map(lg => lg.lote?.insumo?.id)).size} insumos | {movimiento.lotes_grupos.length} lotes
                                    </span>
                                  </div>
                                  
                                  <div className="overflow-x-auto bg-white rounded-lg border">
                                    <table className="min-w-full divide-y divide-gray-200">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Insumo</th>
                                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Lotes</th>
                                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Salida</th>
                                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Entrada</th>
                                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase"></th>
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-200">
                                        {(() => {
                                          // Agrupar lotes por insumo
                                          const insumosAgrupados = movimiento.lotes_grupos.reduce((acc, loteGrupo) => {
                                            const insumoId = loteGrupo?.lote?.insumo?.id;
                                            if (!acc[insumoId]) {
                                              acc[insumoId] = {
                                                insumo: loteGrupo?.lote?.insumo,
                                                lotes: [],
                                                totalSalida: 0,
                                                totalEntrada: 0
                                              };
                                            }
                                            acc[insumoId].lotes.push(loteGrupo);
                                            acc[insumoId].totalSalida += loteGrupo?.cantidad_salida || 0;
                                            acc[insumoId].totalEntrada += loteGrupo?.cantidad_entrada || 0;
                                            return acc;
                                          }, {});

                                          return Object.entries(insumosAgrupados).map(([insumoId, data], index) => (
                                            <React.Fragment key={insumoId}>
                                              {/* Fila principal del insumo */}
                                              <tr className="hover:bg-gray-50 bg-gray-25">
                                                <td className="px-2 py-2">
                                                  <div className="min-w-0">
                                                    <div className="text-xs font-medium text-gray-900 truncate max-w-xs" title={data.insumo?.nombre}>
                                                      {data.insumo?.nombre}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                      #{data.insumo?.codigo} | {data.insumo?.tipo}
                                                    </div>
                                                  </div>
                                                </td>
                                                <td className="px-2 py-2">
                                                  <span className="text-xs font-medium text-gray-700">
                                                    {data.lotes.length} lote{data.lotes.length > 1 ? 's' : ''}
                                                  </span>
                                                </td>
                                                <td className="px-2 py-2">
                                                  <span className="text-xs font-semibold text-red-600">
                                                    -{data.totalSalida}
                                                  </span>
                                                </td>
                                                <td className="px-2 py-2">
                                                  <span className="text-xs font-semibold text-green-600">
                                                    +{data.totalEntrada}
                                                  </span>
                                                </td>
                                                <td className="px-2 py-2">
                                                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                                    data.insumo?.status === 'activo' 
                                                      ? 'bg-green-100 text-green-700' 
                                                      : 'bg-red-100 text-red-700'
                                                  }`}>
                                                    {data.insumo?.status === 'activo' ? '✓' : '✗'}
                                                  </span>
                                                </td>
                                                <td className="px-2 py-2 text-right">
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      setExpandedItems(prev => ({
                                                        ...prev,
                                                        [`insumo-${insumoId}`]: !prev[`insumo-${insumoId}`]
                                                      }));
                                                    }}
                                                    className="text-indigo-600 hover:text-indigo-900 text-xs"
                                                  >
                                                    {expandedItems[`insumo-${insumoId}`] ? '▲' : '▼'}
                                                  </button>
                                                </td>
                                              </tr>
                                              
                                              {/* Filas de lotes expandibles */}
                                              {expandedItems[`insumo-${insumoId}`] && data.lotes.map((loteGrupo, loteIndex) => (
                                                <tr key={`${insumoId}-${loteIndex}`} className="bg-blue-50">
                                                  <td className="px-4 py-1 pl-8">
                                                    <div className="text-xs text-gray-600">
                                                      └ Lote: {loteGrupo?.lote?.numero_lote}
                                                    </div>
                                                  </td>
                                                  <td className="px-2 py-1">
                                                    <div className="text-xs text-gray-600">
                                                      ID: {loteGrupo?.lote?.id}
                                                    </div>
                                                  </td>
                                                  <td className="px-2 py-1">
                                                    <span className="text-xs font-medium text-red-600">
                                                      -{loteGrupo?.cantidad_salida || 0}
                                                    </span>
                                                  </td>
                                                  <td className="px-2 py-1">
                                                    <span className="text-xs font-medium text-green-600">
                                                      +{loteGrupo?.cantidad_entrada || 0}
                                                    </span>
                                                  </td>
                                                  <td className="px-2 py-1">
                                                    <div className="text-xs text-gray-600">
                                                      {loteGrupo?.lote?.fecha_vencimiento ? 
                                                        new Date(loteGrupo.lote.fecha_vencimiento).toLocaleDateString('es-ES', {
                                                          day: '2-digit',
                                                          month: '2-digit',
                                                          year: '2-digit'
                                                        }) : 'N/A'
                                                      }
                                                    </div>
                                                  </td>
                                                  <td className="px-2 py-1"></td>
                                                </tr>
                                              ))}
                                            </React.Fragment>
                                          ));
                                        })()}
                                      </tbody>
                                    </table>
                                  </div>
                                  
                                  {/* Resumen compacto */}
                                  <div className="mt-2 flex justify-between text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded">
                                    <span>Total Salida: <strong className="text-red-600">
                                      {movimiento.lotes_grupos.reduce((sum, lg) => sum + (lg.cantidad_salida || 0), 0)}
                                    </strong></span>
                                    <span>Total Entrada: <strong className="text-green-600">
                                      {movimiento.lotes_grupos.reduce((sum, lg) => sum + (lg.cantidad_entrada || 0), 0)}
                                    </strong></span>
                                    <span>Insumos únicos: <strong>{new Set(movimiento.lotes_grupos.map(lg => lg.lote?.insumo?.id)).size}</strong></span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
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