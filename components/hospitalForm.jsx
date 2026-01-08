'use client';

import { useState } from 'react';
import { tipos } from '@/constantes/hospiTipos';
import { useEffect } from 'react';
import { dependencias } from '@/constantes/dependencias';
import { provincias } from '@/constantes/provincias';
import { municipios } from '@/constantes/municipios';
import { parroquias } from '@/constantes/parroquias';

// Normaliza texto a slug (minúscula, sin acentos)
const toSlug = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

// Busca el ID correcto en las constantes comparando por slug
const findMatchingId = (value, items) => {
  if (!value) return '';
  const slug = toSlug(value);
  // Primero buscar coincidencia exacta por id
  let match = items.find(item => item.id === value);
  if (match) return match.id;
  // Luego buscar por slug del id (coincidencia exacta)
  match = items.find(item => toSlug(item.id) === slug);
  if (match) return match.id;
  // Luego buscar por slug del nombre (coincidencia exacta)
  match = items.find(item => toSlug(item.nombre) === slug);
  if (match) return match.id;
  // Buscar ID que empiece con el slug (para casos como "arismendi" -> "arismendi sucre")
  match = items.find(item => toSlug(item.id).startsWith(slug + ' ') || toSlug(item.id) === slug);
  if (match) return match.id;
  // Buscar nombre que empiece con el slug
  match = items.find(item => toSlug(item.nombre).startsWith(slug));
  if (match) return match.id;
  // Si no encuentra, devolver el valor original
  return value;
};

