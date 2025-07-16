"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Calendar, Truck, PackageCheck, Clock, AlertCircle, CheckCircle, RefreshCw, MapPin, Package, User, ChevronDown, ChevronRight } from 'lucide-react';

// Mock data - replace with actual API calls
const mockDespachos = Array.from({ length: 15 }, (_, i) => ({
  id: `DESP-${2000 + i}`,
  almacenOrigen: `Almacén ${String.fromCharCode(65 + (i % 5))}`,
  almacenDestino: `Almacén ${String.fromCharCode(66 + (i % 5))}`,
  fechaSalida: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
  fechaEntregaEstimada: new Date(Date.now() + (Math.floor(Math.random() * 5) + 1) * 24 * 60 * 60 * 1000).toISOString(),
  estado: ['pendiente', 'en_ruta', 'entregado', 'retrasado'][Math.floor(Math.random() * 4)],
  prioridad: ['baja', 'media', 'alta'][Math.floor(Math.random() * 3)],
  items: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, j) => ({
    id: `ITEM-${i}-${j}`,
    nombre: `Insumo ${j + 1}`,
    cantidad: Math.floor(Math.random() * 10) + 1,
    unidad: 'unid.'
  })),
  conductor: `Conductor ${i + 1}`,
  vehiculo: `Vehículo ${String.fromCharCode(65 + (i % 5))}-${100 + i}`,
  ubicacionActual: `Ubicación ${i % 3 + 1}`,
  historial: [
    {
      fecha: new Date().toISOString(),
      estado: 'registrado',
      ubicacion: 'Almacén Central',
      notas: 'Despacho registrado en el sistema'
    }
  ]
}));

