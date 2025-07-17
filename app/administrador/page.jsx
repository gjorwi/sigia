'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Importar íconos dinámicamente para evitar problemas de SSR
const Users = dynamic(() => import('lucide-react').then(mod => mod.Users), { ssr: false });
const Hospital = dynamic(() => import('lucide-react').then(mod => mod.Hospital), { ssr: false });
const AlertCircle = dynamic(() => import('lucide-react').then(mod => mod.AlertCircle), { ssr: false });
const Truck = dynamic(() => import('lucide-react').then(mod => mod.Truck), { ssr: false });
const PackagePlus = dynamic(() => import('lucide-react').then(mod => mod.PackagePlus), { ssr: false });
const Warehouse = dynamic(() => import('lucide-react').then(mod => mod.Warehouse), { ssr: false });

// Dynamically import the WarehouseMap component to avoid SSR issues with Leaflet
const WarehouseMap = dynamic(
  () => import('@/components/WarehouseMap'),
  { ssr: false }
);

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('mapa');
  const router = useRouter();

  const stats = [
    { 
      name: 'Total Insumos', 
      value: '2,685', 
      change: '+12% desde el mes pasado', 
      changeType: 'positive',
      color: '#10B981', // Verde
      icon: <Warehouse className="h-6 w-6" />
    },
    { 
      name: 'Stock Crítico', 
      value: '8', 
      change: 'Requiere atención inmediata', 
      changeType: 'negative',
      color: '#EF4444', // Rojo
      icon: <AlertCircle className="h-6 w-6" />
    },
    { 
      name: 'Hospitales Activos', 
      value: '15', 
      change: 'Conectados al sistema', 
      changeType: 'positive',
      color: '#3B82F6', // Azul
      icon: <Hospital className="h-6 w-6" />
    },
    { 
      name: 'Solicitudes Pendientes', 
      value: '23', 
      change: 'Esperando aprobación', 
      changeType: 'negative',
      color: '#F59E0B', // Ámbar
      icon: <Users className="h-6 w-6" />
    },
  ];

  const topSupplies = [
    { id: 1, name: 'Mascarillas N95', quantity: 1200, status: 'Bajo' },
    { id: 2, name: 'Guantes de Látex', quantity: 980, status: 'Bajo' },
    { id: 3, name: 'Jeringas 10ml', quantity: 1500, status: 'Medio' },
    { id: 4, name: 'Alcohol en Gel', quantity: 850, status: 'Bajo' },
    { id: 5, name: 'Agujas 21G', quantity: 2000, status: 'Medio' },
  ];

  const recentAlerts = [
    { id: 1, hospital: 'Hospital General', supply: 'Mascarillas N95', level: 'Crítico' },
    { id: 2, hospital: 'Hospital del Niño', supply: 'Guantes de Látex', level: 'Bajo' },
    { id: 3, hospital: 'Hospital de Emergencias', supply: 'Sueros Fisiológicos', level: 'Crítico' },
  ];

  return (
    <>
      {/* Main content */}
      <div className="md:ml-64 flex flex-col">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              
              {/* Quick Actions */}
              <div className=" bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Acciones Rápidas</h3>
                </div>
                <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                  <button
                      type="button"
                      onClick={() => router.push('/administrador/insumos/nuevo')}
                      className="inline-flex items-center justify-center px-4 py-3 text-sm font-medium rounded-md shadow-sm text-gray-700 border-l-4 border-blue-600 hover:bg-blue-700/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                      <PackagePlus className="-ml-1 mr-2 h-5 w-5 text-blue-600" />
                      Nuevo Insumo
                  </button>
                  <button
                      type="button"
                      onClick={() => router.push('/administrador/despachos/nuevo')}
                      className="inline-flex items-center justify-center px-4 py-3 text-sm font-medium rounded-md shadow-sm text-gray-700 border-l-4 border-green-600 hover:bg-green-700/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                      <Truck className="-ml-1 mr-2 h-5 w-5 text-green-600" />
                      Nuevo Despacho
                  </button>
                  <button
                      type="button"
                      onClick={() => router.push('/administrador/hospitales/nuevo')}
                      className="inline-flex items-center justify-center px-4 py-3 text-sm font-medium rounded-md shadow-sm text-gray-700 border-l-4 border-purple-600 hover:bg-purple-700/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                      <Hospital className="-ml-1 mr-2 h-5 w-5 text-purple-600" />
                      Nuevo Hospital
                  </button>
                  <button
                      type="button"
                      onClick={() => router.push('/administrador/usuarios/nuevo')}
                      className="inline-flex items-center justify-center px-4 py-3 text-sm font-medium rounded-md shadow-sm text-gray-700 border-l-4 border-indigo-600 hover:bg-indigo-700/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                      <Users className="-ml-1 mr-2 h-5 w-5 text-indigo-600" />
                      Nuevo Usuario
                  </button>
                </div>
              </div>
              {/* Main content */}
              <div className="mb-6">
                <div className="grid grid-cols-3 gap-2 mt-4 w-full p-2 bg-white rounded-md">
                  <button
                    onClick={() => setActiveTab('mapa')}
                    className={`px-4 py-2 rounded-md ${activeTab === 'mapa' ? 'bg-sky-600 text-white border border-gray-200 shadow-sm' : 'bg-gray-50 hover:bg-gray-100 text-gray-500 font-medium shadow-sm border border-gray-200'}`}
                  >
                    Mapa
                  </button>
                  <button
                    onClick={() => setActiveTab('analiticas')}
                    className={`px-4 py-2 rounded-md ${activeTab === 'analiticas' ? 'bg-sky-600 text-white border border-gray-200 shadow-sm' : 'bg-gray-50 hover:bg-gray-100 text-gray-500 font-medium shadow-sm border border-gray-200'}`}
                  >
                    Analíticas
                  </button>
                  
                  {/* <button
                    onClick={() => setActiveTab('deficiencias')}
                    className={`px-4 py-2 rounded-md ${activeTab === 'deficiencias' ? 'bg-white text-black' : 'bg-gray-100 hover:bg-white text-gray-500 font-medium'}`}
                  >
                    Deficiencias
                  </button> */}
                  <button
                    onClick={() => setActiveTab('despachos')}
                    className={`px-4 py-2 rounded-md ${activeTab === 'despachos' ? 'bg-sky-600 text-white border border-gray-200 shadow-sm' : 'bg-gray-50 hover:bg-gray-100 text-gray-500 font-medium shadow-sm border border-gray-200'}`}
                  >
                    Despachos
                  </button>
                </div>
                
                <div className="mt-4 p-4 bg-white rounded-lg shadow">
                  {activeTab === 'analiticas' && (
                    <div className="space-y-6">
                      {/* Stats */}
                      <div className="mt-2">
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                          {stats.map((stat) => (
                            <div key={stat.name} className="relative bg-white overflow-hidden  rounded-lg">
                              <div className="absolute left-0 top-0 h-full w-1" style={{ backgroundColor: stat.color }} />
                              <div className="px-5 py-4">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-sm font-medium text-gray-500">{stat.name}</h3>
                                  <div className="text-2xl" style={{ color: stat.color }}>
                                    {stat.icon}
                                  </div>
                                </div>
                                <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
                                <p className={`mt-1 text-sm text-gray-500`}>
                                  {stat.change}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-4 text-gray-900">Resumen de Inventario</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Nivel de Inventario */}
                          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                            <h4 className="text-sm font-medium text-gray-500 mb-2">Nivel de Inventario</h4>
                            <div className="space-y-3 text-gray-500">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-green-600">Alto</span>
                                  <span>42%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '42%' }}></div>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-yellow-500">Medio</span>
                                  <span>35%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-red-500">Bajo</span>
                                  <span>23%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '23%' }}></div>
                                </div>
                              </div>
                            </div>
                          </div>

                          

                          {/* Insumos en Alerta */}
                          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                            <h4 className="text-sm font-medium text-gray-500 mb-4">Insumos en Alerta</h4>
                            <div className="space-y-3">
                              {[
                                { name: 'Mascarillas N95', percent: 85, color: 'bg-red-500' },
                                { name: 'Guantes de Látex', percent: 72, color: 'bg-yellow-500' },
                                { name: 'Jeringas 3ml', percent: 45, color: 'bg-blue-500' },
                              ].map((item, index) => (
                                <div key={index}>
                                  <div className="flex justify-between text-sm mb-1 text-gray-500">
                                    <span>{item.name}</span>
                                    <span className="font-medium">{item.percent}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`${item.color} h-2 rounded-full`} 
                                      style={{ width: `${item.percent}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tabla de Insumos Próximos a Vencer */}
                      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                        <h4 className="text-sm font-medium text-gray-500 mb-4">Insumos Próximos a Vencer</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insumo</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lote</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vence</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {[
                                { id: 1, name: 'Mascarillas N95', lote: 'LTE-2023-001', cantidad: 120, vence: '15/07/2023', estado: 'Próximo a vencer' },
                                { id: 2, name: 'Guantes de Látex', lote: 'GLX-2023-045', cantidad: 85, vence: '20/07/2023', estado: 'Próximo a vencer' },
                                { id: 3, name: 'Jeringas 3ml', lote: 'JER-2023-102', cantidad: 200, vence: '25/07/2023', estado: 'En buen estado' },
                                { id: 4, name: 'Alcohol en Gel', lote: 'ALC-2023-056', cantidad: 45, vence: '05/08/2023', estado: 'En buen estado' },
                              ].map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.lote}</td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.cantidad}</td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.vence}</td>
                                  <td className="px-4 py-2 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      item.estado === 'Próximo a vencer' 
                                        ? 'bg-yellow-100 text-yellow-800' 
                                        : 'bg-green-100 text-green-800'
                                    }`}>
                                      {item.estado}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === 'mapa' && (
                    <div className="space-y-4">
                      <div className="h-[500px] rounded-lg overflow-hidden border border-gray-200">
                        <WarehouseMap />
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Resumen de Almacenes</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white p-3 rounded-lg shadow border border-green-100">
                            <div className="flex items-center">
                              <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
                                <Warehouse className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Almacén Central</p>
                                <p className="font-semibold text-green-600">Inventario Alto</p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white p-3 rounded-lg shadow border border-yellow-100">
                            <div className="flex items-center">
                              <div className="p-2 rounded-full bg-yellow-100 text-yellow-600 mr-3">
                                <Warehouse className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Almacén Norte</p>
                                <p className="font-semibold text-yellow-600">Inventario Medio</p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white p-3 rounded-lg shadow border border-red-100">
                            <div className="flex items-center">
                              <div className="p-2 rounded-full bg-red-100 text-red-600 mr-3">
                                <Warehouse className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Almacén Este</p>
                                <p className="font-semibold text-red-600">Inventario Bajo</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === 'despachos' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Gestión de Despachos</h3>
                        <p className="text-gray-500 mb-6">Seguimiento y control de despachos realizados</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 text-gray-700">
                          {/* Tarjeta de Resumen */}
                          <div className="bg-white p-4 rounded-lg shadow border border-blue-100">
                            <div className="flex items-center">
                              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                                <Truck className="h-6 w-6" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Total de Despachos</p>
                                <p className="text-2xl font-semibold">156</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Tarjeta de Pendientes */}
                          <div className="bg-white p-4 rounded-lg shadow border border-yellow-100">
                            <div className="flex items-center">
                              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                                <AlertCircle className="h-6 w-6" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Pendientes</p>
                                <p className="text-2xl font-semibold">8</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Tarjeta de Completados */}
                          <div className="bg-white p-4 rounded-lg shadow border border-green-100">
                            <div className="flex items-center">
                              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Completados (últimos 30 días)</p>
                                <p className="text-2xl font-semibold">42</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Tabla de Despachos Recientes */}
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                            <h4 className="text-sm font-medium text-gray-500">Despachos Recientes</h4>
                            <button
                              onClick={() => router.push('/administrador/despachos/nuevo')}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <Truck className="-ml-1 mr-1 h-4 w-4" />
                              Nuevo Despacho
                            </button>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insumos</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {[
                                  { 
                                    id: 'DESP-2023-0456', 
                                    hospital: 'Hospital General', 
                                    fecha: '07/07/2023',
                                    insumos: 12,
                                    estado: 'Completado'
                                  },
                                  { 
                                    id: 'DESP-2023-0455', 
                                    hospital: 'Hospital del Niño', 
                                    fecha: '06/07/2023',
                                    insumos: 8,
                                    estado: 'En tránsito'
                                  },
                                  { 
                                    id: 'DESP-2023-0454', 
                                    hospital: 'Hospital de Emergencias', 
                                    fecha: '05/07/2023',
                                    insumos: 15,
                                    estado: 'Pendiente'
                                  },
                                  { 
                                    id: 'DESP-2023-0453', 
                                    hospital: 'Hospital Central', 
                                    fecha: '04/07/2023',
                                    insumos: 10,
                                    estado: 'Completado'
                                  },
                                ].map((item, index) => (
                                  <tr key={index} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/despachos/${item.id}`)}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{item.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.hospital}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.fecha}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.insumos} insumos</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        item.estado === 'Completado' ? 'bg-green-100 text-green-800' :
                                        item.estado === 'En tránsito' ? 'bg-blue-100 text-blue-800' :
                                        'bg-yellow-100 text-yellow-800'
                                      }`}>
                                        {item.estado}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                            <div className="flex-1 flex justify-between sm:hidden">
                              <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                Anterior
                              </a>
                              <a href="#" className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                Siguiente
                              </a>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                              <div>
                                <p className="text-sm text-gray-700">
                                  Mostrando <span className="font-medium">1</span> a <span className="font-medium">4</span> de <span className="font-medium">156</span> resultados
                                </p>
                              </div>
                              <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                  <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                    <span className="sr-only">Anterior</span>
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </a>
                                  <a href="#" aria-current="page" className="z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                                    1
                                  </a>
                                  <a href="#" className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                                    2
                                  </a>
                                  <a href="#" className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                                    3
                                  </a>
                                  <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                    <span className="sr-only">Siguiente</span>
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </a>
                                </nav>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                            <h4 className="text-sm font-medium text-gray-500 mb-4">Distribución por Hospital (Mes Actual)</h4>
                            <div className="space-y-3">
                              {[
                                { name: 'Hospital General', value: 35, color: 'bg-blue-500' },
                                { name: 'Hospital del Niño', value: 25, color: 'bg-green-500' },
                                { name: 'Hospital de Emergencias', value: 20, color: 'bg-yellow-500' },
                                { name: 'Otros', value: 20, color: 'bg-gray-300' },
                              ].map((item, index) => (
                                <div key={index}>
                                  <div className="flex justify-between text-sm mb-1 text-gray-500">
                                    <span className="text-gray-700">{item.name}</span>
                                    <span className="font-medium">{item.value}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`${item.color} h-2 rounded-full`} 
                                      style={{ width: `${item.value}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                            <h4 className="text-sm font-medium text-gray-500 mb-4">Estadísticas Rápidas</h4>
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm text-gray-500">Tiempo promedio de entrega</p>
                                <p className="text-lg font-semibold text-gray-700">2.5 <span className="text-sm font-normal text-gray-500">días</span></p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Insumos más despachados</p>
                                <ul className="mt-1 text-sm text-gray-700 space-y-1">
                                  <li className="flex justify-between">
                                    <span>Mascarillas N95</span>
                                    <span className="font-medium">1,250 uds</span>
                                  </li>
                                  <li className="flex justify-between">
                                    <span>Guantes de Látex</span>
                                    <span className="font-medium">980 pares</span>
                                  </li>
                                  <li className="flex justify-between">
                                    <span>Jeringas 3ml</span>
                                    <span className="font-medium">750 uds</span>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
            </div>
          </div>
        </main>
      </div>
    </>  
  );
};

export default DashboardPage;