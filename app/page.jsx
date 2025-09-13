'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { postLogin } from '@/servicios/login/post';
import Modal from '@/components/Modal';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPageVariant() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('cliente'); 
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info', // 'info', 'error', 'success', 'warning'
    time: null
  });

  const showMessage = (title, message, type = 'info', time = null) => {
    setModal({isOpen: true, title, message, type, time});
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const result = await postLogin({ email, password });
      
      if (!result?.status) {
        showMessage('Error', result?.mensaje || 'Error al iniciar sesión', 'error', 4000);
        return;
      }
      if (result.data && result.data.user?.tipo === selectedRole) {
        // Save user data in context and localStorage
        login({
          ...result.data.user,
          token: result.data.token
        });
        
        // Redirect based on user role
        router.push(selectedRole === 'cliente' ? '/cliente' : '/administrador');
      } else {
        showMessage('Error', 'No tienes permiso para ingresar a este módulo', 'error', 4000);
      }
    } catch (error) {
      console.log('Login error:', error);
      showMessage('Error', 'Ocurrió un error al intentar iniciar sesión', 'error', 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <Modal isOpen={modal.isOpen} onClose={closeModal} title={modal.title} message={modal.message} type={modal.type} time={modal.time} />
    <div className={`relative min-h-screen flex px-4 items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900 overflow-hidden ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}>
      {/* Fondo artístico con overlay y animación */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/fondo.svg"
          width={500}
          height={500}
          alt="Inventario de insumos médicos en almacén hospitalario"
          className="w-full h-full object-cover object-center opacity-60 animate-fadein"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-blue-800/60 to-blue-900/90"></div>
        <div className="absolute left-1/2 top-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-400/30 via-blue-400/20 to-transparent rounded-full blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2 animate-pulse-slow"></div>
      </div>

      {/* Tarjeta glassmorphism */}
      <main className="relative z-10 w-full max-w-md mx-auto bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl px-10 py-4 flex flex-col items-center animate-fadein-up">
        <img src="/images/logo.svg" alt="Logo" className="w-24 h-24 mb-6 drop-shadow-lg bg-white/10 rounded-full p-3 border border-white/30" />
        <h1 className="text-xl md:text-4xl font-extrabold text-white drop-shadow-xl mb-2 tracking-tight text-center">Bienvenido a SIGIA</h1>
        <p className="text-sm italic text-white/80 mb-2 text-center">Sistema de Gestión de Inventario para Almacenes</p>
        
        {/* Selector de rol */}
        <div className="w-full">
          {/* <p className="text-sm text-white/80 mb-3 text-center">Selecciona tu rol</p> */}
          <div className="flex space-x-4 justify-center">
            <button
              type="button"
              onClick={() => setSelectedRole('cliente')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedRole === 'cliente'
                  ? 'bg-white text-indigo-700 shadow-lg shadow-indigo-500/20'
                  : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'
              }`}
            >
              Cliente
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('administrador')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedRole === 'administrador'
                  ? 'bg-white text-indigo-700 shadow-lg shadow-indigo-500/20'
                  : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'
              }`}
            >
              Administrador
            </button>
          </div>
        </div>
        
        <div className="w-full border-t border-white/10 my-4 mb-2"></div>
        <form className="w-full space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1">Correo electrónico</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-indigo-200" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>
              </span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full pl-10 pr-4 py-2 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:border-transparent transition shadow-md backdrop-blur-sm"
                placeholder="tu@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-white/80">Contraseña</label>
              <a href="#" className="text-xs font-medium text-fuchsia-200 hover:text-white transition">¿Olvidó su contraseña?</a>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-indigo-200" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>
              </span>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full pl-10 pr-4 py-2 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:border-transparent transition shadow-md backdrop-blur-sm"
                placeholder="Jorge1234*."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-fuchsia-500 via-indigo-500 to-blue-500 shadow-xl text-lg font-bold text-white tracking-wide hover:scale-105 hover:from-fuchsia-400 hover:to-blue-400 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-fuchsia-400/40 mt-4"
          >
            Iniciar sesión
          </button>
        </form>
        <div className="mt-6 text-xs text-white/50 text-center">
          Version 1.0.0
        </div>
        <div className="mt-6 text-xs text-white/50 text-center">
          © {new Date().getFullYear()} SIGIA. Todos los derechos reservados.
        </div>
      </main>
      <style jsx>{`
        .animate-fadein {
          animation: fadein 1.2s cubic-bezier(.39,.58,.57,1) both;
        }
        .animate-fadein-up {
          animation: fadein-up 1.1s cubic-bezier(.39,.58,.57,1) both;
        }
        .animate-pulse-slow {
          animation: pulse 6s infinite alternate;
        }
        @keyframes fadein {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes fadein-up {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0% { opacity: 0.3; transform: scale(1); }
          100% { opacity: 0.7; transform: scale(1.08); }
        }
      `}</style>
    </div>
    
  </>
  );
}