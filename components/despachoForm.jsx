'use client';
import { useState, useEffect } from 'react';
import { Search, Package, X, Plus, Minus } from 'lucide-react';

export default function DespachoForm({ onSubmit, id, formData, onFormDataChange, loading = false }) {
  const [errors, setErrors] = useState({});
  const [insumos, setInsumos] = useState(formData?.insumos || []);
  const [suggestedQuantities, setSuggestedQuantities] = useState({});
  const [expandedInsumos, setExpandedInsumos] = useState({});
  const [insumoMetrics, setInsumoMetrics] = useState({});
  const [warnings, setWarnings] = useState({});

  useEffect(() => {
    if (formData.hospitalId && formData.insumos?.length > 0) {
      const suggestions = {};
      const newWarnings = {};
      
      formData.insumos.forEach(insumo => {
        const availableStock = insumo.lotes.reduce((total, lot) => total + lot.cantidad, 0);
        const hospitalRequirement = insumo.cantidadDespacho || 0;
        const suggestedQty = Math.min(
          Math.floor(availableStock * 0.8),
          hospitalRequirement
        );
        
        suggestions[insumo.id] = suggestedQty;
        
        // Configurar mensaje de advertencia si es necesario
        if (suggestedQty < hospitalRequirement) {
          if (suggestedQty < availableStock) {
            newWarnings[insumo.id] = `Se sugiere ${suggestedQty} (80% del stock disponible).`;
          } else {
            newWarnings[insumo.id] = `Stock insuficiente. Solo hay ${availableStock} unidades disponibles.`;
          }
        } else {
          newWarnings[insumo.id] = '';
        }
        
        // Inicializar métricas si no existen
        if (!insumoMetrics[insumo.id]) {
          setInsumoMetrics(prev => ({
            ...prev,
            [insumo.id]: {
              cantidadRequerida: hospitalRequirement,
              cantidadDisponible: availableStock,
              cantidadADespachar: suggestedQty,
              lotesADespachar: calculateLotesADespachar(insumo, suggestedQty)
            }
          }));
        }
      });
      setSuggestedQuantities(suggestions);
      setWarnings(newWarnings);
    }
  }, [formData.hospitalId, formData.insumos]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.hospitalId) newErrors.hospitalId = 'Seleccione un hospital';
    if (!formData.fechaDespacho) newErrors.fechaDespacho = 'Seleccione la fecha de despacho';
    
    // Validate at least one insumo with quantity > 0
    const hasInsumos = formData.insumos && 
      Object.values(formData.insumos).some(qty => qty > 0);
    if (!hasInsumos) newErrors.insumos = 'Debe seleccionar al menos un insumo';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddInsumo = (insumo) => {
    if (!insumo) return;
    
    const availableStock = insumo.lotes.reduce((total, lot) => total + lot.cantidad, 0);
    const suggestedQty = Math.min(
      Math.floor(availableStock * 0.8),
      insumo.cantidadDespacho || 0
    );
    
    // Actualizar el formulario principal
    const updatedInsumos = [...(formData.insumos || [])];
    if (!updatedInsumos.some(item => item.id === insumo.id)) {
      updatedInsumos.push({
        ...insumo,
        cantidadDespacho: suggestedQty + 10 // Mantener la lógica de +10
      });
      
      onFormDataChange({
        ...formData,
        insumos: updatedInsumos
      });
      
      // Actualizar métricas
      setInsumoMetrics(prev => ({
        ...prev,
        [insumo.id]: {
          cantidadRequerida: insumo.cantidadDespacho || 0,
          cantidadDisponible: availableStock,
          cantidadADespachar: suggestedQty,
          lotesADespachar: calculateLotesADespachar(insumo, suggestedQty)
        }
      }));
    }
  };

  const handleRemoveInsumo = (e, insumoId) => {
    e.stopPropagation();
    const newInsumos = { ...formData.insumos };
    delete newInsumos[insumoId];
    onFormDataChange({
      ...formData,
      insumos: newInsumos
    });
  };

  const toggleInsumoDetails = (insumoId) => {
    setExpandedInsumos(prev => ({
      ...prev,
      [insumoId]: !prev[insumoId]
    }));
  };

  const handleQuantityChange = (insumo, newQuantity) => {
    const quantity = Math.max(0, parseInt(newQuantity) || 0);
    const availableStock = insumo.lotes.reduce((total, lot) => total + lot.cantidad, 0);
    
    // Actualizar las métricas con el nuevo valor manual
    setInsumoMetrics(prev => ({
      ...prev,
      [insumo.id]: {
        ...prev[insumo.id],
        cantidadADespachar: Math.min(quantity, availableStock), // No permitir más del stock disponible
        lotesADespachar: calculateLotesADespachar(insumo, Math.min(quantity, availableStock))
      }
    }));
    
    // Actualizar el formulario principal
    const updatedInsumos = formData.insumos.map(item => 
      item.id === insumo.id 
        ? { 
            ...item, 
            cantidadDespacho: Math.min(quantity, availableStock) + 10 // Mantener la lógica de +10 si es necesario
          } 
        : item
    );
    
    onFormDataChange({
      ...formData,
      insumos: updatedInsumos
    });
    
    // Actualizar advertencias
    updateWarnings(insumo, Math.min(quantity, availableStock), availableStock);
  };

  const getAvailableInsumos = () => {
    if (!formData.insumos || !Array.isArray(formData.insumos)) return [...insumos];
    return insumos.filter(insumo => 
      !formData.insumos.some(addedInsumo => addedInsumo.id === insumo.id)
    );
  };

  // Inicializar métricas cuando se cargan los insumos
  useEffect(() => {
    if (formData?.insumos?.length > 0 && Object.keys(insumoMetrics).length === 0) {
      const initialMetrics = {};
      formData.insumos.forEach(insumo => {
        initialMetrics[insumo.id] = {
          cantidadRequerida: insumo.cantidadDespacho,
          cantidadDisponible: insumo.lotes.reduce((total, lot) => total + lot.cantidad, 0),
          cantidadADespachar: insumo.cantidadDespacho - 10, // Valor inicial
          lotesADespachar: calculateLotesADespachar(insumo, insumo.cantidadDespacho - 10)
        };
      });
      setInsumoMetrics(initialMetrics);
    }
  }, [formData?.insumos]);

  const calculateLotesADespachar = (insumo, cantidadDeseada) => {
    let cantidadRestante = cantidadDeseada;
    const lotesADespachar = [];
    
    // Ordenar lotes por fecha de vencimiento (más próximos a vencer primero)
    const lotesOrdenados = [...insumo.lotes].sort((a, b) => 
      new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento)
    );

    for (const lote of lotesOrdenados) {
      if (cantidadRestante <= 0) break;
      
      const cantidadATomar = Math.min(lote.cantidad, cantidadRestante);
      if (cantidadATomar > 0) {
        lotesADespachar.push({
          lote: lote.numeroLote,
          cantidad: cantidadATomar,
          vencimiento: lote.fechaVencimiento
        });
        cantidadRestante -= cantidadATomar;
      }
    }

    return lotesADespachar;
  };

  const updateWarnings = (insumo, cantidad, availableStock) => {
    const hospitalRequirement = insumo.cantidadDespacho || 0;
    
    if (cantidad < hospitalRequirement) {
      if (cantidad < availableStock) {
        setWarnings(prev => ({
          ...prev,
          [insumo.id]: `Se sugiere ${cantidad} (valor ingresado manualmente).`
        }));
      } else {
        setWarnings(prev => ({
          ...prev,
          [insumo.id]: `Stock insuficiente. Solo hay ${availableStock} unidades disponibles.`
        }));
      }
    } else {
      setWarnings(prev => ({
        ...prev,
        [insumo.id]: ''
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} id={id} className="space-y-6">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 space-y-6">

        {/* Fecha de Despacho */}
        <div>
          <label htmlFor="fechaDespacho" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Despacho
          </label>
          <input
            type="date"
            id="fechaDespacho"
            name="fechaDespacho"
            value={formData.fechaDespacho || ''}
            onChange={(e) => onFormDataChange({ ...formData, fechaDespacho: e.target.value })}
            className="mt-1 block pl-3 pr-2 py-2 text-base border border-gray-300 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            min={new Date().toISOString().split('T')[0]}
          />
          {errors.fechaDespacho && (
            <p className="mt-1 text-sm text-red-600">{errors.fechaDespacho}</p>
          )}
        </div>

        {/* Insumos */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Insumos a Despachar
            </label>
            {/* {getAvailableInsumos().length > 0 && ( */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const available = getAvailableInsumos();
                    if (available.length === 1) {
                      handleAddInsumo(available[0]);
                    } else if (available.length > 1) {
                      // Mostrar menú desplegable con los insumos disponibles
                      const selected = prompt(
                        `Seleccione un insumo:\n${
                          available.map((insumo, index) => 
                            `${index + 1}. ${insumo.nombre} (${insumo.codigo})`
                          ).join('\n')
                        }`
                      );
                      const index = parseInt(selected) - 1;
                      if (!isNaN(index) && index >= 0 && index < available.length) {
                        handleAddInsumo(available[index]);
                      }
                    }
                  }}
                  className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-3 w-3 mr-1" /> Agregar Insumo
                </button>
              </div>
            {/* )} */}
          </div>
          
          {formData?.insumos?.length > 0 ? (
            <div className="space-y-4">
              {formData.insumos.map((insumo) => {
                const lotesADespachar = calculateLotesADespachar(insumo);
                const totalDisponible = insumo.lotes.reduce((total, lot) => total + lot.cantidad, 0);
                const cantidadADespachar = insumo.cantidadDespacho - 10;
                
                return (
                  <div 
                    key={insumo.id} 
                    className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleInsumoDetails(insumo.id)}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">{insumo.nombre}</h4>
                              <p className="text-xs text-gray-500">Código: {insumo.codigo}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">
                                <span className="font-medium">A despachar: </span>
                                <span className="text-green-600">{cantidadADespachar} unidades</span>
                              </p>
                              <p className="text-xs text-gray-500">
                                <span className="font-medium">Disponible: </span>
                                <span className={totalDisponible >= cantidadADespachar ? 'text-blue-600' : 'text-red-600'}>
                                  {totalDisponible} unidades
                                </span>
                              </p>
                            </div>
                          </div>
                          
                          {expandedInsumos[insumo.id] && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-yellow-50 p-2 rounded">
                                  <p className="font-medium text-gray-700">Requerido</p>
                                  <p className="text-yellow-700">{insumoMetrics[insumo.id]?.cantidadRequerida || 0} unidades</p>
                                </div>
                                <div className="bg-blue-50 p-2 rounded">
                                  <p className="font-medium text-gray-700">Disponible</p>
                                  <p className="text-blue-700">{insumoMetrics[insumo.id]?.cantidadDisponible || 0} unidades</p>
                                </div>
                                <div className="bg-green-50 p-2 rounded">
                                  <p className="font-medium text-gray-700">A despachar</p>
                                  <p className="text-green-700">{insumoMetrics[insumo.id]?.cantidadADespachar || 0} unidades</p>
                                </div>
                                <div className="bg-red-50 p-2 rounded">
                                  <p className="font-medium text-gray-700">Lotes</p>
                                  <div className="flex flex-wrap gap-1">
                                    {(insumoMetrics[insumo.id]?.lotesADespachar || []).map((lote, index, array) => (
                                      <span key={lote.lote} className="text-red-700">
                                        {lote.lote} ({lote.cantidad}u){index < array.length - 1 ? ',' : ''}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-4 flex flex-col items-end space-y-2">
                          <div className="flex flex-col items-end">
                            <div className="flex items-center border rounded-md bg-white mb-1" onClick={e => e.stopPropagation()}>
                              <input
                                type="number"
                                min="0"
                                max={insumo.lotes.reduce((total, lot) => total + lot.cantidad, 0) || 0}
                                value={insumoMetrics[insumo.id]?.cantidadADespachar || 0}
                                onChange={(e) => handleQuantityChange(insumo, e.target.value)}
                                onBlur={(e) => {
                                  // Asegurar que el valor no sea mayor al disponible
                                  const availableStock = insumo.lotes.reduce((total, lot) => total + lot.cantidad, 0);
                                  const value = Math.min(parseInt(e.target.value) || 0, availableStock);
                                  handleQuantityChange(insumo, value);
                                }}
                                onClick={e => e.stopPropagation()}
                                className="w-20 text-center text-gray-900 border-0 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-md"
                              />
                            </div>
                            {warnings[insumo.id] && (
                              <div className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                                {warnings[insumo.id]}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleRemoveInsumo(e, insumo.id)}
                            className="inline-flex items-center px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                          >
                            <X className="h-3 w-3 mr-1" /> Quitar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-3 text-sm font-medium text-gray-900">No hay insumos agregados</h3>
              <p className="mt-1 text-sm text-gray-500 max-w-xs mx-auto">
                Comience agregando insumos para realizar el despacho
              </p>
              {getAvailableInsumos().length > 0 && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => handleAddInsumo(getAvailableInsumos()[0])}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Agregar primer insumo
                  </button>
                </div>
              )}
            </div>
          )}
          {errors.insumos && (
            <p className="mt-1 text-sm text-red-600">{errors.insumos}</p>
          )}
        </div>

        {/* Observaciones */}
        <div>
          <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-1">
            Observaciones (Opcional)
          </label>
          <textarea
            id="observaciones"
            name="observaciones"
            rows={3}
            value={formData.observaciones || ''}
            onChange={(e) => onFormDataChange({ ...formData, observaciones: e.target.value })}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
            placeholder="Notas adicionales sobre el despacho"
          />
        </div>
      </div>
    </form>
  );
}
