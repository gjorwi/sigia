"use client";

import { useState, useEffect } from 'react';
import { Settings, Save, Clock, Bell, Mail, Lock, Globe, Database, User, Shield, AlertCircle, CheckCircle } from 'lucide-react';

// Mock data - replace with actual API calls
const initialSettings = {
  general: {
    nombreSistema: 'Sistema de Gestión de Almacenes',
    empresa: 'Nombre de la Empresa',
    moneda: 'USD',
    zonaHoraria: 'America/Lima',
    itemsPorPagina: 25,
  },
  seguridad: {
    intentosMaximos: 5,
    tiempoBloqueo: 30, // minutos
    longitudMinimaClave: 8,
    requiereMayusculas: true,
    requiereNumeros: true,
    requiereCaracteresEspeciales: true,
    expiracionClave: 90, // días
  },
  notificaciones: {
    correoSistemas: 'sistemas@empresa.com',
    notificarNuevoUsuario: true,
    notificarDespachoPendiente: true,
    notificarDespachoEnCamino: true,
    notificarDespachoEntregado: true,
    notificarBajoStock: true,
    notificarStockCritico: true,
  },
  correo: {
    servidor: 'smtp.empresa.com',
    puerto: 587,
    usuario: 'notificaciones@empresa.com',
    requiereAutenticacion: true,
    usarSSL: true,
  },
  backup: {
    frecuencia: 'diario',
    horaProgramada: '02:00',
    mantenerUltimos: 30, // días
    notificarEnError: true,
    correoNotificacion: 'sistemas@empresa.com',
  },
};

const ConfiguracionesPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ type: '', message: '' });
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState(JSON.stringify(initialSettings));

  // Check for changes
  useEffect(() => {
    setHasChanges(JSON.stringify(settings) !== originalSettings);
  }, [settings, originalSettings]);

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus({ type: '', message: '' });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setOriginalSettings(JSON.stringify(settings));
      setSaveStatus({ 
        type: 'success', 
        message: 'Configuración guardada exitosamente' 
      });
    } catch (error) {
      setSaveStatus({ 
        type: 'error', 
        message: 'Error al guardar la configuración. Intente nuevamente.' 
      });
    } finally {
      setIsSaving(false);
      
      // Clear success message after 3 seconds
      if (saveStatus.type === 'success') {
        setTimeout(() => {
          setSaveStatus({ type: '', message: '' });
        }, 3000);
      }
    }
  };

  const renderSaveButton = () => (
    <div className=" flex justify-end mb-6">
      <button
        type="button"
        onClick={handleSave}
        disabled={!hasChanges || isSaving}
        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
          hasChanges && !isSaving 
            ? 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' 
            : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        {isSaving ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Guardando...
          </>
        ) : (
          <>
            <Save className="-ml-1 mr-2 h-4 w-4" />
            Guardar Cambios
          </>
        )}
      </button>
    </div>
  );

  const renderStatusMessage = () => {
    if (!saveStatus.message) return null;
    
    const baseClasses = 'p-4 rounded-md mb-6';
    const typeClasses = saveStatus.type === 'error' 
      ? 'bg-red-50 text-red-700' 
      : 'bg-green-50 text-green-700';
    
    return (
      <div className={`${baseClasses} ${typeClasses}`}>
        <div className="flex">
          <div className="flex-shrink-0">
            {saveStatus.type === 'error' ? (
              <AlertCircle className="h-5 w-5 text-red-400" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-400" />
            )}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{saveStatus.message}</p>
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'general', name: 'General', icon: <Settings className="h-5 w-5" /> },
    { id: 'seguridad', name: 'Seguridad', icon: <Shield className="h-5 w-5" /> },
    { id: 'notificaciones', name: 'Notificaciones', icon: <Bell className="h-5 w-5" /> },
    { id: 'correo', name: 'Correo Electrónico', icon: <Mail className="h-5 w-5" /> },
    { id: 'backup', name: 'Respaldo', icon: <Database className="h-5 w-5" /> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Configuración General</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Configuración básica del sistema.</p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                <dl className="sm:divide-y sm:divide-gray-200">
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Nombre del Sistema</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <input
                        type="text"
                        value={settings.general.nombreSistema}
                        onChange={(e) => handleChange('general', 'nombreSistema', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Empresa</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <input
                        type="text"
                        value={settings.general.empresa}
                        onChange={(e) => handleChange('general', 'empresa', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Moneda</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <select
                        value={settings.general.moneda}
                        onChange={(e) => handleChange('general', 'moneda', e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option value="USD">Dólares Americanos (USD)</option>
                        <option value="EUR">Euros (EUR)</option>
                        <option value="PEN">Soles (PEN)</option>
                      </select>
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Zona Horaria</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <select
                        value={settings.general.zonaHoraria}
                        onChange={(e) => handleChange('general', 'zonaHoraria', e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option value="America/Lima">Lima, Perú (GMT-5)</option>
                        <option value="America/New_York">Nueva York, EE.UU. (GMT-4/-5)</option>
                        <option value="America/Mexico_City">Ciudad de México, México (GMT-6/-5)</option>
                        <option value="Europe/Madrid">Madrid, España (GMT+1/+2)</option>
                      </select>
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Ítems por página</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <select
                        value={settings.general.itemsPorPagina}
                        onChange={(e) => handleChange('general', 'itemsPorPagina', parseInt(e.target.value))}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option value={10}>10 ítems</option>
                        <option value={25}>25 ítems</option>
                        <option value={50}>50 ítems</option>
                        <option value={100}>100 ítems</option>
                      </select>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        );
      
      case 'seguridad':
        return (
          <div className="space-y-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Configuración de Seguridad</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Ajustes de seguridad y autenticación.</p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                <dl className="sm:divide-y sm:divide-gray-200">
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Máximo de intentos de inicio de sesión</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={settings.seguridad.intentosMaximos}
                        onChange={(e) => handleChange('seguridad', 'intentosMaximos', parseInt(e.target.value))}
                        className="mt-1 block w-20 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                      <p className="mt-2 text-xs text-gray-500">Número de intentos fallidos antes de bloquear la cuenta.</p>
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Tiempo de bloqueo (minutos)</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <input
                        type="number"
                        min="1"
                        max="1440"
                        value={settings.seguridad.tiempoBloqueo}
                        onChange={(e) => handleChange('seguridad', 'tiempoBloqueo', parseInt(e.target.value))}
                        className="mt-1 block w-20 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                      <p className="mt-2 text-xs text-gray-500">Tiempo que la cuenta permanecerá bloqueada después de superar el límite de intentos.</p>
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Longitud mínima de contraseña</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <input
                        type="number"
                        min="6"
                        max="32"
                        value={settings.seguridad.longitudMinimaClave}
                        onChange={(e) => handleChange('seguridad', 'longitudMinimaClave', parseInt(e.target.value))}
                        className="mt-1 block w-20 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Requisitos de contraseña</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 space-y-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="requiereMayusculas"
                          checked={settings.seguridad.requiereMayusculas}
                          onChange={(e) => handleChange('seguridad', 'requiereMayusculas', e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="requiereMayusculas" className="ml-2 block text-sm text-gray-700">
                          Requerir al menos una letra mayúscula
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="requiereNumeros"
                          checked={settings.seguridad.requiereNumeros}
                          onChange={(e) => handleChange('seguridad', 'requiereNumeros', e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="requiereNumeros" className="ml-2 block text-sm text-gray-700">
                          Requerir al menos un número
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="requiereCaracteresEspeciales"
                          checked={settings.seguridad.requiereCaracteresEspeciales}
                          onChange={(e) => handleChange('seguridad', 'requiereCaracteresEspeciales', e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="requiereCaracteresEspeciales" className="ml-2 block text-sm text-gray-700">
                          Requerir al menos un carácter especial (ej. !@#$%^&*)
                        </label>
                      </div>
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Expiración de contraseña (días)</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={settings.seguridad.expiracionClave}
                        onChange={(e) => handleChange('seguridad', 'expiracionClave', parseInt(e.target.value))}
                        className="mt-1 block w-20 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                      <p className="mt-2 text-xs text-gray-500">Número de días antes de que la contraseña expire y deba ser cambiada.</p>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        );
      
      // Add other cases for additional tabs...
      
      default:
        return (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Configuración de {tabs.find(tab => tab.id === activeTab)?.name}</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Configuración detallada para {tabs.find(tab => tab.id === activeTab)?.name.toLowerCase()}.</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <div className="px-4 py-5 sm:p-6 text-center">
                <p className="text-gray-500">Configuración no disponible en este momento.</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="md:ml-64 px-4 sm:px-6 lg:px-8 py-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          {/* <h1 className="text-2xl font-semibold text-gray-900">Configuración del Sistema</h1>
          <p className="mt-2 text-sm text-gray-700">
            Administra la configuración general del sistema y las preferencias de la aplicación.
          </p> */}
        </div>
      </div>

      {renderStatusMessage()}
      
      <div className="mt-6">
        <div className="sm:hidden">
          <label htmlFor="tabs" className=" text-gray-500">Selecciona una pestaña</label>
          <select
            id="tabs"
            name="tabs"
            className="block w-full pl-3 pr-10 py-2 text-gray-700 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.name}
              </option>
            ))}
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  {tab.icon}
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {renderSaveButton()}
        {renderTabContent()}
        {renderSaveButton()}
      </div>
    </div>
  );
};

export default ConfiguracionesPage;