'use client';

import { useState, useEffect } from 'react';
import { getEnTransitoAdmin, getMovimientos } from '@/servicios/despachos/get';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import TrackingEnvios from '@/components/TrackingEnvios';

export default function Logistica() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [envios, setEnvios] = useState([]);
  const [tipoVista, setTipoVista] = useState('activos'); // 'activos' o 'historial'
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    time: null
  });

  useEffect(() => {
    if (tipoVista === 'activos') {
      handleRastrearActivos();
    } else {
      handleRastrearHistorial();
    }
  }, [tipoVista]);
  
  const handleRastrearActivos = async () => {
    const {token, sede_id} = user;
    const response = await getEnTransitoAdmin(token, sede_id);
    
    if (!response.status) {
      if(response.autenticacion==1||response.autenticacion==2){
        showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
        logout();
        router.replace('/');
        return;
      }
      showMessage('Error', response.mensaje||'Error en la solicitud', 'error', 4000);
      return;
    }
    
    const enviosTransformados = response.data.map(movimiento => {
      const ultimoSeguimiento = movimiento.seguimientos && movimiento.seguimientos.length > 0 
        ? movimiento.seguimientos[0] 
        : null;
      
      const historial = movimiento.seguimientos ? movimiento.seguimientos.map(seg => ({
        fecha: seg.created_at,
        evento: seg.observaciones || `Estado: ${seg.estado}`,
        ubicacion: (seg.ubicacion && typeof seg.ubicacion === 'object') 
          ? (seg.ubicacion.direccion || `Lat: ${seg.ubicacion.lat}, Lng: ${seg.ubicacion.lng}`)
          : (seg.ubicacion || `Actualización por ${seg.despachador?.nombre || 'Despachador'}`)
      })).reverse() : [];
      
      return {
        id: movimiento.codigo_grupo || `MOV-${movimiento.id}`,
        origen: movimiento.origen_hospital?.nombre || movimiento.origen_sede?.nombre || 'Origen no especificado',
        destino: movimiento.destino_hospital?.nombre || movimiento.destino_sede?.nombre || 'Destino no especificado',
        fechaEnvio: movimiento.fecha_despacho,
        fechaEstimada: movimiento.fecha_recepcion,
        estado: movimiento.estado,
        transportista: ultimoSeguimiento?.despachador?.nombre || 'No asignado',
        guia: movimiento.codigo_grupo,
        items: movimiento.cantidad_salida_total,
        ubicacionActual: (ultimoSeguimiento?.ubicacion && typeof ultimoSeguimiento.ubicacion === 'object')
          ? (ultimoSeguimiento.ubicacion.direccion || `Lat: ${ultimoSeguimiento.ubicacion.lat}, Lng: ${ultimoSeguimiento.ubicacion.lng}`)
          : (ultimoSeguimiento?.ubicacion || 'En tránsito'),
        historial: historial,
        lotes_grupos: movimiento.lotes_grupos || [],
        origen_hospital: movimiento.origen_hospital,
        origen_sede: movimiento.origen_sede,
        destino_hospital: movimiento.destino_hospital,
        destino_sede: movimiento.destino_sede,
        seguimientos: movimiento.seguimientos
      };
    });
    
    setEnvios(enviosTransformados);
  };

  const handleRastrearHistorial = async () => {
    const {token, sede_id} = user;
    const response = await getMovimientos(token, sede_id);
    console.log(JSON.stringify(response,null,2))
    if (!response.status) {
      if(response.autenticacion==1||response.autenticacion==2){
        showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
        logout();
        router.replace('/');
        return;
      }
      showMessage('Error', response.mensaje||'Error en la solicitud', 'error', 4000);
      return;
    }
    
    const enviosTransformados = response.data.data.map(movimiento => {
      const ultimoSeguimiento = movimiento.seguimientos && movimiento.seguimientos.length > 0 
        ? movimiento.seguimientos[0] 
        : null;
      
      const historial = movimiento.seguimientos ? movimiento.seguimientos.map(seg => ({
        fecha: seg.created_at,
        evento: seg.observaciones || `Estado: ${seg.estado}`,
        ubicacion: (seg.ubicacion && typeof seg.ubicacion === 'object') 
          ? (seg.ubicacion.direccion || `Lat: ${seg.ubicacion.lat}, Lng: ${seg.ubicacion.lng}`)
          : (seg.ubicacion || `Actualización por ${seg.despachador?.nombre || 'Despachador'}`)
      })).reverse() : [];
      
      return {
        id: movimiento.codigo_grupo || `MOV-${movimiento.id}`,
        origen: movimiento.origen_hospital?.nombre || movimiento.origen_sede?.nombre || 'Origen no especificado',
        destino: movimiento.destino_hospital?.nombre || movimiento.destino_sede?.nombre || 'Destino no especificado',
        fechaEnvio: movimiento.fecha_despacho,
        fechaEstimada: movimiento.fecha_recepcion,
        estado: movimiento.estado,
        transportista: ultimoSeguimiento?.despachador?.nombre || 'No asignado',
        guia: movimiento.codigo_grupo,
        items: movimiento.cantidad_salida_total,
        ubicacionActual: (ultimoSeguimiento?.ubicacion && typeof ultimoSeguimiento.ubicacion === 'object')
          ? (ultimoSeguimiento.ubicacion.direccion || `Lat: ${ultimoSeguimiento.ubicacion.lat}, Lng: ${ultimoSeguimiento.ubicacion.lng}`)
          : (ultimoSeguimiento?.ubicacion || 'Completado'),
        historial: historial,
        lotes_grupos: movimiento.lotes_grupos || [],
        origen_hospital: movimiento.origen_hospital,
        origen_sede: movimiento.origen_sede,
        destino_hospital: movimiento.destino_hospital,
        destino_sede: movimiento.destino_sede,
        seguimientos: movimiento.seguimientos
      };
    });
    
    setEnvios(enviosTransformados);
  };

  const showMessage = (title, message, type = 'info', time = null) => {
    setModal({isOpen: true, title, message, type, time});
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="md:ml-64 space-y-6 p-6">
      {/* Tabs para alternar entre activos e historial */}
      <div className="bg-white rounded-lg shadow-sm p-1 inline-flex">
        <button
          onClick={() => setTipoVista('activos')}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            tipoVista === 'activos'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Envíos Activos
        </button>
        <button
          onClick={() => setTipoVista('historial')}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            tipoVista === 'historial'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Historial
        </button>
      </div>

      <TrackingEnvios 
        envios={envios}
        onRastrear={tipoVista === 'activos' ? handleRastrearActivos : handleRastrearHistorial}
        showSearch={true}
        modal={modal}
        closeModal={closeModal}
      />
    </div>
  );
}
