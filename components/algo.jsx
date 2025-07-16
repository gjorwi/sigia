'use client';
import { useState, useEffect } from 'react';
import { Search, Package, X, Plus, Minus } from 'lucide-react';

export default function DespachoForm({ onSubmit, id, formData, onFormDataChange, loading = false }) {
  const [errors, setErrors] = useState({});
  const [showSearchHospital, setShowSearchHospital] = useState(false);
  const [showSearchAlmacen, setShowSearchAlmacen] = useState(false);
  const [hospitales, setHospitales] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [suggestedQuantities, setSuggestedQuantities] = useState({});

  // Load initial data
  useEffect(() => {
    // TODO: Load hospitales, almacenes, and insumos from API
    const loadInitialData = async () => {
      // Mock data for now
      setHospitales([
        { id: 1, nombre: 'Hospital Central', rif: 'J-12345678-9', direccion: 'Caracas' },
        { id: 2, nombre: 'Hospital de Niños', rif: 'J-98765432-1', direccion: 'Valencia' },
      ]);
      
      setAlmacenes([
        { id: 1, nombre: 'Almacén Principal', ubicacion: 'Caracas', capacidad: 1000 },
        { id: 2, nombre: 'Almacén Regional', ubicacion: 'Valencia', capacidad: 500 },
      ]);
      
      setInsumos([
        { id: 1, nombre: 'Paracetamol 500mg', codigo: 'PARA500', stock: 1000 },
        { id: 2, nombre: 'Ibuprofeno 400mg', codigo: 'IBUF400', stock: 800 },
      ]);
    };
    
    loadInitialData();
  }, []);

  // Calculate suggested quantities when hospital or almacen changes
  useEffect(() => {
    if (formData.hospitalId && formData.almacenId) {
      // TODO: Implement logic to calculate suggested quantities based on hospital ficha and almacen stock
      const suggestions = {};
      insumos.forEach(insumo => {
        // Example: Suggest 20% of available stock or hospital's required quantity, whichever is lower
        const hospitalRequirement = Math.floor(Math.random() * 50) + 10; // Mock data
        const availableStock = insumo.stock;
        suggestions[insumo.id] = Math.min(
          Math.floor(availableStock * 0.2), // Max 20% of available stock
          hospitalRequirement // But not more than hospital needs
        );
      });
      setSuggestedQuantities(suggestions);
    }
  }, [formData.hospitalId, formData.almacenId, insumos]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.hospitalId) newErrors.hospitalId = 'Seleccione un hospital';
    if (!formData.almacenId) newErrors.almacenId = 'Seleccione un almacén destino';
    if (!formData.fechaDespacho) newErrors.fechaDespacho = 'Seleccione la fecha de despacho';
    
    // Validate at least one insumo with quantity > 0
    const hasInsumos = formData.insumos && 
      Object.values(formData.insumos).some(qty => qty > 0);
    if (!hasInsumos) newErrors.insumos = 'Debe seleccionar al menos un insumo';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddInsumo = (insumo) => {
    onFormDataChange({
      ...formData,
      insumos: {
        ...formData.insumos,
        [insumo.id]: suggestedQuantities[insumo.id] || 0
      }
    });
  };

  const handleRemoveInsumo = (insumoId) => {
    const newInsumos = { ...formData.insumos };
    delete newInsumos[insumoId];
    onFormDataChange({
      ...formData,
      insumos: newInsumos
    });
  };

  const handleQuantityChange = (insumoId, newQuantity) => {
    const quantity = Math.max(0, parseInt(newQuantity) || 0);
    onFormDataChange({
      ...formData,
      insumos: {
        ...formData.insumos,
        [insumoId]: quantity
      }
    });
  };

  const getAvailableInsumos = () => {
    return insumos.filter(insumo => !formData.insumos || !formData.insumos[insumo.id]);
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
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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
            {getAvailableInsumos().length > 0 && (
              <button
                type="button"
                onClick={() => handleAddInsumo(getAvailableInsumos()[0])}
                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-3 w-3 mr-1" /> Agregar Insumo
              </button>
            )}
          </div>
          
          {formData.insumos && Object.keys(formData.insumos).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(formData.insumos).map(([insumoId, cantidad]) => {
                const insumo = insumos.find(i => i.id === parseInt(insumoId));
                if (!insumo) return null;
                
                return (
                  <div key={insumoId} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{insumo.nombre}</p>
                      <p className="text-xs text-gray-500">Código: {insumo.codigo}</p>
                      <p className="text-xs text-gray-500">
                        Stock disponible: {insumo.stock} unidades
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center border rounded-md">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(insumoId, cantidad - 1)}
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <input
                          type="number"
                          value={cantidad}
                          onChange={(e) => handleQuantityChange(insumoId, e.target.value)}
                          min="0"
                          max={insumo.stock}
                          className="w-16 text-center border-0 focus:ring-0 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(insumoId, cantidad + 1)}
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveInsumo(insumoId)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-md">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Sin insumos</h3>
              <p className="mt-1 text-sm text-gray-500">
                Agregue insumos para realizar el despacho
              </p>
              {getAvailableInsumos().length > 0 && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => handleAddInsumo(getAvailableInsumos()[0])}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="h-3 w-3 mr-1" /> Agregar Insumo
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

      {/* Modals */}
      {showSearchHospital && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Buscar Hospital</h3>
                <button
                  type="button"
                  onClick={() => setShowSearchHospital(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Buscar hospital..."
                />
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {hospitales.map((hospital) => (
                <button
                  key={hospital.id}
                  type="button"
                  onClick={() => {
                    onFormDataChange({
                      ...formData,
                      hospitalId: hospital.id,
                      insumos: {}
                    });
                    setShowSearchHospital(false);
                  }}
                  className="w-full text-left p-4 hover:bg-gray-50"
                >
                  <p className="text-sm font-medium text-gray-900">{hospital.nombre}</p>
                  <p className="text-sm text-gray-500">{hospital.rif}</p>
                  <p className="text-xs text-gray-500">{hospital.direccion}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