export default function HospitalForm({ onSubmit, id, formData, onFormDataChange,menu }) {
  const [errors, setErrors] = useState({});
  const [filteredMunicipios, setFilteredMunicipios] = useState(municipios);
  const [filteredParroquias, setFilteredParroquias] = useState(parroquias);
  const [isNormalizing, setIsNormalizing] = useState(false);

  // Normalizar valores de estado/municipio/parroquia cuando cambian desde el backend
  useEffect(() => {
    if (formData.estado || formData.municipio || formData.parroquia) {
      const normalizedEstado = findMatchingId(formData.estado, provincias);
      const filteredMuns = municipios.filter(m => m.provinciaId === normalizedEstado);
      const normalizedMunicipio = findMatchingId(formData.municipio, filteredMuns.length ? filteredMuns : municipios);
      const filteredPars = parroquias.filter(p => p.municipioId === normalizedMunicipio);
      const normalizedParroquia = findMatchingId(formData.parroquia, filteredPars.length ? filteredPars : parroquias);
      
      // Actualizar listas filtradas inmediatamente
      if (filteredMuns.length) setFilteredMunicipios(filteredMuns);
      if (filteredPars.length) setFilteredParroquias(filteredPars);
      
      if (normalizedEstado !== formData.estado || 
          normalizedMunicipio !== formData.municipio || 
          normalizedParroquia !== formData.parroquia) {
        setIsNormalizing(true);
        onFormDataChange({
          ...formData,
          estado: normalizedEstado,
          municipio: normalizedMunicipio,
          parroquia: normalizedParroquia
        });
        // Resetear flag después de un tick
        setTimeout(() => setIsNormalizing(false), 0);
      }
    }
  }, [formData.estado, formData.municipio, formData.parroquia]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.rif.trim()) newErrors.rif = 'El rif es requerido';
    
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

  // Update filtered municipalities when province changes
  useEffect(() => {
    // No ejecutar durante la normalización
    if (isNormalizing) return;
    
    if (formData.estado) {
      const filtered = municipios.filter(m => m.provinciaId === formData.estado);
      setFilteredMunicipios(filtered);
    } else {
      setFilteredMunicipios([]);
    }
  }, [formData.estado, isNormalizing]);
  
  // Update filtered parroquias when municipality changes
  useEffect(() => {
    // No ejecutar durante la normalización
    if (isNormalizing) return;
    
    if (formData.municipio) {
      const filtered = parroquias.filter(p => p.municipioId === formData.municipio);
      setFilteredParroquias(filtered);
    } else {
      setFilteredParroquias([]);
    }
  }, [formData.municipio, isNormalizing]);

  const handleChangeEstado = (e) => {
    const { value } = e.target;

    // Solo resetear municipio/parroquia si no estamos normalizando
    onFormDataChange({
      ...formData,
      estado: value,
      municipio: isNormalizing ? formData.municipio : '',
      parroquia: isNormalizing ? formData.parroquia : ''
    });
  };
  const handleChangeMunicipio = (e) => {
    const { value } = e.target;
    onFormDataChange({
      ...formData,
      parroquia: '' // Reset parroquia when municipio changes
    });
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

  // Debug render
  console.log('Render - formData.municipio:', formData.municipio, 'filteredMunicipios.length:', filteredMunicipios.length);
    
  return (
    <form id={id} onSubmit={handleSubmit} className="divide-y divide-gray-200">
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 text-gray-700">
          {/* Rif */}
          <div className="sm:col-span-3">
            <label htmlFor="rif" className="block text-sm font-medium text-gray-700">
              Rif *
            </label>
            <div className="mt-1">
              <input
                type="text"
                placeholder="Ej: V-12345678"
                id="rif"
                name="rif"
                value={formData.rif||''}
                onChange={handleChange}
                className={`block w-full uppercase px-4 py-2 text-base bg-white text-gray-900 border placeholder-gray-400 ${
                  errors.rif 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-md shadow-sm transition duration-150 ease-in-out`}
              />
              {errors.rif && (
                <p className="mt-1 text-sm text-red-600">{errors.rif}</p>
              )}
            </div>
          </div>
          {/* Codigo SICM */}
          <div className="sm:col-span-3">
            <label htmlFor="codigo_sicm" className="block text-sm font-medium text-gray-700">
              Codigo SICM *
            </label>
            <div className="mt-1">
              <input
                type="text"
                placeholder="Ej: 12345678"
                id="cod_sicm"
                name="cod_sicm"
                value={formData.cod_sicm||''}
                onChange={handleChange}
                className={`block w-full px-4 py-2 text-base bg-white text-gray-900 border placeholder-gray-400 ${
                  errors.cod_sicm 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-md shadow-sm transition duration-150 ease-in-out`}
              />
              {errors.cod_sicm && (
                <p className="mt-1 text-sm text-red-600">{errors.cod_sicm}</p>
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
                placeholder="Ej: Hospital General"
                id="nombre"
                name="nombre"
                value={formData.nombre||''}
                onChange={handleChange}
                className={`block w-full px-4 py-2 text-base bg-white text-gray-900 border placeholder-gray-400 ${
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
              Tipo de hospital *
            </label>
            <div className="mt-1">
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo||''}
              onChange={handleChange}
              className={`block w-full px-4 capitalize py-[11px] text-gray-900 text-base border ${
                errors.tipo 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } rounded-md shadow-sm transition duration-150 ease-in-out bg-white`}
            >
              <option value="">Seleccione...</option>
              {tipos.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </option>
              ))}
            </select>
            {errors.tipo && (
              <p className="mt-1 text-sm text-red-600">{errors.tipo}</p>
            )}
            </div>
          </div>
          {/* Dependencia */}
          <div className="sm:col-span-3">
            <label htmlFor="dependencia" className="block text-sm font-medium text-gray-700">
              Dependencia *
            </label>
            <select
              id="dependencia"
              name="dependencia"
              value={formData.dependencia||''}
              onChange={handleChange}
              className={`block w-full px-4 capitalize py-2 text-gray-900 text-base border ${
                errors.dependencia 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } rounded-md shadow-sm transition duration-150 ease-in-out bg-white`}
            >
              <option value="">Seleccione...</option>
              {dependencias.map((dependencia) => (
                <option key={dependencia.id} value={dependencia.id}>
                  {dependencia.nombre}
                </option>
              ))}
            </select>
            {errors.dependencia && (
              <p className="mt-1 text-sm text-red-600">{errors.dependencia}</p>
            )}
          </div>
          {/* Estado (Provincia)*/}
          <div className="sm:col-span-3">
            <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
              Estado *
            </label>
            <select
              id="estado"
              name="estado"
              value={formData.estado||''}
              onChange={(e)=>{handleChange(e);handleChangeEstado(e)}}
              className={`block w-full px-4 capitalize py-2 text-gray-900 text-base border ${
                errors.estado 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } rounded-md shadow-sm transition duration-150 ease-in-out bg-white`}
            >
              <option value="">Seleccione...</option>
              {provincias.map((provincia, index) => (
                <option key={index} value={provincia.id}>
                  {provincia.nombre}
                </option>
              ))}
            </select>
            {errors.estado && (
              <p className="mt-1 text-sm text-red-600">{errors.estado}</p>
            )}
          </div>
          {/* Municipio */}
          <div className="sm:col-span-3">
            <label htmlFor="municipio" className="block text-sm font-medium text-gray-700">
              Municipio *
            </label>
            <select
              id="municipio"
              name="municipio"
              value={formData.municipio||''}
              onChange={(e) => {
                console.log('Municipio onChange:', e.target.value);
                handleChange(e);
              }}
              className={`block w-full px-4 capitalize py-2 text-gray-900 text-base border ${
                errors.municipio 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } rounded-md shadow-sm transition duration-150 ease-in-out bg-white`}
            >
              <option value="">Seleccione...</option>
              {filteredMunicipios.map((municipio) => {
                const isSelected = municipio.id === formData.municipio;
                if (isSelected) console.log('Municipio seleccionado encontrado:', municipio);
                return (
                  <option key={municipio.id} value={municipio.id}>
                    {municipio.nombre}
                  </option>
                );
              })}
            </select>
            {errors.municipio && (
              <p className="mt-1 text-sm text-red-600">{errors.municipio}</p>
            )}
          </div>
          {/* parroquia */}
          <div className="sm:col-span-3">
            <label htmlFor="parroquia" className="block text-sm font-medium text-gray-700">
              Parroquia *
            </label>
            <select
              id="parroquia"
              name="parroquia"
              value={formData.parroquia||''}
              onChange={handleChange}
              className={`block w-full px-4 capitalize py-2 text-gray-900 text-base border ${
                errors.parroquia 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } rounded-md shadow-sm transition duration-150 ease-in-out bg-white`}
            >
              <option value="">Seleccione...</option>
              {filteredParroquias.map((parroquia, index) => (
                <option key={index+'parroquia'} value={parroquia.id}>
                  {parroquia.nombre}
                </option>
              ))}
            </select>
            {errors.parroquia && (
              <p className="mt-1 text-sm text-red-600">{errors.parroquia}</p>
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
                value={formData.email||''}
                onChange={handleChange}
                className={`block w-full px-4 py-2 text-base bg-white text-gray-900 border placeholder-gray-400 ${
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
          {/* Nombre Contacto */}
          <div className="sm:col-span-3">
            <label htmlFor="nombre_contacto" className="block text-sm font-medium text-gray-700">
              Nombre directivo *
            </label>
            <div className="mt-1">
              <input
                type="text"
                placeholder="Ej: Campos José"
                id="nombre_contacto"
                name="nombre_contacto"
                value={formData.nombre_contacto||''}
                onChange={handleChange}
                className={`block w-full px-4 capitalize py-2 text-base bg-white text-gray-900 border placeholder-gray-400 ${
                  errors.nombre_contacto 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-md shadow-sm transition duration-150 ease-in-out`}
              />
              {errors.nombre_contacto && (
                <p className="mt-1 text-sm text-red-600">{errors.nombre_contacto}</p>
              )}
            </div>
          </div>
          {/* Email Contacto */}
          <div className="sm:col-span-3">
            <label htmlFor="email_contacto" className="block text-sm font-medium text-gray-700">
              Correo electrónico directivo
            </label>
            <div className="mt-1">
              <input
                type="email"
                placeholder="Ej: camposjose@gmail.com"
                id="email_contacto"
                name="email_contacto"
                value={formData.email_contacto||''}
                onChange={handleChange}
                className={`block w-full px-4 py-2 text-base bg-white text-gray-900 border placeholder-gray-400 ${
                  errors.email_contacto 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-md shadow-sm transition duration-150 ease-in-out`}
              />
              {errors.email_contacto && (
                <p className="mt-1 text-sm text-red-600">{errors.email_contacto}</p>
              )}
            </div>
          </div>

          {/* Teléfono */}
          <div className="sm:col-span-3">
            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
              Teléfono del directivo *
            </label>
            <div className="mt-1">
              <input
                type="tel"
                placeholder="Ej: 0987654321"
                id="telefono"
                name="telefono"
                value={formData.telefono||''}
                onChange={handleChange}
                className={`block w-full px-4 py-2 text-base bg-white text-gray-900 border placeholder-gray-400 ${
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
                value={formData.direccion||''}
                onChange={handleChange}
                className={`block w-full px-4 py-2 text-base bg-white text-gray-900 border placeholder-gray-400 ${
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
                  value={formData.ubicacion?.lat ?? ''}
                  onChange={handleChange}
                  className={`block w-full px-4 py-2 text-base bg-white text-gray-900 border placeholder-gray-400 ${
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
                  value={formData.ubicacion?.lng ?? ''}
                  onChange={handleChange}
                  className={`block w-full px-4 py-2 text-base bg-white text-gray-900 border placeholder-gray-400 ${
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