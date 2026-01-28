
import { PackagePlus, PackageSearch, PackageCheck, PackageX } from 'lucide-react';

export const insumoActions = [
    { 
      title: 'Nuevo Insumo', 
      description: 'Crear un nuevo insumo en el sistema',
      icon: <PackagePlus className="h-6 w-6 text-blue-600" />,
      color: 'bg-blue-600/20 hover:bg-blue-700/20 focus:ring-blue-500 border-blue-600',
      href: '/administrador/insumos/nuevo'
    },
    { 
      title: 'Editar Insumo', 
      description: 'Modificar datos de insumo existente',
      icon: <PackageSearch className="h-6 w-6 text-purple-600" />,
      color: 'bg-purple-600/20 hover:bg-purple-700/20 focus:ring-purple-500 border-purple-600',
      href: '/administrador/insumos/editar'
    },
    { 
      title: 'Activar/Desactivar', 
      description: 'Habilitar o deshabilitar registro de insumo',
      icon: <PackageCheck className="h-6 w-6 text-green-600" />,
      color: 'bg-green-600/20 hover:bg-green-700/20 focus:ring-green-500 border-green-600',
      href: '/administrador/insumos/activar'
    },
    { 
      title: 'Eliminar Insumo', 
      description: 'Eliminar permanentemente un insumo',
      icon: <PackageX className="h-8 w-8 text-white" />,
      color: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      href: '/administrador/insumos/eliminar'
    }
  ];