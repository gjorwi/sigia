'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Search, UserSearch, FileText } from 'lucide-react';
import Modal from '@/components/Modal';
import { getHospitalById } from '@/servicios/hospitales/get';
import { postFicha, postGenerarFicha } from '@/servicios/fichas/post';
import { putActualizarFichaInsumos, putActualizarFichaHospital } from '@/servicios/fichas/put';
import { getInsumos } from '@/servicios/insumos/get';
import { getFichaHospitalById } from '@/servicios/fichas/get';
import { deleteFichaHospital } from '@/servicios/fichas/delete';
import ConfirmModal from '@/components/ConfirmModal';
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
  const [insumosFicha, setInsumosFicha] = useState([]);
  const [insumosFichaOriginal, setInsumosFichaOriginal] = useState([]);
  const [insumosSearchTerm, setInsumosSearchTerm] = useState('');
  const [tieneFicha, setTieneFicha] = useState(false);
  const [generandoFicha, setGenerandoFicha] = useState(false);
  const [actualizandoFicha, setActualizandoFicha] = useState(false);
  const [isDeletingFicha, setIsDeletingFicha] = useState(false);
  const [confirm, setConfirm] = useState({ isOpen: false, title: '', message: '', onConfirm: null, confirmText: 'Confirmar' });
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

  const handleSubmit = async () => {
    if (!hospitalFound || !dataSetForm?.id) {
      setSearchError('Por favor busque un hospital primero');
      return;
    }
    setLoading(true);

    const { token } = user;
    try {
      const normalize = (v) => String(v ?? '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
      const isPolidioxanona = (item) => {
        const nombre = item?.insumo?.nombre ?? item?.nombre;
        return normalize(nombre).includes('polidioxanona');
      };

      const originalById = new Map(
        (insumosFichaOriginal || [])
          .filter((i) => i?.id != null)
          .map((i) => [i.id, i])
      );

      const changedItems = (insumosFicha || []).filter((i) => {
        if (i?.id == null) return true;
        const original = originalById.get(i.id);
        if (!original) return true;
        const currentStatus = Boolean(i?.status);
        const originalStatus = Boolean(original?.status);
        const currentCantidad = i?.cantidad ?? null;
        const originalCantidad = original?.cantidad ?? null;
        return currentStatus !== originalStatus || currentCantidad !== originalCantidad;
      });

      const payload = changedItems.map((i) => ({
        id: i?.id,
        insumo_id: i?.insumo_id || i?.insumo?.id,
        status: Boolean(i?.status),
        cantidad: i?.cantidad
      }));

      const polidioxanonaInChanged = changedItems.some(isPolidioxanona);
      if (polidioxanonaInChanged) {
        console.log('[DEBUG POLIDIOXANONA] Payload putActualizarFichaInsumos:', JSON.stringify(payload, null, 2));
      }

      const result = await putActualizarFichaInsumos(dataSetForm.id, payload, token);

      if (polidioxanonaInChanged) {
        console.log('[DEBUG POLIDIOXANONA] Response putActualizarFichaInsumos:', JSON.stringify(result, null, 2));
      }

      if (!result?.status) {
        if (result?.autenticacion === 1 || result?.autenticacion === 2) {
          showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
          logout();
          router.replace('/');
          return;
        }
        showMessage('Error', result?.mensaje || 'Error al actualizar la ficha de insumos', 'error', 4000);
        return;
      }

      showMessage('Éxito', result?.mensaje || 'Ficha actualizada correctamente', 'success', 2500);
      await verificarFicha(dataSetForm.id, token);
    } catch (error) {
      console.error('Error al actualizar la ficha de insumos:', error);
      showMessage('Error', 'Error al actualizar la ficha de insumos', 'error', 4000);
    } finally {
      setLoading(false);
    }
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
    console.log(JSON.stringify(result,null,2))
    setDataSetForm(result.data);
    const type=result.data? 'success': 'info';
    const title=result.data? 'Éxito': 'Información';
    showMessage(title, result.mensaje, type, 2000);
    if (result.data) {
      setHospitalFound(true);
      // Verificar si tiene ficha
      await verificarFicha(result.data.id, token);
    }
    setSearching(false);
    setLoading(false);
    
  };

  const verificarFicha = async (hospitalId, token) => {
    try {
      const result = await getFichaHospitalById(hospitalId, token);
      console.log('Resultado de verificar ficha:', JSON.stringify(result, null, 2));

      const fichaData = Array.isArray(result?.data?.data)
        ? result.data.data
        : (Array.isArray(result?.data) ? result.data : []);

      if (result?.status && fichaData.length > 0) {
        setTieneFicha(true);
        setInsumosFicha(fichaData);
        setInsumosFichaOriginal(fichaData);
      } else {
        setTieneFicha(false);
        setInsumosFicha([]);
        setInsumosFichaOriginal([]);
      }
    } catch (error) {
      console.error('Error al verificar ficha:', error);
      setTieneFicha(false);
      setInsumosFicha([]);
      setInsumosFichaOriginal([]);
    }
  };

  const handleActualizarFicha = () => {
    if (!hospitalFound || !dataSetForm?.id) {
      showMessage('Error', 'Primero debe buscar un hospital', 'error', 4000);
      return;
    }

    setConfirm({
      isOpen: true,
      title: 'Sincronizar ficha',
      message: `¿Desea sincronizar la ficha de insumos del hospital "${dataSetForm?.nombre}"?`,
      confirmText: 'Sincronizar',
      onConfirm: async () => {
        setConfirm(prev => ({ ...prev, isOpen: false }));
        const { token } = user;
        setActualizandoFicha(true);
        try {
          console.log('Actualizando ficha del hospital:', JSON.stringify(dataSetForm, null, 2));
          const result = await putActualizarFichaHospital(dataSetForm.id, token);
          console.log('Resultado de actualizar ficha:', JSON.stringify(result, null, 2));
          if (!result?.status) {
            if (result?.autenticacion === 1 || result?.autenticacion === 2) {
              showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
              logout();
              router.replace('/');
              return;
            }
            showMessage('Error', result?.mensaje || 'Error al actualizar la ficha', 'error', 4000);
            return;
          }
          
          showMessage('Éxito', result?.mensaje || 'Ficha actualizada correctamente', 'success', 3000);
          await verificarFicha(dataSetForm.id, token);
        } catch (error) {
          console.error('Error al actualizar ficha:', error);
          showMessage('Error', 'Error al actualizar la ficha de insumos', 'error', 4000);
        } finally {
          setActualizandoFicha(false);
        }
      }
    });
  };

  const handleGenerarFicha = async () => {
    const {token} = user;
    setGenerandoFicha(true);
    try {
      const result = await postGenerarFicha(dataSetForm.id, token);
      console.log("Resultado generar ficha: "+JSON.stringify(result, null, 2));
      if (!result.status) {
        if(result.autenticacion==1||result.autenticacion==2){
          showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
          logout();
          router.replace('/');
          return;
        }
        showMessage('Error', result.mensaje || 'Error al generar ficha', 'error', 4000);
        return;
      }
      showMessage('Éxito', result.mensaje || 'Ficha generada correctamente', 'success', 3000);
      // Recargar la ficha
      await verificarFicha(dataSetForm.id, token);
    } catch (error) {
      console.error('Error al generar ficha:', error);
      showMessage('Error', 'Error al generar ficha de insumos', 'error', 4000);
    } finally {
      setGenerandoFicha(false);
    }
  };

  const handleEliminarFicha = () => {
    setConfirm({
      isOpen: true,
      title: 'Eliminar ficha',
      message: `¿Desea eliminar la ficha de insumos asociada al hospital "${dataSetForm?.nombre}"?`,
      confirmText: 'Eliminar',
      onConfirm: async () => {
        setConfirm(prev => ({ ...prev, isOpen: false }));
        const { token } = user;
        setIsDeletingFicha(true);
        try {
          const result = await deleteFichaHospital(dataSetForm.id, token);
          if (!result?.status) {
            if (result?.autenticacion === 1 || result?.autenticacion === 2) {
              showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
              logout();
              router.replace('/');
              return;
            }
            showMessage('Error', result?.mensaje || 'Error al eliminar la ficha de insumos', 'error', 4000);
            return;
          }
          showMessage('Éxito', result?.mensaje || 'Ficha eliminada correctamente', 'success', 3000);
          setTieneFicha(false);
          setInsumosFicha([]);
        } catch (error) {
          console.error('Error al eliminar ficha:', error);
          showMessage('Error', 'Error al eliminar la ficha de insumos', 'error', 4000);
        } finally {
          setIsDeletingFicha(false);
        }
      }
    });
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
    setTieneFicha(false);
    setInsumosFicha([]);
    setInsumosSearchTerm('');
  };

  const filteredInsumosFicha = insumosFicha.filter((item) => {
    const term = String(insumosSearchTerm || '').toLowerCase().trim();
    if (!term) return true;
    const codigo = String(item?.insumo?.codigo || item?.codigo || '').toLowerCase();
    const nombre = String(item?.insumo?.nombre || item?.nombre || '').toLowerCase();
    const descripcion = String(item?.insumo?.descripcion || item?.descripcion || '').toLowerCase();
    return codigo.includes(term) || nombre.includes(term) || descripcion.includes(term);
  });

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
        <ConfirmModal
          isOpen={confirm.isOpen}
          title={confirm.title}
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(prev => ({ ...prev, isOpen: false }))}
          confirmText={confirm.confirmText}
          cancelText="Cancelar"
          loading={isDeletingFicha || actualizandoFicha}
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
                  Actualizar ficha
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
                  {!tieneFicha ? (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Insumos del Hospital</h3>
                      </div>
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500 mb-4">Este hospital no tiene una ficha de insumos asignada</p>
                        <button
                          type="button"
                          onClick={handleGenerarFicha}
                          disabled={generandoFicha}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {generandoFicha ? (
                            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                          ) : (
                            <FileText className="-ml-1 mr-2 h-4 w-4" />
                          )}
                          Generar Ficha de Insumos
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Insumos del Hospital</h3>
                        <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={handleActualizarFicha}
                            disabled={actualizandoFicha}
                            className="inline-flex w-full sm:w-auto justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                          >
                            {actualizandoFicha ? (
                              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                            ) : null}
                            {actualizandoFicha ? 'Sincronizando...' : 'Sincronizar Ficha'}
                          </button>
                          <button
                            type="button"
                            onClick={handleEliminarFicha}
                            disabled={isDeletingFicha}
                            className="inline-flex w-full sm:w-auto justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                          >
                            {isDeletingFicha ? (
                              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                            ) : null}
                            {isDeletingFicha ? 'Eliminando...' : 'Eliminar Ficha'}
                          </button>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            value={insumosSearchTerm}
                            onChange={(e) => setInsumosSearchTerm(e.target.value)}
                            placeholder="Buscar por código, nombre o descripción"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {filteredInsumosFicha.length > 0 ? (
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                          <ul className="divide-y divide-gray-200">
                            {filteredInsumosFicha.map((item) => (
                              <li key={item?.id ?? item?.insumo_id ?? item?.insumo?.id ?? item?.codigo ?? JSON.stringify(item)}>
                                <div className="px-4 py-4 flex items-center justify-between">
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {item?.insumo?.nombre || item?.nombre}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">Código: {item?.insumo?.codigo || item?.codigo}</p>
                                    <p className="text-xs text-gray-500">Cantidad: {item?.cantidad ?? 0}</p>
                                  </div>

                                  <div className="ml-4 flex items-center gap-4">
                                    <label className="inline-flex items-center">
                                      <input
                                        type="checkbox"
                                        checked={Boolean(item?.status)}
                                        onChange={(e) => {
                                          const checked = e.target.checked;
                                          setInsumosFicha(prev => prev.map(i => (
                                            i.id === item.id ? { ...i, status: checked } : i
                                          )));
                                        }}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                      />
                                    </label>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                          <p className="text-gray-500">No hay insumos en la ficha</p>
                        </div>
                      )}
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