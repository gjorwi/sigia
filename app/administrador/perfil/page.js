"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { putChangePassword } from '@/servicios/users/put';
import { useAuth } from '@/contexts/AuthContext';
import Modal from '@/components/Modal';

export default function Perfil() {
    const router = useRouter();
    const {user, logout} = useAuth();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        time: null
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    useEffect(() => {
        if(user){
            setLoading(false);
        }
        console.log("User: "+JSON.stringify(user,null,2));
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.currentPassword) newErrors.currentPassword = 'La contraseña actual es requerida';
        if (!formData.newPassword) {
            newErrors.newPassword = 'La nueva contraseña es requerida';
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
        }
        if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const closeModal = () => {
        setModal(prev => ({ ...prev, isOpen: false }));
    };

    const showMessage = (title, message, type, time) => {
        setModal({ isOpen: true, title, message, type, time });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const {token, id} = user;
        
        if (!validateForm()) return;
        
        setLoading(true);
        
        const result = await putChangePassword({
            id: id,
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword
        }, token);
        
        if (!result.status) {
            if (result.autenticacion === 1 || result.autenticacion === 2) {
                showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
                logout();
                router.replace('/');
                return;
            }
            showMessage('Error', result.mensaje || 'Error al actualizar la contraseña', 'error', 4000);
            setLoading(false);
            return;
        }
        
        showMessage('Éxito', result.mensaje || 'Contraseña actualizada correctamente', 'success', 3000);
        setLoading(false);
        
        // Limpiar formulario
        setFormData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
    };

    if (loading) {
        return (
            <div className="ml-64 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mx-auto"></div>
                    <p className="mt-4 text-lg font-medium text-gray-700">Cargando tu perfil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen md:ml-64 bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-5">
                        <div className="flex items-center">
                            <div className="bg-white/20 p-3 rounded-full">
                                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h2 className="text-xl font-semibold text-white">Información Personal</h2>
                                <p className="text-indigo-100 text-sm">Datos de tu cuenta</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500">Nombre completo</p>
                                <p className="text-gray-800 font-medium">{user?.nombre} {user?.apellido}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500">Cédula</p>
                                <p className="text-gray-800">{user?.cedula || 'No especificado'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500">Género</p>
                                <p className="text-gray-800">{user?.genero || 'No especificado'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500">Correo electrónico</p>
                                <p className="text-gray-800">{user?.email}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500">Teléfono</p>
                                <p className="text-gray-800">{user?.telefono || 'No especificado'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500">Dirección</p>
                                <p className="text-gray-800">{user?.direccion || 'No especificado'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500">Tipo de usuario</p>
                                <p className="text-gray-800 capitalize">{user?.tipo || 'No especificado'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500">Rol en el sistema</p>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    user?.rol === 'admin' 
                                        ? 'bg-purple-100 text-purple-800' 
                                        : 'bg-blue-100 text-blue-800'
                                }`}>
                                    {user?.rol === 'admin' ? 'Administrador' : 'Usuario'}
                                </span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500">Estado</p>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    user?.status === 'activo' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {user?.status === 'activo' ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hospital and Sede Information */}
                {(user?.hospital || user?.sede) && (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-5">
                            <div className="flex items-center">
                                <div className="bg-white/20 p-3 rounded-full">
                                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h2 className="text-xl font-semibold text-white">Información de Almacen</h2>
                                    <p className="text-green-100 text-sm">Ubicación y centro de trabajo</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {user?.hospital && (
                                    <div className="col-span-full">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <svg className="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            Almacén
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-gray-500">Nombre</p>
                                                <p className="text-gray-800 font-medium">{user.hospital.nombre}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-gray-500">RIF</p>
                                                <p className="text-gray-800">{user.hospital.rif}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-gray-500">Dirección</p>
                                                <p className="text-gray-800">{user.hospital.direccion || 'No especificado'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-gray-500">Teléfono</p>
                                                <p className="text-gray-800">{user.hospital.telefono || 'No especificado'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-gray-500">Email</p>
                                                <p className="text-gray-800">{user.hospital.email || 'No especificado'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-gray-500">Estado</p>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                    user.hospital.status === 'activo' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {user.hospital.status === 'activo' ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {user?.sede && (
                                    <div className="col-span-full">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <svg className="h-5 w-5 mr-2 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Sede
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-gray-500">Nombre</p>
                                                <p className="text-gray-800 font-medium">{user.sede.nombre}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-gray-500">Tipo de almacén</p>
                                                <p className="text-gray-800">{user.sede.tipo_almacen === 'almacenCent' ? 'Almacén Central' : user.sede.tipo_almacen}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-gray-500">Estado</p>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                    user.sede.status === 'activo' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {user.sede.status === 'activo' ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Permissions Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-5">
                        <div className="flex items-center">
                            <div className="bg-white/20 p-3 rounded-full">
                                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h2 className="text-xl font-semibold text-white">Permisos del Usuario</h2>
                                <p className="text-orange-100 text-sm">Accesos y capacidades en el sistema</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                    user?.can_view ? 'bg-green-100' : 'bg-red-100'
                                }`}>
                                    {user?.can_view ? (
                                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Ver</p>
                                    <p className="text-xs text-gray-500">Visualizar datos</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                    user?.can_create ? 'bg-green-100' : 'bg-red-100'
                                }`}>
                                    {user?.can_create ? (
                                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Crear</p>
                                    <p className="text-xs text-gray-500">Agregar registros</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                    user?.can_update ? 'bg-green-100' : 'bg-red-100'
                                }`}>
                                    {user?.can_update ? (
                                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Actualizar</p>
                                    <p className="text-xs text-gray-500">Editar datos</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                    user?.can_delete ? 'bg-green-100' : 'bg-red-100'
                                }`}>
                                    {user?.can_delete ? (
                                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Eliminar</p>
                                    <p className="text-xs text-gray-500">Borrar registros</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                    user?.can_crud_user ? 'bg-green-100' : 'bg-red-100'
                                }`}>
                                    {user?.can_crud_user ? (
                                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Gestión Usuarios</p>
                                    <p className="text-xs text-gray-500">CRUD usuarios</p>
                                </div>
                            </div>

                            {user?.is_root && (
                                <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-purple-100">
                                        <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-purple-900">Usuario Root</p>
                                        <p className="text-xs text-purple-600">Acceso total</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Password Change Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-5">
                        <div className="flex items-center">
                            <div className="bg-white/20 p-3 rounded-full">
                                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h2 className="text-xl font-semibold text-white">Seguridad</h2>
                                <p className="text-indigo-100 text-sm">Actualiza tu contraseña</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                        Contraseña Actual
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <input
                                            id="currentPassword"
                                            name="currentPassword"
                                            type={showPasswords.current ? "text" : "password"}
                                            autoComplete="new-password"
                                            value={formData.currentPassword}
                                            onChange={handleChange}
                                            className={`block w-full pr-10 px-4 py-3 rounded-lg text-gray-700 border ${
                                                errors.currentPassword 
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                                            } shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 transition duration-150`}
                                            placeholder="Ingresa tu contraseña actual"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <button
                                                type="button"
                                                onClick={() => togglePasswordVisibility('current')}
                                                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                            >
                                                {showPasswords.current ? (
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                    </svg>
                                                ) : (
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    {errors.currentPassword && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center">
                                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {errors.currentPassword}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                            Nueva Contraseña
                                        </label>
                                        <div className="relative rounded-md shadow-sm">
                                            <input
                                                id="newPassword"
                                                name="newPassword"
                                                type={showPasswords.new ? "text" : "password"}
                                                autoComplete="new-password"
                                                value={formData.newPassword}
                                                onChange={handleChange}
                                                className={`block w-full pr-10 px-4 py-3 text-gray-700 rounded-lg border ${
                                                    errors.newPassword 
                                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                                                } shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 transition duration-150`}
                                                placeholder="Crea una nueva contraseña"
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('new')}
                                                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                                >
                                                    {showPasswords.new ? (
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        {errors.newPassword && (
                                            <p className="mt-2 text-sm text-red-600 flex items-center">
                                                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {errors.newPassword}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                            Confirmar Contraseña
                                        </label>
                                        <div className="relative rounded-md shadow-sm">
                                            <input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type={showPasswords.confirm ? "text" : "password"}
                                                autoComplete="new-password"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className={`block w-full pr-10 px-4 py-3 text-gray-700 rounded-lg border ${
                                                    errors.confirmPassword 
                                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                                                } shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 transition duration-150`}
                                                placeholder="Confirma tu nueva contraseña"
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('confirm')}
                                                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                                >
                                                    {showPasswords.confirm ? (
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        {errors.confirmPassword && (
                                            <p className="mt-2 text-sm text-red-600 flex items-center">
                                                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {errors.confirmPassword}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out transform hover:-translate-y-0.5"
                                >
                                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Actualizar Contraseña
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Modal de mensajes */}
            <Modal
                isOpen={modal.isOpen}
                onClose={closeModal}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                time={modal.time}
            />
        </div>
    );
}