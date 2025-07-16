
import { UserPlus, UserCog, Users, UserCheck } from 'lucide-react';

export const hospiActions = [
    { 
      title: 'Nuevo Hospital', 
      description: 'Crear un nuevo hospital en el sistema',
      icon: <UserPlus className="h-6 w-6 text-blue-600" />,
      color: 'bg-blue-600/20 hover:bg-blue-700/20 focus:ring-blue-500 border-blue-600',
      href: '/administrador/hospitales/nuevo'
    },
    { 
      title: 'Editar Hospital', 
      description: 'Modificar datos de hospital existente',
      icon: <UserCog className="h-6 w-6 text-purple-600" />,
      color: 'bg-purple-600/20 hover:bg-purple-700/20 focus:ring-purple-500 border-purple-600',
      href: '/administrador/hospitales/editar'
    },
    { 
      title: 'Ficha de Insumos', 
      description: 'Gestionar ficha de insumos del hospital',
      icon: <Users className="h-6 w-6 text-indigo-600" />,
      color: 'bg-indigo-600/20 hover:bg-indigo-700/20 focus:ring-indigo-500 border-indigo-600',
      href: '/administrador/hospitales/ficha'
    },
    { 
      title: 'Activar/Desactivar', 
      description: 'Habilitar o deshabilitar registro de hospital',
      icon: <UserCheck className="h-6 w-6 text-green-600" />,
      color: 'bg-green-600/20 hover:bg-green-700/20 focus:ring-green-500 border-green-600',
      href: '/administrador/hospitales/activar'
    }
  ];