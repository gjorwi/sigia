// This utility ensures the map component is only rendered on the client side
export const isBrowser = typeof window !== 'undefined';

// Center of Venezuela coordinates
export const defaultCenter = [8.0000, -66.0000];
export const defaultZoom = 6;

export const warehouses = [
  { 
    id: 1, 
    name: 'Almacén Caracas', 
    lat: 10.5000, 
    lng: -66.9000, 
    city: 'Caracas',
    region: 'Distrito Capital',
    inventory: 'Alto' 
  },
  { 
    id: 2, 
    name: 'Almacén Maracaibo', 
    lat: 10.6333, 
    lng: -71.6333,
    city: 'Maracaibo',
    region: 'Zulia',
    inventory: 'Medio' 
  },
  { 
    id: 3, 
    name: 'Almacén Valencia', 
    lat: 10.1667, 
    lng: -68.0000,
    city: 'Valencia',
    region: 'Carabobo',
    inventory: 'Bajo' 
  },
  { 
    id: 4, 
    name: 'Almacén Maracay', 
    lat: 10.2500, 
    lng: -67.6000,
    city: 'Maracay',
    region: 'Aragua',
    inventory: 'Alto' 
  },
  { 
    id: 5, 
    name: 'Almacén Barquisimeto', 
    lat: 10.0670, 
    lng: -69.3000,
    city: 'Barquisimeto',
    region: 'Lara',
    inventory: 'Medio' 
  },
  { 
    id: 6, 
    name: 'Almacén Ciudad Guayana', 
    lat: 8.3000, 
    lng: -62.7167,
    city: 'Ciudad Guayana',
    region: 'Bolívar',
    inventory: 'Alto' 
  },
];

export const getMarkerColor = (inventory) => {
  switch (inventory) {
    case 'Alto':
      return { color: 'green', text: 'text-green-600' };
    case 'Medio':
      return { color: 'yellow', text: 'text-yellow-600' };
    case 'Bajo':
      return { color: 'red', text: 'text-red-600' };
    default:
      return { color: 'blue', text: 'text-blue-600' };
  }
};
