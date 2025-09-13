'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';


export const tipos = [
  { id: 'administrador', nombre: 'Administrador' },
  { id: 'cliente', nombre: 'Cliente' },
];
export const permissions=[
  {id: 'can_view', nombre: 'Ver' },
  {id: 'can_create', nombre: 'Crear' },
  {id: 'can_update', nombre: 'Actualizar' },
  {id: 'can_delete', nombre: 'Eliminar' },
  {id: 'can_crud_user', nombre: 'Gestionar usuarios' },
];
export const roles=[
  {idType: 'administrador', id: 'almacenCent', nombre: 'Almacén Central' },
  {idType: 'cliente', id: 'almacenPrin', nombre: 'Almacén Principal' },
  {idType: 'cliente', id: 'almacenFarm', nombre: 'Almacén Farmacia' },
  {idType: 'cliente', id: 'almacenPar', nombre: 'Almacén Paralelo' },
  {idType: 'cliente', id: 'almacenServAtenciones', nombre: 'Almacén Servicios de Atenciones' },
  {idType: 'cliente', id: 'almacenServApoyo', nombre: 'Almacén Servicios de Apoyo' },
];

export default function UserForm({menu, setSelectedHospital,setSelectedSede,setAllSedes,onSubmit, id, formData, onFormDataChange, openHospitalModal, selectedHospital, openSedeModal, selectedSede }) {
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
    if(menu!='editar'){
      if (!formData.password) {
        newErrors.password = 'La contraseña es requerida';
      }
      if (!formData.confirm_password) {
        newErrors.confirm_password = 'La confirmación de contraseña es requerida';
      } else if (formData.password !== formData.confirm_password) {
        newErrors.confirm_password = 'Las contraseñas no coinciden';
      }
    }
    if(formData.tipo === 'cliente'){
      if (!formData.hospital_id) {
        newErrors.hospital_id = 'El hospital es requerido';
      }
      if (!formData.sede_id) {
        newErrors.sede_id = 'La sede es requerida';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'tipo') {
      setSelectedHospital(null);
      setSelectedSede(null);
      setAllSedes([]);
      onFormDataChange({
        ...formData,
        [name]: value,
        hospital_id: null,
        hospital_nombre: null,
        hospital: null,
        sede_id: null,
        sede_nombre: null,
        sede: null,
        rol: 'almacenCent',
      });
      return;
    }
    onFormDataChange({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  const togglePermission = (permission) => {
    const newFormData = {
      ...formData,
      [permission]: !formData[permission]
    };
    onFormDataChange(newFormData);
  };
  return (
    <>
      <form id={id} onSubmit={handleSubmit} className="divide-y divide-gray-200">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 text-gray-700">
            {/* Cedula */}
            <div className="sm:col-span-3">
              <label htmlFor="cedula" className="block text-sm font-medium text-gray-700">
                Cédula *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  placeholder="Ej: 123456789"
                  id="cedula"
                  name="cedula"
                  value={formData.cedula||''}
                  onChange={handleChange}
                  className={`block w-full px-4 py-2 text-base border placeholder-gray-400 ${
                    errors.cedula 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  } rounded-md shadow-sm transition duration-150 ease-in-out`}
                />
                {errors.cedula && (
                  <p className="mt-1 text-sm text-red-600">{errors.cedula}</p>
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
                  value={formData.nombre||''}
                  onChange={handleChange}
                  className={`block w-full px-4 py-2 capitalize text-base border placeholder-gray-400 ${
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
                  value={formData.apellido||''}
                  onChange={handleChange}
                  className={`block w-full px-4 py-2 capitalize text-base border placeholder-gray-400 ${
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
            {/* Genero */}
            <div className="sm:col-span-3">
              <label htmlFor="genero" className="block text-sm font-medium text-gray-700">
                Genero *
              </label>
              <div className="mt-1">
                <select
                  id="genero"
                  name="genero"
                  value={formData.genero||''}
                  onChange={handleChange}
                  className={`block w-full px-4 py-[11px] text-gray-700 text-base border ${
                    errors.genero 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  } rounded-md shadow-sm transition duration-150 ease-in-out`}
                >
                  <option value="">Seleccione un genero</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                </select>
                {errors.genero && (
                  <p className="mt-1 text-sm text-red-600">{errors.genero}</p>
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
                  value={formData.email||''}
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
                  value={formData.telefono||''}
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
                Dirección
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  placeholder="Ej: Calle 123"
                  id="direccion"
                  name="direccion"
                  value={formData.direccion||''}
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

            {/* Tipo */}
            <div className="sm:col-span-3">
              <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
                Tipo *
              </label>
              <div className="mt-1">
                <select
                  id="tipo"
                  name="tipo"
                  value={formData.tipo||''}
                  onChange={handleChange}
                  className={`block w-full px-4 py-[11px] text-gray-700 text-base border ${
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

            {/* Hospital */}
              <>
                <div className="sm:col-span-3">
                  <dt className="text-sm font-medium text-gray-700">
                    {formData.tipo === 'cliente' ? 'Hospital' : 'Instancia'} *
                  </dt>
                  <dd className="text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div onClick={openHospitalModal} className="flex cursor-pointer rounded-md shadow-sm mt-1">
                      <input
                        type="text"
                        readOnly
                        value={selectedHospital ? `${selectedHospital.nombre} (${selectedHospital.rif})` : ''}
                        className="flex-1 min-w-0 block w-full px-3 py-[11px] cursor-pointer rounded-none rounded-l-md border border-gray-300 focus:outline-0 focus:ring-0 sm:text-sm"
                        placeholder="Seleccionar hospital"
                      />
                      <button
                        type="button"
                        onClick={openHospitalModal}
                        className="inline-flex items-center px-3 py-2 cursor-pointer border border-l-0 border-gray-300 bg-gray-50 text-gray-700 text-sm rounded-r-md hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <Search className="h-4 w-4" />
                      </button>
                    </div>
                  </dd>
                </div>
                <div className="sm:col-span-3">
                  <dt className="text-sm font-medium text-gray-700">
                    {formData.tipo === 'cliente' ? 'Sede' : 'Almacen'} *
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div onClick={openSedeModal} className="flex cursor-pointer rounded-md shadow-sm mt-1">
                      <input
                        type="text"
                        readOnly
                        value={selectedSede ? `${selectedSede.nombre}` : ''}
                        className="flex-1 min-w-0 block w-full px-3 py-[11px] cursor-pointer rounded-none rounded-l-md border border-gray-300 focus:outline-0 focus:ring-0 sm:text-sm"
                        placeholder="Seleccionar sede"
                      />
                      <button
                        type="button"
                        onClick={openSedeModal}
                        className="inline-flex items-center px-3 py-2 cursor-pointer border border-l-0 border-gray-300 bg-gray-50 text-gray-700 text-sm rounded-r-md hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <Search className="h-4 w-4" />
                      </button>
                    </div>
                  </dd>
                </div>
              </>
            {/* Contraseña */}
            {menu!='editar'&&(
              <>
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
                      value={formData.password||''}
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
                      id="confirm_password"
                      name="confirm_password"
                      value={formData.confirm_password||''}
                      onChange={handleChange}
                      className={`block w-full px-4 py-2 text-base border placeholder-gray-400 ${
                        errors.confirm_password 
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      } rounded-md shadow-sm transition duration-150 ease-in-out`}
                    />
                    {errors.confirm_password && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirm_password}</p>
                    )}
                  </div>
                </div>
              </>
            )}
            {/* Permisos */}
          </div>
            <div className="w-full mt-4"> 
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Permisos *
              </label>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 w-full">
                <div className="mt-1 grid grid-cols-2 lg:grid-cols-5 gap-2 w-full"> 
                  {permissions.map((permission) => (
                    <div key={permission.id} className="flex items-center justify-end lg:justify-start gap-2">
                      <label htmlFor={`permission-${permission.id}`} className="ml-2 block text-sm text-gray-700">
                        {permission.nombre}
                      </label>
                      <input
                        id={`permission-${permission.id}`}
                        name={`permission-${permission.id}`}
                        type="checkbox"
                        checked={formData[permission.id]}
                        onChange={() => togglePermission(permission.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  ))}
                </div>
              </dd>
            </div>
        </div>
      </form>
      {/* Modal de selección de hospital */}
      
    </>
    );
}