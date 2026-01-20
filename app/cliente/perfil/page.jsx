"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { putChangePassword } from '@/servicios/users/put';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Modal from '@/components/Modal';

export default function Perfil() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(false);
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
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-lg font-medium text-white/70">Cargando tu perfil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen md:p-6 relative -mt-15">
            <div className="max-w-5xl space-y-6">
                {/* Profile Card */}
                <div className="bg-gradient-to-r from-indigo-600/80 to-blue-600/80 rounded-2xl shadow-xl overflow-hidden mt-10">
                    <div className="bg-white/5 backdrop-blur-sm px-6 py-5">
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

                    <div className="p-6 bg-white/20 backdrop-blur-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-white/70">Nombre completo</p>
                                <p className="text-white font-medium capitalize">{user?.nombre} {user?.apellido}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-white/70">Correo electrónico</p>
                                <p className="text-white">{user?.email}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-white/70">Teléfono</p>
                                <p className="text-white">{user?.telefono || 'No especificado'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-white/70">Rol en el sistema</p>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    user?.rol === 'admin' 
                                        ? 'bg-purple-100 text-purple-800' 
                                        : 'bg-blue-100 text-blue-800'
                                }`}>
                                    {user?.rol === 'admin' ? 'Administrador' : 'Usuario'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Password Change Card */}
                <div className="bg-gradient-to-r from-indigo-600/80 to-blue-600/80 rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-white/5 backdrop-blur-sm px-6 py-5">
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

                    <div className="">
                        <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white/20 backdrop-blur-sm">
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="currentPassword" className="block text-sm font-medium text-white/70 mb-1">
                                        Contraseña Actual
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <PasswordInput
                                            id="currentPassword"
                                            name="currentPassword"
                                            value={formData.currentPassword}
                                            onChange={handleChange}
                                            autoComplete="current-password"
                                            placeholder="Contraseña actual"
                                            className={`block w-full px-4 py-3 rounded-lg border text-white placeholder-white/40 ${
                                                errors.currentPassword 
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                                            } shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 transition duration-150`}
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
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
                                        <label htmlFor="newPassword" className="block text-sm font-medium text-white/70 mb-1">
                                            Nueva Contraseña
                                        </label>
                                        <div className="relative rounded-md shadow-sm">
                                            <PasswordInput
                                                id="newPassword"
                                                name="newPassword"
                                                value={formData.newPassword}
                                                onChange={handleChange}
                                                autoComplete="new-password"
                                                placeholder="Nueva contraseña"
                                                className={`block w-full px-4 py-3 rounded-lg border text-white placeholder-white/40 ${
                                                    errors.newPassword 
                                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                                                } shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 transition duration-150`}
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
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
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/70 mb-1">
                                            Confirmar Contraseña
                                        </label>
                                        <div className="relative rounded-md shadow-sm">
                                            <PasswordInput
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                autoComplete="new-password"
                                                placeholder="Confirmar contraseña"
                                                className={`block w-full px-4 py-3 rounded-lg border text-white placeholder-white/40 ${
                                                    errors.confirmPassword 
                                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                                                } shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 transition duration-150`}
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
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