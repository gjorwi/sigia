'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Search, Save, PackageSearch } from 'lucide-react';
import Modal from '@/components/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { getInsumoByCodigo } from '@/servicios/insumos/get';
import { deleteInsumo } from '@/servicios/insumos/delete';

export default function EliminarInsumo() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    time: null
  });

  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [insumoFound, setInsumoFound] = useState(false);
  const [dataSetForm, setDataSetForm] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const showMessage = (title, message, type = 'info', time = null) => {
    setModal({ isOpen: true, title, message, type, time });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const clearSearch = () => {
    setSearchTerm('');
    setDataSetForm(null);
    setInsumoFound(false);
    setConfirmDelete('');
  };

  const requiredText = dataSetForm?.codigo ? `ELIMINAR ${String(dataSetForm.codigo).trim()}` : '';
  const canDelete = confirmDelete.trim().toUpperCase() === requiredText;

  const handleSearch = async (e) => {
    e?.preventDefault();
    const codigo = String(searchTerm || '').trim();
    if (!codigo) {
      showMessage('Error', 'Por favor ingrese un código de insumo', 'error', 4000);
      return;
    }

    setSearching(true);
    setInsumoFound(false);
    setDataSetForm(null);
    setConfirmDelete('');

    try {
      const { token } = user;
      const result = await getInsumoByCodigo(codigo, token);

      if (!result?.status) {
        if (result?.autenticacion === 1 || result?.autenticacion === 2) {
          showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
          logout();
          router.replace('/');
          return;
        }
        showMessage('Error', result?.mensaje || 'No se pudo obtener el insumo', 'error', 4000);
        return;
      }

      const insumo = result?.data;
      setDataSetForm(insumo || null);
      if (insumo) {
        setInsumoFound(true);
        showMessage('Éxito', result?.mensaje || 'Insumo encontrado', 'success', 2000);
      } else {
        showMessage('Info', result?.mensaje || 'No se encontró el insumo', 'info', 3000);
      }
    } catch (error) {
      console.error('Error buscando insumo:', error);
      showMessage('Error', 'Error al buscar el insumo', 'error', 4000);
    } finally {
      setSearching(false);
    }
  };

  const handleDelete = async () => {
    if (!insumoFound || !dataSetForm) return;
    if (!canDelete) {
      showMessage('Error', 'Ingrese el texto correcto para confirmar la eliminación', 'error', 4000);
      return;
    }

    setIsDeleting(true);
    try {
      const { token } = user;
      const result = await deleteInsumo(dataSetForm, token);

      if (!result?.status) {
        if (result?.autenticacion === 1 || result?.autenticacion === 2) {
          showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
          logout();
          router.replace('/');
          return;
        }
        showMessage('Error', result?.mensaje || 'No se pudo eliminar el insumo', 'error', 4000);
        return;
      }

      showMessage('Éxito', result?.mensaje || 'Insumo eliminado correctamente', 'success', 2500);
      clearSearch();
    } catch (error) {
      console.error('Error eliminando insumo:', error);
      showMessage('Error', 'Error al eliminar el insumo', 'error', 4000);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="md:pl-64 flex flex-col">
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
                    onClick={() => router.replace('/administrador/insumos')}
                    className="mr-3 text-gray-500 hover:text-gray-700"
                  >
                    <ArrowLeft className="h-6 w-6 inline" />
                  </button>
                  Eliminar Insumo
                </h2>
              </div>

              <div className="mt-4 flex md:mt-0 md:ml-4">
                <button
                  type="button"
                  onClick={() => router.push('/administrador/insumos')}
                  className="ml-3 inline-flex items-center px-5 py-2.5 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting || !canDelete}
                  className={`ml-3 inline-flex items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${isDeleting || !canDelete ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out`}
                >
                  {isDeleting ? (
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  ) : (
                    <Save className="-ml-1 mr-2 h-5 w-5" />
                  )}
                  Eliminar
                </button>
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  <PackageSearch className="h-5 w-5 inline-block mr-2 text-blue-500" />
                  {insumoFound ? 'Eliminar Insumo' : 'Buscar Insumo'}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {insumoFound
                    ? 'Revise los datos y confirme la eliminación.'
                    : 'Ingrese el código del insumo para buscarlo.'}
                </p>

                <div className="mt-4">
                  <form onSubmit={handleSearch} className="flex space-x-2 text-gray-700">
                    <div className="flex-1">
                      <label htmlFor="codigo" className="sr-only">Código</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="text"
                          id="codigo"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Ingrese el código"
                          className="block w-full px-4 py-2 text-base border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm placeholder-gray-400"
                          disabled={searching || insumoFound}
                        />
                      </div>
                    </div>

                    {!insumoFound ? (
                      <button
                        type="submit"
                        disabled={searching || !String(searchTerm || '').trim()}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${searching || !String(searchTerm || '').trim() ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
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
                        Nueva búsqueda
                      </button>
                    )}
                  </form>
                </div>
              </div>

              {insumoFound && dataSetForm && (
                <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Insumo</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Revise la información del insumo.</p>
                  </div>
                  <div className="border-t border-gray-200">
                    <dl>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Código</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{dataSetForm?.codigo}</dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{dataSetForm?.nombre}</dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Descripción</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{dataSetForm?.descripcion}</dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Unidad de medida</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{dataSetForm?.unidad_medida}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="border-t border-red-300 bg-red-50 px-4 py-6 sm:p-0 rounded-b-lg">
                    <dl className="sm:divide-y sm:divide-gray-200">
                      <div className="py-6 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-md font-extrabold text-red-700">
                          ¡Atención! Esta acción eliminará el insumo de forma permanente.
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <p>Ingrese exactamente: <span className="font-semibold">{requiredText}</span></p>
                          <input
                            type="text"
                            value={confirmDelete}
                            placeholder={requiredText || 'ELIMINAR CODIGO'}
                            onChange={(e) => setConfirmDelete(e.target.value)}
                            className="w-full bg-red-100 border-2 px-3 py-2 border-red-500 text-red-700 placeholder-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}