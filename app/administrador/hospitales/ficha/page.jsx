'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Search, Plus, X, UserSearch } from 'lucide-react';
import Modal from '@/components/Modal';
import { getHospitalById } from '@/servicios/hospitales/get';
import { postFicha } from '@/servicios/fichas/post';
import { useAuth } from '@/contexts/AuthContext';
const initialFormData = {
  nombre: '',
  direccion: '',
  tipo: '',
  telefono: '',
  email: '',
  ubicacion: {
    lat: '',
    lng: '',
  },
};

export default function EditarUsuario() {
  const router = useRouter();
  const {user,logout} = useAuth();
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchError, setSearchError] = useState('');
  const [dataSetForm, setDataSetForm] = useState(initialFormData);
  const [hospitalFound, setHospitalFound] = useState(false);
  const [showInsumosModal, setShowInsumosModal] = useState(false);
  const [insumosFicha, setInsumosFicha] = useState([]);
  const [selectedInsumos, setSelectedInsumos] = useState([]);
  const [insumosDisponibles] = useState([
    { id: 1, nombre: 'Mascarillas N95', cantidad: 0 },
    { id: 2, nombre: 'Guantes de látex', cantidad: 0 },
    { id: 3, nombre: 'Jeringas', cantidad: 0 },
    { id: 4, nombre: 'Algodón', cantidad: 0 },
    { id: 5, nombre: 'Gasas', cantidad: 0 },
  ]);
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info', // 'info', 'error', 'success', 'warning'
    time: null
  });
  const showMessage = (title, message, type = 'info', time = null) => {
    setModal({isOpen: true, title, message, type, time});
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleSubmit = async (formData) => {
    if (!hospitalFound) {
      setSearchError('Por favor busque un hospital primero');
      return;
    }
    setLoading(true);
    const result = await postFicha(formData);
    if (!result.success) {
      showMessage('Error', result.message, 'error', 4000);
      setLoading(false);
      return;
    }
    showMessage('Éxito', result.message, 'success', 2000);
    // router.push('/usuarios');
    setLoading(false);
    clearSearch();
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    const {token} = user;
    if (!searchTerm.trim()) {
      showMessage('Error', 'Por favor ingrese un número de rif', 'error', 4000);
      return;
    }
    setSearching(true);
    setHospitalFound(false);
    const result = await getHospitalById(searchTerm,token);
    
    if (!result.status) {
      if(result.autenticacion==1||result.autenticacion==2){
        showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
        logout();
        router.replace('/');
        return;
      }
      showMessage('Error', result.mensaje, 'error', 4000);
      setDataSetForm(initialFormData);
      setLoading(false);
      return;
    }
    setDataSetForm(result.data);
    const type=result.data? 'success': 'info';
    const title=result.data? 'Éxito': 'Información';
    showMessage(title, result.mensaje, type, 2000);
    if (result.data) {
      setHospitalFound(true);
    }
    setSearching(false);
    setLoading(false);
    
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (searchError) setSearchError('');
  };
  
  const clearSearch = () => {
    setSearchTerm('');
    setSearchError('');
    setDataSetForm(initialFormData);
    setHospitalFound(false);
  };
  const agregarInsumos = () => {
    setInsumosFicha(prev => {
      // Actualizar cantidades de insumos existentes o agregar nuevos
      const updated = [...prev];
      selectedInsumos.forEach(selected => {
        const existingIndex = updated.findIndex(i => i.id === selected.id);
        if (existingIndex >= 0) {
          updated[existingIndex].cantidad += selected.cantidad;
        } else {
          updated.push({ ...selected });
        }
      });
      return updated;
    });
    setSelectedInsumos([]);
    setShowInsumosModal(false);
  };

  const handleQuantityChange = (e, insumo) => {
    const cantidad = parseInt(e.target.value) || 0;
    setSelectedInsumos(prev => {
      const exists = prev.some(i => i.id === insumo.id);
      if (cantidad > 0) {
        return exists
          ? prev.map(i => i.id === insumo.id ? { ...i, cantidad } : i)
          : [...prev, { ...insumo, cantidad }];
      } else {
        return prev.filter(i => i.id !== insumo.id);
      }
    });
  };

  return (
    <>
      <div className="md:pl-64 flex flex-col">
        {/* Modal de mensajes */}
        <Modal 
          isOpen={modal.isOpen} 
          onClose={closeModal} 
          title={modal.title} 
          message={modal.message} 
          type={modal.type} 
          time={modal.time}
        />
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="md:flex md:items-center md:justify-between mb-6">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate">
                  <button 
                    onClick={() => router.replace('/administrador/hospitales')} 
                    className="mr-3 text-gray-500 hover:text-gray-700"
                  >
                    <ArrowLeft className="h-6 w-6 inline" />
                  </button>
                  Atras
                </h2>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <button
                  type="button"
                  onClick={() => router.push('/administrador/hospitales')}
                  className="ml-3 inline-flex items-center px-5 py-2.5 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="ml-3 inline-flex items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                >
                  {loading ? (
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  ) : (
                    <Save className="-ml-1 mr-2 h-5 w-5" />
                  )}
                  Guardar
                </button>
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  <UserSearch className="h-5 w-5 inline-block mr-2 text-blue-500" />
                  {hospitalFound ? 'Editar Hospital' : 'Buscar Hospital'}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {hospitalFound 
                    ? 'Revise y actualice la información del hospital.'
                    : 'Ingrese el número de rif para buscar un hospital.'}
                </p>
                
                {/* Campo de búsqueda de cédula */}
                <div className="mt-4">
                  <form onSubmit={handleSearch} className="flex space-x-2 text-gray-700">
                    <div className="flex-1">
                      <label htmlFor="rif" className="sr-only">RIF</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="text"
                          id="rif"
                          value={searchTerm}
                          onChange={handleSearchChange}
                          placeholder="Ingrese el número de rif"
                          className={`block w-full px-4 py-2 text-base border ${
                            searchError 
                              ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                          } rounded-md shadow-sm placeholder-gray-400`}
                          disabled={searching || hospitalFound}
                        />
                      </div>
                      {searchError && (
                        <p className="mt-1 text-sm text-red-600">{searchError}</p>
                      )}
                    </div>
                    
                    {!hospitalFound ? (
                      <button
                        type="submit"
                        disabled={searching || !searchTerm.trim()}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                          searching || !searchTerm.trim() 
                            ? 'bg-blue-400' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                      >
                        {searching ? (
                          <>
                            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                            Buscando...
                          </>
                        ) : (
                          <>
                            <Search className="-ml-1 mr-2 h-4 w-4" />
                            Buscar
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Nueva Búsqueda
                      </button>
                    )}
                  </form>
                </div>
              </div>
　　 　 　 　 {hospitalFound && (
                <div className="p-4 pt-0">
                  <div className="mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Gestionar ficha del hospital
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Hospital: {dataSetForm?.nombre}
                    </p>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      RIF: {dataSetForm?.rif}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Insumos del Hospital</h3>
                    <button
                      type="button"
                      onClick={() => setShowInsumosModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <Plus className="-ml-1 mr-2 h-4 w-4" />
                      Agregar Insumos
                    </button>
                  </div>

                  {insumosFicha.length > 0 ? (
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                      <ul className="divide-y divide-gray-200">
                        {insumosFicha.map((insumo) => (
                          <li key={insumo.id}>
                            <div className="px-4 py-4 flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{insumo.nombre}</p>
                                <p className="text-sm text-gray-500">Cantidad: {insumo.cantidad}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setInsumosFicha(prev => prev.filter(i => i.id !== insumo.id));
                                }}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-gray-500">No hay insumos registrados</p>
                    </div>
                  )}

                  {/* Modal para agregar insumos */}
                  {showInsumosModal && (
                    <div className="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                      <div id="modal" className="flex items-end justify-center bg-black/50 min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0" onClick={(e) => closeModal(e)}>
                        {/* <div className="fixed inset-0 " aria-hidden="true" onClick={() => setShowInsumosModal(false)}></div> */}
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white z-50 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6 md:ml-64">
                          <div>
                            <div className="mt-3 text-center sm:mt-5">
                              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                Agregar Insumos
                              </h3>
                              <div className="mt-4">
                                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                                  <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                                    {insumosDisponibles.map((insumo) => (
                                      <li key={insumo.id} className="px-4 py-4">
                                        <div className="flex items-center justify-between">
                                          <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{insumo.nombre}</p>
                                          </div>
                                          <div className="flex items-center">
                                            <input
                                              type="text"
                                              inputMode="numeric"
                                              pattern="[0-9]*"
                                              className="w-20 px-2 py-1 border text-gray-700 border-gray-300 rounded-md text-sm text-right"
                                              value={selectedInsumos.find(i => i.id === insumo.id)?.cantidad || ''}
                                              placeholder="0"
                                              onChange={(e) => handleQuantityChange(e, insumo)}
                                            />
                                          </div>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                            <button
                              type="button"
                              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:col-start-2 sm:text-sm"
                              onClick={() => agregarInsumos()}
                            >
                              Agregar seleccionados
                            </button>
                            <button
                              type="button"
                              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                              onClick={() => setShowInsumosModal(false)}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}