const estados = {
  pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-4 w-4" /> },
  en_ruta: { label: 'En Ruta', color: 'bg-blue-100 text-blue-800', icon: <Truck className="h-4 w-4" /> },
  entregado: { label: 'Entregado', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4" /> },
  retrasado: { label: 'Retrasado', color: 'bg-red-100 text-red-800', icon: <AlertCircle className="h-4 w-4" /> }
};

export default function Logistica() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('hoy');
  const [despachos, setDespachos] = useState([]);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: 'todos',
    fechaInicio: '',
    fechaFin: ''
  });
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [despachoSeleccionado, setDespachoSeleccionado] = useState(null);
  const [mostrarTracking, setMostrarTracking] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    // En producción, reemplazar con una llamada a la API
    setDespachos(mockDespachos);
  }, []);

  // Filtrar despachos según la pestaña activa
  const despachosFiltrados = despachos.filter(despacho => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const fechaDespacho = new Date(despacho.fechaSalida);
    fechaDespacho.setHours(0, 0, 0, 0);
    
    if (activeTab === 'hoy') {
      return fechaDespacho.getTime() === hoy.getTime();
    } else if (activeTab === 'pendientes') {
      return despacho.estado === 'pendiente' || despacho.estado === 'en_ruta';
    } else if (activeTab === 'retrasados') {
      return despacho.estado === 'retrasado';
    } else if (activeTab === 'todos') {
      return true;
    }
    return true;
  });

  // Formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Actualizar estado de un despacho
  const actualizarEstado = (id, nuevoEstado) => {
    setDespachos(despachos.map(despacho => {
      if (despacho.id === id) {
        const nuevoHistorial = [...despacho.historial, {
          fecha: new Date().toISOString(),
          estado: nuevoEstado,
          ubicacion: 'Actualizado en sistema',
          notas: `Estado cambiado a ${nuevoEstado}`
        }];
        
        return {
          ...despacho,
          estado: nuevoEstado,
          historial: nuevoHistorial
        };
      }
      return despacho;
    }));
  };

  // Ver detalles del despacho
  const verDetalle = (despacho) => {
    setDespachoSeleccionado(despacho);
    setMostrarTracking(true);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 md:ml-64 py-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          {/* <h1 className="text-2xl font-semibold text-gray-900">Gestión Logística</h1>
          <p className="mt-2 text-sm text-gray-700">
            Monitorea y gestiona el estado de los despachos en tiempo real.
          </p> */}
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-2">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            onClick={() => router.push('/despachos/nuevo')}
          >
            <Truck className="-ml-1 mr-2 h-4 w-4" />
            Nuevo Despacho
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
          >
            <Filter className="-ml-1 mr-2 h-4 w-4 text-gray-500" />
            Filtros
          </button>
        </div>
      </div>

      {/* Pestañas */}
      <div className="mt-6">
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">Selecciona una pestaña</label>
          <select
            id="tabs"
            name="tabs"
            className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            <option value="hoy">Hoy</option>
            <option value="pendientes">Pendientes</option>
            <option value="retrasados">Retrasados</option>
            <option value="todos">Todos</option>
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {[
                { name: 'Hoy', value: 'hoy' },
                { name: 'Pendientes', value: 'pendientes' },
                { name: 'Retrasados', value: 'retrasados' },
                { name: 'Todos', value: 'todos' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`${activeTab === tab.value
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  {tab.name}
                  {tab.value === 'pendientes' && (
                    <span className="ml-2 bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {despachos.filter(d => d.estado === 'pendiente' || d.estado === 'en_ruta').length}
                    </span>
                  )}
                  {tab.value === 'retrasados' && (
                    <span className="ml-2 bg-red-100 text-red-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {despachos.filter(d => d.estado === 'retrasado').length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Filtros */}
      {filtrosAbiertos && (
        <div className="mt-4 bg-white shadow overflow-hidden rounded-lg p-4 text-gray-700">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="busqueda" className="block text-sm font-medium text-gray-700">
                Buscar
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="busqueda"
                  id="busqueda"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                  placeholder="Buscar por ID, almacén o conductor"
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
                Estado
              </label>
              <select
                id="estado"
                name="estado"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={filtros.estado}
                onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
              >
                <option value="todos">Todos los estados</option>
                {Object.entries(estados).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Lista de despachos */}
      <div className="mt-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {despachosFiltrados.length > 0 ? (
              despachosFiltrados.map((despacho) => (
                <li key={despacho.id} className="hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Truck className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <h3 className="text-lg font-medium text-indigo-600">{despacho.id}</h3>
                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estados[despacho.estado].color}`}>
                              {estados[despacho.estado].icon}
                              <span className="ml-1">{estados[despacho.estado].label}</span>
                            </span>
                            {despacho.prioridad === 'alta' && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Alta prioridad
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-sm text-gray-500">
                            <span className="font-medium">De:</span> {despacho.almacenOrigen} • 
                            <span className="font-medium"> A:</span> {despacho.almacenDestino}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {formatearFecha(despacho.fechaSalida)}
                        </div>
                        <div className="mt-1">
                          <button
                            onClick={() => verDetalle(despacho)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Ver detalles
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <div className="flex items-center text-sm text-gray-500">
                          <Package className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          <p>
                            {despacho.items.length} {despacho.items.length === 1 ? 'ítem' : 'ítems'}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <User className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          <p>{despacho.conductor}</p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <Truck className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          <p>{despacho.vehiculo}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        <p>Última ubicación: {despacho.ubicacionActual}</p>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-6 text-center text-gray-500">
                No se encontraron despachos que coincidan con los filtros seleccionados.
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Modal de seguimiento */}
      {mostrarTracking && despachoSeleccionado && (
        <div className="fixed z-50 inset-0 overflow-y-auto bg-black/50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div> */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Seguimiento de Despacho: {despachoSeleccionado.id}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {despachoSeleccionado.almacenOrigen} → {despachoSeleccionado.almacenDestino}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={() => setMostrarTracking(false)}
                  >
                    <span className="sr-only">Cerrar</span>
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Estado actual</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${estados[despachoSeleccionado.estado].color.replace('text-', 'text-').replace('bg-', 'bg-').split(' ')[0]}`}>
                        {estados[despachoSeleccionado.estado].icon}
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{estados[despachoSeleccionado.estado].label}</p>
                        <p className="text-sm text-gray-500">Última actualización: {formatearFecha(despachoSeleccionado.historial[despachoSeleccionado.historial.length - 1].fecha)}</p>
                      </div>
                      <div className="ml-auto">
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <RefreshCw className="-ml-1 mr-1 h-3 w-3" />
                          Actualizar estado
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Historial de seguimiento</h4>
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {despachoSeleccionado.historial.map((evento, eventoIdx) => (
                        <li key={eventoIdx}>
                          <div className="relative pb-8">
                            {eventoIdx !== despachoSeleccionado.historial.length - 1 ? (
                              <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                            ) : null}
                            <div className="relative flex space-x-3">
                              <div>
                                <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                  evento.estado === 'entregado' ? 'bg-green-500' : 
                                  evento.estado === 'en_ruta' ? 'bg-blue-500' : 
                                  evento.estado === 'retrasado' ? 'bg-red-500' : 'bg-yellow-500'
                                }`}>
                                  {evento.estado === 'entregado' ? (
                                    <CheckCircle className="h-5 w-5 text-white" />
                                  ) : evento.estado === 'en_ruta' ? (
                                    <Truck className="h-5 w-5 text-white" />
                                  ) : evento.estado === 'retrasado' ? (
                                    <AlertCircle className="h-5 w-5 text-white" />
                                  ) : (
                                    <Clock className="h-5 w-5 text-white" />
                                  )}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    <span className="font-medium text-gray-900">{evento.estado.charAt(0).toUpperCase() + evento.estado.slice(1)}</span>
                                    {' '}en {evento.ubicacion}
                                  </p>
                                  <p className="text-sm text-gray-500">{evento.notas}</p>
                                </div>
                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                  <time dateTime={evento.fecha}>
                                    {formatearFecha(evento.fecha)}
                                  </time>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Detalles del envío</h4>
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Información del despacho
                      </h3>
                    </div>
                    <div className="border-t border-gray-200">
                      <dl>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Origen</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{despachoSeleccionado.almacenOrigen}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Destino</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{despachoSeleccionado.almacenDestino}</dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Conductor</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{despachoSeleccionado.conductor}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Vehículo</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{despachoSeleccionado.vehiculo}</dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Fecha estimada de entrega</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {formatearFecha(despachoSeleccionado.fechaEntregaEstimada)}
                          </dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Ítems</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                              {despachoSeleccionado.items.map((item, itemIdx) => (
                                <li key={itemIdx} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                                  <div className="w-0 flex-1 flex items-center">
                                    <Package className="flex-shrink-0 h-5 w-5 text-gray-400" />
                                    <span className="ml-2 flex-1 w-0 truncate">
                                      {item.nombre}
                                    </span>
                                  </div>
                                  <div className="ml-4 flex-shrink-0">
                                    <span className="font-medium text-indigo-600 hover:text-indigo-500">
                                      {item.cantidad} {item.unidad}
                                    </span>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                  onClick={() => setMostrarTracking(false)}
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={() => {
                    // Lógica para actualizar estado
                    const estadosDisponibles = ['pendiente', 'en_ruta', 'entregado', 'retrasado'];
                    const estadoActualIndex = estadosDisponibles.indexOf(despachoSeleccionado.estado);
                    const nuevoEstado = estadosDisponibles[(estadoActualIndex + 1) % estadosDisponibles.length];
                    actualizarEstado(despachoSeleccionado.id, nuevoEstado);
                  }}
                >
                  <RefreshCw className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
                  Cambiar estado
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}