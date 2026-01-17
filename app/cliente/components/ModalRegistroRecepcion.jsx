'use client';

import { createPortal } from 'react-dom';
import { Package } from 'lucide-react';

const ModalRegistroRecepcion = ({ 
  isOpen, 
  recepcion, 
  loading,
  insumosRecibidos, 
  onClose, 
  onToggleInsumo, 
  onToggleLote, 
  onUpdateCantidad,
  onAddManualLote,
  onUpdateManualLote,
  onConfirmar,
  formatDate 
}) => {
  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header del Modal */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Registrar Recepción - {recepcion?.codigo_grupo}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Origen: {recepcion?.origen_hospital?.nombre} | 
                Fecha: {formatDate(recepcion?.fecha_despacho)}
              </p>
            </div>
            <button
              onClick={onClose}
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
              Confirmar Insumos Recibidos ({recepcion?.lotes_grupos?.length || 0} items)
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Marca los insumos y lotes que fueron recibidos correctamente. Ajusta las cantidades si es necesario.
            </p>
          </div>

          {recepcion?.lotes_grupos && (
            <div className="space-y-4">
              {(() => {
                // Agrupar lotes por insumo
                const insumosAgrupados = recepcion.lotes_grupos.reduce((acc, loteGrupo) => {
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
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 space-y-2 sm:space-y-0">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={`registro-insumo-${insumoId}`}
                          checked={insumosRecibidos[insumoId]?.recibido || false}
                          onChange={() => onToggleInsumo(insumoId)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded flex-shrink-0"
                        />
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-indigo-600" />
                        </div>
                        <label htmlFor={`registro-insumo-${insumoId}`} className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {data.insumo?.nombre}
                          </div>
                          <div className="text-xs text-gray-500">
                            #{data.insumo?.codigo} | {data.insumo?.tipo} | {data.lotes.length} lote(s)
                          </div>
                        </label>
                      </div>
                      <div className="text-sm font-semibold text-gray-900 sm:ml-4">
                        Enviado: {data.lotes.reduce((sum, lg) => sum + (lg.cantidad_salida || 0), 0)}
                      </div>
                    </div>

                    {/* Lotes del Insumo */}
                    <div className="ml-4 sm:ml-11 space-y-2">
                      {data.lotes.map((loteGrupo, loteIndex) => (
                        <div key={loteIndex} className="bg-white p-3 rounded border border-gray-200">
                          <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                            <div className="flex items-start space-x-3 flex-1 min-w-0">
                              <input
                                type="checkbox"
                                id={`registro-lote-${insumoId}-${loteGrupo.lote.id}`}
                                checked={insumosRecibidos[insumoId]?.lotes?.[loteGrupo.lote.id]?.recibido || false}
                                onChange={() => onToggleLote(insumoId, loteGrupo.lote.id)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded flex-shrink-0 mt-0.5"
                              />
                              <label htmlFor={`registro-lote-${insumoId}-${loteGrupo.lote.id}`} className="flex-1 min-w-0">
                                {loteGrupo.lote?.numero_lote && (
                                  <div className="text-sm font-medium text-gray-900">
                                    Lote: {loteGrupo.lote?.numero_lote}
                                  </div>
                                )}
                                <div className="text-xs text-gray-500 mt-1 space-y-1">
                                  <div>ID: {loteGrupo.lote?.id}</div>
                                  <div>Enviado: <span className="font-medium">{loteGrupo.cantidad_salida}</span></div>
                                  {loteGrupo.lote?.fecha_vencimiento && (
                                    <div>
                                      Vence: {new Date(loteGrupo.lote.fecha_vencimiento).toLocaleDateString('es-VE', { timeZone: 'UTC' })}
                                    </div>
                                  )}
                                </div>
                              </label>
                            </div>
                            <div className="flex items-center space-x-2 lg:ml-4 flex-shrink-0">
                              <label className="text-xs text-gray-600 flex-shrink-0">Recibido:</label>
                              <input
                                type="number"
                                min="0"
                                max={loteGrupo.cantidad_salida}
                                value={insumosRecibidos[insumoId]?.lotes?.[loteGrupo.lote.id]?.cantidadRecibida || 0}
                                onChange={(e) => onUpdateCantidad(insumoId, loteGrupo.lote.id, e.target.value)}
                                disabled={!insumosRecibidos[insumoId]?.lotes?.[loteGrupo.lote.id]?.recibido}
                                className="w-20 px-2 py-1 text-sm border text-gray-700 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-400 flex-shrink-0"
                              />
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

          {!recepcion?.lotes_grupos && insumosRecibidos && Object.keys(insumosRecibidos).length > 0 && (
            <div className="space-y-4">
              {Object.entries(insumosRecibidos).map(([insumoId, data]) => (
                <div key={insumoId} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id={`registro-insumo-manual-${insumoId}`}
                        checked={data?.recibido || false}
                        onChange={() => onToggleInsumo(insumoId)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded flex-shrink-0"
                      />
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-indigo-600" />
                      </div>
                      <label htmlFor={`registro-insumo-manual-${insumoId}`} className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {data?.insumo?.nombre || data?.insumo?.codigo || `Insumo ${insumoId}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          #{data?.insumo?.codigo || 'N/A'} | {data?.insumo?.tipo || 'N/A'}
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="ml-4 sm:ml-11 space-y-2">
                    {(data?.lotesManuales || []).map((lm, idx) => (
                      <div key={idx} className="bg-white p-3 rounded border border-gray-200">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Número de lote</label>
                            <input
                              type="text"
                              value={lm?.numero_lote || ''}
                              onChange={(e) => onUpdateManualLote(insumoId, idx, 'numero_lote', e.target.value)}
                              disabled={!data?.recibido}
                              className="w-full px-2 py-2 text-sm border text-gray-700 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-400"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Fecha de vencimiento</label>
                            <input
                              type="date"
                              value={lm?.fecha_vencimiento || ''}
                              onChange={(e) => onUpdateManualLote(insumoId, idx, 'fecha_vencimiento', e.target.value)}
                              disabled={!data?.recibido}
                              className="w-full px-2 py-2 text-sm border text-gray-700 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-400"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Cantidad recibida</label>
                            <input
                              type="number"
                              min="0"
                              value={lm?.cantidadRecibida || 0}
                              onChange={(e) => onUpdateManualLote(insumoId, idx, 'cantidadRecibida', e.target.value)}
                              disabled={!data?.recibido}
                              className="w-full px-2 py-2 text-sm border text-gray-700 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-400"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <div>
                      <button
                        type="button"
                        onClick={() => onAddManualLote(insumoId)}
                        disabled={!data?.recibido}
                        className="px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Agregar lote
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer del Modal */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            {loading ? 'Procesando...' : 'Confirmar Recepción'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ModalRegistroRecepcion;
