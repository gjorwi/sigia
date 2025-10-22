'use client';

import { useState, useEffect } from 'react';
import { getEnTransito } from '@/servicios/despachos/get';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import TrackingEnvios from '@/components/TrackingEnvios';

export default function Logistica() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [envios, setEnvios] = useState([]);
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    time: null
  });

  useEffect(() => {
    handleRastrear();
  }, []);
  
  const handleRastrear = async () => {
    const {token, sede_id} = user;
    const response = await getEnTransito(token, sede_id);
    
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
        ubicacion: seg.ubicacion || `Actualización por ${seg.despachador?.nombre || 'Despachador'}`
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
        ubicacionActual: ultimoSeguimiento?.ubicacion || 'En tránsito',
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
      <TrackingEnvios 
        envios={envios}
        onRastrear={handleRastrear}
        showSearch={true}
        modal={modal}
        closeModal={closeModal}
      />
    </div>
  );
}
