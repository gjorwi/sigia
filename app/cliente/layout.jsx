'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Bell, User } from 'lucide-react';


export default function Layout({ children }) {
    const router = useRouter();
    const [isLoaded, setIsLoaded] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const userMenuRef = useRef(null);
    const notificationsRef = useRef(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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
    }, []);
    
    const handleLogout = () => {
      // TODO: Implementar la lógica de cierre de sesión
      router.push('/login');
    };
    
    return <>
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
                        onClick={() => router.push('/cliente/perfil')}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Perfil
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
          {children}
        </main>
        <footer className="fixed bottom-0 w-full z-50 border-t border-white/10 bg-gradient-to-br from-indigo-900/80 via-blue-800/80 to-purple-900/80">
          <div className="mx-auto h-full max-w-7xl px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-md py-3">
            <p className="text-center text-sm text-indigo-100">
              &copy; 2023 SIGIA - Sistema de Gestión de Inventario para Almacenes. Todos los derechos reservados.
            </p>
          </div>
        </footer>
      </div>
    </>;
}