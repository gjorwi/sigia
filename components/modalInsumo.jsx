'use client';

import { Search, X, Package } from 'lucide-react';

export default function InsumoSelectionModal({ isOpen, onClose, onSelectInsumo, searchTerm, setSearchTerm, insumos = [] }) {
  
  const filteredInsumos = (insumos || []).filter(insumo => 
    (insumo?.nombre || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    (insumo?.codigo || '').toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  const handleSelectInsumo = (insumo) => {
    onSelectInsumo(insumo);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 md:ml-64 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Seleccionar Insumo</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar insumo por nombre o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 text-gray-900 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredInsumos.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {filteredInsumos.map((insumo) => (
                <li key={insumo.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectInsumo(insumo)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <Package className="h-5 w-5 text-indigo-600" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{insumo.nombre}</div>
                        <div className="text-sm text-gray-500">Código: {insumo.codigo}</div>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No se encontraron insumos que coincidan con la búsqueda
            </div>
          )}
        </div>
        
        <div className="p-4 border-t flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}