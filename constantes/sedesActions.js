
import { UserPlus, UserCog, Users, UserCheck } from 'lucide-react';

export const sedesActions = [
    { 
      title: 'Nueva Sede', 
      description: 'Crear una nueva sede en el sistema',
      icon: <UserPlus className="h-6 w-6 text-blue-600" />,
      color: 'bg-blue-600/20 hover:bg-blue-700/20 focus:ring-blue-500 border-blue-600',
      href: '/administrador/sedes/nuevo'
    },
    { 
      title: 'Editar Sede', 
      description: 'Modificar datos de sede existente',
      icon: <UserCog className="h-6 w-6 text-purple-600" />,
      color: 'bg-purple-600/20 hover:bg-purple-700/20 focus:ring-purple-500 border-purple-600',
      href: '/administrador/sedes/editar'
    },
    { 
      title: 'Activar/Desactivar', 
      description: 'Habilitar o deshabilitar registro de sede',
      icon: <UserCheck className="h-6 w-6 text-green-600" />,
      color: 'bg-green-600/20 hover:bg-green-700/20 focus:ring-green-500 border-green-600',
      href: '/administrador/sedes/activar'
    }
  ];