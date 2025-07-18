'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  Truck, 
  Bell, 
  Clock,
  ClipboardList,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  User,
  Settings,
  LogOut
} from 'lucide-react';

// Importar componentes
import Recepcion from './components/Recepcion';
import Tracking from './components/Tracking';
import Inventario from './components/Inventario';
import Registro from './components/Registro';

export default function ClientePage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [menuActivo, setMenuActivo] = useState('recepcion');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Aquí iría la lógica de cierre de sesión
    router.push('/');
  };

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const stats = [
    { 
      id: 1, 
      name: 'Total de insumos', 
      value: '3560', 
      icon: Package, 
      color: 'bg-indigo-500',
      trend: '12% más que el mes pasado',
      trendType: 'up'
    },
    { 
      id: 2, 
      name: 'En transito', 
      value: '1', 
      icon: Truck, 
      color: 'bg-blue-500',
      trend: '1 en camino',
      trendType: 'neutral'
    },
    { 
      id: 3, 
      name: 'Insumos en falla', 
      value: '3', 
      icon: AlertCircle, 
      color: 'bg-orange-500',
      trend: '3 en falla',
      trendType: 'up'
    },
    { 
      id: 4, 
      name: 'Solicitudes', 
      value: '2', 
      icon: AlertCircle, 
      color: 'bg-yellow-500',
      trend: '2 pendientes',
      trendType: 'warning'
    },
  ];

  const recentShipments = [
    {
      id: 'DESP-2023-015',
      origin: 'Almacén Central',
      destination: 'Hospital Regional',
      status: 'en_ruta',
      estimatedArrival: '2023-12-15T14:30:00',
      items: 5,
      totalItems: 350,
    },
    {
      id: 'DESP-2023-014',
      origin: 'Almacén Central',
      destination: 'Clínica San José',
      status: 'entregado',
      deliveredAt: '2023-11-28T11:30:00',
      estimatedArrival: '2023-11-28T11:30:00',
      items: 2,
      totalItems: 1000,
    },
    {
      id: 'DESP-2023-013',
      origin: 'Almacén Central',
      destination: 'Centro Médico Norte',
      status: 'preparado',
      estimatedArrival: '2023-12-05T09:15:00',
      items: 8,
      totalItems: 1200,
    },
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      en_ruta: { bg: 'bg-blue-100 text-blue-800', label: 'En Ruta', icon: Truck },
      entregado: { bg: 'bg-green-100 text-green-800', label: 'Entregado', icon: CheckCircle2 },
      preparado: { bg: 'bg-yellow-100 text-yellow-800', label: 'Preparado', icon: Package },
      pendiente: { bg: 'bg-gray-100 text-gray-800', label: 'Pendiente', icon: Clock },
      incidencia: { bg: 'bg-red-100 text-red-800', label: 'Incidencia', icon: AlertCircle },
    };
    
    const config = statusConfig[status] || statusConfig.pendiente;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${config.bg}`}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const options = { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-indigo-900/80 via-blue-800/80 to-purple-900/80 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Fondo artístico con overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-blue-800/60 to-blue-900/90"></div>
        <div className="absolute left-1/2 top-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-indigo-400/30 via-blue-400/20 to-transparent rounded-full blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2 animate-pulse-slow"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white backdrop-blur-md shadow-lg border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center gap-2 justify-center">
                  <h1 className="text-xl font-bold text-indigo-800">SIGIA </h1>
                <div className="flex flex-col justify-center">
                  <span className="text-gray-500 text-sm mt-1 capitalize">Hospital Dr. Rafael Gallardo</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Notificaciones */}
              <div className="relative" ref={notificationsRef}>
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                    setUserMenuOpen(false);
                  }}
                  className="relative rounded-full bg-white/10 p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
                >
                  <span className="sr-only">Ver notificaciones</span>
                  <Bell className="h-6 w-6" aria-hidden="true" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-500 text-xs text-white flex items-center justify-center">3</span>
                </button>
                
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-700">Notificaciones (3)</p>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {[1, 2, 3].map((item) => (
                        <div key={item} className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                          <p className="text-sm text-gray-700">Nuevo despacho programado</p>
                          <p className="text-xs text-gray-500">Hace {item} hora{item !== 1 ? 's' : ''}</p>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2 border-t border-gray-100 text-center">
                      <a href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-800">Ver todas las notificaciones</a>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Menú de usuario */}
              <div className="relative" ref={userMenuRef}>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(!userMenuOpen);
                      setNotificationsOpen(false);
                    }}
                    className="flex rounded-full bg-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
                    id="user-menu-button"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    <span className="sr-only">Abrir menú de usuario</span>
                    <div className="h-8 w-8 rounded-full bg-indigo-200 flex items-center justify-center">
                      <span className="text-indigo-800 font-medium">UC</span>
                    </div>
                  </button>
                </div>

                {userMenuOpen && (
                  <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-700">Usuario Cliente</p>
                      <p className="text-xs text-gray-500 truncate">usuario@cliente.com</p>
                    </div>
                    <a
                      href="#"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Perfil
                    </a>
                    <a
                      href="#"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Configuración
                    </a>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-20 pb-20 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Panel de Control</h2>
          <p className="mt-1 text-indigo-100 mb-6">Bienvenido al módulo de cliente de SIGIA</p>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {stats.map((stat) => (
              <div key={stat.id} className="overflow-hidden rounded-2xl bg-white/10 backdrop-blur-lg border border-white/10 p-6 shadow-lg">
                <div className="flex items-center">
                  <div className={`${stat.color} rounded-lg p-3`}>
                    <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dt className="truncate text-sm font-medium text-indigo-100">{stat.name}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-white">{stat.value}</div>
                      <div className="ml-2 flex items-baseline text-sm font-medium">
                        {stat.trendType === 'up' && (
                          <span className="text-green-400">{stat.trend}</span>
                        )}
                        {stat.trendType === 'neutral' && (
                          <span className="text-indigo-200">{stat.trend}</span>
                        )}
                        {stat.trendType === 'warning' && (
                          <span className="text-yellow-400">{stat.trend}</span>
                        )}
                      </div>
                    </dd>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Navegación entre secciones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 p-2 bg-white backdrop-blur-lg border border-white/10 rounded-lg">
            <button 
              className={`flex gap-2 items-center justify-start px-4 py-3 rounded-lg transition-all duration-200 group ${
                menuActivo === 'recepcion' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-indigo-500/15 text-gray-800 hover:bg-indigo-500/30'
              }`}
              onClick={() => setMenuActivo('recepcion')}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                menuActivo === 'recepcion' ? 'bg-white/20' : 'bg-indigo-500/90 text-white'
              }`}>
                <Package className="h-5 w-5" />
              </div>
              <span className="font-medium">Recepción</span>
            </button>
            
            <button 
              className={`flex gap-2 items-center justify-start px-4 py-3 rounded-lg transition-all duration-200 group ${
                menuActivo === 'tracking' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-500/15 text-gray-800 hover:bg-blue-500/30'
              }`}
              onClick={() => setMenuActivo('tracking')}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                menuActivo === 'tracking' ? 'bg-white/20' : 'bg-blue-500/90 text-white'
              }`}>
                <Truck className="h-5 w-5" />
              </div>
              <span className="font-medium">Seguimiento</span>
            </button>
            
            <button 
              className={`flex gap-2 items-center justify-start px-4 py-3 rounded-lg transition-all duration-200 group ${
                menuActivo === 'inventario' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-green-500/10 text-gray-800 hover:bg-green-500/30'
              }`}
              onClick={() => setMenuActivo('inventario')}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                menuActivo === 'inventario' ? 'bg-white/20' : 'bg-green-500/90 text-white'
              }`}>
                <ClipboardList className="h-5 w-5" />
              </div>
              <span className="font-medium">Inventario</span>
            </button>
            
            <button 
              className={`flex gap-2 items-center justify-start px-4 py-3 rounded-lg transition-all duration-200 group ${
                menuActivo === 'registro' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-purple-500/15 text-gray-800 hover:bg-purple-500/30'
              }`}
              onClick={() => setMenuActivo('registro')}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                menuActivo === 'registro' ? 'bg-white/20' : 'bg-purple-500/90 text-white'
              }`}>
                <PlusCircle className="h-5 w-5" />
              </div>
              <span className="font-medium">Registro</span>
            </button>
          </div>
        </div>

        <div className="mt-6">
          {menuActivo === "recepcion" && <Recepcion />}
          {menuActivo === "tracking" && <Tracking />}
          {menuActivo === "inventario" && <Inventario />}
          {menuActivo === "registro" && <Registro />}
        </div>
        
      </main>

      <footer className="fixed bottom-0 w-full z-50 border-t border-white/10 bg-white/5 py-4 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-indigo-100">
            &copy; 2023 SIGIA - Sistema de Gestión de Inventario para Almacenes. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}