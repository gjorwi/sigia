'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/AuthContext';
import Modal from '@/components/Modal';
import { getHospitales } from '@/servicios/hospitales/get';
import { getUsers } from '@/servicios/users/get';
import { getInsumos } from '@/servicios/insumos/get';
import { getSedes } from '@/servicios/sedes/get';
import { getSedeByHospitalId } from '@/servicios/sedes/get';
import { getMovimientos } from '@/servicios/despachos/get';
import MapAlmacenes from '@/components/mapAlmacenes';
import LoadingSpinner from '@/components/LoadingSpinner';
import SelectHospiModal from '@/components/SelectHospiModal';
import SelectSedeModal from '@/components/SelectSedeModal';
import ModalDetallesRecepcion from '@/app/cliente/components/ModalDetallesRecepcion';
// Importar íconos dinámicamente para evitar problemas de SSR
const Users = dynamic(() => import('lucide-react').then(mod => mod.Users), { ssr: false });
const Hospital = dynamic(() => import('lucide-react').then(mod => mod.Hospital), { ssr: false });
const AlertCircle = dynamic(() => import('lucide-react').then(mod => mod.AlertCircle), { ssr: false });
const Truck = dynamic(() => import('lucide-react').then(mod => mod.Truck), { ssr: false });
const PackagePlus = dynamic(() => import('lucide-react').then(mod => mod.PackagePlus), { ssr: false });
const Warehouse = dynamic(() => import('lucide-react').then(mod => mod.Warehouse), { ssr: false });
const MapPin = dynamic(() => import('lucide-react').then(mod => mod.MapPin), { ssr: false });
const Activity = dynamic(() => import('lucide-react').then(mod => mod.Activity), { ssr: false });
const Package = dynamic(() => import('lucide-react').then(mod => mod.Package), { ssr: false });

