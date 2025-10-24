'use client';

import { Search, X, Package, Plus, Minus, Check, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function InsumoSelectionModalCliente({ isOpen, onClose, onSelectInsumo, searchTerm, setSearchTerm, insumos = [] }) {
  const [cantidades, setCantidades] = useState({});
  const [insumosSeleccionados, setInsumosSeleccionados] = useState([]);
  
  const filteredInsumos = (insumos || []).filter(insumo => 
    (insumo?.nombre || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    (insumo?.codigo || '').toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  const handleCantidadChange = (insumoId, cantidad) => {
    // Permitir valores vacíos temporalmente para que el usuario pueda borrar
    if (cantidad === '' || cantidad === null || cantidad === undefined) {
      setCantidades(prev => ({
        ...prev,
        [insumoId]: ''
      }));
      return;
    }
    
    const numericValue = parseInt(cantidad) || 0;
    const maxCantidad = getMaxCantidad(insumoId);
    const finalValue = Math.max(1, Math.min(numericValue, maxCantidad));
    
    setCantidades(prev => ({
      ...prev,
      [insumoId]: finalValue
    }));
  };

  const handleCantidadBlur = (insumoId) => {
    // Al perder el foco, asegurar que hay un valor válido
    const currentValue = cantidades[insumoId];
    if (currentValue === '' || currentValue === null || currentValue === undefined || currentValue < 1) {
      setCantidades(prev => ({
        ...prev,
        [insumoId]: 1
      }));
    }
  };

  const handleCantidadFocus = (event) => {
    // Seleccionar todo el texto al hacer foco
    event.target.select();
  };

  const getMaxCantidad = (insumoId) => {
    const insumo = insumos.find(i => i.id === insumoId);
    return insumo?.cantidad_total || 0;
  };

  const getCantidad = (insumoId) => {
    const value = cantidades[insumoId];
    return value === '' || value === null || value === undefined ? 1 : value;
  };

  const getIncremento = (cantidad) => {
    // Incrementos inteligentes basados en la cantidad actual
    if (cantidad < 10) return 1;
    if (cantidad < 100) return 10;
    if (cantidad < 1000) return 50;
    return 100;
  };

  const distribuirCantidadEnLotes = (insumo, cantidadSolicitada) => {
    if (!insumo.lotes || insumo.lotes.length === 0) {
      // Si no hay lotes específicos, usar el insumo completo
      return [{
        lote_id: null,
        numero_lote: 'General',
        cantidad: cantidadSolicitada,
        fecha_vencimiento: null,
        insumo_id: insumo.id
      }];
    }

    // Ordenar lotes por fecha de vencimiento (FIFO - más próximo a vencer primero)
    const lotesOrdenados = [...insumo.lotes]
      .filter(lote => lote.cantidad > 0) // Solo lotes con stock
      .sort((a, b) => {
        // Si no hay fecha de vencimiento, va al final
        if (!a.fecha_vencimiento && !b.fecha_vencimiento) return 0;
        if (!a.fecha_vencimiento) return 1;
        if (!b.fecha_vencimiento) return -1;
        return new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento);
      });

    const distribucion = [];
    let cantidadRestante = cantidadSolicitada;

    for (const lote of lotesOrdenados) {
      if (cantidadRestante <= 0) break;

      const cantidadDelLote = Math.min(cantidadRestante, lote.cantidad);
      
      distribucion.push({
        lote_id: lote.lote_id,
        numero_lote: lote.numero_lote || lote.id,
        cantidad: cantidadDelLote,
        fecha_vencimiento: lote.fecha_vencimiento,
        insumo_id: insumo.id,
        cantidad_disponible: lote.cantidad
      });

      cantidadRestante -= cantidadDelLote;
    }

    return distribucion;
  };

  const handleToggleInsumo = (insumo) => {
    const cantidad = getCantidad(insumo.id);
    if (cantidad <= 0) return;
    
    const yaSeleccionado = insumosSeleccionados.find(item => item.id === insumo.id);
    
    if (yaSeleccionado) {
      // Remover de la selección
      setInsumosSeleccionados(prev => prev.filter(item => item.id !== insumo.id));
    } else {
      // Calcular distribución de lotes
      const distribucionLotes = distribuirCantidadEnLotes(insumo, cantidad);
      
      // Agregar a la selección con distribución de lotes
      setInsumosSeleccionados(prev => [...prev, {
        ...insumo,
        cantidad: cantidad,
        lotes: distribucionLotes
      }]);
    }
  };

  const handleConfirmarSeleccion = () => {
    if (insumosSeleccionados.length > 0) {
      // Enviar cada insumo individualmente como en el sistema original
      insumosSeleccionados.forEach(insumo => {
        onSelectInsumo(insumo);
      });
      
      // Limpiar selecciones
      setInsumosSeleccionados([]);
      setCantidades({});
      onClose();
    }
  };

  const isInsumoSeleccionado = (insumoId) => {
    return insumosSeleccionados.some(item => item.id === insumoId);
  };

  const handleRemoverSeleccionado = (insumoId) => {
    setInsumosSeleccionados(prev => prev.filter(item => item.id !== insumoId));
  };

  // Don't render anything if not open or document is not available
  if (!isOpen || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[10002] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div 
          className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 w-full max-w-4xl max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h3 className="text-xl font-semibold text-gray-700">Seleccionar Insumos</h3>
            {insumosSeleccionados.length > 0 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                <ShoppingCart className="h-4 w-4 mr-2" />
                {insumosSeleccionados.length} seleccionado{insumosSeleccionados.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2 bg-gray-100 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar insumo por nombre o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              autoFocus
            />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredInsumos.length > 0 ? (
            <div className="grid gap-4">
              {filteredInsumos.map((insumo) => (
                <div key={insumo.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="p-3 bg-indigo-100 rounded-lg">
                        <Package className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-lg">{insumo.nombre}</div>
                        <div className="text-gray-600 mt-1">Código: {insumo.codigo}</div>
                        {insumo.cantidad_total && (
                          <div className="text-indigo-600 font-medium mt-2">
                            Disponible: {insumo.cantidad_total} unidades
                          </div>
                        )}
                        {insumo.lotes && insumo.lotes.length > 0 && (
                          <div className="text-sm text-gray-500 mt-1">
                            {insumo.lotes.length} lote{insumo.lotes.length !== 1 ? 's' : ''} disponible{insumo.lotes.length !== 1 ? 's' : ''}
                          </div>
                        )}
                        
                        {/* Vista previa de distribución de lotes */}
                        {insumo.lotes && insumo.lotes.length > 0 && getCantidad(insumo.id) > 0 && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h5 className="text-sm font-medium text-blue-800 mb-3">Distribución por lotes (FIFO):</h5>
                            <div className="space-y-2">
                              {distribuirCantidadEnLotes(insumo, getCantidad(insumo.id)).map((lote, index) => (
                                <div key={index} className="flex justify-between items-center text-sm text-blue-700 bg-blue-100 rounded p-2">
                                  <span className="font-medium">Lote {lote.numero_lote}</span>
                                  <span className="text-blue-800">{lote.cantidad} unidades</span>
                                  {lote.fecha_vencimiento && (
                                    <span className="text-blue-600 text-xs">
                                      Vence: {new Date(lote.fecha_vencimiento).toLocaleDateString('es-VE', { timeZone: 'UTC' })}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Controles de cantidad */}
                        <div className="mt-4 flex items-center space-x-4">
                          <span className="text-sm font-medium text-gray-700">Cantidad a despachar:</span>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                const currentValue = getCantidad(insumo.id);
                                const increment = getIncremento(currentValue);
                                handleCantidadChange(insumo.id, Math.max(1, currentValue - increment));
                              }}
                              disabled={getCantidad(insumo.id) <= 1}
                              className="p-2 rounded-lg bg-red-100 border border-red-200 text-red-600 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              title={`Decrementar en ${getIncremento(getCantidad(insumo.id))}`}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <input
                              type="number"
                              min="1"
                              max={getMaxCantidad(insumo.id)}
                              value={getCantidad(insumo.id)}
                              onChange={(e) => handleCantidadChange(insumo.id, e.target.value)}
                              onBlur={() => handleCantidadBlur(insumo.id)}
                              onFocus={handleCantidadFocus}
                              className="w-24 text-center bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              placeholder="Cantidad"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const currentValue = getCantidad(insumo.id);
                                const increment = getIncremento(currentValue);
                                handleCantidadChange(insumo.id, currentValue + increment);
                              }}
                              disabled={getCantidad(insumo.id) >= getMaxCantidad(insumo.id)}
                              className="p-2 rounded-lg bg-green-100 border border-green-200 text-green-600 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              title={`Incrementar en ${getIncremento(getCantidad(insumo.id))}`}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <span className="text-xs text-gray-500">
                            (máx: {getMaxCantidad(insumo.id)})
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-6 flex flex-col items-end space-y-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        insumo.cantidad_total && insumo.cantidad_total > 0 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : 'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        {insumo.cantidad_total && insumo.cantidad_total > 0 ? 'Disponible' : 'Agotado'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleInsumo(insumo)}
                        disabled={insumo.cantidad_total <= 0}
                        className={`px-6 py-2 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                          isInsumoSeleccionado(insumo.id)
                            ? 'bg-green-600 text-white hover:bg-green-700 border border-green-500'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 border border-indigo-500'
                        }`}
                      >
                        {isInsumoSeleccionado(insumo.id) ? (
                          <>
                            <Check className="h-4 w-4 inline mr-2" />
                            Seleccionado
                          </>
                        ) : (
                          'Seleccionar'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-700 mb-2">No se encontraron insumos</h4>
              <p className="text-gray-500">
                {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay insumos disponibles'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between items-center">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 border border-gray-500 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Cancelar
          </button>
          {insumosSeleccionados.length > 0 && (
            <button
              type="button"
              onClick={handleConfirmarSeleccion}
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Agregar {insumosSeleccionados.length} insumo{insumosSeleccionados.length !== 1 ? 's' : ''}
            </button>
          )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
