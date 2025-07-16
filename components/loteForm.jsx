'use client';

import { useState, useEffect } from 'react';
import InsumoSelectionModal from './modalInsumo';
import { Package, X } from 'lucide-react';

export default function LoteForm({ onSubmit, id, formData, onFormDataChange, selectedInsumo, onSelectedInsumoChange }) {
  const [errors, setErrors] = useState({});
  const [initialized, setInitialized] = useState(false);
  const [showInsumoModal, setShowInsumoModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  

  const [insumos, setInsumos] = useState([
    { id: 1, nombre: 'Paracetamol 500mg', codigo: 'PARA500' },
    { id: 2, nombre: 'Ibuprofeno 400mg', codigo: 'IBU400' },
    { id: 3, nombre: 'Amoxicilina 500mg', codigo: 'AMOX500' },
    { id: 4, nombre: 'Loratadina 10mg', codigo: 'LORA010' },
    { id: 5, nombre: 'Omeprazol 20mg', codigo: 'OMEP020' },
  ]);

  useEffect(() => {
    if (formData && !initialized) {
      console.log(JSON.stringify(formData,null,2));
      onFormDataChange({
        codigo: formData.codigo ?? '',
        nombre: formData.nombre ?? '',
        insumoId: formData.insumoId ?? '',
        numeroLote: formData.numeroLote ?? '',
        fechaVencimiento: formData.fechaVencimiento ?? '',
        cantidad: formData.cantidad ?? '',
        fechaIngreso: formData.fechaIngreso ?? '',
      });
      onSelectedInsumoChange(formData);
      setInitialized(true);
    }
  }, [formData, initialized, onFormDataChange]);

  const validateForm = () => {
    const newErrors = {};

    // Check if insumoId exists and is not empty (works for both string and number)
    if (!formData?.insumoId && formData?.insumoId !== 0) {
      newErrors.insumoId = 'El insumo es requerido';
    }

    // Check other fields with string validation
    if (typeof formData?.numeroLote === 'string' && !formData.numeroLote.trim()) {
      newErrors.numeroLote = 'El numero de lote es requerido';
    } else if (!formData?.numeroLote) {
      newErrors.numeroLote = 'El numero de lote es requerido';
    }

    if (typeof formData?.fechaVencimiento === 'string' && !formData.fechaVencimiento.trim()) {
      newErrors.fechaVencimiento = 'La fecha de vencimiento es requerida';
    } else if (!formData?.fechaVencimiento) {
      newErrors.fechaVencimiento = 'La fecha de vencimiento es requerida';
    }

    if (typeof formData?.cantidad === 'string' && !formData.cantidad.trim()) {
      newErrors.cantidad = 'La cantidad es requerida';
    } else if (!formData?.cantidad && formData?.cantidad !== 0) {
      newErrors.cantidad = 'La cantidad es requerida';
    }

    if (typeof formData?.fechaIngreso === 'string' && !formData.fechaIngreso.trim()) {
      newErrors.fechaIngreso = 'La fecha de ingreso es requerida';
    } else if (!formData?.fechaIngreso) {
      newErrors.fechaIngreso = 'La fecha de ingreso es requerida';
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
      insumoId: insumo.id,
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
      insumoId: '',
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
              {errors.insumoId && (
                <p className="mt-1 text-sm text-red-600">{errors.insumoId}</p>
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
                  value={formData?.insumoId}
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
                  id="numeroLote"
                  name="numeroLote"
                  value={formData?.numeroLote}
                  onChange={handleChange}
                  className={`block w-full px-4 py-2 text-base border placeholder-gray-400 ${
                    errors.numeroLote
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  } rounded-md shadow-sm transition duration-150 ease-in-out`}
                />
                {errors.numeroLote && (
                  <p className="mt-1 text-sm text-red-600">{errors.numeroLote}</p>
                )}
              </div>
            </div>
            {/* fecha de vencimiento */}
            <div className="sm:col-span-3">
              <label htmlFor="fechaVencimiento" className="block text-sm font-medium text-gray-700">
                Fecha de Vencimiento *
              </label>
              <input
                id="fechaVencimiento"
                name="fechaVencimiento"
                type="date"
                value={formData?.fechaVencimiento}
                onChange={handleChange}
                className={`block w-full px-4 py-2 text-gray-900 text-base border placeholder-gray-400 ${
                  errors.fechaVencimiento
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-md shadow-sm transition duration-150 ease-in-out bg-white`}
              />
              {errors.fechaVencimiento && (
                <p className="mt-1 text-sm text-red-600">{errors.fechaVencimiento}</p>
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
              <label htmlFor="fechaIngreso" className="block text-sm font-medium text-gray-700">
                Fecha de Ingreso *
              </label>
              <input
                id="fechaIngreso"
                name="fechaIngreso"
                type="date"
                value={formData?.fechaIngreso}
                onChange={handleChange}
                className={`block w-full px-4 py-2 text-gray-900 text-base border placeholder-gray-400 ${
                  errors.fechaIngreso
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-md shadow-sm transition duration-150 ease-in-out bg-white`}
              />
              {errors.fechaIngreso && (
                <p className="mt-1 text-sm text-red-600">{errors.fechaIngreso}</p>
              )}
            </div>
          </div>
        </div>
      </form>

      <InsumoSelectionModal
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