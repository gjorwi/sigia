'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Package, Search, AlertCircle } from 'lucide-react';
import { getInsumos } from '@/servicios/insumos/get';
import { useAuth } from '@/contexts/AuthContext';

export default function ModalSeleccionInsumo({ isOpen, onClose, onSelect }) {
    const { user } = useAuth();
    const [insumos, setInsumos] = useState([]);
    const [filteredInsumos, setFilteredInsumos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            loadInsumos();
        }
    }, [isOpen]);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredInsumos(insumos);
        } else {
            const filtered = insumos.filter(insumo =>
                insumo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (insumo.codigo && insumo.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredInsumos(filtered);
        }
    }, [searchTerm, insumos]);

    const loadInsumos = async () => {
        setIsLoading(true);
        try {
            const response = await getInsumos(user.token);
            if (response && response.data) {
                setInsumos(response.data);
                setFilteredInsumos(response.data);
            }
        } catch (error) {
            console.error('Error al cargar insumos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelect = (insumo) => {
        onSelect(insumo);
        setSearchTerm('');
        onClose();
    };

    if (!isOpen || !isMounted) {
        return null;
    }

    const modalContent = (
        <div className="fixed inset-0 z-[10001] overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-screen items-center justify-center p-4 text-center">
                <div
                    className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center">
                            <Package className="h-6 w-6 text-white mr-3" />
                            <h3 className="text-xl font-semibold text-white">
                                Seleccionar Insumo
                            </h3>
                        </div>
                        <button
                            type="button"
                            className="rounded-md text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white"
                            onClick={onClose}
                        >
                            <span className="sr-only">Cerrar</span>
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar por nombre o código..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-10 pr-3 text-gray-700 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="bg-white px-6 py-4 max-h-96 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                            </div>
                        ) : filteredInsumos.length === 0 ? (
                            <div className="text-center py-8">
                                <Package className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-500">
                                    {searchTerm ? 'No se encontraron insumos' : 'No hay insumos disponibles'}
                                </p>
                                {searchTerm && (
                                    <div className="mt-4 p-4 bg-yellow-50 rounded-md border border-yellow-200 inline-block text-left max-w-md">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <AlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-yellow-800">Insumo no encontrado</h3>
                                                <div className="mt-2 text-sm text-yellow-700">
                                                    <p>
                                                        Si el insumo no aparece en la lista, debe realizar una solicitud del mismo al administrador.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredInsumos.map((insumo) => (
                                    <div
                                        key={insumo.id}
                                        onClick={() => handleSelect(insumo)}
                                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all duration-200"
                                    >
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <Package className="h-5 w-5 text-blue-600" />
                                            </div>
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                {insumo.nombre}
                                            </p>
                                            {insumo.codigo && (
                                                <p className="text-sm text-gray-500">
                                                    Código: {insumo.codigo}
                                                </p>
                                            )}
                                            {insumo.descripcion && (
                                                <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                                                    {insumo.descripcion}
                                                </p>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            onClick={onClose}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
