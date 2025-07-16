'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Search, UserSearch } from 'lucide-react';
import LoteForm from '@/components/loteForm';
import Modal from '@/components/Modal';
import { getLoteById } from '@/servicios/lotes/get';
import { putLote } from '@/servicios/lotes/put';
import { getInsumoById } from '@/servicios/insumos/get';

export default function EditarInventario() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchError, setSearchError] = useState('');
  const [dataSetForm, setDataSetForm] = useState({});
  const [selectedInsumo, setSelectedInsumo] = useState(null);
  const [loteFound, setLoteFound] = useState(false);
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
    if (!loteFound) {
      setSearchError('Por favor busque un lote primero');
      return;
    }
    setLoading(true);
    const result = await putLote(formData);
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
    if (!searchTerm.trim()) {
      showMessage('Error', 'Por favor ingrese un código de lote', 'error', 4000);
      return;
    }
    setSearching(true);
    setLoteFound(false);
    const result = await getLoteById(searchTerm);
    const result2 = await getInsumoById(searchTerm);
    
    if (!result.success&&!result2.success) {
      showMessage('Error', 'No se encontró ningún lote con este código', 'error', 4000);
      setDataSetForm({});
      setLoading(false);
      return;
    }
    const joinData = {...result.data, ...result2.data};
    console.log(JSON.stringify(joinData,null,2));
    setDataSetForm(joinData);
    const type=joinData? 'success': 'info';
    showMessage('Info', result.message, type, 2000);
    if (joinData) {
      setLoteFound(true);
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
    setDataSetForm({});
    setLoteFound(false);
    setSelectedInsumo(null);
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
                    onClick={() => router.replace('/inventario')} 
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
                  onClick={() => router.push('/inventario')}
                  className="ml-3 inline-flex items-center px-5 py-2.5 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="lote-form"
                  disabled={loading}
                  className="ml-3 inline-flex items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                >
                  {loading ? (
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  ) : (
                    <Save className="-ml-1 mr-2 h-5 w-5" />
                  )}
                  Actualizar
                </button>
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  <UserSearch className="h-5 w-5 inline-block mr-2 text-blue-500" />
                  {loteFound ? 'Editar Lote' : 'Buscar Lote'}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {loteFound 
                    ? 'Revise y actualice la información del lote.'
                    : 'Ingrese el código del lote para buscar un lote.'}
                </p>
                
                {/* Campo de búsqueda de lote */}
                <div className="mt-4">
                  <form onSubmit={handleSearch} className="flex space-x-2 text-gray-700">
                    <div className="flex-1">
                      <label htmlFor="codigo" className="sr-only">Código</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="text"
                          id="codigo"
                          value={searchTerm}
                          onChange={handleSearchChange}
                          placeholder="Ingrese el código del lote"
                          className={`block w-full px-4 py-2 text-base border ${
                            searchError 
                              ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                          } rounded-md shadow-sm placeholder-gray-400`}
                          disabled={searching || loteFound}
                        />
                      </div>
                      {searchError && (
                        <p className="mt-1 text-sm text-red-600">{searchError}</p>
                      )}
                    </div>
                    
                    {!loteFound ? (
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
              
              {loteFound && (
                <LoteForm 
                  id="lote-form" 
                  onSubmit={handleSubmit} 
                  loading={loading}
                  formData={dataSetForm}
                  onFormDataChange={setDataSetForm}
                  selectedInsumo={selectedInsumo}
                  onSelectedInsumoChange={setSelectedInsumo}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}