'use client';

import { useState } from 'react';
import { Plus, Upload, Save, X, CheckCircle, AlertCircle, Package, Calendar, Hash, DollarSign, Info, Search, ArrowLeft } from 'lucide-react';
import ClientInsumoForm from './clientInsumoForm';
import { getInsumoById } from '@/servicios/insumos/get';
import Modal from '@/components/Modal';
import MovimientoInsumoCliente from './MovimientoInsumoCliente';

const Registro = () => {
  const [selectedOption, setSelectedOption] = useState(null); // null, 'entrada', 'salida'
  const [showForm, setShowForm] = useState(false);
  const [showMovimiento, setShowMovimiento] = useState(false);
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
    set (result.data);
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

  const handleSelectOption = (option) => {
    setSelectedOption(option);
    setShowForm(false);
    setShowMovimiento(false);
    
    if (option === 'salida') {
      setShowMovimiento(true);
    } else if (option === 'entrada') {
      setShowForm(true);
    }
  };

  const handleBack = () => {
    setSelectedOption(null);
    setShowForm(false);
    setShowMovimiento(false);
  };

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
        {!selectedOption ? (
          // Pantalla de selección principal
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Gestión de Inventario</h2>
              <p className="text-gray-300">Selecciona el tipo de operación que deseas realizar</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Opción Salida - Priorizada */}
              <div 
                onClick={() => handleSelectOption('salida')}
                className="group relative bg-gradient-to-br from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 border border-red-500/30 hover:border-red-500/50 rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-2xl flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                    <Upload className="h-8 w-8 text-red-400 group-hover:text-red-300" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-100">
                    Salida de Inventario
                  </h3>
                  
                  <p className="text-gray-300 group-hover:text-gray-200 mb-4">
                    Registra despachos y salidas de insumos hacia otras sedes
                  </p>
                  
                  <div className="space-y-2 text-sm text-gray-400 group-hover:text-gray-300">
                    <div className="flex items-center justify-center gap-2">
                      <Package className="h-4 w-4" />
                      <span>Despacho entre sedes</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Control por lotes</span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors">
                      <span className="font-medium">Comenzar</span>
                      <ArrowLeft className="h-4 w-4 rotate-180" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Opción Entrada */}
              <div 
                onClick={() => handleSelectOption('entrada')}
                className="group relative bg-gradient-to-br from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-500/30 hover:border-green-500/50 rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-2xl flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                    <Plus className="h-8 w-8 text-green-400 group-hover:text-green-300" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-100">
                    Entrada de Inventario
                  </h3>
                  
                  <p className="text-gray-300 group-hover:text-gray-200 mb-4">
                    Registra nuevos insumos que ingresan al almacén
                  </p>
                  
                  <div className="space-y-2 text-sm text-gray-400 group-hover:text-gray-300">
                    <div className="flex items-center justify-center gap-2">
                      <Package className="h-4 w-4" />
                      <span>Nuevos insumos</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Control de fechas</span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors">
                      <span className="font-medium">Comenzar</span>
                      <ArrowLeft className="h-4 w-4 rotate-180" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Contenido específico según la selección
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </button>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {selectedOption === 'entrada' ? 'Registro de Entrada' : 'Registro de Salida'}
                  </h2>
                  <p className="text-sm text-gray-300">
                    {selectedOption === 'entrada' 
                      ? 'Registra la entrada de nuevos artículos al inventario' 
                      : 'Registra la salida de artículos del inventario'}
                  </p>
                </div>
              </div>
            </div>

            {/* Contenido específico */}
            {selectedOption === 'salida' && showMovimiento && (
              <MovimientoInsumoCliente onBack={handleBack} />
            )}

            {selectedOption === 'entrada' && showForm && (
              <div>
                {insumoFound ? (
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
                    activeTab="entrada"
                  />
                ) : (
                  <div className="flex items-center">
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
                )}

                {showForm && (
                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md shadow-sm transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow-sm transition-colors"
                    >
                      Registrar Entrada
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Registro;
