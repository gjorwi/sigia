'use client';

import { useState } from 'react';

export const roles = [
  { id: 'admin', nombre: 'Administrador' },
  { id: 'user', nombre: 'Usuario' },
];

export default function UserForm({ onSubmit, id, dataSetForm }) {
  const [formData, setFormData] = useState({
    nombre: dataSetForm?.nombre || '',
    apellido: dataSetForm?.apellido || '',
    email: dataSetForm?.email || '',
    telefono: dataSetForm?.telefono || '',
    rol: dataSetForm?.rol || 'user',
    usuario: dataSetForm?.usuario || '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es requerido';
    
    if (!formData.email) {
      newErrors.email = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Ingrese un correo válido';
    }
    
    if (formData.telefono && !/^\d{10,15}$/.test(formData.telefono)) {
      newErrors.telefono = 'Ingrese un teléfono válido';
    }
    
    if (!formData.rol) newErrors.rol = 'Seleccione un rol';
    
    if (!formData.usuario.trim()) {
      newErrors.usuario = 'El nombre de usuario es requerido';
    } else if (formData.usuario.length < 4) {
      newErrors.usuario = 'Mínimo 4 caracteres';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

          {/* Apellido */}
          <div className="sm:col-span-3">
            <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">
              Apellido *
            </label>
            <div className="mt-1">
              <input
                type="text"
                placeholder="Ej: Campos"
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                className={`block w-full px-4 py-2 text-base border placeholder-gray-400 ${
                  errors.apellido 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-md shadow-sm transition duration-150 ease-in-out`}
              />
              {errors.apellido && (
                <p className="mt-1 text-sm text-red-600">{errors.apellido}</p>
              )}
            </div>
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

          {/* Rol */}
          <div className="sm:col-span-3">
            <label htmlFor="rol" className="block text-sm font-medium text-gray-700">
              Rol *
            </label>
            <select
              id="rol"
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              className={`block w-full px-4 py-2 text-gray-700 text-base border ${
                errors.rol 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } rounded-md shadow-sm transition duration-150 ease-in-out bg-white`}
            >
              <option value="">Seleccione...</option>
              {roles.map((rol) => (
                <option key={rol.id} value={rol.id}>
                  {rol.nombre}
                </option>
              ))}
            </select>
            {errors.rol && (
              <p className="mt-1 text-sm text-red-600">{errors.rol}</p>
            )}
          </div>

          {/* Usuario */}
          <div className="sm:col-span-3">
            <label htmlFor="usuario" className="block text-sm font-medium text-gray-700">
              Nombre de usuario *
            </label>
            <div className="mt-1">
              <input
                type="text"
                placeholder="Ej: camposjose"
                id="usuario"
                name="usuario"
                value={formData.usuario}
                onChange={handleChange}
                className={`block w-full px-4 py-2 text-base border placeholder-gray-400 ${
                  errors.usuario 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-md shadow-sm transition duration-150 ease-in-out`}
              />
              {errors.usuario && (
                <p className="mt-1 text-sm text-red-600">{errors.usuario}</p>
              )}
            </div>
          </div>

          {/* Contraseña */}
          <div className="sm:col-span-3">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña *
            </label>
            <div className="mt-1">
              <input
                type="password"
                placeholder="Ej: Jc123456.."
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`block w-full px-4 py-2 text-base border placeholder-gray-400 ${
                  errors.password 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-md shadow-sm transition duration-150 ease-in-out`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
          </div>

          {/* Confirmar Contraseña */}
          <div className="sm:col-span-3">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirmar Contraseña *
            </label>
            <div className="mt-1">
              <input
                type="password"
                placeholder="Ej: Jc123456.."
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`block w-full px-4 py-2 text-base border placeholder-gray-400 ${
                  errors.confirmPassword 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-md shadow-sm transition duration-150 ease-in-out`}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
    );
}