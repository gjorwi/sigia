'use client';

import { useState } from 'react';
import { Plus, Upload, Save, X, CheckCircle, AlertCircle, Package, Calendar, Hash, DollarSign, Info } from 'lucide-react';

const Registro = () => {
  const [activeTab, setActiveTab] = useState('entrada');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'entrada',
    fecha: new Date().toISOString().split('T')[0],
    referencia: '',
    proveedor: '',
    observaciones: '',
    items: [{ id: Date.now(), articulo: '', cantidad: 1, lote: '', fechaVencimiento: '', precio: '' }]
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleItemChange = (id, field, value) => {
    const updatedItems = formData.items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setFormData({ ...formData, items: updatedItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { id: Date.now() + Math.random(), articulo: '', cantidad: 1, lote: '', fechaVencimiento: '', precio: '' }
      ]
    });
  };

  const removeItem = (id) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter(item => item.id !== id);
      setFormData({ ...formData, items: updatedItems });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Validación básica
    if (!formData.referencia) {
      setError('La referencia es obligatoria');
      return;
    }
    
    if (formData.items.some(item => !item.articulo || !item.cantidad)) {
      setError('Todos los artículos deben tener al menos un nombre y una cantidad');
      return;
    }

    // Aquí iría la lógica para enviar los datos al servidor
    console.log('Datos del formulario:', formData);
    
    // Simular envío exitoso
    setSubmitted(true);
    setTimeout(() => {
      setShowForm(false);
      setSubmitted(false);
      // Resetear formulario
      setFormData({
        tipo: 'entrada',
        fecha: new Date().toISOString().split('T')[0],
        referencia: '',
        proveedor: '',
        observaciones: '',
        items: [{ id: Date.now(), articulo: '', cantidad: 1, lote: '', fechaVencimiento: '', precio: '' }]
      });
    }, 2000);
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {submitted ? (
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">¡Registro exitoso!</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        {activeTab === 'entrada' 
                          ? 'La entrada de inventario ha sido registrada correctamente.'
                          : 'La salida de inventario ha sido registrada correctamente.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="fecha" className="block text-sm font-medium text-gray-300 mb-1">
                      Fecha
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        name="fecha"
                        id="fecha"
                        value={formData.fecha}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="referencia" className="block text-sm font-medium text-gray-300 mb-1">
                      Referencia / N° de Documento
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Hash className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="referencia"
                        id="referencia"
                        value={formData.referencia}
                        onChange={handleInputChange}
                        placeholder="Ej: FACT-001-001-0001234"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="proveedor" className="block text-sm font-medium text-gray-300 mb-1">
                      {activeTab === 'entrada' ? 'Proveedor / Origen' : 'Destino / Responsable'}
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Package className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="proveedor"
                        id="proveedor"
                        value={formData.proveedor}
                        onChange={handleInputChange}
                        placeholder={activeTab === 'entrada' ? 'Nombre del proveedor' : 'Nombre del responsable'}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="observaciones" className="block text-sm font-medium text-gray-300 mb-1">
                      Observaciones
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 pt-2">
                        <Info className="h-5 w-5 text-gray-400" />
                      </div>
                      <textarea
                        name="observaciones"
                        id="observaciones"
                        rows={2}
                        value={formData.observaciones}
                        onChange={handleInputChange}
                        placeholder="Notas adicionales sobre este registro"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white">Artículos</h3>
                    <button
                      type="button"
                      onClick={addItem}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Agregar Artículo
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.items.map((item, index) => (
                      <div key={item.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-sm font-medium text-white">Artículo {index + 1}</h4>
                          {formData.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-gray-400 hover:text-red-400"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                          <div className="lg:col-span-2">
                            <label className="block text-xs font-medium text-gray-400 mb-1">
                              Nombre del artículo
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={item.articulo}
                                onChange={(e) => handleItemChange(item.id, 'articulo', e.target.value)}
                                className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Ej: Paracetamol 500mg"
                                list="articulos-sugeridos"
                              />
                              <datalist id="articulos-sugeridos">
                                {articulosSugeridos.map((articulo, i) => (
                                  <option key={i} value={articulo} />
                                ))}
                              </datalist>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">
                              Cantidad
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={item.cantidad}
                              onChange={(e) => handleItemChange(item.id, 'cantidad', parseInt(e.target.value) || 0)}
                              className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">
                              Lote
                            </label>
                            <input
                              type="text"
                              value={item.lote}
                              onChange={(e) => handleItemChange(item.id, 'lote', e.target.value)}
                              className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              placeholder="N° de lote"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">
                              Fecha Venc.
                            </label>
                            <input
                              type="date"
                              value={item.fechaVencimiento}
                              onChange={(e) => handleItemChange(item.id, 'fechaVencimiento', e.target.value)}
                              className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        
                        
                      </div>
                    ))}
                  </div>
                </div>

                {/* {activeTab === 'entrada' && (
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-300">Total:</span>
                      <span className="text-xl font-bold text-white">
                        $
                        {formData.items
                          .reduce((sum, item) => sum + (item.cantidad * (parseFloat(item.precio) || 0)), 0)
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>
                )} */}

                <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-200 bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Guardar {activeTab === 'entrada' ? 'Entrada' : 'Salida'}
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default Registro;
