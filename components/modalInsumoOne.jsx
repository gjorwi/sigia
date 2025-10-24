'use client';

import { Search, X, Package, Plus, Minus, Check, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function InsumoSelectionModalOne({ isOpen, onClose, onSelectInsumo, searchTerm, setSearchTerm, insumos = [] }) {
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
        distribucion_lotes: distribucionLotes
      }]);
    }
  };

  const handleConfirmarSeleccion = () => {
    if (insumosSeleccionados.length > 0) {
      onSelectInsumo(insumosSeleccionados);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 md:ml-64 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-medium text-gray-900">Seleccionar Insumos</h3>
            {insumosSeleccionados.length > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                <ShoppingCart className="h-3 w-3 mr-1" />
                {insumosSeleccionados.length} seleccionado{insumosSeleccionados.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar insumo por nombre o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 text-gray-900 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredInsumos.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {filteredInsumos.map((insumo) => (
                <li key={insumo.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <Package className="h-5 w-5 text-indigo-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{insumo.nombre}</div>
                        <div className="text-sm text-gray-500">Código: {insumo.codigo}</div>
                        {insumo.cantidad_total && (
                          <div className="text-sm text-indigo-600 font-medium">
                            Disponible: {insumo.cantidad_total} unidades
                          </div>
                        )}
                        {insumo.lotes && insumo.lotes.length > 0 && (
                          <div className="text-xs text-gray-400 mt-1">
                            {insumo.lotes.length} lote{insumo.lotes.length !== 1 ? 's' : ''} disponible{insumo.lotes.length !== 1 ? 's' : ''}
                          </div>
                        )}
                        
                        {/* Vista previa de distribución de lotes */}
                        {insumo.lotes && insumo.lotes.length > 0 && getCantidad(insumo.id) > 0 && (
                          <div className="mt-3 p-2 bg-blue-50 rounded-md">
                            <h5 className="text-xs font-medium text-blue-900 mb-1">Distribución por lotes (FIFO):</h5>
                            <div className="space-y-1">
                              {distribuirCantidadEnLotes(insumo, getCantidad(insumo.id)).map((lote, index) => (
                                <div key={index} className="flex justify-between text-xs text-blue-800">
                                  <span>Lote {lote.numero_lote}</span>
                                  <span>{lote.cantidad} unidades</span>
                                  {lote.fecha_vencimiento && (
                                    <span>Vence: {new Date(lote.fecha_vencimiento).toLocaleDateString('es-VE', { timeZone: 'UTC' })}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Controles de cantidad */}
                        <div className="mt-3 flex items-center space-x-3">
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
                              className="p-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                              className="w-20 text-center border border-gray-300 text-gray-700 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                              className="p-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <div className="ml-4 flex flex-col items-end space-y-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        insumo.cantidad_total && insumo.cantidad_total > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {insumo.cantidad_total && insumo.cantidad_total > 0 ? 'Disponible' : 'Agotado'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleInsumo(insumo)}
                        disabled={insumo.cantidad_total <= 0}
                        className={`px-3 py-1 text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${
                          isInsumoSeleccionado(insumo.id)
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        {isInsumoSeleccionado(insumo.id) ? (
                          <>
                            <Check className="h-3 w-3 inline mr-1" />
                            Seleccionado
                          </>
                        ) : (
                          'Seleccionar'
                        )}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No se encontraron insumos que coincidan con la búsqueda
            </div>
          )}
        </div>
        
        {/* Resumen de seleccionados */}
        {/* {insumosSeleccionados.length > 0 && (
          <div className="p-4 border-t bg-gray-50">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Insumos seleccionados:</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {insumosSeleccionados.map((item) => (
                <div key={item.id} className="bg-white p-3 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex-1 truncate text-gray-900 font-medium">{item.nombre}</span>
                    <span className="mx-2 text-indigo-600 font-bold">Total: {item.cantidad}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoverSeleccionado(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {item.distribucion_lotes && item.distribucion_lotes.length > 0 && (
                    <div className="mt-2 p-2 bg-blue-50 rounded">
                      <h6 className="text-xs font-medium text-blue-900 mb-1">Distribución por lotes:</h6>
                      <div className="space-y-1">
                        {item.distribucion_lotes.map((lote, index) => (
                          <div key={index} className="flex justify-between text-xs text-blue-800">
                            <span>Lote {lote.numero_lote}</span>
                            <span className="font-medium">{lote.cantidad} unidades</span>
                            {lote.fecha_vencimiento && (
                              <span className="text-blue-600">
                                Vence: {new Date(lote.fecha_vencimiento).toLocaleDateString('es-VE', { timeZone: 'UTC' })}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )} */}

        <div className="p-4 border-t flex justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          {insumosSeleccionados.length > 0 && (
            <button
              type="button"
              onClick={handleConfirmarSeleccion}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Agregar {insumosSeleccionados.length} insumo{insumosSeleccionados.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
