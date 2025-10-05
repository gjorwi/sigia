'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  Truck, 
  ClipboardList,
  PlusCircle,
  AlertCircle,
  BarChart3,
  FileText,
} from 'lucide-react';

// Importar componentes
import Recepcion from './components/Recepcion';
import Tracking from './components/Tracking';
import Inventario from './components/Inventario';
import Registro from './components/Registro';
import Reportes from './components/Reportes';
import { useAuth } from '@/contexts/AuthContext';  

export default function ClientePage() {
  const {user} = useAuth();
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
      name: 'Total despachos', 
      value: '1', 
      icon: Truck, 
      color: 'bg-blue-500',
      trend: 'Despachos',
      trendType: 'neutral'
    },
    { 
      id: 3, 
      name: 'Insumos en falla', 
      value: '3', 
      icon: AlertCircle, 
      color: 'bg-orange-500',
      trend: 'Insumos en falla',
      trendType: 'up'
    },
    { 
      id: 4, 
      name: 'Pacientes', 
      value: '2', 
      icon: AlertCircle, 
      color: 'bg-yellow-500',
      trend: 'Despachados',
      trendType: 'warning'
    },
  ];

  return (
    <>
      <div className="mb-4">
        {/* <h2 className="text-2xl font-bold text-white">Panel de Control</h2> */}
        <div className="flex md:items-center md:flex-row flex-col pl-6 py-2 mb-4 gap-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg">
          <span className="text-white text-sm mt-1 capitalize">{user?.hospital?.nombre}</span>
          <span className="text-white bg-orange-500 w-fit px-2 rounded-full text-sm capitalize">{user?.sede?.nombre}</span>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-4">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 p-2 bg-white backdrop-blur-lg border border-white/10 rounded-lg">
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
            <span className="font-medium">Movimientos</span>
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
            <span className="font-medium">Registro/Despacho</span>
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
          {/* Mostrar Seguimiento solo para almacén principal */}
          {user?.sede?.tipo_almacen === 'almacenPrin' ? (
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
          ) : (
            <button 
              className={`flex gap-2 items-center justify-start px-4 py-3 rounded-lg transition-all duration-200 group ${
                menuActivo === 'reportes' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-orange-500/15 text-gray-800 hover:bg-orange-500/30'
              }`}
              onClick={() => setMenuActivo('reportes')}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                menuActivo === 'reportes' ? 'bg-white/20' : 'bg-orange-500/90 text-white'
              }`}>
                <BarChart3 className="h-5 w-5" />
              </div>
              <span className="font-medium">Reportes</span>
            </button>
          )}
        </div>
      </div>
      <div className="mt-2">
        {menuActivo === "recepcion" && <Recepcion />}
        {menuActivo === "tracking" && <Tracking />}
        {menuActivo === "inventario" && <Inventario setMenuActivo={setMenuActivo}/>}
        {menuActivo === "registro" && <Registro />}
        {menuActivo === "reportes" && <Reportes />}
      </div>
    </>
  );
}