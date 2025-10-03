'use client';

import { useState, useEffect } from 'react';
import InsumoSelectionModalOne from './modalInsumo';
import { Package, X } from 'lucide-react';

export default function LoteForm({ onSubmit, id, formData, onFormDataChange, selectedInsumo, onSelectedInsumoChange,insumos }) {
  const [errors, setErrors] = useState({});
  const [showInsumoModal, setShowInsumoModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const validateForm = () => {
    const newErrors = {};

    // Check if insumoId exists and is not empty (works for both string and number)
    if (!formData?.insumo_id && formData?.insumo_id !== 0) {
      newErrors.insumo_id = 'El insumo es requerido';
    }
    // Check other fields with string validation
    if (typeof formData?.lote_cod === 'string' && !formData.lote_cod.trim()) {
      newErrors.lote_cod = 'El numero de lote es requerido';
    } else if (!formData?.lote_cod) {
      newErrors.lote_cod = 'El numero de lote es requerido';
    }

    if (typeof formData?.fecha_vencimiento === 'string' && !formData.fecha_vencimiento.trim()) {
      newErrors.fecha_vencimiento = 'La fecha de vencimiento es requerida';
    } else if (!formData?.fecha_vencimiento) {
      newErrors.fecha_vencimiento = 'La fecha de vencimiento es requerida';
    }
    if (typeof formData?.cantidad === 'string' && !formData.cantidad.trim()) {
      newErrors.cantidad = 'La cantidad es requerida';
    } else if (!formData?.cantidad && formData?.cantidad !== 0) {
      newErrors.cantidad = 'La cantidad es requerida';
    } else if (formData?.cantidad && isNaN(Number(formData.cantidad))) {
      newErrors.cantidad = 'La cantidad debe ser un número válido';
    } else if (formData?.cantidad && Number(formData.cantidad) < 0) {
      newErrors.cantidad = 'La cantidad debe ser un número positivo';
    } else if (formData?.cantidad && !isNaN(Number(formData.cantidad))) {
      // Si la conversión a número es válida, convertir automáticamente
      const numericValue = Number(formData.cantidad);
      if (formData.cantidad !== numericValue) {
        onFormDataChange({ ...formData, cantidad: numericValue });
      }
    }

    if (typeof formData?.fecha_ingreso === 'string' && !formData.fecha_ingreso.trim()) {
      newErrors.fecha_ingreso = 'La fecha de ingreso es requerida';
    } else if (!formData?.fecha_ingreso) {
      newErrors.fecha_ingreso = 'La fecha de ingreso es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    onFormDataChange({ ...formData, [name]: value });
  };

  const handleSelectInsumo = (insumo) => {
    onSelectedInsumoChange(insumo);
    onFormDataChange({ 
      ...formData, 
      insumo_id: insumo.id,
      nombre: insumo.nombre,
      codigo: insumo.codigo
    });
    setShowInsumoModal(false);
    setSearchTerm('');
  };

  const handleClearInsumo = () => {
    onSelectedInsumoChange(null);
    onFormDataChange({ 
      ...formData, 
      insumo_id: '',
      nombre: '',
      codigo: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} id={id} className="space-y-8 text-gray-900">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 p-4">
            {/* Campo de selección de insumo */}
            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-700">
                Insumo *
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <div className="relative flex items-stretch flex-grow focus-within:z-10">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Package className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="focus:ring-blue-500 text-gray-900 border focus:border-blue-500 block w-full rounded-none rounded-l-md pl-10 sm:text-sm border-gray-300"
                    placeholder="Seleccione un insumo"
                    value={selectedInsumo ? `${selectedInsumo?.nombre} (${selectedInsumo?.codigo})` : ''}
                    readOnly
                  />
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowInsumoModal(true);
                  }}
                  className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <span>Seleccionar</span>
                </button>
                {selectedInsumo && (
                  <button
                    type="button"
                    onClick={handleClearInsumo}
                    className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {errors.insumo_id && (
                <p className="mt-1 text-sm text-red-600">{errors.insumo_id}</p>
              )}
            </div>
            {/* Codigo */}
            <div className="sm:col-span-3">
              <label htmlFor="codigo" className="block text-sm font-medium text-gray-700">
                Codigo *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  placeholder="Ej: camposjose@gmail.com"
                  id="codigo"
                  name="codigo"
                  value={formData?.insumo_id}
                  onChange={handleChange}
                  className={`block w-full px-4 py-2 text-gray-900 text-base border placeholder-gray-400 ${
                    errors.codigo
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  } rounded-md shadow-sm transition duration-150 ease-in-out`}
                />
                {errors.codigo && (
                  <p className="mt-1 text-sm text-red-600">{errors.codigo}</p>
                )}
              </div>
            </div>
            {/* lote */}
            <div className="sm:col-span-3">
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                Numero de Lote *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  placeholder="Ej: 123456789"
                  id="lote_cod"
                  name="lote_cod"
                  value={formData?.lote_cod}
                  onChange={handleChange}
                  className={`block w-full px-4 py-2 text-base border placeholder-gray-400 ${
                    errors.lote_cod
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  } rounded-md shadow-sm transition duration-150 ease-in-out`}
                />
                {errors.lote_cod && (
                  <p className="mt-1 text-sm text-red-600">{errors.lote_cod}</p>
                )}
              </div>
            </div>
            {/* fecha de vencimiento */}
            <div className="sm:col-span-3">
              <label htmlFor="fecha_vencimiento" className="block text-sm font-medium text-gray-700">
                Fecha de Vencimiento *
              </label>
              <input
                id="fecha_vencimiento"
                name="fecha_vencimiento"
                type="date"
                value={formData?.fecha_vencimiento}
                onChange={handleChange}
                className={`block w-full px-4 py-2 text-gray-900 text-base border placeholder-gray-400 ${
                  errors.fecha_vencimiento
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-md shadow-sm transition duration-150 ease-in-out bg-white`}
              />
              {errors.fecha_vencimiento && (
                <p className="mt-1 text-sm text-red-600">{errors.fecha_vencimiento}</p>
              )}
            </div>
            {/* Cantidad */}
            <div className="sm:col-span-3">
              <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700">
                Cantidad *
              </label>
              <input
                id="cantidad"
                name="cantidad"
                type="string"
                pattern="[0-9]*"
                value={formData?.cantidad}
                onChange={handleChange}
                className={`block w-full px-4 py-2 text-base border placeholder-gray-400 ${
                  errors.cantidad
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-md shadow-sm transition duration-150 ease-in-out`}
              />
              {errors.cantidad && (
                <p className="mt-1 text-sm text-red-600">{errors.cantidad}</p>
              )}
            </div>
            {/* fecha de ingreso */}
            <div className="sm:col-span-3">
              <label htmlFor="fecha_ingreso" className="block text-sm font-medium text-gray-700">
                Fecha de Ingreso *
              </label>
              <input
                id="fecha_ingreso"
                name="fecha_ingreso"
                type="date"
                value={formData?.fecha_ingreso}
                onChange={handleChange}
                className={`block w-full px-4 py-2 text-gray-900 text-base border placeholder-gray-400 ${
                  errors.fecha_ingreso
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-md shadow-sm transition duration-150 ease-in-out bg-white`}
              />
              {errors.fecha_ingreso && (
                <p className="mt-1 text-sm text-red-600">{errors.fecha_ingreso}</p>
              )}
            </div>
          </div>
        </div>
      </form>

      <InsumoSelectionModalOne
        isOpen={showInsumoModal}
        onClose={() => {
          setShowInsumoModal(false);
          setSearchTerm('');
        }}
        insumos={insumos}
        onSelectInsumo={handleSelectInsumo}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
    </>
  );
}