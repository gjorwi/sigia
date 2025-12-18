'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Modal from '@/components/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { postRecoverPasswordEmail } from '@/servicios/users/put';

export default function RecuperarContrasenaPage() {
    const { user, logout } = useAuth();
    const [email, setEmail] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        time: null
    });

    const showMessage = (title, message, type = 'info', time = null) => {
        setModal({ isOpen: true, title, message, type, time });
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

        // Simulate API call
        const { token } = user;
        const result = await postRecoverPassword({ email }, token);

        if (!result.status) {
            if (result.autenticacion === 1 || result.autenticacion === 2) {
                showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
                logout();
                router.replace('/');
                return;
            }
            showMessage('Error', result.mensaje, 'error', 4000);
            setIsSubmitting(false);
            return;
        }
        showMessage('Correo enviado', 'Si el correo existe en nuestro sistema, recibirás instrucciones para recuperar tu contraseña.', 'success', 5000);

        setIsSubmitting(false);
    };

    return (
        <>
            <Modal isOpen={modal.isOpen} onClose={closeModal} title={modal.title} message={modal.message} type={modal.type} time={modal.time} />
            <div className={`relative min-h-screen flex px-4 items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900 overflow-hidden ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}>
                {/* Background consistent with login */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/fondo.svg"
                        width={500}
                        height={500}
                        alt="Fondo"
                        className="w-full h-full object-cover object-center opacity-60 animate-fadein"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-blue-800/60 to-blue-900/90"></div>
                    <div className="absolute left-1/2 top-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-400/30 via-blue-400/20 to-transparent rounded-full blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2 animate-pulse-slow"></div>
                </div>

                {/* Card */}
                <main className="relative z-10 w-full max-w-md mx-auto bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl px-10 py-8 flex flex-col items-center animate-fadein-up">
                    <img src="/images/logo.svg" alt="Logo" className="w-20 h-20 mb-6 drop-shadow-lg bg-white/10 rounded-full p-3 border border-white/30" />
                    <h1 className="text-xl md:text-3xl font-extrabold text-white drop-shadow-xl mb-2 tracking-tight text-center">Recuperar Contraseña</h1>
                    <p className="text-sm text-white/80 mb-6 text-center">Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.</p>

                    <form className="w-full space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1">Correo electrónico</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <svg className="h-5 w-5 text-indigo-200" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
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

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-fuchsia-500 via-indigo-500 to-blue-500 shadow-xl text-lg font-bold text-white tracking-wide hover:scale-105 hover:from-fuchsia-400 hover:to-blue-400 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-fuchsia-400/40 mt-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? 'Enviando...' : 'Enviar instrucciones'}
                        </button>

                        <div className="text-center mt-4">
                            <Link href="/" className="text-sm font-medium text-indigo-200 hover:text-white transition flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                                Volver al inicio de sesión
                            </Link>
                        </div>
                    </form>
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
