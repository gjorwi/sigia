'use client';

import { useState, useEffect } from 'react';
import { BarChart3, FileText, TrendingUp, Package, Users, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Reportes = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('mes');
  const [reportType, setReportType] = useState('movimientos');

  // Datos de ejemplo para reportes
  const reportData = {
    movimientos: {
      title: 'Movimientos de Inventario',
      icon: <Package className="h-6 w-6" />,
      stats: [
        { label: 'Entradas', value: '45', change: '+12%', color: 'text-green-400' },
        { label: 'Salidas', value: '38', change: '+8%', color: 'text-blue-400' },
        { label: 'Transferencias', value: '23', change: '-5%', color: 'text-orange-400' },
        { label: 'Devoluciones', value: '7', change: '+15%', color: 'text-purple-400' }
      ]
    },
    stock: {
      title: 'Estado del Stock',
      icon: <TrendingUp className="h-6 w-6" />,
      stats: [
        { label: 'Stock Óptimo', value: '156', change: '+3%', color: 'text-green-400' },
        { label: 'Bajo Stock', value: '23', change: '-8%', color: 'text-yellow-400' },
        { label: 'Agotado', value: '5', change: '-12%', color: 'text-red-400' },
        { label: 'Próximo a Vencer', value: '12', change: '+2%', color: 'text-orange-400' }
      ]
    }
  };

  const periods = [
    { id: 'semana', name: 'Esta Semana' },
    { id: 'mes', name: 'Este Mes' },
    { id: 'trimestre', name: 'Este Trimestre' },
    { id: 'año', name: 'Este Año' }
  ];

  const reportTypes = [
    { id: 'movimientos', name: 'Movimientos', icon: <Package className="h-5 w-5" /> },
    { id: 'stock', name: 'Estado Stock', icon: <TrendingUp className="h-5 w-5" /> }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Reportes y Estadísticas</h2>
            <p className="text-white/70">Análisis de movimientos y estado del inventario - {user?.sede?.nombre}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
            {/* Selector de Período */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {periods.map((period) => (
                <option key={period.id} value={period.id} className="bg-gray-800 text-white">
                  {period.name}
                </option>
              ))}
            </select>
            
            {/* Botón de Exportar */}
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <FileText className="h-4 w-4 mr-2" />
              Exportar PDF
            </button>
          </div>
        </div>

        {/* Selector de Tipo de Reporte */}
        <div className="flex flex-wrap gap-2">
          {reportTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setReportType(type.id)}
              className={`inline-flex items-center px-4 py-2 rounded-lg transition-all ${
                reportType === type.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {type.icon}
              <span className="ml-2">{type.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportData[reportType].stats.map((stat, index) => (
          <div key={index} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`text-right ${stat.color}`}>
                <p className="text-sm font-medium">{stat.change}</p>
                <p className="text-xs text-white/50">vs período anterior</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico Placeholder */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/10">
        <div className="flex items-center mb-4">
          {reportData[reportType].icon}
          <h3 className="text-lg font-semibold text-white ml-2">{reportData[reportType].title}</h3>
        </div>
        
        <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/50 text-lg font-medium">Gráfico de {reportData[reportType].title}</p>
            <p className="text-white/30 text-sm mt-2">Período: {periods.find(p => p.id === selectedPeriod)?.name}</p>
          </div>
        </div>
      </div>

      {/* Resumen de Actividad Reciente */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Actividad Reciente
        </h3>
        
        <div className="space-y-3">
          {[
            { action: 'Entrada de inventario', item: 'ACETAMINOFÉN', quantity: '50 unidades', time: 'Hace 2 horas', type: 'entrada' },
            { action: 'Despacho a paciente', item: 'ACICLOVIR', quantity: '5 unidades', time: 'Hace 4 horas', type: 'salida' },
            { action: 'Transferencia a Sede B', item: 'IBUPROFENO', quantity: '25 unidades', time: 'Hace 6 horas', type: 'transferencia' },
            { action: 'Recepción desde Almacén Principal', item: 'AMOXICILINA', quantity: '100 unidades', time: 'Ayer', type: 'entrada' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  activity.type === 'entrada' ? 'bg-green-400' :
                  activity.type === 'salida' ? 'bg-red-400' :
                  'bg-blue-400'
                }`}></div>
                <div>
                  <p className="text-white font-medium">{activity.action}</p>
                  <p className="text-white/70 text-sm">{activity.item} - {activity.quantity}</p>
                </div>
              </div>
              <p className="text-white/50 text-sm">{activity.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reportes;
