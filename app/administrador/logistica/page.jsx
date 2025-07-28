'use client';

import { useState } from 'react';
import { Truck, MapPin, Clock, CheckCircle, AlertCircle, Search, Package, Eye } from 'lucide-react';

export default function Logistica() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [detalleVisible, setDetalleVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('activos');
  const [showInsumosModal, setShowInsumosModal] = useState(false);
  const [showMapaModal, setShowMapaModal] = useState(false);
  const [insumos, setInsumos] = useState([]);
  const [envioActual, setEnvioActual] = useState(null);
  
  // Datos de ejemplo para seguimientos
  const envios = {
    activos: [
      {
        id: 'ENV-2023-045',
        origen: 'Almacén Central',
        destino: 'Hospital Dr. Rafael Gallardo',
        fechaEnvio: '2023-12-05T08:30:00',
        fechaEstimada: '2023-12-05T14:00:00',
        estado: 'en_transito',
        transportista: 'Logística Rápida S.A.',
        guia: 'GUIA-789456123',
        items: 12,
        ubicacionActual: 'En ruta - A 15km de destino',
        historial: [
          { fecha: '2023-12-05T08:30:00', evento: 'Envío registrado', ubicacion: 'Almacén Central' },
          { fecha: '2023-12-05T09:15:00', evento: 'Recolección completada', ubicacion: 'Almacén Central' },
          { fecha: '2023-12-05T11:30:00', evento: 'En tránsito', ubicacion: 'Centro de distribución' },
        ]
      }
    ],
    historial: [
      {
        id: 'ENV-2023-044',
        origen: 'Proveedor XYZ',
        destino: 'Hospital Dr. Rafael Gallardo',
        fechaEnvio: '2023-12-01T10:00:00',
        fechaEntrega: '2023-12-02T15:30:00',
        estado: 'entregado',
        transportista: 'Mensajería Express',
        guia: 'GUIA-123456789',
        items: 8,
        receptor: 'Juan Pérez',
        historial: [
          { fecha: '2023-12-01T10:00:00', evento: 'Envío registrado', ubicacion: 'Proveedor XYZ' },
          { fecha: '2023-12-01T12:30:00', evento: 'Recolección completada', ubicacion: 'Proveedor XYZ' },
          { fecha: '2023-12-02T10:15:00', evento: 'En reparto', ubicacion: 'Zona de entrega' },
          { fecha: '2023-12-02T15:30:00', evento: 'Entregado', ubicacion: 'Hospital Dr. Rafael Gallardo' },
        ]
      }
    ]
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      en_transito: { 
        bg: 'bg-blue-100 text-blue-800', 
        icon: <Truck className="h-4 w-4" />,
        label: 'En Tránsito'
      },
      entregado: { 
        bg: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="h-4 w-4" />,
        label: 'Entregado'
      },
      pendiente: { 
        bg: 'bg-yellow-100 text-yellow-800',
        icon: <Clock className="h-4 w-4" />,
        label: 'Pendiente'
      },
      retrasado: {
        bg: 'bg-red-100 text-red-800',
        icon: <AlertCircle className="h-4 w-4" />,
        label: 'Retrasado'
      }
    };
    
    const config = statusConfig[status] || statusConfig.pendiente;
    
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${config.bg}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleVerInsumos = (envioId) => {
    // Datos de ejemplo para los insumos
    const insumosEjemplo = [
      { id: 1, nombre: 'Mascarillas N95', cantidad: 100, unidad: 'unidades', lote: 'LOTE-2023-001' },
      { id: 2, nombre: 'Guantes de Nitrilo', cantidad: 200, unidad: 'pares', lote: 'LOTE-2023-045' },
      { id: 3, nombre: 'Batas Desechables', cantidad: 50, unidad: 'unidades', lote: 'LOTE-2023-078' },
      { id: 4, nombre: 'Alcohol en Gel', cantidad: 30, unidad: 'litros', lote: 'LOTE-2023-112' },
    ];
    setInsumos(insumosEjemplo);
    setShowInsumosModal(true);
  };

  const handleVerMapa = (envioId) => {
    // Encontrar el envío actual para mostrar sus datos
    const envio = envios.activos.find(e => e.id === envioId) || 
                 envios.historial.find(e => e.id === envioId);
    setEnvioActual(envio);
    setShowMapaModal(true);
  };

  const closeInsumosModal = () => {
    setShowInsumosModal(false);
    setInsumos([]);
  };

  const renderHistorial = (historial, envio) => {
    return (
      <>
        <div className="flex justify-start items-center mt-4">
          <div className="relative flex flex-col md:flex-row gap-2">
            <span 
              onClick={() => handleVerInsumos(envio.id)} 
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-teal-500 text-white hover:bg-teal-600 cursor-pointer transition-colors"
            >
              <Eye className="h-4 w-4" />
              Ver Insumos
            </span>
            <span 
              onClick={() => handleVerMapa(envio.id)} 
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-teal-500 text-white hover:bg-teal-600 cursor-pointer transition-colors"
            >
              <MapPin className="h-4 w-4" />
              Seguimiento en mapa
            </span>
          </div>
        </div>
        <div className="mt-4 space-y-4">
          <h4 className="text-sm font-medium text-indigo-500">Historial de Seguimiento:</h4>
          <div className="relative">
            <div className="absolute left-4 h-full w-0.5 bg-gray-600"></div>
            <div className="space-y-6">
              {historial.map((evento, index) => (
                <div key={index} className="relative flex items-start">
                  <div className="absolute left-0 mt-1.5 ml-3 h-3 w-3 rounded-full bg-indigo-500"></div>
                  <div className="ml-8">
                    <p className="text-sm font-medium text-gray-800">{evento.evento}</p>
                    <p className="text-xs text-gray-500">{formatDate(evento.fecha)}</p>
                    <p className="text-xs text-gray-500">{evento.ubicacion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="md:ml-64 space-y-6 p-6">
      <div className="rounded-2xl p-6 shadow-lg border border-gray-100">
        {/* <h2 className="text-xl font-semibold text-gray-800 mb-6">Seguimiento de Despachos</h2> */}
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 flex">
            <div className="pl-3 -mr-8 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className=" w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white/10 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Número de guía o ID de envío"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Rastrear
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('activos')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'activos' ? 'border-indigo-700 text-gray-800' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
              Envíos Activos
            </button>
            <button
              onClick={() => setActiveTab('historial')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'historial' ? 'border-indigo-700 text-gray-800' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
              Historial
            </button>
          </nav>
        </div>

        <div className="p-6">
          {envios[activeTab].length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-500">No hay envíos {activeTab === 'activos' ? 'activos' : 'en el historial'}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeTab === 'activos' 
                  ? 'Actualmente no hay envíos en curso.' 
                  : 'No se encontraron envíos anteriores.'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {envios[activeTab].map((envio) => (
                <div key={envio.id} className="bg-white rounded-lg p-4 border border-indigo-700">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row items-start md:items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-800">Envío #{envio.id}</h3>
                        {getStatusBadge(envio.estado)}
                      </div>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-indigo-500">Origen</p>
                          <p className="text-gray-800">{envio.origen}</p>
                        </div>
                        <div>
                          <p className="text-indigo-500">Destino</p>
                          <p className="text-gray-800">{envio.destino}</p>
                        </div>
                        <div>
                          <p className="text-indigo-500">Transportista</p>
                          <p className="text-gray-800">{envio.transportista}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-4">
                      <button 
                        onClick={() => setDetalleVisible(!detalleVisible)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                  {detalleVisible && (
                    <div className="mt-4">
                      {renderHistorial(envio.historial, envio)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de Insumos */}
      {showInsumosModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Insumos Despachados</h3>
              <button 
                onClick={closeInsumosModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lote</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {insumos.map((insumo) => (
                      <tr key={insumo.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{insumo.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{insumo.nombre}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {insumo.cantidad} {insumo.unidad}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{insumo.lote}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={closeInsumosModal}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Mapa de Seguimiento */}
      {showMapaModal && envioActual && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full overflow-hidden max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Seguimiento en Tiempo Real</h3>
                <p className="text-sm text-gray-500">Envío #{envioActual.id} - {envioActual.origen} → {envioActual.destino}</p>
              </div>
              <button 
                onClick={() => setShowMapaModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 flex-1 flex flex-col">
              {/* Simulación de Mapa */}
              <div className="bg-gray-200 rounded-lg flex-1 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-50">
                  {/* Ruta simulada */}
                  <svg className="w-full h-full">
                    <line 
                      x1="10%" y1="80%" 
                      x2="90%" y2="20%" 
                      stroke="#3b82f6" 
                      strokeWidth="4" 
                      strokeDasharray="10,5"
                      strokeLinecap="round"
                    />
                    {/* Punto de origen */}
                    <circle cx="10%" cy="80%" r="10" fill="#10b981" />
                    <text x="10%" y="75%" textAnchor="middle" className="text-xs font-semibold">
                      {envioActual.origen.split(',')[0]}
                    </text>
                    
                    {/* Punto de destino */}
                    <circle cx="90%" cy="20%" r="10" fill="#ef4444" />
                    <text x="90%" y="15%" textAnchor="middle" className="text-xs font-semibold">
                      {envioActual.destino.split(',')[0]}
                    </text>
                    
                    {/* Vehículo en movimiento */}
                    <circle 
                      cx="50%" 
                      cy="50%" 
                      r="12" 
                      fill="#3b82f6" 
                      className="animate-pulse"
                    />
                    <text 
                      x="50%" 
                      y="50%" 
                      textAnchor="middle" 
                      dy=".3em" 
                      className="text-xs font-bold text-white"
                    >
                      {envioActual.transportista[0]}
                    </text>
                  </svg>
                </div>
                <div className="relative z-10 text-center p-4 bg-white/80 rounded-lg shadow-lg">
                  <Truck className="h-12 w-12 mx-auto text-blue-600 mb-2" />
                  <h4 className="font-semibold text-gray-800">Seguimiento Activo</h4>
                  <p className="text-sm text-gray-600">Actualizado hace 2 minutos</p>
                </div>
              </div>
              
              {/* Información del envío */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-800">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Estado Actual</p>
                  <p className="font-medium">En tránsito</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Tiempo Estimado</p>
                  <p className="font-medium">~ 45 min</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Conductor</p>
                  <p className="font-medium">{envioActual.transportista}</p>
                </div>
              </div>
              
              {/* Historial reciente */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Última Actualización</h4>
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <MapPin className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">En ruta hacia {envioActual.destino.split(',')[0]}</p>
                      <p className="text-gray-500">Hace 15 minutos</p>
                      <p className="text-xs text-gray-400 mt-1">Av. Principal #123, Ciudad</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => setShowMapaModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
