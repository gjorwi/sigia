'use client';

import { useState } from 'react';
import { insumoTipos } from '@/constantes/insumoTipos';
import { insumoMedida } from '@/constantes/insumoMedida';
import { useEffect } from 'react';

export default function InsumoForm({ onSubmit, id, formData, onFormDataChange }) {
  const [errors, setErrors] = useState({});
  const [initialized, setInitialized] = useState(false);
  const [showCantidadPorPaquete, setShowCantidadPorPaquete] = useState(false);

  // Handle initial data when component mounts
  useEffect(() => {
    if (formData && !initialized) {
      onFormDataChange({
        nombre: formData.nombre || '',
        descripcion: formData.descripcion || '',
        codigo: formData.codigo || '',
        tipo: formData.tipo || '',
        medida: formData.medida || '',
        cantidadPorPaquete: formData.cantidadPorPaquete || 1,
      });
      setInitialized(true);
    }
  }, [formData, initialized, onFormDataChange]);

  // Show/hide cantidad por paquete field based on medida
  useEffect(() => {
    if (formData?.medida && (formData.medida.toLowerCase() === 'caja' || formData.medida.toLowerCase() === 'paquete')) {
      setShowCantidadPorPaquete(true);
    } else {
      setShowCantidadPorPaquete(false);
      // Reset cantidadPorPaquete when medida changes to something else
      if (formData?.cantidadPorPaquete) {
        onFormDataChange({
          ...formData,
          cantidadPorPaquete: 1
        });
      }
    }
  }, [formData?.medida]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';

    if (!formData.codigo) {
      newErrors.codigo = 'El codigo es requerido';
    }

    if (!formData.tipo) newErrors.tipo = 'Seleccione un tipo';

    if (!formData.medida) newErrors.medida = 'Seleccione una unidad de medida';

    if (showCantidadPorPaquete && !formData.cantidadPorPaquete) {
      newErrors.cantidadPorPaquete = 'La cantidad por paquete es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === 'cantidadPorPaquete' ? parseInt(value) || 1 : value;

    onFormDataChange({
      ...formData,
      [name]: newValue
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form id={id} onSubmit={handleSubmit} className="divide-y divide-gray-200">
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 text-gray-700">
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
                value={formData?.codigo}
                onChange={handleChange}
                className={`block w-full px-4 py-2 text-base border placeholder-gray-400 ${
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
          {/* Nombre */}
          <div className="sm:col-span-3">
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
              Nombre *
            </label>
            <div className="mt-1">
              <input
                type="text"
                placeholder="Ej: Jose"
                id="nombre"
                name="nombre"
                value={formData?.nombre}
                onChange={handleChange}
                className={`block w-full px-4 py-2 text-base border placeholder-gray-400 ${
                  errors.nombre
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-md shadow-sm transition duration-150 ease-in-out`}
              />
              {errors.nombre && (
                <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
              )}
            </div>
          </div>
          {/* Tipo */}
          <div className="sm:col-span-3">
            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
              Tipo *
            </label>
            <select
              id="tipo"
              name="tipo"
              value={formData?.tipo}
              onChange={handleChange}
              className={`block w-full px-4 capitalize py-2 text-gray-700 text-base border ${
                errors.tipo
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } rounded-md shadow-sm transition duration-150 ease-in-out bg-white`}
            >
              <option value="">Seleccione...</option>
              {insumoTipos.map((tipo) => (
                <option key={tipo.id} value={tipo.nombre} className="capitalize">
                  {tipo.nombre}
                </option>
              ))}
            </select>
            {errors.tipo && (
              <p className="mt-1 text-sm text-red-600">{errors.tipo}</p>
            )}
          </div>
          {/* Medida */}
          <div className="sm:col-span-3">
            <label htmlFor="medida" className="block text-sm font-medium text-gray-700">
              Unidad de Medida *
            </label>
            <select
              id="medida"
              name="medida"
              value={formData?.medida}
              onChange={handleChange}
              className={`block w-full px-4 py-2 text-base border placeholder-gray-400 ${
                errors.medida
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } rounded-md shadow-sm transition duration-150 ease-in-out`}
            >
              <option value="">Seleccione...</option>
              {insumoMedida.map((medida) => (
                <option key={medida.id} value={medida.nombre} className="capitalize">
                  {medida.nombre}
                </option>
              ))}
            </select>
            {errors.medida && (
              <p className="mt-1 text-sm text-red-600">{errors.medida}</p>
            )}
          </div>
          {/* Cantidad por paquete (solo visible para caja/paquete) */}
          {showCantidadPorPaquete && (
            <div className="sm:col-span-3">
              <label htmlFor="cantidadPorPaquete" className="block text-sm font-medium text-gray-700">
                Cantidad por {formData.medida.toLowerCase()}
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                id="cantidadPorPaquete"
                name="cantidadPorPaquete"
                value={formData?.cantidadPorPaquete || ''}
                placeholder="1"
                onChange={(e) => {
                  // Solo permite números
                  if (e.target.value === '' || /^\d+$/.test(e.target.value)) {
                    handleChange({
                      target: {
                        name: 'cantidadPorPaquete',
                        value: e.target.value === '' ? '' : parseInt(e.target.value, 10)
                      }
                    });
                  }
                }}
                className={`mt-1 block w-full px-3 py-2 border text-left ${
                  errors.cantidadPorPaquete
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-md shadow-sm`}
              />
              {errors.cantidadPorPaquete && (
                <p className="mt-1 text-sm text-red-600">{errors.cantidadPorPaquete}</p>
              )}
            </div>
          )}
          {/* Descripcion */}
          <div className="sm:col-span-3">
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
              Descripción *
            </label>
            <div className="mt-1">
              <textarea
                placeholder="Ej: Jose"
                id="descripcion"
                name="descripcion"
                value={formData?.descripcion}
                onChange={handleChange}
                className={`block w-full px-4 py-2 text-base border placeholder-gray-400 ${
                  errors.descripcion 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-md shadow-sm transition duration-150 ease-in-out`}
              />
              {errors.descripcion && (
                <p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
    );
}