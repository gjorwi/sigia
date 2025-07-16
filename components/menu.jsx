'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Truck,
  Bell,
  Users,
  Hospital,
  MapPin,
  Activity, 
  Settings,
  FileText,
  Warehouse,
  User,
  ChevronDown
} from 'lucide-react';
import nombreRutas from '@/constantes/nombreRutas';

export default function Menu() {
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    }

    // Add event listener when component mounts
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Clean up the event listener when component unmounts
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    // Close notifications if open
    if (isNotificationsOpen) setIsNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    // Close user menu if open
    if (isUserMenuOpen) setIsUserMenuOpen(false);
  };
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Check if the screen is mobile/tablet size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 766); // lg breakpoint (1024px)
      if (window.innerWidth >= 766) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    // Initial check
    checkIfMobile();
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Close sidebar when navigating on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]);
  const navigation = [
    { name: 'Panel de Control', icon: LayoutDashboard, href: '/administrador', current: true },
    { name: 'Despachos', icon: Package, href: '/administrador/despachos', current: false },
    { name: 'Inventario', icon: Warehouse, href: '/administrador/inventario', current: false },
    { name: 'Mapa', icon: MapPin, href: '/administrador/mapa', current: false },
    { name: 'Solicitudes', icon: FileText, href: '/administrador/solicitudes', current: false },
    { name: 'Logística', icon: Truck, href: '/administrador/logistica', current: false },
    { name: 'Hospitales', icon: Hospital, href: '/administrador/hospitales', current: false },
    { name: 'Insumos', icon: Package, href: '/administrador/insumos', current: false },
    { name: 'Usuarios', icon: Users, href: '/administrador/usuarios', current: false },
    { name: 'Configuración', icon: Settings, href: '/administrador/configuracion', current: false },
  ];

  const handleLogout = () => {
    // Implementar la lógica de cierre de sesión
    router.push('/');
    console.log('Cerrar sesión');
  };

  // Update active state based on current path
  const updatedNavigation = navigation.map(item => ({
    ...item,
    current: pathname === item.href
  }));

  // Hide menu on home page, show on all other pages
  const showMenu = pathname !== '/';
  
  // Always show sidebar on desktop, respect sidebarOpen state on mobile
  const shouldShowSidebar = showMenu && (sidebarOpen || !isMobile);
  
  return (
    <>
    {shouldShowSidebar && (
      <div className="fixed bg-gradient-to-br from-indigo-900/90 via-blue-800/90 to-purple-900/90 inset-y-0 left-0 transform translate-x-0 transition-all duration-200 ease-in-out z-40 w-64 bg-white/10 backdrop-blur-xl border-r border-white/10 shadow-2xl text-white">
        <div className="flex items-center justify-between h-18 border-b border-white/20">
          <div className="flex items-center w-full p-4">
            <div className="h-8 w-8 flex items-center justify-center bg-white/10 rounded-lg p-1.5 border border-white/20">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold text-white drop-shadow-md">SIGIA</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden text-white/80 hover:text-white p-2 -mr-1"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="mt-6 flex-1 px-3 space-y-1">
          {updatedNavigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg mx-2 transition-all duration-200 ${
                item.current 
                  ? 'bg-white/20 text-white shadow-lg' 
                  : 'text-white/90 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
              {item.current && (
                <span className="ml-auto h-2 w-2 rounded-full bg-white/80"></span>
              )}
            </a>
          ))}
        </nav>
      </div>
    )}
    {/* Top navigation - hidden on home page, visible on all other routes */}
    {showMenu && (
      <div className={`sticky top-0 flex flex-shrink-0 h-18 bg-gradient-to-br from-indigo-900/90 via-blue-800/90 to-purple-900/90 md:from-gray-900/5 md:via-gray-900/5 md:to-gray-900/5 backdrop-blur-lg border-b border-gray-200 transition-all duration-200 ease-in-out ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <button
          type="button"
          className="px-4 border-r border-white/20 text-white hover:text-white md:text-gray-700 md:hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/30 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="sr-only">Abrir menú</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex-1 px-4 flex justify-between">
          <div className="flex-1 flex">
            <div className="w-full flex items-center md:ml-0">
              <div className='text-md md:text-2xl font-semibold text-white md:text-gray-700 drop-shadow-lg'>
                {nombreRutas[pathname]}
              </div>
            </div>
          </div>
          <div className="ml-4 flex items-center md:ml-6">
            {/* Notifications Dropdown */}
            <div className="relative ml-4 text-gray-700" ref={notificationsRef}>
              <button
                type="button"
                onClick={toggleNotifications}
                className={`p-2 rounded-full text-gray-700 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors duration-200 relative ${isNotificationsOpen ? 'bg-white/20' : ''}`}
                aria-label="Ver notificaciones"
                aria-haspopup="true"
                aria-expanded={isNotificationsOpen}
              >
                <Bell className="h-6 w-6" />
                <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-orange-500 ring-1 ring-gray-900"></span>
              </button>
              {/* Dropdown panel - show/hide with state */}
              <div className={`${isNotificationsOpen ? 'block' : 'hidden'} absolute right-0 mt-2 w-80 bg-white border-1 border-gray-300 rounded-md shadow-lg overflow-hidden z-50`}>
                <div className="py-1">
                  <div className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border-b border-gray-100">
                    Notificaciones
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {/* Notification items would go here */}
                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <Bell className="h-4 w-4 text-indigo-600" />
                          </div>
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">Nueva actualización disponible</p>
                          <p className="mt-0.5 text-sm text-gray-500">Versión 2.0 está lista para instalar</p>
                          <p className="mt-1 text-xs text-gray-400">Hace 2 horas</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-2 text-center border-t border-gray-100">
                    <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                      Ver todas las notificaciones
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile dropdown */}
            <div className="ml-4 relative" ref={dropdownRef}>
              <div>
                <button
                  type="button"
                  className={`flex items-center max-w-xs rounded-full focus:outline-none ring-2 ring-offset-2 ring-indigo-500`}
                  id="user-menu"
                  onClick={toggleUserMenu}
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <span className="sr-only">Abrir menú de usuario</span>
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
                    <User className="h-5 w-5" />
                  </div>
                  <span className="hidden md:block ml-2 text-sm font-medium text-white md:text-gray-700">
                    Admin User
                  </span>
                  <ChevronDown className="hidden md:block ml-1 h-4 w-4 text-gray-400" />
                </button>
              </div>
              {/* Dropdown menu - show/hide with state */}
              <div className={`${isUserMenuOpen ? 'block' : 'hidden'} origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-gray-300 ring-opacity-5 focus:outline-none z-50`}>
                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    Mi perfil
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    Configuración
                  </a>
                  <div className="border-t border-gray-100"></div>
                  <a
                    onClick={handleLogout}
                    className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    role="menuitem"
                  >
                    Cerrar sesión
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
  );
}