
import { UserPlus, UserCog, Users, UserCheck, UserX, Key } from 'lucide-react';

export const userActions = [
    { 
      title: 'Nuevo Usuario', 
      description: 'Crear un nuevo usuario en el sistema',
      icon: <UserPlus className="h-6 w-6 text-blue-600" />,
      color: 'bg-blue-600/20 hover:bg-blue-700/20 focus:ring-blue-500 border-blue-600',
      href: '/administrador/usuarios/nuevo'
    },
    { 
      title: 'Editar Usuario', 
      description: 'Modificar datos de usuario existente',
      icon: <UserCog className="h-6 w-6 text-purple-600" />,
      color: 'bg-purple-600/20 hover:bg-purple-700/20 focus:ring-purple-500 border-purple-600',
      href: '/administrador/usuarios/editar'
    },
    { 
      title: 'Asignar Roles', 
      description: 'Gestionar permisos y roles de usuario',
      icon: <Users className="h-6 w-6 text-indigo-600" />,
      color: 'bg-indigo-600/20 hover:bg-indigo-700/20 focus:ring-indigo-500 border-indigo-600',
      href: '/administrador/usuarios/roles'
    },
    { 
      title: 'Activar/Desactivar', 
      description: 'Habilitar o deshabilitar cuentas de usuario',
      icon: <UserCheck className="h-6 w-6 text-green-600" />,
      color: 'bg-green-600/20 hover:bg-green-700/20 focus:ring-green-500 border-green-600',
      href: '/administrador/usuarios/activar'
    },
    { 
      title: 'Eliminar Usuario', 
      description: 'Eliminar permanentemente un usuario',
      icon: <UserX className="h-6 w-6 text-red-600" />,
      color: 'bg-red-600/20 hover:bg-red-700/20 focus:ring-red-500 border-red-600',
      href: '/administrador/usuarios/eliminar'
    },
    { 
      title: 'Restablecer Contraseña', 
      description: 'Generar nueva contraseña para el usuario',
      icon: <Key className="h-6 w-6 text-yellow-600" />,
      color: 'bg-yellow-600/20 hover:bg-yellow-700/20 focus:ring-yellow-500 border-yellow-600',
      href: '/administrador/usuarios/clave'
    },
  ];