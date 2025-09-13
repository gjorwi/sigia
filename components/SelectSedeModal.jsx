import { X, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SelectSedeModal({ isOpen, onClose, onSelect, sedes }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSedes, setFilteredSedes] = useState([]);

  useEffect(() => {
    if (sedes) {
      setFilteredSedes(sedes || sedes);
    }
  }, [sedes]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (!term) {
      setFilteredSedes(sedes);
      return;
    }

    const filtered = sedes.filter(sede => 
      (sede.nombre && sede.nombre.toLowerCase().includes(term)) ||
      (sede.codigo && sede.codigo.toLowerCase().includes(term))
    );
    setFilteredSedes(filtered);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed md:ml-64 top-0 left-0 bg-black/50 right-0 bottom-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[70vh] flex flex-col overflow-hidden m-4">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Seleccionar Sede</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 text-gray-700 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Buscar sede..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>
        
        {/* Sede List */}
        <div className="flex-1 overflow-y-auto">
          {filteredSedes && filteredSedes.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {filteredSedes.map((sede) => (
                <li key={sede.id}>
                  <button
                    type="button"
                    className="w-full px-4 py-4 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                    onClick={() => onSelect(sede)}
                  >
                    <div className="flex items-center">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {sede.nombre}
                        </p>
                        {sede.codigo && (
                          <p className="text-sm text-gray-500 truncate">
                            Código: {sede.codigo}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No se encontraron sedes
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
