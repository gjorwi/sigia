'use client';

import { useState } from 'react';
import { insumoTipos } from '@/constantes/insumoTipos';
import { insumoMedida } from '@/constantes/insumoMedida';
import { useEffect } from 'react';

const insumoPresentacionFarmaceutica = [
  { id: 1, idPresentacion: 'ampolla', nombre: 'Ampolla' },
  { id: 2, idPresentacion: 'botella', nombre: 'Botella' },
  { id: 3, idPresentacion: 'tableta', nombre: 'Tableta' },
  { id: 4, idPresentacion: 'suspension', nombre: 'Suspension' },
  { id: 5, idPresentacion: 'gotas', nombre: 'Gotas' },
  { id: 6, idPresentacion: 'crema', nombre: 'Crema' },
  { id: 7, idPresentacion: 'vial', nombre: 'Vial' },
  { id: 8, idPresentacion: 'inyeccion', nombre: 'Inyeccion' },
  { id: 9, idPresentacion: 'solucion_acuosa', nombre: 'Solucion acuosa' },
  { id: 10, idPresentacion: 'solucion_oral', nombre: 'Solucion oral' }
];
const insumoPresentacionMedicaQuirurgica = [
  { id: 1, idPresentacion: 'material', nombre: 'Material' },
  { id: 2, idPresentacion: 'equipo', nombre: 'Equipo' }
];

export default function InsumoForm({ onSubmit, id, formData, onFormDataChange }) {
  const [errors, setErrors] = useState({});
  const [showCantidadPorPaquete, setShowCantidadPorPaquete] = useState(false);
  // Presentaciones según tipo
  const getPresentaciones = () => {
    const tipo = (formData?.tipo || '').toLowerCase();
    if (tipo === 'medicamento') {
      return insumoPresentacionFarmaceutica;
    }
    if (tipo === 'medico/quirurgico') {
      return insumoPresentacionMedicaQuirurgica;
    }
    return [];
  };

  // Al cambiar el tipo, si la presentación seleccionada no es válida, se limpia
  useEffect(() => {
    const opciones = getPresentaciones();
    const valido = opciones.some(p => p.nombre === formData?.presentacion);
    if (!valido && formData?.presentacion) {
      onFormDataChange({...formData, presentacion: '' });
    }
  }, [formData?.tipo]);

  // Show/hide cantidad por paquete field based on medida
  useEffect(() => {
    if (formData?.unidad_medida && (formData.unidad_medida.toLowerCase() === 'caja' || formData.unidad_medida.toLowerCase() === 'paquete')) {
      setShowCantidadPorPaquete(true);
    } else {
      setShowCantidadPorPaquete(false);
      // Reset cantidadPorPaquete when medida changes to something else
      if (formData?.cantidad_por_paquete) {
        onFormDataChange({
          ...formData,
          cantidad_por_paquete: 1
        });
      }
    }
  }, [formData?.unidad_medida]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';

    if (!formData.codigo) {
      newErrors.codigo = 'El codigo es requerido';
    }

    if (!formData.tipo) newErrors.tipo = 'Seleccione un tipo';

    if (!formData.unidad_medida) newErrors.unidad_medida = 'Seleccione una unidad de medida';

    if (showCantidadPorPaquete && !formData.cantidad_por_paquete) {
      newErrors.cantidad_por_paquete = 'La cantidad por paquete es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === 'cantidad_por_paquete' ? parseInt(value) : value;

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
                value={formData?.codigo||''}
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
                value={formData?.nombre||''}
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
              value={formData?.tipo||''}
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
          {/* Presentacion */}
          <div className="sm:col-span-3">
            <label htmlFor="presentacion" className="block text-sm font-medium text-gray-700">
              Presentacion *
            </label>
            <select
              id="presentacion"
              name="presentacion"
              value={formData?.presentacion||''}
              onChange={handleChange}
              className={`block w-full px-4 capitalize py-2 text-gray-700 text-base border ${
                errors.presentacion
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } rounded-md shadow-sm transition duration-150 ease-in-out bg-white`}
            >
              <option value="">Seleccione...</option>
              {getPresentaciones().map((presentacion) => (
                <option key={presentacion.id} value={presentacion.idPresentacion} className="capitalize">
                  {presentacion.nombre}
                </option>
              ))}
            </select>
            {errors.presentacion && (
              <p className="mt-1 text-sm text-red-600">{errors.presentacion}</p>
            )}
          </div>
          {/* Medida */}
          <div className="sm:col-span-3">
            <label htmlFor="unidad_medida" className="block text-sm font-medium text-gray-700">
              Unidad de Medida *
            </label>
            <select
              id="unidad_medida"
              name="unidad_medida"
              value={formData?.unidad_medida||''}
              onChange={handleChange}
              className={`block w-full px-4 py-2 text-base border capitalize placeholder-gray-400 ${
                errors.unidad_medida
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
            {errors.unidad_medida && (
              <p className="mt-1 text-sm text-red-600">{errors.unidad_medida}</p>
            )}
          </div>
          {/* Cantidad por paquete (solo visible para caja/paquete) */}
          {showCantidadPorPaquete && (
            <div className="sm:col-span-3">
              <label htmlFor="cantidadPorPaquete" className="block text-sm font-medium text-gray-700">
                Cantidad por {formData.unidad_medida?.toLowerCase()}
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                id="cantidadPorPaquete"
                name="cantidad_por_paquete"
                value={formData?.cantidad_por_paquete || ''}
                placeholder="Agregar cantidad"
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border text-left ${
                  errors.cantidad_por_paquete
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-md shadow-sm`}
              />
              {errors.cantidad_por_paquete && (
                <p className="mt-1 text-sm text-red-600">{errors.cantidad_por_paquete}</p>
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
                value={formData?.descripcion||''}
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