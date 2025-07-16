'use client';

import { useState } from 'react';
import { tipos } from '@/constantes/hospiTipos';
import { useEffect } from 'react';

export default function HospitalForm({ onSubmit, id, formData, onFormDataChange }) {
  const [errors, setErrors] = useState({});
  const [initialized, setInitialized] = useState(false);
  
  // Handle initial data when component mounts
  useEffect(() => {
    if (formData && !initialized) {
      onFormDataChange({
        nombre: formData.nombre || '',
        direccion: formData.direccion || '',
        tipo: formData.tipo || '',
        telefono: formData.telefono || '',
        email: formData.email || '',
        rif: formData.rif || '',
        ubicacion: formData.ubicacion || { lat: '', lng: '' },
      });
      setInitialized(true);
    }
  }, [formData, initialized, onFormDataChange]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    
    if (!formData.email) {
      newErrors.email = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Ingrese un correo válido';
    }
    
    if (formData.telefono && !/^\d{10,15}$/.test(formData.telefono)) {
      newErrors.telefono = 'Ingrese un teléfono válido';
    }
    
    if (!formData.tipo) newErrors.tipo = 'Seleccione un tipo';
    
    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es requerida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'lat' || name === 'lng') {
      onFormDataChange({
        ...formData,
        ubicacion: {
          ...formData.ubicacion,
          [name]: value
        }
      });
    } else {
      onFormDataChange({
        ...formData,
        [name]: value
      });
    }
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
                value={formData.nombre}
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
              value={formData.tipo}
              onChange={handleChange}
              className={`block w-full px-4 capitalize py-2 text-gray-700 text-base border ${
                errors.tipo 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } rounded-md shadow-sm transition duration-150 ease-in-out bg-white`}
            >
              <option value="">Seleccione...</option>
              {tipos.map((tipo) => (
                <option key={tipo.id} value={tipo.nombre}>
                  {tipo.nombre}
                </option>
              ))}
            </select>
            {errors.tipo && (
              <p className="mt-1 text-sm text-red-600">{errors.tipo}</p>
            )}
          </div>

          {/* Email */}
          <div className="sm:col-span-3">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo electrónico *
            </label>
            <div className="mt-1">
              <input
                type="email"
                placeholder="Ej: camposjose@gmail.com"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`block w-full px-4 py-2 text-base border placeholder-gray-400 ${
                  errors.email 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-md shadow-sm transition duration-150 ease-in-out`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Teléfono */}
          <div className="sm:col-span-3">
            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
              Teléfono
            </label>
            <div className="mt-1">
              <input
                type="tel"
                placeholder="Ej: 0987654321"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className={`block w-full px-4 py-2 text-base border placeholder-gray-400 ${
                  errors.telefono 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-md shadow-sm transition duration-150 ease-in-out`}
              />
              {errors.telefono && (
                <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
              )}
            </div>
          </div>

          {/* Dirección */}
          <div className="sm:col-span-3">
            <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">
              Dirección *
            </label>
            <div className="mt-1">
              <textarea
                placeholder="Ej: Calle 123"
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                className={`block w-full px-4 py-2 text-base border placeholder-gray-400 ${
                  errors.direccion 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-md shadow-sm transition duration-150 ease-in-out`}
              />
              {errors.direccion && (
                <p className="mt-1 text-sm text-red-600">{errors.direccion}</p>
              )}
            </div>
          </div>
          {/* Ubicación */}
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">
              Ubicación *
            </label>
            <div className="mt-1 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <input
                  type="number"
                  step="any"
                  placeholder="Latitud: -2.1700"
                  id="lat"
                  name="lat"
                  value={formData.ubicacion.lat}
                  onChange={handleChange}
                  className={`block w-full px-4 py-2 text-base border placeholder-gray-400 ${
                    errors.lat 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  } rounded-md shadow-sm transition duration-150 ease-in-out`}
                />
                {errors.lat && (
                  <p className="mt-1 text-sm text-red-600">{errors.lat}</p>
                )}
              </div>
              <div>
                <input
                  type="number"
                  step="any"
                  placeholder="Longitud: -79.9000"
                  id="lng"
                  name="lng"
                  value={formData.ubicacion.lng}
                  onChange={handleChange}
                  className={`block w-full px-4 py-2 text-base border placeholder-gray-400 ${
                    errors.lng 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  } rounded-md shadow-sm transition duration-150 ease-in-out`}
                />
                {errors.lng && (
                  <p className="mt-1 text-sm text-red-600">{errors.lng}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
    );
}