'use client';

import { useState } from 'react';
import { Plus, Upload, Save, X, CheckCircle, AlertCircle, Package, Calendar, Hash, DollarSign, Info, Search } from 'lucide-react';
import ClientInsumoForm from './clientInsumoForm';
import { getInsumoById } from '@/servicios/insumos/get';
import Modal from '@/components/Modal';

const Registro = () => {
  const [activeTab, setActiveTab] = useState('entrada');
  const [showForm, setShowForm] = useState(false);
    const [regInsumo, setRegInsumo] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [insumoFound, setInsumoFound] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'entrada',
    codigo: '',
    nombre: '',
    tipo: '',
    medida: '',
    cantidadPorPaquete: '',
    descripcion: '',
  });
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info', // 'info', 'error', 'success', 'warning'
    time: null
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const searchInsumo = async () => {
    console.log("id: "+searchQuery);
    // Lógica de búsqueda aquí
    const result = await getInsumoById(searchQuery);
    console.log("Result: "+JSON.stringify(result,null,2));
    if (!result.success) {
      setModal({isOpen: true, title: 'Error', message: result.message, type: 'error', time: 4000});
      return;
    }
    setModal({isOpen: true, title: 'Success', message: result.message, type: 'success', time: 4000});
    setRegInsumo(result.data);
  }

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  // Estado y lógica para el formulario de nuevo insumo
  const [newInsumoFormData, setNewInsumoFormData] = useState({
    codigo: '',
    nombre: '',
    tipo: '',
    medida: '',
    cantidadPorPaquete: '',
    descripcion: '',
  });

  const [newInsumoErrors, setNewInsumoErrors] = useState({});

  const insumoTipos = [
    { id: 1, nombre: 'medicamento' },
    { id: 2, nombre: 'material de curacion' },
    { id: 3, nombre: 'equipo medico' },
    { id: 4, nombre: 'otro' },
  ];

  const insumoMedida = [
    { id: 1, nombre: 'unidad' },
    { id: 2, nombre: 'caja' },
    { id: 3, nombre: 'paquete' },
    { id: 4, nombre: 'kit' },
  ];

  const showCantidadPorPaquete = newInsumoFormData.medida === 'caja' || newInsumoFormData.medida === 'paquete';

  const handleNewInsumoChange = (e) => {
    const { name, value } = e.target;
    setNewInsumoFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewInsumoSubmit = (e) => {
    e.preventDefault();
    // Lógica de validación y envío aquí
    console.log('Datos del nuevo insumo:', newInsumoFormData);
    // Resetear formulario o cerrar modal después de enviar
  };

  const articulosSugeridos = [
    'Paracetamol 500mg',
    'Ibuprofeno 400mg',
    'Amoxicilina 500mg',
    'Jeringa 5ml',
    'Guantes de látex Talla M',
    'Mascarilla quirúrgica',
    'Gasas estériles 10x10cm',
    'Alcohol etílico 70%'
  ];

  return (
    <>
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        time={modal.time}
      />
      <div className="space-y-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">
                {activeTab === 'entrada' ? 'Registro de Entrada' : 'Registro de Salida'}
              </h2>
              <p className="text-sm text-gray-300">
                {activeTab === 'entrada' 
                  ? 'Registra la entrada de nuevos artículos al inventario' 
                  : 'Registra la salida de artículos del inventario'}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  type="button"
                  onClick={() => setActiveTab('entrada')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                    activeTab === 'entrada'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  Entrada
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('salida')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                    activeTab === 'salida'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  Salida
                </button>
              </div>
            </div>
          </div>

          {!showForm ? (
            <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-200">
                {activeTab === 'entrada' 
                  ? 'Registrar nueva entrada de inventario' 
                  : 'Registrar nueva salida de inventario'}
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                {activeTab === 'entrada' 
                  ? 'Comienza registrando los artículos que ingresan al almacén.'
                  : 'Registra los artículos que salen del almacén.'}
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  {activeTab === 'entrada' ? 'Nueva Entrada' : 'Nueva Salida'}
                </button>
              </div>
            </div>
          ) : (
            <div>
            {regInsumo
              ? (
                <ClientInsumoForm 
                  id="clientInsumoForm"
                  handleNewInsumoSubmit={handleNewInsumoSubmit}
                  handleNewInsumoChange={handleNewInsumoChange}
                  newInsumoFormData={newInsumoFormData}
                  newInsumoErrors={newInsumoErrors}
                  showCantidadPorPaquete={showCantidadPorPaquete}
                  insumoTipos={insumoTipos}
                  insumoMedida={insumoMedida}
                  setShowForm={setShowForm}
                  activeTab={activeTab}
                />
              )
              :<div className="flex items-center">
                <div className="relative w-full">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-white/40" aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar insumo por código o nombre"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full rounded-md border-0 bg-white/5 py-1.5 pl-10 pr-3 text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                  />
                </div>
                <button
                  type="button"
                  onClick={(e) => searchInsumo(e)}
                  className="ml-2 bg-indigo-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  buscar
                </button>
              </div>
            }
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className=" bg-indigo-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className=" bg-indigo-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {activeTab === 'entrada' ? 'Registrar Entrada' : 'Registrar Salida'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Registro;
