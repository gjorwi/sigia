'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  Truck,
  AlertCircle,
  BarChart3,
  Send
} from 'lucide-react';

// Importar componentes
import Recepcion from './components/Recepcion';
import Tracking from './components/Tracking';
import Reportes from './components/Reportes';
import { useAuth } from '@/contexts/AuthContext';
import { getStats } from '@/servicios/estadisticas/get';
import Modal from '@/components/Modal';
import ModalSolicitud from '@/components/ModalSolicitud';

export default function ClientePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [menuActivo, setMenuActivo] = useState('recepcion');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const [estadisticas, setEstadisticas] = useState([]);
  const [showSolicitudModal, setShowSolicitudModal] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info', // 'info', 'error', 'success', 'warning'
    time: null
  });

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

  useEffect(() => {
    setIsLoaded(true);
    if (user) {
      handleStats();
    }
  }, []);

  const showMessage = (title, message, type = 'info', time = null) => {
    setModal({ isOpen: true, title, message, type, time });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleStats = async () => {
    const { token, sede_id } = user;
    const result = await getStats(token, sede_id);
    console.log(JSON.stringify(result, null, 2));
    if (!result.status) {
      if (result.autenticacion === 1 || result.autenticacion === 2) {
        showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
        logout();
        router.replace('/');
        return;
      }
      showMessage('Error', result.mensaje || "Error en la solicitud", 'error', 4000);
      return;
    }
    console.log(JSON.stringify(result.data, null, 2));
    setEstadisticas(result.data);
  };

  const handleSolicitudSubmit = async (formData) => {
    console.log('Solicitud enviada:', formData);
    // Aquí iría la llamada al servicio real
    // const result = await postSolicitud(formData, user.token);

    // Simular éxito
    setTimeout(() => {
      showMessage('Éxito', 'Solicitud enviada correctamente', 'success', 3000);
    }, 500);
  };

  const stats = [
    {
      id: 1,
      name: 'Total de insumos',
      value: estadisticas?.resumen_insumos?.total || 0,
      icon: Package,
      color: 'bg-indigo-500',
      trend: 'insumos',
      trendType: 'up'
    },
    {
      id: 2,
      name: 'Total despachos',
      value: estadisticas?.resumen_movimientos?.total || 0,
      icon: Truck,
      color: 'bg-blue-500',
      trend: 'Despachos',
      trendType: 'neutral'
    },
    ...(user?.sede?.tipo_almacen === 'almacenAUS'
      ? []
      : [
          {
            id: 3,
            name: 'Insumos en falla',
            value: estadisticas?.resumen_faltantes?.total_problemas || 0,
            icon: AlertCircle,
            color: 'bg-orange-500',
            trend: 'Insumos en falla',
            trendType: 'up'
          },
          {
            id: 4,
            name: 'Pacientes',
            value: estadisticas?.resumen_pacientes?.total_despachos || 0,
            icon: AlertCircle,
            color: 'bg-yellow-500',
            trend: 'Despachados',
            trendType: 'warning'
          },
        ]),
  ];

  const statsGridColsLgClass =
    stats.length >= 4 ? 'lg:grid-cols-4' :
      stats.length === 3 ? 'lg:grid-cols-3' :
        'lg:grid-cols-2';

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

      <ModalSolicitud
        isOpen={showSolicitudModal}
        onClose={() => setShowSolicitudModal(false)}
        onSubmit={handleSolicitudSubmit}
      />

      <div className="mb-4">
        {/* <h2 className="text-2xl font-bold text-white">Panel de Control</h2> */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:px-6 md:py-2 mb-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-white text-sm mt-1 capitalize">{user?.hospital?.nombre}</span>
            <span className="text-white bg-orange-500 w-fit px-2 rounded-full text-sm capitalize">{user?.sede?.nombre}</span>
          </div>

          {user?.sede?.tipo_almacen === 'almacenPrin' && (
            <button
              onClick={() => setShowSolicitudModal(true)}
              className="flex items-center justify-center w-full md:w-auto gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl transition-all duration-300 text-sm font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 border border-white/10"
            >
              <Send className="h-4 w-4" />
              Realizar Solicitud
            </button>
          )}
        </div>

        {/* Stats Grid */}
        <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${statsGridColsLgClass} mb-4`}>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 p-2 bg-white backdrop-blur-lg border border-white/10 rounded-lg">
          <button
            className={`flex gap-2 items-center justify-start px-4 py-3 rounded-lg transition-all duration-200 group ${menuActivo === 'recepcion'
              ? 'bg-indigo-600 text-white'
              : 'bg-indigo-500/15 text-gray-800 hover:bg-indigo-500/30'
              }`}
            onClick={() => setMenuActivo('recepcion')}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${menuActivo === 'recepcion' ? 'bg-white/20' : 'bg-indigo-500/90 text-white'
              }`}>
              <Package className="h-5 w-5" />
            </div>
            <span className="font-medium">Movimientos</span>
          </button>
          {/* Mostrar Seguimiento solo para almacén principal */}
          {user?.sede?.tipo_almacen === 'almacenPrin' ? (
            <button
              className={`flex gap-2 items-center justify-start px-4 py-3 rounded-lg transition-all duration-200 group ${menuActivo === 'tracking'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-500/15 text-gray-800 hover:bg-blue-500/30'
                }`}
              onClick={() => setMenuActivo('tracking')}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${menuActivo === 'tracking' ? 'bg-white/20' : 'bg-blue-500/90 text-white'
                }`}>
                <Truck className="h-5 w-5" />
              </div>
              <span className="font-medium">Seguimiento</span>
            </button>
          ) : (
            <button
              className={`flex gap-2 items-center justify-start px-4 py-3 rounded-lg transition-all duration-200 group ${menuActivo === 'reportes'
                ? 'bg-orange-600 text-white'
                : 'bg-orange-500/15 text-gray-800 hover:bg-orange-500/30'
                }`}
              onClick={() => setMenuActivo('reportes')}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${menuActivo === 'reportes' ? 'bg-white/20' : 'bg-orange-500/90 text-white'
                }`}>
                <BarChart3 className="h-5 w-5" />
              </div>
              <span className="font-medium">Reportes</span>
            </button>
          )}
        </div>
        {/* ... rest of the component ... */}

      </div>
      <div className="mt-2">
        {menuActivo === "recepcion" && <Recepcion />}
        {menuActivo === "tracking" && <Tracking />}
        {menuActivo === "reportes" && <Reportes />}
      </div>
    </>
  );
}