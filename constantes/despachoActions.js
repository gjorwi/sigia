
import { UserPlus, UserCog, Users, UserCheck } from 'lucide-react';

export const despachoActions = [
    { 
      title: 'Nuevo Movimiento', 
      description: 'Crear un nuevo movimiento en el sistema',
      icon: <UserPlus className="h-6 w-6 text-blue-600" />,
      color: 'bg-blue-600/20 hover:bg-blue-700/20 focus:ring-blue-500 border-blue-600',
      href: '/administrador/movimientos/nuevo'
    },
    { 
      title: 'Movimiento por archivo', 
      description: 'Crear un movimiento por archivo',
      icon: <UserPlus className="h-6 w-6 text-cyan-600" />,
      color: 'bg-cyan-600/20 hover:bg-cyan-700/20 focus:ring-cyan-500 border-cyan-600',
      href: '/administrador/movimientos/archivo'
    },
    { 
      title: 'Editar Movimiento', 
      description: 'Modificar datos de movimiento existente',
      icon: <UserCog className="h-6 w-6 text-purple-600" />,
      color: 'bg-purple-600/20 hover:bg-purple-700/20 focus:ring-purple-500 border-purple-600',
      href: '/administrador/movimientos/editar'
    },
    { 
      title: 'Cancelar Movimiento', 
      description: 'Cancelar un movimiento existente',
      icon: <UserCheck className="h-6 w-6 text-green-600" />,
      color: 'bg-green-600/20 hover:bg-green-700/20 focus:ring-green-500 border-green-600',
      href: '/administrador/movimientos/cancelar'
    }
  ];