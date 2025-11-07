'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Package, TrendingUp, Users, Search } from 'lucide-react';

export default function Reportes() {
  const router = useRouter();
  const [selectedReport, setSelectedReport] = useState(null);

  const reportes = [
    // {
    //   id: 'general',
    //   titulo: 'Reporte General',
    //   descripcion: 'Resumen completo de todas las operaciones del sistema',
    //   icono: FileText,
    //   color: 'from-blue-500 to-blue-600',
    //   bgColor: 'bg-blue-50',
    //   iconColor: 'text-blue-600',
    //   ruta: '/administrador/reportes/general'
    // },
    {
      id: 'movimientos',
      titulo: 'Reporte Movimientos',
      descripcion: 'Historial detallado de todos los movimientos de inventario',
      icono: TrendingUp,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      ruta: '/administrador/reportes/movimientos'
    },
    {
      id: 'inventario',
      titulo: 'Reporte Inventario',
      descripcion: 'Estado actual del inventario por sede y almacén',
      icono: Package,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      ruta: '/administrador/reportes/inventario'
    },
    {
      id: 'pacientes',
      titulo: 'Reporte Pacientes',
      descripcion: 'Información sobre pacientes y consumo de insumos',
      icono: Users,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      ruta: '/administrador/reportes/pacientes'
    },
    {
      id: 'traza',
      titulo: 'Reporte Traza Insumo',
      descripcion: 'Seguimiento completo de la trazabilidad de insumos',
      icono: Search,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      iconColor: 'text-teal-600',
      ruta: '/administrador/reportes/traza'
    }
  ];

  const handleSelectReport = (reporteId) => {
    setSelectedReport(reporteId);
  };

  const handleGenerarReporte = () => {
    if (!selectedReport) {
      alert('Por favor selecciona un tipo de reporte');
      return;
    }
    
    const reporte = reportes.find(r => r.id === selectedReport);
    console.log('Generando reporte:', reporte.titulo);
    router.push(reporte.ruta);
  };

  return (
    <div className="md:ml-64 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            {/* <h1 className="text-3xl font-bold text-gray-900 mb-2">Reportes del Sistema</h1> */}
            <p className="text-gray-600">Selecciona el tipo de reporte que deseas generar</p>
          </div>
          
          {/* Botón para Generar Reporte */}
          {selectedReport && (
            <button
              onClick={handleGenerarReporte}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <FileText className="w-5 h-5 mr-2" />
              Generar Reporte
            </button>
          )}
        </div>

        {/* Grid de Reportes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportes.map((reporte) => {
            const IconComponent = reporte.icono;
            const isSelected = selectedReport === reporte.id;
            
            return (
              <div
                key={reporte.id}
                onClick={() => handleSelectReport(reporte.id)}
                className={`
                  relative bg-white rounded-xl shadow-md hover:shadow-xl 
                  transition-all duration-300 cursor-pointer overflow-hidden
                  transform hover:-translate-y-1 flex flex-col h-full
                  ${isSelected ? 'ring-4 ring-blue-500 ring-opacity-50 scale-105' : ''}
                `}
              >
                {/* Gradient Header */}
                <div className={`h-2 bg-gradient-to-r ${reporte.color}`}></div>
                
                <div className="p-6 flex flex-col flex-grow">
                  {/* Icon */}
                  <div className={`${reporte.bgColor} w-14 h-14 rounded-lg flex items-center justify-center mb-4`}>
                    <IconComponent className={`w-7 h-7 ${reporte.iconColor}`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {reporte.titulo}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 flex-grow">
                    {reporte.descripcion}
                  </p>

                  {/* Status Indicator */}
                  <div
                    className={`
                      w-full py-2 px-4 rounded-lg font-medium text-center mt-auto
                      ${isSelected 
                        ? `bg-gradient-to-r ${reporte.color} text-white` 
                        : 'bg-gray-100 text-gray-700'
                      }
                    `}
                  >
                    {isSelected ? '✓ Seleccionado' : 'Seleccionar'}
                  </div>
                </div>

                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-blue-500 rounded-full p-1">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Tip:</span> Selecciona una tarjeta y luego haz clic en el botón &quot;Generar Reporte&quot; para continuar. 
                Los reportes pueden ser exportados en formato PDF o Excel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}