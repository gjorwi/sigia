'use client';

import { createPortal } from 'react-dom';
import { User, Calendar, FileText, MapPin, Phone, CreditCard, Hospital, Package, X, Clock } from 'lucide-react';

const ModalDetallesPaciente = ({ isOpen, despacho, onClose, formatDate }) => {

  if (!isOpen || typeof document === 'undefined') return null;

  const getEstadoBadge = (estado) => {
    const estados = {
      'despachado': { color: 'bg-green-100 text-green-800', text: 'Despachado' },
      'pendiente': { color: 'bg-yellow-100 text-yellow-800', text: 'Pendiente' },
      'entregado': { color: 'bg-blue-100 text-blue-800', text: 'Entregado' },
      'cancelado': { color: 'bg-red-100 text-red-800', text: 'Cancelado' }
    };
    
    const estadoInfo = estados[estado] || { color: 'bg-gray-100 text-gray-800', text: estado };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoInfo.color}`}>
        {estadoInfo.text}
      </span>
    );
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full  overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Despacho a Paciente
              </h2>
              <p className="text-sm text-gray-600">
                Código: {despacho?.codigo_despacho || 'N/A'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Información del Paciente */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 text-blue-600 mr-2" />
              Información del Paciente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nombre Completo</label>
                  <p className="text-gray-900 font-medium">
                    {despacho?.paciente_nombres} {despacho?.paciente_apellidos}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Cédula</label>
                  <p className="text-gray-900 flex items-center">
                    <CreditCard className="h-4 w-4 text-gray-500 mr-2" />
                    {despacho?.paciente_cedula || 'No especificada'}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Teléfono</label>
                  <p className="text-gray-900 flex items-center">
                    <Phone className="h-4 w-4 text-gray-500 mr-2" />
                    {despacho?.paciente_telefono || 'No especificado'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Dirección</label>
                  <p className="text-gray-900 flex items-center">
                    <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                    {despacho?.paciente_direccion || 'No especificada'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Información Médica */}
          <div className="bg-green-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 text-green-600 mr-2" />
              Información Médica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Médico Tratante</label>
                <p className="text-gray-900">
                  {despacho?.medico_tratante || 'No especificado'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Diagnóstico</label>
                <p className="text-gray-900">
                  {despacho?.diagnostico || 'No especificado'}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Indicaciones Médicas</label>
                <p className="text-gray-900 bg-white p-3 rounded-lg border">
                  {despacho?.indicaciones_medicas || 'No especificadas'}
                </p>
              </div>
            </div>
          </div>

          {/* Información del Despacho */}
          <div className="bg-purple-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="h-5 w-5 text-purple-600 mr-2" />
              Detalles del Despacho
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Fecha de Despacho</label>
                <p className="text-gray-900 flex items-center">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  {formatDate ? formatDate(despacho?.fecha_despacho) : despacho?.fecha_despacho}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Estado</label>
                <div className="mt-1">
                  {getEstadoBadge(despacho?.estado)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Total de Items</label>
                <p className="text-gray-900 font-semibold">
                  {despacho?.cantidad_total_items || 0} items
                </p>
              </div>
              {despacho?.fecha_entrega && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Fecha de Entrega</label>
                  <p className="text-gray-900 flex items-center">
                    <Clock className="h-4 w-4 text-gray-500 mr-2" />
                    {formatDate ? formatDate(despacho?.fecha_entrega) : despacho?.fecha_entrega}
                  </p>
                </div>
              )}
              {despacho?.valor_total && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Valor Total</label>
                  <p className="text-gray-900 font-semibold">
                    ${despacho?.valor_total}
                  </p>
                </div>
              )}
            </div>
            
            {despacho?.observaciones && (
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700">Observaciones</label>
                <p className="text-gray-900 bg-white p-3 rounded-lg border mt-1">
                  {despacho?.observaciones}
                </p>
              </div>
            )}
          </div>

          {/* Información del Hospital y Sede */}
          <div className="bg-orange-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Hospital className="h-5 w-5 text-orange-600 mr-2" />
              Información del Centro de Salud
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Hospital</label>
                <p className="text-gray-900 font-medium">
                  {despacho?.hospital?.nombre || 'No especificado'}
                </p>
                <p className="text-sm text-gray-600">
                  RIF: {despacho?.hospital?.rif || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Sede/Almacén</label>
                <p className="text-gray-900 font-medium">
                  {despacho?.sede?.nombre || 'No especificada'}
                </p>
                <p className="text-sm text-gray-600">
                  Tipo: {despacho?.sede?.tipo_almacen || 'N/A'}
                </p>
              </div>
              {despacho?.hospital?.direccion && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Dirección</label>
                  <p className="text-gray-900 flex items-start">
                    <MapPin className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                    {despacho?.hospital?.direccion}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Información del Usuario */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Usuario Responsable
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Nombre</label>
                <p className="text-gray-900">
                  {despacho?.usuario?.nombre} {despacho?.usuario?.apellido}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Rol</label>
                <p className="text-gray-900 capitalize">
                  {despacho?.usuario?.rol || 'No especificado'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">
                  {despacho?.usuario?.email || 'No especificado'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Fecha de Registro</label>
                <p className="text-gray-900">
                  {formatDate ? formatDate(despacho?.created_at) : despacho?.created_at}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ModalDetallesPaciente;
