'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Truck, MapPin, Clock, CheckCircle, AlertCircle, Search, Package, Eye } from 'lucide-react';
import Modal from '@/components/Modal';
import dynamic from 'next/dynamic';

// Importar MapaTracking dinámicamente para evitar problemas de SSR con Leaflet
const MapaTracking = dynamic(() => import('@/app/cliente/components/MapaTracking'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-gray-600">Cargando mapa...</div>
    </div>
  )
});

export default function TrackingEnvios({ 
  envios = [], 
  onRastrear, 
  showSearch = true,
  title = "Seguimiento de Despachos",
  modal,
  closeModal
}) {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [detalleVisible, setDetalleVisible] = useState({});
  const [activeTab, setActiveTab] = useState('activos');
  const [showInsumosModal, setShowInsumosModal] = useState(false);
  const [showMapaModal, setShowMapaModal] = useState(false);
  const [insumos, setInsumos] = useState([]);
  const [envioActual, setEnvioActual] = useState(null);

  const getStatusBadge = (status) => {
    const statusConfig = {
      en_transito: { 
        bg: 'bg-blue-100 text-blue-800', 
        icon: <Truck className="h-4 w-4" />,
        label: 'En Tránsito'
      },
      en_camino: { 
        bg: 'bg-pink-100 text-pink-800',
        icon: <Truck className="h-4 w-4" />,
        label: 'En Camino'
      },
      entregado: { 
        bg: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="h-4 w-4" />,
        label: 'Entregado'
      },
      pendiente: { 
        bg: 'bg-yellow-100 text-yellow-800',
        icon: <Clock className="h-4 w-4" />,
        label: 'Pendiente'
      },
      despachado: { 
        bg: 'bg-indigo-100 text-indigo-800',
        icon: <Package className="h-4 w-4" />,
        label: 'Despachado'
      },
      recibido: { 
        bg: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="h-4 w-4" />,
        label: 'Recibido'
      },
      retrasado: {
        bg: 'bg-red-100 text-red-800',
        icon: <AlertCircle className="h-4 w-4" />,
        label: 'Retrasado'
      }
    };
    
    const config = statusConfig[status] || statusConfig.pendiente;
    
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${config.bg}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleVerInsumos = (envioId) => {
    const envio = envios.find(e => e.id === envioId);
    
    if (!envio || !envio.lotes_grupos || envio.lotes_grupos.length === 0) {
      return;
    }
    
    const insumosTransformados = envio.lotes_grupos.map(loteGrupo => ({
      id: loteGrupo.id,
      nombre: loteGrupo.lote?.insumo?.nombre || 'Insumo sin nombre',
      cantidad: loteGrupo.cantidad_salida,
      unidad: loteGrupo.lote?.insumo?.unidad_medida || 'unidad',
      lote: loteGrupo.lote?.numero_lote || 'N/A',
      codigo: loteGrupo.lote?.insumo?.codigo || 'N/A',
      codigoAlterno: loteGrupo.lote?.insumo?.codigo_alterno || 'N/A',
      tipo: loteGrupo.lote?.insumo?.tipo || 'N/A',
      descripcion: loteGrupo.lote?.insumo?.descripcion || '',
      presentacion: loteGrupo.lote?.insumo?.presentacion || 'N/A',
      fechaVencimiento: loteGrupo.lote?.fecha_vencimiento || 'N/A',
      fechaIngreso: loteGrupo.lote?.fecha_ingreso || 'N/A',
      cantidadPorPaquete: loteGrupo.lote?.insumo?.cantidad_por_paquete || 1
    }));
    
    setInsumos(insumosTransformados);
    setShowInsumosModal(true);
  };

  const handleVerMapa = (envioId) => {
    const envio = envios.find(e => e.id === envioId);
    setEnvioActual(envio);
    setShowMapaModal(true);
  };

  const closeInsumosModal = () => {
    setShowInsumosModal(false);
    setInsumos([]);
  };

  const toggleDetalle = (envioId) => {
    setDetalleVisible(prev => ({
      ...prev,
      [envioId]: !prev[envioId]
    }));
  };

  const renderHistorial = (historial, envio) => {
    return (
      <>
        <div className="flex justify-start items-center mt-4">
          <div className="relative flex flex-col md:flex-row gap-2">
            <span 
              onClick={() => handleVerInsumos(envio.id)} 
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-teal-500 text-white hover:bg-teal-600 cursor-pointer transition-colors"
            >
              <Eye className="h-4 w-4" />
              Ver Insumos
            </span>
            <span 
              onClick={() => handleVerMapa(envio.id)} 
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-teal-500 text-white hover:bg-teal-600 cursor-pointer transition-colors"
            >
              <MapPin className="h-4 w-4" />
              Seguimiento en mapa
            </span>
          </div>
        </div>
        <div className="mt-4 space-y-4">
          <h4 className="text-sm font-medium text-indigo-500">Historial de Seguimiento:</h4>
          <div className="relative">
            <div className="absolute left-4 h-full w-0.5 bg-gray-600"></div>
            <div className="space-y-6">
              {historial && historial.length > 0 ? (
                historial.map((evento, index) => (
                  <div key={index} className="relative flex items-start">
                    <div className="absolute left-0 mt-1.5 ml-3 h-3 w-3 rounded-full bg-indigo-500"></div>
                    <div className="ml-8">
                      <p className="text-sm font-medium text-gray-800">{evento.evento}</p>
                      <p className="text-xs text-gray-500">{formatDate(evento.fecha)}</p>
                      <p className="text-xs text-gray-500">{evento.ubicacion}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 ml-8">No hay historial de seguimiento disponible</p>
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  // Filtrar envíos por estado
  const enviosActivos = envios.filter(e => 
    ['en_transito', 'en_camino', 'despachado', 'pendiente'].includes(e.estado)
  );
  const enviosHistorial = envios.filter(e => 
    ['entregado', 'recibido'].includes(e.estado)
  );

  const enviosMostrar = activeTab === 'activos' ? enviosActivos : enviosHistorial;

  return (
    <div className="space-y-6">
      {modal && (
        <Modal 
          isOpen={modal.isOpen} 
          onClose={closeModal} 
          title={modal.title} 
          message={modal.message} 
          type={modal.type}
          time={modal.time}
        />
      )}

      {showSearch && (
        <div className="rounded-2xl p-6 shadow-lg border border-gray-100 bg-white">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex">
              <div className="pl-3 -mr-8 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Número de guía o ID de envío"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>
            <button 
              onClick={() => onRastrear && onRastrear(trackingNumber)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Rastrear
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('activos')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'activos' 
                  ? 'border-indigo-700 text-gray-800' 
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              Envíos Activos ({enviosActivos.length})
            </button>
            <button
              onClick={() => setActiveTab('historial')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'historial' 
                  ? 'border-indigo-700 text-gray-800' 
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              Historial ({enviosHistorial.length})
            </button>
          </nav>
        </div> */}

        <div className="p-6">
          {enviosMostrar.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-500">
                No hay envíos {activeTab === 'activos' ? 'activos' : 'en el historial'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeTab === 'activos' 
                  ? 'Actualmente no hay envíos en curso.' 
                  : 'No se encontraron envíos anteriores.'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {enviosMostrar.map((envio) => (
                <div key={envio.id} className="bg-white rounded-lg p-4 border border-indigo-700">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
                        <h3 className="text-lg font-medium text-gray-800">Envío #{envio.id}</h3>
                        {getStatusBadge(envio.estado)}
                      </div>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-indigo-500 font-medium">Origen</p>
                          <p className="text-gray-800">{envio.origen}</p>
                        </div>
                        <div>
                          <p className="text-indigo-500 font-medium">Destino</p>
                          <p className="text-gray-800">{envio.destino}</p>
                        </div>
                        <div>
                          <p className="text-indigo-500 font-medium">Transportista</p>
                          <p className="text-gray-800">{envio.transportista}</p>
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-indigo-500 font-medium">Fecha Envío</p>
                          <p className="text-gray-800">{formatDate(envio.fechaEnvio)}</p>
                        </div>
                        <div>
                          <p className="text-indigo-500 font-medium">Fecha Estimada</p>
                          <p className="text-gray-800">{formatDate(envio.fechaEstimada)}</p>
                        </div>
                        <div>
                          <p className="text-indigo-500 font-medium">Items</p>
                          <p className="text-gray-800">{envio.items || 0} insumos</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-4">
                      <button 
                        onClick={() => toggleDetalle(envio.id)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                      >
                        {detalleVisible[envio.id] ? 'Ocultar Detalles' : 'Ver Detalles'}
                      </button>
                    </div>
                  </div>
                  {detalleVisible[envio.id] && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {renderHistorial(envio.historial, envio)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Insumos */}
      {showInsumosModal && (
        <div className="fixed ml-64 inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Insumos Despachados</h3>
              <button 
                onClick={closeInsumosModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {/* Resumen de insumos */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">Total Insumos</div>
                      <div className="text-xl font-bold text-blue-900">{insumos.length}</div>
                      <div className="text-xs text-blue-600 mt-1">tipos diferentes</div>
                    </div>
                    <Package className="h-8 w-8 text-blue-400 opacity-50" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-green-600 font-semibold uppercase tracking-wide mb-1">Cantidad Total</div>
                      <div className="text-xl font-bold text-green-900">
                        {insumos.reduce((sum, i) => sum + i.cantidad, 0)}
                      </div>
                      <div className="text-xs text-green-600 mt-1">unidades</div>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-400 opacity-50" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200 shadow-sm">
                  <div>
                    <div className="text-xs text-purple-600 font-semibold uppercase tracking-wide mb-2">Tipos de Insumos</div>
                    <div className="flex flex-wrap gap-1">
                      {[...new Set(insumos.map(i => i.tipo))].map((tipo, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-purple-200 text-purple-800 capitalize">
                          {tipo}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Lista de insumos en cards */}
              <div className="space-y-3">
                {insumos.map((insumo) => (
                  <div key={insumo.id} className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200">
                    <div className="p-4">
                      {/* Header del insumo */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-bold text-gray-900">{insumo.nombre}</h4>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 capitalize">
                              {insumo.tipo}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <span className="font-medium text-gray-700">Código:</span> {insumo.codigo}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="font-medium text-gray-700">Alt:</span> {insumo.codigoAlterno}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="font-medium text-gray-700">Presentación:</span> {insumo.presentacion}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Grid de información compacto */}
                      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                        {/* Cantidad */}
                        <div className="bg-gray-50 rounded-md p-2">
                          <div className="text-xs text-gray-500 mb-0.5">Cantidad</div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm font-bold text-gray-900">{insumo.cantidad}</span>
                            <span className="text-xs text-gray-600">{insumo.unidad}</span>
                          </div>
                        </div>

                        {/* Lote */}
                        <div className="bg-gray-50 rounded-md p-2">
                          <div className="text-xs text-gray-500 mb-0.5">Lote</div>
                          <div className="font-semibold text-gray-900 text-xs">{insumo.lote}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(insumo.fechaIngreso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                          </div>
                        </div>

                        {/* Vencimiento */}
                        <div className={`rounded-md p-2 ${new Date(insumo.fechaVencimiento) < new Date() ? 'bg-red-50' : 'bg-green-50'}`}>
                          <div className="text-xs mb-0.5 flex justify-start items-center gap-1">
                            <span className={new Date(insumo.fechaVencimiento) < new Date() ? 'text-red-600' : 'text-green-600'}>
                              Vence
                            </span>
                          </div>
                          <div className={`font-semibold text-xs ${new Date(insumo.fechaVencimiento) < new Date() ? 'text-red-700' : 'text-green-700'}`}>
                            {new Date(insumo.fechaVencimiento).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={closeInsumosModal}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Mapa */}
      {showMapaModal && envioActual && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[10002] overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/70 transition-opacity"
            onClick={() => setShowMapaModal(false)}
          />
          
          {/* Modal */}
          <div className="flex min-h-screen items-center justify-center p-4">
            <div 
              className="relative bg-white rounded-lg shadow-xl w-full overflow-hidden max-w-5xl h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="flex justify-between items-center px-4 py-3 border-b flex-shrink-0 bg-gradient-to-r from-indigo-600 to-blue-600">
              <div>
                <h3 className="text-base font-semibold text-white">🗺️ Seguimiento en Tiempo Real</h3>
                <p className="text-xs text-indigo-100">Envío #{envioActual.id} - {envioActual.origen} → {envioActual.destino}</p>
              </div>
              <button 
                onClick={() => setShowMapaModal(false)}
                className="text-white hover:text-indigo-100 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden flex flex-col p-3">
              {/* Mapa real con Leaflet */}
              <div className="flex-1 relative rounded-lg overflow-hidden" style={{ minHeight: '350px' }}>
                <MapaTracking envio={envioActual} />
              </div>
              
              {/* Información del envío compacta */}
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-gray-800">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-2 rounded-lg border border-blue-200">
                  <p className="text-[10px] text-blue-600 font-semibold uppercase">Estado</p>
                  <p className="text-xs font-bold text-blue-900 capitalize">{envioActual.estado.replace('_', ' ')}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-2 rounded-lg border border-green-200">
                  <p className="text-[10px] text-green-600 font-semibold uppercase">Conductor</p>
                  <p className="text-xs font-bold text-green-900 truncate">{envioActual.transportista}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-2 rounded-lg border border-purple-200">
                  <p className="text-[10px] text-purple-600 font-semibold uppercase">Insumos</p>
                  <p className="text-xs font-bold text-purple-900">{envioActual.items} unidades</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-2 rounded-lg border border-orange-200">
                  <p className="text-[10px] text-orange-600 font-semibold uppercase">Seguimientos</p>
                  <p className="text-xs font-bold text-orange-900">{envioActual.seguimientos?.length || 0} registros</p>
                </div>
              </div>
              
              {/* Historial de seguimientos compacto */}
              {envioActual.historial && envioActual.historial.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Historial de Seguimiento
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-2 max-h-32 overflow-y-auto">
                    <div className="space-y-2">
                      {envioActual.historial.slice().reverse().slice(0, 5).map((evento, idx) => (
                        <div key={idx} className="flex items-start text-xs border-l-2 border-indigo-400 pl-2">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{evento.evento}</p>
                            {evento.ubicacion && (
                              <p className="text-[10px] text-gray-600">{evento.ubicacion}</p>
                            )}
                            <p className="text-[10px] text-gray-400">{formatDate(evento.fecha)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t flex-shrink-0">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => setShowMapaModal(false)}
              >
                Cerrar
              </button>
            </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
