
import { FilePlus2, FileSearch, FileCheck } from 'lucide-react';

export const inventActions = [
    { 
      title: 'Nuevo Lote', 
      description: 'Crear un nuevo lote de insumo',
      icon: <FilePlus2 className="h-6 w-6 text-blue-600" />,
      color: 'bg-blue-600/20 hover:bg-blue-700/20 focus:ring-blue-500 border-blue-600',
      href: '/administrador/inventario/nuevo'
    },
    { 
      title: 'Editar Lote', 
      description: 'Modificar datos de lote existente',
      icon: <FileSearch className="h-6 w-6 text-purple-600" />,
      color: 'bg-purple-600/20 hover:bg-purple-700/20 focus:ring-purple-500 border-purple-600',
      href: '/administrador/inventario/editar'
    },
    { 
      title: 'Activar/Desactivar', 
      description: 'Habilitar o deshabilitar registro de lote',
      icon: <FileCheck className="h-6 w-6 text-green-600" />,
      color: 'bg-green-600/20 hover:bg-green-700/20 focus:ring-green-500 border-green-600',
      href: '/administrador/inventario/activar'
    }
  ];