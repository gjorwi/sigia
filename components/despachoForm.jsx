'use client';
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Package } from 'lucide-react';
import { X } from 'lucide-react';
import InsumoSelectionModalOne from './modalInsumoOne';

export default function DespachoForm({ onSubmit, insumos, id, formData, onFormDataChange, onOpenSedeModal }) {
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('handleSubmit: ' + JSON.stringify(formData,null,2));
      onSubmit(formData);
    }
  };
  useEffect(() => {
    console.log('insumos: ' + JSON.stringify(insumos,null,2));
  }, [insumos]);

  const handleAddInsumo = () => {
    setIsModalOpen(true);
  };

  const handleRemoveInsumo = (id, idx) => {
    const current = Array.isArray(formData.insumos) ? formData.insumos : [];
    const newInsumos = id != null
      ? current.filter((i) => i.id !== id)
      : current.filter((_, i) => i !== idx);
    onFormDataChange({ ...formData, insumos: newInsumos });
  };

  const handleSelectInsumo = (insumoOrList) => {
    const current = Array.isArray(formData.insumos) ? [...formData.insumos] : [];
    const items = Array.isArray(insumoOrList) ? insumoOrList : [insumoOrList];
    const byId = new Map(current.map((i) => [i.id, { ...i }]));
    for (const it of items) {
      const prev = byId.get(it.id);
      // console.log('prev: ' + JSON.stringify(prev,null,2));
      console.log('it: ' + JSON.stringify(it,null,2));
      if (prev) {
        // Actualizar insumo existente
        byId.set(it.id, {
          ...prev,
          id: it.id,
          nombre: it.nombre || it?.inventario?.insumo?.nombre || prev.nombre || 'Insumo',
          cantidad: it.cantidad ?? prev.cantidad ?? 1,
          // Actualizar distribución de lotes si existe
          // distribucion_lotes: it.distribucion_lotes ?? prev.distribucion_lotes ?? [],
          lotes: it.distribucion_lotes ? it.distribucion_lotes.map(lote => ({
            lote_id: lote.lote_id,
            numero_lote: lote.numero_lote,
            cantidad: lote.cantidad,
            fecha_vencimiento: lote.fecha_vencimiento
          })) : (prev.lotes ?? [])
        });
      } else {
        // Nuevo insumo
        const nuevoInsumo = {
          id: it.id,
          nombre: it.nombre || it?.inventario?.insumo?.nombre || 'Insumo',
          cantidad: it.cantidad ?? 1
        };

        // Agregar información de lotes si existe
        if (it.distribucion_lotes && it.distribucion_lotes.length > 0) {
          nuevoInsumo.lotes = it.distribucion_lotes.map(lote => ({
            lote_id: lote.lote_id,
            numero_lote: lote.numero_lote,
            cantidad: lote.cantidad,
            fecha_vencimiento: lote.fecha_vencimiento
          }));
        } else {
          nuevoInsumo.lotes = [];
        }

        byId.set(it.id, nuevoInsumo);
      }
    }
    const newInsumos = Array.from(byId.values());
    console.log('newInsumos: ' + JSON.stringify(newInsumos,null,2));
    onFormDataChange({ ...formData, insumos: newInsumos });
    setIsModalOpen(false);
    setSearchTerm('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.hospital_id_desde) newErrors.hospital_id_desde = 'Origen no seleccionado';
    if (!formData.hospital_id_hasta) newErrors.hospital_id_hasta = 'Destino no ha sido seleccionado';
    if (!formData.sede_id) newErrors.sede_id = 'Debe seleccionar una sede';
    if (!formData.tipo_movimiento) newErrors.tipo_movimiento = 'Tipo de movimiento no seleccionado';
    if (!formData.fecha_despacho) newErrors.fecha_despacho = 'Fecha de despacho no ha sido seleccionada';
    
    // Validate at least one insumo with quantity > 0
    const hasInsumos = Array.isArray(formData.insumos) &&
      formData.insumos.some((i) => (i.cantidad ?? 0) > 0);
    if (!hasInsumos) newErrors.insumos = 'Debe seleccionar al menos un insumo';
    console.log('newErrors: ' + JSON.stringify(newErrors,null,2));
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <form onSubmit={handleSubmit} id={id} className="">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        {/* Sede */}
        <div className="mb-2">
          <label htmlFor="sede" className="block text-sm font-medium text-gray-700 mb-1">
            Sede Destino
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="sede"
              name="sede"
              value={formData.sede_nombre || ''}
              readOnly
              placeholder="Seleccione una sede"
              className={`mt-1 block w-full pl-3 pr-2 py-2 text-base border ${errors.sede_id ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} text-gray-900 focus:outline-none sm:text-sm rounded-md`}
            />
            <button
              type="button"
              onClick={onOpenSedeModal}
              className="mt-1 inline-flex items-center px-3 py-2 border border-gray-300 text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Seleccionar
            </button>
          </div>
          {errors.sede_id && (
            <p className="mt-1 text-sm text-red-600">{errors.sede_id}</p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fecha de Despacho */}
          <div>
            <label htmlFor="fecha_despacho" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Despacho
            </label>
            <input
              type="date"
              id="fecha_despacho"
              name="fecha_despacho"
              value={formData.fecha_despacho || ''}
              onChange={(e) => onFormDataChange({ ...formData, fecha_despacho: e.target.value })}
              className="mt-1 block pl-3 pr-2 py-2 text-base border border-gray-300 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.fecha_despacho && (
              <p className="mt-1 text-sm text-red-600">{errors.fecha_despacho}</p>
            )}
          </div>
          {/* tipo de movimiento */}
          <div>
            <label htmlFor="tipo_movimiento" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Movimiento
            </label>
            <select
              id="tipo_movimiento"
              name="tipo_movimiento"
              value={formData.tipo_movimiento || ''}
              onChange={(e) => onFormDataChange({ ...formData, tipo_movimiento: e.target.value })}
              className="mt-1 block pl-3 pr-2 py-2 text-base border border-gray-300 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Seleccione...</option>
              <option value="ingreso">Ingreso</option>
              <option value="despacho">Despacho</option>
              <option value="redistribucion">Redistribución</option>
            </select>
            {errors.tipo_movimiento && (
              <p className="mt-1 text-sm text-red-600">{errors.tipo_movimiento}</p>
            )}
          </div>
        </div>
        {/* Insumos */}
        <div>
          <div className="flex justify-between items-center mb-2 mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Insumos a Despachar
            </label>
              {Array.isArray(formData.insumos) && formData.insumos.length > 0 && (
                <div className="relative">
                  <div
                    onClick={(e) => { handleAddInsumo(); }}
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="h-3 w-3 mr-1" /> Agregar Insumo
                  </div>
                </div>
              )}
          </div>
          
          
          {Array.isArray(formData.insumos) && formData.insumos.length > 0 ? (
            <div className="border border-gray-200 rounded-lg bg-white">
              <ul className="divide-y divide-gray-200">
                {formData.insumos.map((item, idx) => (
                  <li key={item.id ?? idx} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{item.nombre ?? 'Insumo'}</div>
                        <div className="text-sm font-semibold text-indigo-600 mt-1">
                          Cantidad total: {item.cantidad} unidades
                        </div>
                        
                        {/* Mostrar distribución de lotes si existe */}
                        {item.lotes && item.lotes.length > 0 && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-md">
                            <h6 className="text-xs font-medium text-blue-900 mb-2">Distribución por lotes:</h6>
                            <div className="space-y-1">
                              {item.lotes.map((lote, loteIdx) => (
                                <div key={loteIdx} className="flex justify-between text-xs text-blue-800">
                                  <span className="font-medium">
                                    {lote.numero_lote ? `Lote ${lote.numero_lote}` : 'Lote General'}
                                  </span>
                                  <span className="font-semibold">{lote.cantidad} unidades</span>
                                  {lote.fecha_vencimiento && (
                                    <span className="text-blue-600">
                                      Vence: {new Date(lote.fecha_vencimiento).toLocaleDateString('es-VE', { timeZone: 'UTC' })}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveInsumo(item.id, idx)}
                        className="ml-4 inline-flex items-center justify-center h-8 w-8 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500"
                        aria-label="Eliminar insumo"
                        title="Eliminar insumo"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-3 text-sm font-medium text-gray-900">No hay insumos agregados</h3>
              <p className="mt-1 text-sm text-gray-500 max-w-xs mx-auto">
                Comience agregando insumos para realizar el despacho
              </p>
              <div className="mt-4 cursor-pointer">
                <div
                  onClick={() => handleAddInsumo()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" /> Agregar primer insumo
                </div>
              </div>
            </div>
          )}
          
          {errors.insumos && (
            <p className="mt-1 text-sm text-red-600">{errors.insumos}</p>
          )}
        </div>

        {/* Observaciones */}
        <div className="mt-2">
          <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-1">
            Observaciones (Opcional)
          </label>
          <textarea
            id="observaciones"
            name="observaciones"
            rows={3}
            value={formData.observaciones || ''}
            onChange={(e) => onFormDataChange({ ...formData, observaciones: e.target.value })}
            className="shadow-sm focus:ring-blue-500 text-gray-700 px-2 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
            placeholder="Notas adicionales sobre el despacho"
          />
        </div>

        {/* Modal para seleccionar Insumo */}
        <InsumoSelectionModalOne
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSearchTerm(''); }}
          onSelectInsumo={handleSelectInsumo}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          insumos={insumos}
        />
      </div>
    </form>
  );
}

