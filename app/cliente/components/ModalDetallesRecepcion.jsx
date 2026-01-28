'use client';

import { createPortal } from 'react-dom';
import { Package, User, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { useEffect } from 'react';

const ModalDetallesRecepcion = ({ isOpen, recepcion, onClose, formatDate, userSedeTipo }) => {
  const ocultarLotes = userSedeTipo === 'almacenAUS';

  useEffect(() => {
    if (recepcion) {
     console.log("Recepcion: "+JSON.stringify(recepcion, null, 2));
    }
  }, [recepcion]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header del Modal */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Detalles de Recepción - {recepcion?.codigo_grupo}
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
          
          {/* Información General */}
          <div className={`grid gap-6 mb-6 ${
            recepcion?.estado === 'recibido' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
          }`}>
            {/* Información de Despacho */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-md font-semibold text-blue-800 mb-3 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Información de Despacho
              </h4>
              <div className="space-y-2 text-sm text-gray-700">
                <div><span className="font-medium text-gray-900">Despachado por:</span> {recepcion?.usuario?.nombre} {recepcion?.usuario?.apellido}</div>
                <div><span className="font-medium text-gray-900">Cédula:</span> {recepcion?.usuario?.cedula}</div>
                <div><span className="font-medium text-gray-900">Email:</span> {recepcion?.usuario?.email}</div>
                <div><span className="font-medium text-gray-900">Fecha despacho:</span> {formatDate(recepcion?.fecha_despacho)}</div>
                {recepcion?.origen_hospital_id!=recepcion?.destino_hospital_id ? (
                  <>
                    <div><span className="font-medium text-gray-900">Origen:</span> {recepcion?.origen_hospital?.nombre}</div>
                    <div><span className="font-medium text-gray-900">Destino:</span> {recepcion?.destino_hospital?.nombre}</div>
                  </>
                ):(
                  <>
                    <div><span className="font-medium text-gray-900">Sede Origen:</span> {recepcion?.origen_sede?.nombre}</div>
                    <div><span className="font-medium text-gray-900">Sede Destino:</span> {recepcion?.destino_sede?.nombre}</div>
                  </>
                )}

              </div>
            </div>

            {/* Información de Recepción (solo si está completado) */}
            {recepcion?.estado === 'recibido' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-md font-semibold text-green-800 mb-3 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Información de Recepción
                </h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <div><span className="font-medium text-gray-900">Recibido por:</span> {recepcion?.usuario_receptor?.nombre} {recepcion?.usuario_receptor?.apellido}</div>
                  <div><span className="font-medium text-gray-900">Cédula:</span> {recepcion?.usuario_receptor?.cedula}</div>
                  <div><span className="font-medium text-gray-900">Email:</span> {recepcion?.usuario_receptor?.email}</div>
                  <div><span className="font-medium text-gray-900">Fecha recepción:</span> {formatDate(recepcion?.fecha_recepcion)}</div>
                  {/* datos de la sede */}
                  <div><span className="font-medium text-gray-900">Sede:</span> {recepcion?.destino_sede?.nombre}</div>
                  {recepcion?.observaciones_recepcion && (
                    <div><span className="font-medium text-gray-900">Observaciones:</span> {recepcion.observaciones_recepcion}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Totales y Discrepancias */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Resumen de Cantidades</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{recepcion?.cantidad_salida_total || 0}</div>
              <div className="text-sm text-gray-600">Total Salida</div>
            </div>
            {recepcion?.estado === 'recibido' && (
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{recepcion?.cantidad_entrada_total || 0}</div>
                <div className="text-sm text-gray-600">Total Entrada</div>
              </div>
            )}
            {!ocultarLotes && (
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{recepcion?.lotes_grupos?.length || 0}</div>
                <div className="text-sm text-gray-600">Lotes</div>
              </div>
            )}
            {recepcion?.discrepancia_total && (
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 mr-1" />
                  ¡Discrepancia!
                </div>
                <div className="text-sm text-red-600">Revisar cantidades</div>
              </div>
            )}
          </div>
        </div>

          {/* Detalle */}
        <div className="mb-4">
          <h4 className="text-md font-semibold text-gray-900 mb-3">
            {ocultarLotes
              ? `Detalle de Insumos (${Object.keys((recepcion?.lotes_grupos || []).reduce((acc, lg) => {
                  const insumoId = lg?.lote?.insumo?.id;
                  if (insumoId) acc[insumoId] = true;
                  return acc;
                }, {})).length} items)`
              : `Detalle de Insumos y Lotes (${recepcion?.lotes_grupos?.length || 0} items)`}
          </h4>
        </div>

        {recepcion?.lotes_grupos && ocultarLotes && (
          <div className="space-y-4">
            {(() => {
              const insumosAgrupados = recepcion.lotes_grupos.reduce((acc, loteGrupo) => {
                const insumoId = loteGrupo?.lote?.insumo?.id;
                if (!insumoId) return acc;
                if (!acc[insumoId]) {
                  acc[insumoId] = {
                    insumo: loteGrupo?.lote?.insumo,
                    totalSalida: 0,
                    totalEntrada: 0
                  };
                }
                acc[insumoId].totalSalida += loteGrupo?.cantidad_salida || 0;
                acc[insumoId].totalEntrada += loteGrupo?.cantidad_entrada || 0;
                return acc;
              }, {});

              return Object.entries(insumosAgrupados).map(([insumoId, data]) => (
                <div key={insumoId} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Package className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {data.insumo?.nombre}
                        </div>
                        <div className="text-xs text-gray-500">
                          #{data.insumo?.codigo} | {data.insumo?.tipo}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      Total: {data.totalSalida}
                      {recepcion?.estado === 'recibido' && (
                        <span className="ml-2 text-green-600">/ {data.totalEntrada} recibido</span>
                      )}
                    </div>
                  </div>
                </div>
              ));
            })()}
          </div>
        )}

        {recepcion?.lotes_grupos && !ocultarLotes && (
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
                        {recepcion?.estado === 'recibido' && (
                          <span className="ml-2 text-green-600">
                            / {data.lotes.reduce((sum, lg) => sum + (lg.cantidad_entrada || 0), 0)} recibido
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Lotes del Insumo */}
                    <div className="ml-11 space-y-2">
                      {data.lotes.map((loteGrupo, loteIndex) => (
                        <div key={loteIndex} className={`bg-white p-3 rounded border ${
                          loteGrupo.discrepancia ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              {loteGrupo.lote?.numero_lote && (
                                <div className="text-sm font-medium text-gray-900 flex items-center">
                                  Lote: {loteGrupo.lote?.numero_lote}
                                  {loteGrupo.discrepancia && (
                                    <AlertTriangle className="w-4 h-4 ml-2 text-red-500" />
                                  )}
                                </div>
                              )}
                              <div className="text-xs text-gray-500 mt-1">
                                <div>ID: {loteGrupo.lote?.id}</div>
                                {loteGrupo.lote?.fecha_vencimiento && (
                                  <div>
                                    Vence: {new Date(loteGrupo.lote.fecha_vencimiento).toLocaleDateString('es-VE', { timeZone: 'UTC' })}
                                  </div>
                                )}
                              </div>
                              <div className="text-xs mt-1">
                                <span className="font-medium text-gray-700">Salida:</span> 
                                <span className={loteGrupo.discrepancia ? 'text-red-600 font-bold' : 'text-blue-600'}>
                                  {loteGrupo.cantidad_salida}
                                </span>
                                {recepcion?.estado === 'recibido' && (
                                  <>
                                    <span className="mx-2">|</span>
                                    <span className="font-medium text-gray-700">Entrada:</span> 
                                    <span className={ 'text-green-600'}>
                                      {loteGrupo.cantidad_entrada}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="ml-4">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                loteGrupo.discrepancia 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {loteGrupo.discrepancia ? 'Discrepancia' : `${loteGrupo.cantidad_salida} unidades`}
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

          {/* Observaciones */}
          {recepcion?.observaciones && (
            <div className="mt-6 bg-yellow-50 rounded-lg p-4">
              <h4 className="text-md font-semibold text-yellow-900 mb-2">Observaciones</h4>
              <p className="text-sm text-yellow-800">{recepcion.observaciones}</p>
            </div>
          )}
        </div>

        {/* Footer del Modal */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ModalDetallesRecepcion;