// Dynamically import the WarehouseMap component to avoid SSR issues with Leaflet
const WarehouseMap = dynamic(
  () => import('@/components/WarehouseMap'),
  { ssr: false }
);

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('mapa');
  const [menuActivo, setMenuActivo] = useState('mapa');
  const router = useRouter();
  const [isLoadingAlmacenes, setIsLoadingAlmacenes] = useState(false);
  const [hospitales, setHospitales] = useState([]);
  const [users, setUsers] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [modal, setModal] = useState({isOpen: false, title: '', message: '', type: 'info', time: null});
  
  // Estados para filtros de despachos
  const [selectedHospitalDespacho, setSelectedHospitalDespacho] = useState(null);
  const [selectedSedeDespacho, setSelectedSedeDespacho] = useState(null);
  const [showHospitalModalDespacho, setShowHospitalModalDespacho] = useState(false);
  const [showSedeModalDespacho, setShowSedeModalDespacho] = useState(false);
  const [sedesDespacho, setSedesDespacho] = useState([]);
  const [movimientosDespacho, setMovimientosDespacho] = useState([]);
  const [loadingMovimientos, setLoadingMovimientos] = useState(false);
  
  // Estados para el modal de detalles
  const [showModalDetalles, setShowModalDetalles] = useState(false);
  const [selectedMovimiento, setSelectedMovimiento] = useState(null);
  
  useEffect(() => {
    if (user) {
      handleGetResumen(user.token);
    }
  }, [user]);

  const handleGetResumen = async (token) => {
    setIsLoadingAlmacenes(false);
    const [hRes, uRes, iRes, sRes] = await Promise.allSettled([
      getHospitales(token),
      getUsers(token),
      getInsumos(token),
      getSedes(token)
    ])

    const msgs = []
    console.log(JSON.stringify(hRes,null,2))
    // Hospitales
    if (hRes.status === 'fulfilled') {
      const r = hRes.value
      if (r?.autenticacion === 1 || r?.autenticacion === 2) {
        showMessage('Error', 'Su sesión ha expirado', 'error', 4000)
        logout()
        router.replace('/')
        return
      }
      if (r?.status && r?.status !== 500 && r?.data) {
        console.log('Hospitales cargados:', r.data.data?.length || 0, 'hospitales')
        console.log('Lista de hospitales:', r.data.data)
        setHospitales(r.data.data || [])
      } else {
        console.log('Error en respuesta de hospitales:', r)
        msgs.push(r?.mensaje || 'Error al cargar hospitales')
      }
    } else {
      msgs.push('Error de red al cargar hospitales')
    }
    // Usuarios
    if (uRes.status === 'fulfilled') {
      const r = uRes.value
      if (r?.status && r?.status !== 500 && r?.data) {
        setUsers(r.data.data || [])
      } else {
        msgs.push(r?.mensaje || 'Error al cargar usuarios')
      }
    } else {
      msgs.push('Error de red al cargar usuarios')
    }

    // Insumos
    if (iRes.status === 'fulfilled') {
      const r = iRes.value
      if (r?.status && r?.status !== 500 && r?.data) {
        setInsumos(r.data.data || [])
      } else {
        msgs.push(r?.mensaje || 'Error al cargar insumos')
      }
    } else {
      msgs.push('Error de red al cargar insumos')
    }

    // Sedes
    if (sRes.status === 'fulfilled') {
      const r = sRes.value
      if (r?.status && r?.status !== 500 && r?.data) {
        setSedes(r.data.data || [])
      } else {
        msgs.push(r?.mensaje || 'Error al cargar sedes')
      }
    } else {
      msgs.push('Error de red al cargar sedes')
    }

    if (msgs.length&&user.can_crud_user) {
      showMessage('Aviso', msgs.join(' | '), 'warning', 5000)
    }
    setIsLoadingAlmacenes(true);
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const showMessage = (title, message, type = 'info', time = null) => {
    setModal({isOpen: true, title, message, type, time});
  };

  // Funciones para manejo de despachos
  const handleSelectHospitalDespacho = (hospital) => {
    setSelectedHospitalDespacho(hospital);
    setSelectedSedeDespacho(null); // Reset sede cuando cambia hospital
    handleSedeDespacho(hospital.id);
    setShowHospitalModalDespacho(false);
  };

  const handleSelectSedeDespacho = (sede) => {
    setSelectedSedeDespacho(sede);
    setShowSedeModalDespacho(false);
    // Cargar movimientos de la sede seleccionada
    handleLoadMovimientos(sede.id);
  };

  const handleSedeDespacho = async (hospitalId) => {
    if (!user?.token) return;
    try {
      const sede = await getSedeByHospitalId(hospitalId, user.token);
      if (!sede.status) {
        if (sede.autenticacion === 1 || sede.autenticacion === 2) {
          showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
          logout();
          router.replace('/');
          return;
        }
        showMessage('Error', sede.mensaje, 'error', 4000);
        return;
      }
      if (sede.data && sede.data.data) {
        setSedesDespacho(sede.data.data);
        
      }
    } catch (error) {
      console.error('Error al cargar sedes:', error);
      showMessage('Error', 'Error al cargar sedes', 'error', 4000);
    }
  };

  const openHospitalModalDespacho = () => {
    setShowHospitalModalDespacho(true);
  };

  const openSedeModalDespacho = () => {
    setShowSedeModalDespacho(true);
  };

  const handleLoadMovimientos = async (sedeId) => {
    if (!user?.token || !sedeId) return;
    
    setLoadingMovimientos(true);
    try {
      console.log('Cargando movimientos para sede:', sedeId);
      const response = await getMovimientos(user.token, sedeId);
      
      if (!response.status) {
        if (response.autenticacion === 1 || response.autenticacion === 2) {
          showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
          logout();
          router.replace('/');
          return;
        }
        showMessage('Error', response.mensaje || 'Error al cargar movimientos', 'error', 4000);
        setMovimientosDespacho([]);
        return;
      }
      
      console.log('Movimientos cargados:', response.data?.length || 0);
      console.log('Lista de movimientos:', response.data);
      // Asegurar que siempre sea un array
      const movimientos = Array.isArray(response.data?.data) ? response.data.data : 
                         Array.isArray(response.data) ? response.data : [];
      setMovimientosDespacho(movimientos);
      
    } catch (error) {
      console.error('Error al cargar movimientos:', error);
      showMessage('Error', 'Error al cargar movimientos', 'error', 4000);
      setMovimientosDespacho([]);
    } finally {
      setLoadingMovimientos(false);
    }
  };

  const clearFiltersDespacho = () => {
    setSelectedHospitalDespacho(null);
    setSelectedSedeDespacho(null);
    setSedesDespacho([]);
    setMovimientosDespacho([]);
  };

  // Funciones para el modal de detalles
  const handleShowMovimientoDetalles = (movimiento) => {
    setSelectedMovimiento(movimiento);
    setShowModalDetalles(true);
  };

  const handleCloseModalDetalles = () => {
    setShowModalDetalles(false);
    setSelectedMovimiento(null);
  };

  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const stats = [
    { 
      name: 'Total Insumos', 
      value: insumos.length, 
      change: '+12% desde el mes pasado', 
      changeType: 'positive',
      color: '#10B981', // Verde
      icon: <Warehouse className="h-6 w-6" />
    },
    { 
      name: 'Sedes Registradas', 
      value: sedes.length, 
      change: '', 
      changeType: 'neutral',
      color: '#D946EF',
      icon: <AlertCircle className="h-6 w-6" />
    },
    { 
      name: 'Hospitales Activos', 
      value: hospitales.length, 
      change: 'Registrados en sistema', 
      changeType: 'positive',
      color: '#3B82F6', // Azul
      icon: <Hospital className="h-6 w-6" />
    },
    { 
      name: 'Usuarios Activos', 
      value: users.length, 
      change: 'Registrados en sistema', 
      changeType: 'neutral',
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
      <Modal 
        isOpen={modal.isOpen} 
        onClose={closeModal} 
        title={modal.title} 
        message={modal.message} 
        type={modal.type} 
        time={modal.time}
      />
      {/* Main content */}
      <div className="md:ml-64 flex flex-col">
        <main className="flex-1">
          <div className="pb-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-5">
              
              {/* Quick Actions */}
              <div className=" bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-3 sm:px-6 border-b border-gray-200">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4 w-full bg-white rounded-md">
                  <button 
                    className={`flex gap-2 items-center justify-start px-4 py-3 rounded-lg transition-all duration-200 group ${
                      menuActivo === 'mapa' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-indigo-500/15 text-gray-800 hover:bg-indigo-500/30'
                    }`}
                    onClick={() => setMenuActivo('mapa')}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      menuActivo === 'mapa' ? 'bg-white/20' : 'bg-indigo-500/90 text-white'
                    }`}>
                      <MapPin className="h-5 w-5" />
                    </div>
                    <span className="font-medium">Mapa</span>
                  </button>
                  <button 
                    className={`flex gap-2 items-center justify-start px-4 py-3 rounded-lg transition-all duration-200 group ${
                      menuActivo === 'analiticas' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-indigo-500/15 text-gray-800 hover:bg-indigo-500/30'
                    }`}
                    onClick={() => setMenuActivo('analiticas')}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      menuActivo === 'analiticas' ? 'bg-white/20' : 'bg-indigo-500/90 text-white'
                    }`}>
                      <Activity className="h-5 w-5" />
                    </div>
                    <span className="font-medium">Analíticas</span>
                  </button>
                  <button 
                    className={`flex gap-2 items-center justify-start px-4 py-3 rounded-lg transition-all duration-200 group ${
                      menuActivo === 'despachos' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-indigo-500/15 text-gray-800 hover:bg-indigo-500/30'
                    }`}
                    onClick={() => setMenuActivo('despachos')}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      menuActivo === 'despachos' ? 'bg-white/20' : 'bg-indigo-500/90 text-white'
                    }`}>
                      <Truck className="h-5 w-5" />
                    </div>
                    <span className="font-medium">Despachos</span>
                  </button>
                </div>
                
                <div className="mt-4 bg-white rounded-lg shadow">
                  {menuActivo === 'analiticas' && (
                    <div className="space-y-6 p-4">
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
                  {menuActivo === 'mapa' && (
                    <div className="space-y-4 p-2">
                      <div className="rounded-lg overflow-hidden border border-gray-200">
                        {isLoadingAlmacenes?
                          <MapAlmacenes almacenes={hospitales}/>
                        :
                          <LoadingSpinner message="Cargando almacenes..." />
                        }
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
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
                  {menuActivo === 'despachos' && (
                    <div className="p-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Gestión de Despachos</h3>
                        <p className="text-gray-500 mb-6">Seguimiento y control de despachos realizados</p>
                        <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-6">
                          <h4 className="text-sm font-medium text-gray-900 mb-4">Filtros de Búsqueda</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Selector de Hospital */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Hospital
                              </label>
                              <button
                                type="button"
                                onClick={openHospitalModalDespacho}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-left bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <span className={selectedHospitalDespacho ? "text-gray-900" : "text-gray-500"}>
                                  {selectedHospitalDespacho ? selectedHospitalDespacho.nombre : "Seleccionar hospital..."}
                                </span>
                              </button>
                            </div>
                            
                            {/* Selector de Sede */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sede
                              </label>
                              <button
                                type="button"
                                onClick={openSedeModalDespacho}
                                disabled={!selectedHospitalDespacho}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-left bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                  !selectedHospitalDespacho ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                <span className={selectedSedeDespacho ? "text-gray-900" : "text-gray-500"}>
                                  {selectedSedeDespacho ? selectedSedeDespacho.nombre : 
                                  selectedHospitalDespacho ? "Seleccionar sede..." : "Primero seleccione un hospital"}
                                </span>
                              </button>
                            </div>
                            
                            {/* Botón para limpiar filtros */}
                            <div className="flex items-end">
                              <button
                                type="button"
                                onClick={clearFiltersDespacho}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                Limpiar Filtros
                              </button>
                            </div>
                          </div>
                          
                          {/* Indicadores de filtros activos */}
                          {(selectedHospitalDespacho || selectedSedeDespacho) && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {selectedHospitalDespacho && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Hospital: {selectedHospitalDespacho.nombre}
                                </span>
                              )}
                              {selectedSedeDespacho && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Sede: {selectedSedeDespacho.nombre}
                                </span>
                              )}
                            </div>
                          )}
                        </div>      
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 text-gray-700">
                          {/* Tarjeta de Resumen */}
                          <div className="bg-white p-4 rounded-lg shadow border border-blue-100">
                            <div className="flex items-center">
                              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                                <Truck className="h-6 w-6" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Total de Despachos</p>
                                <p className="text-2xl font-semibold">{Array.isArray(movimientosDespacho) ? movimientosDespacho.length : 0}</p>
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
                                <p className="text-2xl font-semibold">{Array.isArray(movimientosDespacho) ? movimientosDespacho.filter(m => m.estado === 'pendiente').length : 0}</p>
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
                                <p className="text-2xl font-semibold">{Array.isArray(movimientosDespacho) ? movimientosDespacho.filter(m => m.estado === 'recibido').length : 0}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Tabla de Despachos Recientes */}
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                            <h4 className="text-sm font-medium text-gray-500">
                              {selectedSedeDespacho ? `Movimientos de ${selectedSedeDespacho.nombre}` : 'Despachos Recientes'}
                            </h4>
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
                                {loadingMovimientos ? (
                                  <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center">
                                      <div className="flex items-center justify-center">
                                        <LoadingSpinner />
                                        <span className="ml-2 text-gray-500">Cargando movimientos...</span>
                                      </div>
                                    </td>
                                  </tr>
                                ) : movimientosDespacho.length > 0 ? (
                                  movimientosDespacho.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleShowMovimientoDetalles(item)}>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{item.id}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{selectedHospitalDespacho?.nombre || 'N/A'}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.fecha_despacho)}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.lotes_grupos?.length || 0} insumos</td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                          item.estado === 'completado' ? 'bg-green-100 text-green-800' :
                                          item.estado === 'en_transito' ? 'bg-blue-100 text-blue-800' :
                                          'bg-yellow-100 text-yellow-800'
                                        }`}>
                                          {item.estado === 'completado' ? 'Completado' : 
                                           item.estado === 'en_transito' ? 'En tránsito' : 'Pendiente'}
                                        </span>
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                      {selectedSedeDespacho ? 'No hay movimientos para esta sede' : 'Seleccione una sede para ver los movimientos'}
                                    </td>
                                  </tr>
                                )}
                                
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
                        
                        {/* <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        </div> */}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
            </div>
          </div>
        </main>
        {/* Modales para selección de hospital y sede en despachos */}
        <SelectHospiModal
          isOpen={showHospitalModalDespacho}
          onClose={() => setShowHospitalModalDespacho(false)}
          onSelect={handleSelectHospitalDespacho}
          hospitals={hospitales}
          tipo="despachos"
        />
        <SelectSedeModal
          isOpen={showSedeModalDespacho}
          onClose={() => setShowSedeModalDespacho(false)}
          onSelect={handleSelectSedeDespacho}
          sedes={sedesDespacho}
        />
        <ModalDetallesRecepcion
          isOpen={showModalDetalles}
          recepcion={selectedMovimiento}
          onClose={handleCloseModalDetalles}
          formatDate={formatDate}
        />
      </div>
    </>  
  );
};

export default DashboardPage;