'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Package, CheckCircle, AlertCircle, Clock, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getMovimientosRecepcion } from '@/servicios/despachos/get';
import { useRouter } from 'next/navigation';
import Modal from '@/components/Modal';

const Recepcion = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [recepciones, setRecepciones] = useState([]);
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info', // 'info', 'error', 'success', 'warning'
    time: null
  });
  const [modalDetalles, setModalDetalles] = useState({
    isOpen: false,
    recepcion: null,
    insumosRecibidos: {} // {insumoId: {recibido: boolean, lotes: {loteId: boolean}}}
  });
  const showMessage = (title, message, type = 'info', time = null) => {
    setModal({isOpen: true, title, message, type, time});
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const abrirModalDetalles = (recepcion) => {
    setModalDetalles({
      isOpen: true,
      recepcion: recepcion,
      insumosRecibidos: {}
    });
  };

  const cerrarModalDetalles = () => {
    setModalDetalles({
      isOpen: false,
      recepcion: null,
      insumosRecibidos: {}
    });
  };

  
  
  useEffect(() => {
    
    handleRecepciones();
  }, []);

  const handleRecepciones = async () => {
    const { token, sede_id } = user;
    const response = await getMovimientosRecepcion(token, sede_id);
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
      setRecepciones(response.data.data);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pendiente: { 
        bg: 'bg-yellow-100 text-yellow-800', 
        icon: <Clock className="h-4 w-4" />,
        label: 'Pendiente'
      },
      completado: { 
        bg: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="h-4 w-4" />,
        label: 'Completado'
      },
      en_proceso: { 
        bg: 'bg-blue-100 text-blue-800',
        icon: <Package className="h-4 w-4" />,
        label: 'En Proceso'
      },
      con_incidencias: {
        bg: 'bg-red-100 text-red-800',
        icon: <AlertCircle className="h-4 w-4" />,
        label: 'Con Incidencias'
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
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/10 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-xl font-semibold text-white mb-4 md:mb-0">Recepción de Despachos</h2>
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Buscar recepción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                ID Recepción
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Fecha/Hora
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Origen
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Items
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Total
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white/5 divide-y divide-white/10">
            {recepciones.map((recepcion, index) => (
              <tr key={recepcion.id || index} className="hover:bg-white/10">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                  {recepcion.codigo_grupo || recepcion.id || `MOV-${index + 1}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                  {formatDate(recepcion.fecha_despacho)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                  {recepcion.origen_hospital?.nombre || recepcion.origen || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {getStatusBadge(recepcion.estado)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                  {recepcion.lotes_grupos?.length || recepcion.items || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                  {recepcion.cantidad_salida || recepcion.total || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => abrirModalDetalles(recepcion)}
                    className="text-indigo-400 hover:text-indigo-300 mr-3"
                  >
                    Ver Detalles
                  </button>
                  {recepcion.estado === 'pendiente' && (
                    <button className="text-green-400 hover:text-green-300">
                      Registrar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col md:flex-row justify-between items-center">
        <div className="text-sm text-gray-400">
          Mostrando <span className="font-medium">1</span> a <span className="font-medium">3</span> de{' '}
          <span className="font-medium">3</span> resultados
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 rounded-md bg-white/10 text-white hover:bg-white/20 disabled:opacity-50" disabled>
            Anterior
          </button>
          <button className="px-3 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
            1
          </button>
          <button className="px-3 py-1 rounded-md bg-white/10 text-white hover:bg-white/20">
            2
          </button>
          <button className="px-3 py-1 rounded-md bg-white/10 text-white hover:bg-white/20">
            Siguiente
          </button>
        </div>
      </div>


      {/* Modal para mensajes */}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        type={modal.type}
        time={modal.time}
      >
        {modal.message}
      </Modal>

      {/* Modal de Detalles usando Portal */}
      {modalDetalles.isOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header del Modal */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Detalles de Recepción - {modalDetalles.recepcion?.codigo_grupo}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Origen: {modalDetalles.recepcion?.origen_hospital?.nombre} | 
                    Fecha: {formatDate(modalDetalles.recepcion?.fecha_despacho)}
                  </p>
                </div>
                <button
                  onClick={cerrarModalDetalles}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="mb-4">
                <h4 className="text-md font-semibold text-gray-900 mb-3">
                  Insumos y Lotes ({modalDetalles.recepcion?.lotes_grupos?.length || 0} items)
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Detalle completo de los insumos y lotes incluidos en este movimiento.
                </p>
              </div>

              {modalDetalles.recepcion?.lotes_grupos && (
                <div className="space-y-4">
                  {(() => {
                    // Agrupar lotes por insumo
                    const insumosAgrupados = modalDetalles.recepcion.lotes_grupos.reduce((acc, loteGrupo) => {
                      const insumoId = loteGrupo?.lote?.insumo?.id;
                      if (!acc[insumoId]) {
                        acc[insumoId] = {
                          insumo: loteGrupo?.lote?.insumo,
                          lotes: []
                        };
                      }
                      acc[insumoId].lotes.push(loteGrupo);
                      return acc;
                    }, {});

                    return Object.entries(insumosAgrupados).map(([insumoId, data]) => (
                      <div key={insumoId} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        {/* Header del Insumo */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                              <Package className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {data.insumo?.nombre}
                              </div>
                              <div className="text-xs text-gray-500">
                                #{data.insumo?.codigo} | {data.insumo?.tipo} | {data.lotes.length} lote(s)
                              </div>
                            </div>
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            Total: {data.lotes.reduce((sum, lg) => sum + (lg.cantidad_salida || 0), 0)}
                          </div>
                        </div>

                        {/* Lotes del Insumo */}
                        <div className="ml-11 space-y-2">
                          {data.lotes.map((loteGrupo, loteIndex) => (
                            <div key={loteIndex} className="bg-white p-3 rounded border border-gray-200">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900">
                                    Lote: {loteGrupo.lote?.numero_lote}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    ID: {loteGrupo.lote?.id} | 
                                    Cantidad: <span className="font-medium">{loteGrupo.cantidad_salida}</span> | 
                                    Vence: {loteGrupo.lote?.fecha_vencimiento ? 
                                      new Date(loteGrupo.lote.fecha_vencimiento).toLocaleDateString() : 'N/A'}
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {loteGrupo.cantidad_salida} unidades
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>

            {/* Footer del Modal */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={cerrarModalDetalles}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Recepcion;
