"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Calendar, Download, ChevronDown, ChevronRight, CheckCircle2, Clock, AlertCircle, PackageCheck, Truck, PackageX } from 'lucide-react';

// Mock data - replace with actual API calls
const mockSolicitudes = Array.from({ length: 25 }, (_, i) => ({
  id: `SOL-${1000 + i}`,
  almacen: `Almacén ${String.fromCharCode(65 + (i % 5))}`,
  fecha: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  cantidadItems: Math.floor(Math.random() * 15) + 1,
  estado: ['pendiente', 'en_proceso', 'completada', 'rechazada'][Math.floor(Math.random() * 4)],
  prioridad: ['baja', 'media', 'alta'][Math.floor(Math.random() * 3)],
  detalles: `Solicitud de insumos varios para el almacén ${String.fromCharCode(65 + (i % 5))}`
}));

const estados = {
  pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-4 w-4" /> },
  en_proceso: { label: 'En Proceso', color: 'bg-blue-100 text-blue-800', icon: <PackageCheck className="h-4 w-4" /> },
  completada: { label: 'Completada', color: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="h-4 w-4" /> },
  rechazada: { label: 'Rechazada', color: 'bg-red-100 text-red-800', icon: <PackageX className="h-4 w-4" /> }
};

export default function Solicitudes() {
  const router = useRouter();
  const [solicitudes, setSolicitudes] = useState([]);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: 'todos',
    fechaInicio: '',
    fechaFin: ''
  });
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(10);
  const [ordenarPor, setOrdenarPor] = useState('fecha');
  const [ordenAscendente, setOrdenAscendente] = useState(false);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    // En producción, reemplazar con una llamada a la API
    setSolicitudes(mockSolicitudes);
  }, []);

  // Aplicar filtros
  const solicitudesFiltradas = solicitudes.filter(solicitud => {
    const coincideBusqueda = 
      solicitud.id.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      solicitud.almacen.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      solicitud.detalles.toLowerCase().includes(filtros.busqueda.toLowerCase());
    
    const coincideEstado = filtros.estado === 'todos' || solicitud.estado === filtros.estado;
    
    const fechaSolicitud = new Date(solicitud.fecha);
    const fechaInicio = filtros.fechaInicio ? new Date(filtros.fechaInicio) : null;
    const fechaFin = filtros.fechaFin ? new Date(filtros.fechaFin) : null;
    
    const enRangoFechas = 
      (!fechaInicio || fechaSolicitud >= fechaInicio) && 
      (!fechaFin || fechaSolicitud <= new Date(fechaFin.setHours(23, 59, 59, 999)));
    
    return coincideBusqueda && coincideEstado && enRangoFechas;
  });

  // Ordenar
  const solicitudesOrdenadas = [...solicitudesFiltradas].sort((a, b) => {
    let valorA, valorB;
    
    switch (ordenarPor) {
      case 'fecha':
        valorA = new Date(a.fecha);
        valorB = new Date(b.fecha);
        break;
      case 'almacen':
        valorA = a.almacen;
        valorB = b.almacen;
        break;
      case 'cantidad':
        valorA = a.cantidadItems;
        valorB = b.cantidadItems;
        break;
      default:
        valorA = a[ordenarPor];
        valorB = b[ordenarPor];
    }
    
    if (typeof valorA === 'string') {
      return ordenAscendente 
        ? valorA.localeCompare(valorB)
        : valorB.localeCompare(valorA);
    } else {
      return ordenAscendente ? valorA - valorB : valorB - valorA;
    }
  });

  // Paginación
  const indiceUltimoItem = paginaActual * itemsPorPagina;
  const indicePrimerItem = indiceUltimoItem - itemsPorPagina;
  const itemsActuales = solicitudesOrdenadas.slice(indicePrimerItem, indiceUltimoItem);
  const totalPaginas = Math.ceil(solicitudesOrdenadas.length / itemsPorPagina);

  const cambiarPagina = (numeroPagina) => setPaginaActual(numeroPagina);

  const manejarOrdenar = (columna) => {
    if (ordenarPor === columna) {
      setOrdenAscendente(!ordenAscendente);
    } else {
      setOrdenarPor(columna);
      setOrdenAscendente(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      estado: 'todos',
      fechaInicio: '',
      fechaFin: ''
    });
    setPaginaActual(1);
  };

  const verDetalle = (id) => {
    // Navegar a la página de detalle de la solicitud
    router.push(`/solicitudes/${id}`);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 md:ml-64 py-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Solicitudes de Almacenes Externos</h1>
          <p className="mt-2 text-sm text-gray-700">
            Visualiza y gestiona las solicitudes de insumos realizadas por los almacenes externos.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            onClick={() => router.push('/solicitudes/nueva')}
          >
            Nueva Solicitud
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="mt-6 bg-white shadow overflow-hidden rounded-lg">
        <div 
          className="px-4 py-4 border-b border-gray-200 sm:px-6 flex justify-between items-center cursor-pointer"
          onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
        >
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Filter className="h-5 w-5 mr-2 text-gray-500" />
            Filtros
          </h3>
          <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${filtrosAbiertos ? 'transform rotate-180' : ''}`} />
        </div>
        
        {filtrosAbiertos && (
          <div className="px-4 py-5 sm:p-6 border-b border-gray-200 text-gray-700">
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
                    placeholder="Buscar por ID, almacén o descripción"
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

              <div className="sm:col-span-3">
                <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700">
                  Fecha desde
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="fechaInicio"
                    id="fechaInicio"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                    value={filtros.fechaInicio}
                    onChange={(e) => setFiltros({...filtros, fechaInicio: e.target.value})}
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700">
                  Fecha hasta
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="fechaFin"
                    id="fechaFin"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                    value={filtros.fechaFin}
                    onChange={(e) => setFiltros({...filtros, fechaFin: e.target.value})}
                  />
                </div>
              </div>

              <div className="sm:col-span-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={limpiarFiltros}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Limpiar filtros
                </button>
                <button
                  type="button"
                  onClick={() => setFiltrosAbiertos(false)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Aplicar filtros
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resultados */}
      <div className="mt-6 flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <div className="bg-white px-4 py-3 border-b border-gray-200 sm:px-6 flex justify-between items-center">
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{solicitudesFiltradas.length === 0 ? 0 : indicePrimerItem + 1}</span> a{' '}
                  <span className="font-medium">
                    {Math.min(indiceUltimoItem, solicitudesFiltradas.length)}
                  </span>{' '}
                  de <span className="font-medium">{solicitudesFiltradas.length}</span> resultados
                </p>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Download className="-ml-0.5 mr-2 h-4 w-4" />
                  Exportar
                </button>
              </div>
              
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                      onClick={() => manejarOrdenar('id')}
                    >
                      <div className="flex items-center">
                        ID
                        {ordenarPor === 'id' && (
                          <ChevronDown className={`ml-1 h-4 w-4 ${ordenAscendente ? 'transform rotate-180' : ''}`} />
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                      onClick={() => manejarOrdenar('fecha')}
                    >
                      <div className="flex items-center">
                        Fecha
                        {ordenarPor === 'fecha' && (
                          <ChevronDown className={`ml-1 h-4 w-4 ${ordenAscendente ? 'transform rotate-180' : ''}`} />
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                      onClick={() => manejarOrdenar('almacen')}
                    >
                      <div className="flex items-center">
                        Almacén
                        {ordenarPor === 'almacen' && (
                          <ChevronDown className={`ml-1 h-4 w-4 ${ordenAscendente ? 'transform rotate-180' : ''}`} />
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                      onClick={() => manejarOrdenar('cantidadItems')}
                    >
                      <div className="flex items-center">
                        Items
                        {ordenarPor === 'cantidadItems' && (
                          <ChevronDown className={`ml-1 h-4 w-4 ${ordenAscendente ? 'transform rotate-180' : ''}`} />
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Detalles
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Estado
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {itemsActuales.length > 0 ? (
                    itemsActuales.map((solicitud) => (
                      <tr key={solicitud.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {solicitud.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatearFecha(solicitud.fecha)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {solicitud.almacen}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {solicitud.cantidadItems} {solicitud.cantidadItems === 1 ? 'item' : 'items'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={solicitud.detalles}>
                          {solicitud.detalles}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${estados[solicitud.estado].color} py-1`}>
                            <div className="flex items-center">
                              {estados[solicitud.estado].icon}
                              <span className="ml-1">{estados[solicitud.estado].label}</span>
                            </div>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => verDetalle(solicitud.id)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Ver
                          </button>
                          {solicitud.estado === 'pendiente' && (
                            <button className="text-green-600 hover:text-green-900">
                              Procesar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                        No se encontraron solicitudes que coincidan con los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Paginación */}
              {totalPaginas > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => cambiarPagina(paginaActual - 1)}
                      disabled={paginaActual === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        paginaActual === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => cambiarPagina(paginaActual + 1)}
                      disabled={paginaActual === totalPaginas}
                      className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        paginaActual === totalPaginas ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Siguiente
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Mostrando página <span className="font-medium">{paginaActual}</span> de{' '}
                        <span className="font-medium">{totalPaginas}</span>
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => cambiarPagina(paginaActual - 1)}
                          disabled={paginaActual === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                            paginaActual === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Anterior</span>
                          <ChevronRight className="h-5 w-5 transform rotate-180" />
                        </button>
                        
                        {/* Números de página */}
                        {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                          // Mostrar páginas alrededor de la actual
                          let pageNum;
                          if (totalPaginas <= 5) {
                            pageNum = i + 1;
                          } else if (paginaActual <= 3) {
                            pageNum = i + 1;
                          } else if (paginaActual >= totalPaginas - 2) {
                            pageNum = totalPaginas - 4 + i;
                          } else {
                            pageNum = paginaActual - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => cambiarPagina(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                paginaActual === pageNum
                                  ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => cambiarPagina(paginaActual + 1)}
                          disabled={paginaActual === totalPaginas}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                            paginaActual === totalPaginas ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Siguiente</span>
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}