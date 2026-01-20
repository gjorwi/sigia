'use client';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar', loading = false }) {
  if (!isOpen) return null;

  const handleClose = () => {
    if (typeof onCancel === 'function') onCancel();
  };

  const handleConfirm = () => {
    if (typeof onConfirm === 'function') onConfirm();
  };

  const modal = (
    <div className="fixed inset-0 z-[10002] overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all" onClick={(e) => e.stopPropagation()}>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:items-center sm:justify-between sm:px-6 sm:py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
            <button type="button" className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none" onClick={handleClose}><span className="sr-only">Cerrar</span><X className="h-6 w-6" /></button>
          </div>

          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <p className="text-sm text-gray-700">{message}</p>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-gray-200 gap-2">
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? 'Procesando...' : confirmText}
            </button>
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none sm:w-auto sm:text-sm"
              onClick={handleClose}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
