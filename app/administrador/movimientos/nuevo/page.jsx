'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Search, UserSearch } from 'lucide-react';
import Modal from '@/components/Modal';
import SelectSedeModal from '@/components/SelectSedeModal';
import { getHospitalById } from '@/servicios/hospitales/get';
import { getSedeByHospitalId } from '@/servicios/sedes/get';
import DespachoForm from '@/components/despachoForm';
import { postMovimiento } from '@/servicios/despachos/post';
import { useAuth } from '@/contexts/AuthContext';
import { getInventario } from '@/servicios/inventario/get';

const initialFormData = {
  hospital_id_desde: '',
  hospital_id_hasta: '',
  sede_id: '',
  sede_nombre: '',
  tipo_movimiento: 'despacho',
  fecha_despacho: '',
  insumos: [],
  observaciones: '',
};

export default function NuevoDespacho() {
  const router = useRouter();
  const {user, logout} = useAuth();
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchError, setSearchError] = useState('');
  const [dataSetForm, setDataSetForm] = useState(initialFormData);
  const [allInsumos, setAllInsumos] = useState([]);
  const [hospitalFound, setHospitalFound] = useState(false);
  const [sedes, setSedes] = useState([]);
  const [showSedeModal, setShowSedeModal] = useState(false);
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
  useEffect(() => {
    handleGetInsumos();

  }, []);

  const handleGetInsumos = async () => {
    const { token,sede_id } = user;
    const result = await getInventario(token,sede_id);
    if (!result.status) {
      if(result.autenticacion==1||result.autenticacion==2){
        showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
        logout();
        router.replace('/');
        return;
      }
      showMessage('Error', result.mensaje, 'error', 4000);
      return;
    }
    if(result.data && Array.isArray(result.data)){
      // Transformamos los datos del inventario para que sean compatibles con ModalInsumoOne
      // y mantengan la información de lotes disponibles
      const insumosConLotes = result.data.map(item => ({
        id: item.id || item.insumo_id,
        nombre: item?.insumo?.nombre,
        codigo: item.codigo || item.insumo?.codigo,
        cantidad_total: item.cantidad_total,
        // Mantenemos la información completa del inventario
        inventario: item,
        // Si hay lotes específicos, los incluimos
        lotes: item.lotes || []
      }));
      setAllInsumos(insumosConLotes);
    }
  };  

  const handleSelectSede = (sede) => {
    console.log('sede: ' + JSON.stringify(sede,null,2));
    setDataSetForm(prev => ({
      ...prev,
      sede_id: sede?.id ?? '',
      sede_tipo: sede?.tipo_almacen ?? '',
      hospital_id_hasta: sede?.id,
      sede_nombre: sede?.nombre ?? ''
    }));
    setShowSedeModal(false);
  };

  const handleOpenSedeModal = () => {
    if (!hospitalFound || !dataSetForm.hospital_id) {
      showMessage('Advertencia', 'Debe seleccionar un hospital antes de elegir una sede', 'warning', 3000);
      return;
    }
    if (!sedes || sedes.length === 0) {
      showMessage('Advertencia', 'El hospital seleccionado no tiene sedes disponibles', 'warning', 3000);
      return;
    }
    setShowSedeModal(true);
  };

  const fetchHospitalSedes = async (hospitalId) => {
    const { token } = user;
    const response = await getSedeByHospitalId(hospitalId, token);
    if (!response.status) {
      if (response.autenticacion === 1 || response.autenticacion === 2) {
        showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
        logout();
        router.replace('/');
        return;
      }
      showMessage('Error', response.mensaje || 'No fue posible obtener las sedes', 'error', 4000);
      return;
    }
    const sedesList = Array.isArray(response.data?.data)
      ? response.data.data
      : Array.isArray(response.data)
        ? response.data
        : [];
    console.log('sedesList: ' + JSON.stringify(sedesList,null,2));
    if (!sedesList.length) {
      setDataSetForm(prev => ({ ...prev, sede_id: '', sede_nombre: '' }));
      showMessage('Advertencia', 'El hospital seleccionado no tiene sedes disponibles', 'warning', 3000);
      return;
    }
    const sedeSelected = sedesList.filter(sede => sede.tipo_almacen === 'almacenPrin');
    setSedes(sedeSelected);
  };

  const handleSubmit = async (formData) => {
    if (!hospitalFound) {
      setSearchError('Por favor busque un hospital primero');
      return;
    }
    console.log('formData: ' + JSON.stringify(formData,null,2));
    const { token } = user;
    const { hospital_id_desde, hospital_id_hasta, sede_id,sede_tipo, hospital_id, tipo_movimiento, fecha_despacho, insumos, observaciones } = formData;
    const data = {
      origen_almacen_id: hospital_id_desde,
      destino_almacen_tipo: sede_tipo,
      hospital_id: hospital_id,
      sede_id: sede_id,
      tipo_movimiento: tipo_movimiento,
      fecha_despacho: fecha_despacho,
      observaciones: observaciones,
      items: insumos.flatMap(item =>
        (item.lotes || []).map(lote => ({
          lote_id: lote.lote_id,
          cantidad: lote.cantidad
        }))
      )
    };
    setLoading(true);
    console.log('formData: ' + JSON.stringify(data,null,2));
    const result = await postMovimiento(data,token);
    if (!result.status) {
      if(result.autenticacion==1||result.autenticacion==2){
        showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
        logout();
        router.replace('/');
        return;
      }
      showMessage('Error', result.mensaje, 'error', 4000);
      setLoading(false);
      return;
    }
    showMessage('Éxito', result.mensaje, 'success', 2000);
    setLoading(false);
    // clearSearch();
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    const { token,hospital_id,sede_id,hospital } = user;
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
      showMessage('Error', !result.status?result.mensaje:'Error en la solicitud', 'error', 4000);
      setDataSetForm(initialFormData);
      setLoading(false);
      setSearching(false);
      return;
    }
    console.log('result.data: ' + JSON.stringify(result.data,null,2));
    setDataSetForm(prev => ({
      ...prev,
      hospital: result.data,
      hospital_id_desde: sede_id,
      hospital_nombre_desde: hospital?.nombre,
      hospital_id: result?.data?.id,
      sede_id: '',
      sede_nombre: ''
    }));
    setSedes([]);
    const type=result.data? 'success': 'info';
    showMessage('Info', result.mensaje, type, 2000);
    if (result.data) {
      setHospitalFound(true);
      await fetchHospitalSedes(result.data.id);
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
    setSedes([]);
    setShowSedeModal(false);
  };

  return (
    <>
      <SelectSedeModal
        isOpen={showSedeModal}
        onClose={() => setShowSedeModal(false)}
        onSelect={handleSelectSede}
        sedes={sedes}
      />
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
                    onClick={() => router.replace('/administrador/movimientos')} 
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
                  onClick={() => router.push('/administrador/movimientos')}
                  className="ml-3 inline-flex items-center px-5 py-2.5 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="despacho-form"
                  disabled={loading}
                  className="ml-3 inline-flex items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                >
                  {loading ? (
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  ) : (
                    <Save className="-ml-1 mr-2 h-5 w-5" />
                  )}
                  Despachar
                </button>
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  <UserSearch className="h-5 w-5 inline-block mr-2 text-blue-500" />
                  {hospitalFound ? 'Nuevo Despacho' : 'Buscar Hospital'}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {hospitalFound 
                    ? 'Gestione los insumos a despachar.'
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
                <div className=" bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Despacho
                    </h3>
                    <div className='grid grid-cols-2'>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Hospital: {dataSetForm?.hospital?.nombre}
                      </p>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500 uppercase">
                        Rif: {dataSetForm?.hospital?.rif}
                      </p>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Telefono: {dataSetForm?.hospital?.telefono}
                      </p>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Email: {dataSetForm?.hospital?.email}
                      </p>
                    </div>
                  </div>
                  <DespachoForm 
                    id="despacho-form" 
                    onSubmit={handleSubmit} 
                    loading={loading}
                    formData={dataSetForm}
                    onFormDataChange={setDataSetForm}
                    insumos={allInsumos}
                    onOpenSedeModal={handleOpenSedeModal}
                  />
                </div>
              )}
              {/* {hospitalFound && (
                <HospitalForm 
                  id="hospital-form" 
                  onSubmit={handleSubmit} 
                  loading={loading}
                  formData={dataSetForm}
                  onFormDataChange={setDataSetForm}
                />
              )} */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}