import { X, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function SelectHospiModal({ isOpen, onClose, onSelect, hospitals, tipo }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredHospitals, setFilteredHospitals] = useState([]);

  useEffect(() => {
    let hospitalsData = [];
    if (hospitals) {
      if (!tipo) {
        hospitalsData = hospitals || [];
      } else if(tipo==='administrador'){
        hospitalsData = hospitals?.filter(hospital => hospital.tipo === 'almacen');
      }else if(tipo==='despachos'){
        // Para despachos, mostrar todos los hospitales
        hospitalsData = hospitals || [];
      }else{
        hospitalsData = hospitals?.filter(hospital =>
          hospital.tipo?.includes('hospital') || hospital.tipo?.includes('aus')
        );
      }
      
    }
    console.log("Hospitals Data: "+JSON.stringify(hospitalsData,null,2));
    setFilteredHospitals(hospitalsData);
  }, [hospitals,tipo]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (!term) {
      // Restaurar la lista filtrada según el tipo
      let hospitalsData = [];
      if (hospitals) {
        if (!tipo) {
          hospitalsData = hospitals || [];
        } else if (tipo === 'administrador') {
          hospitalsData = hospitals?.filter(hospital => hospital.tipo === 'almacen');
        } else if (tipo === 'despachos' || tipo === 'insumos por vencer') {
          hospitalsData = hospitals || [];
        } else {
          hospitalsData = hospitals?.filter(hospital =>
            hospital.tipo?.includes('hospital') || hospital.tipo?.includes('AUS')
          );
        }
      }
      setFilteredHospitals(hospitalsData);
      return;
    }
    
    // Filtrar sobre la lista ya filtrada por tipo
    const baseList = filteredHospitals.length > 0 ? filteredHospitals : hospitals;
    const filtered = baseList.filter(hospital => 
      hospital.nombre?.toLowerCase().includes(term) ||
      hospital.rif?.toLowerCase().includes(term) ||
      hospital.cod_sicm?.toLowerCase().includes(term)
    );
    setFilteredHospitals(filtered);
  };

  const clearSearch = () => {
    setSearchTerm('');
    // Restaurar la lista filtrada según el tipo
    let hospitalsData = [];
    if (hospitals) {
      if (!tipo) {
        hospitalsData = hospitals || [];
      } else if (tipo === 'administrador') {
        hospitalsData = hospitals?.filter(hospital => hospital.tipo === 'almacen');
      } else if (tipo === 'despachos' || tipo === 'insumos por vencer') {
        hospitalsData = hospitals || [];
      } else {
        hospitalsData = hospitals?.filter(hospital =>
          hospital.tipo?.includes('hospital') || hospital.tipo?.includes('AUS')
        );
      }
    }
    setFilteredHospitals(hospitalsData);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden m-4">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Seleccionar Hospital</h3>
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
              className="block w-full pl-10 pr-10 py-2 border text-gray-700 border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Buscar hospital..."
              value={searchTerm}
              onChange={handleSearch}
            />
            {searchTerm && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={clearSearch}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Hospital List */}
        <div className="flex-1 overflow-y-auto">
          {filteredHospitals && filteredHospitals.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {filteredHospitals.map((hospital) => (
                <li key={hospital.id}>
                  <button
                    type="button"
                    className="w-full px-4 py-4 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                    onClick={() => onSelect(hospital)}
                  >
                    <div className="flex items-center">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-500 truncate">
                          Código: {hospital.cod_sicm}
                        </p>
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {hospital.nombre}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No se encontraron hospitales
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
    </div>,
    document.body
  );
}
