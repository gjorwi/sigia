'use client';

import { useState } from 'react';
import { Package, CheckCircle, AlertCircle, Clock, Search } from 'lucide-react';

const Recepcion = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Datos de ejemplo para las recepciones
  const recepciones = [
    {
      id: 'REC-2023-001',
      fecha: '2023-12-05T10:30:00',
      origen: 'Almacén Central',
      estado: 'pendiente',
      items: 15,
      total: 1250
    },
    {
      id: 'REC-2023-002',
      fecha: '2023-12-04T14:45:00',
      origen: 'Proveedor XYZ',
      estado: 'completado',
      items: 8,
      total: 850
    },
    {
      id: 'REC-2023-003',
      fecha: '2023-12-03T09:15:00',
      origen: 'Donación ABC',
      estado: 'en_proceso',
      items: 22,
      total: 3200
    }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      pendiente: { 
        bg: 'bg-yellow-100 text-yellow-800', 
        icon: <Clock className="h-4 w-4" />,
        label: 'Pendiente'
      },
      completado: { 
        bg: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="h-4 w-4" />,
        label: 'Completado'
      },
      en_proceso: { 
        bg: 'bg-blue-100 text-blue-800',
        icon: <Package className="h-4 w-4" />,
        label: 'En Proceso'
      },
      con_incidencias: {
        bg: 'bg-red-100 text-red-800',
        icon: <AlertCircle className="h-4 w-4" />,
        label: 'Con Incidencias'
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
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/10 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-xl font-semibold text-white mb-4 md:mb-0">Recepción de Despachos</h2>
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Buscar recepción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                ID Recepción
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Fecha/Hora
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Origen
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Items
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Total
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white/5 divide-y divide-white/10">
            {recepciones.map((recepcion) => (
              <tr key={recepcion.id} className="hover:bg-white/10">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                  {recepcion.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                  {formatDate(recepcion.fecha)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                  {recepcion.origen}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {getStatusBadge(recepcion.estado)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                  {recepcion.items}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                  {recepcion.total.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-indigo-400 hover:text-indigo-300 mr-3">
                    Ver Detalles
                  </button>
                  {recepcion.estado === 'pendiente' && (
                    <button className="text-green-400 hover:text-green-300">
                      Registrar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col md:flex-row justify-between items-center">
        <div className="text-sm text-gray-400">
          Mostrando <span className="font-medium">1</span> a <span className="font-medium">3</span> de{' '}
          <span className="font-medium">3</span> resultados
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 rounded-md bg-white/10 text-white hover:bg-white/20 disabled:opacity-50" disabled>
            Anterior
          </button>
          <button className="px-3 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
            1
          </button>
          <button className="px-3 py-1 rounded-md bg-white/10 text-white hover:bg-white/20">
            2
          </button>
          <button className="px-3 py-1 rounded-md bg-white/10 text-white hover:bg-white/20">
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default Recepcion;
