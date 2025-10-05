import config from '@/config';

// URL base de la API
export const API_BASE_URL = config.URL_API;

// Endpoints específicos
export const ENDPOINTS = {
  // Despachos
  DESPACHOS: {
    MOVIMIENTO_SALIDA: 'movimiento/almacen/salida',
    PACIENTE: 'despachos/paciente',
    PACIENTES_HISTORIAL: 'despachos/pacientes'
  },
  
  // Inventario
  INVENTARIO: {
    GET: 'inventario',
    UPDATE: 'inventario/update'
  },
  
  // Sedes
  SEDES: {
    BY_HOSPITAL: 'sedes/hospital',
    GET_ALL: 'sedes'
  },
  
  // Usuarios
  USUARIOS: {
    LOGIN: 'auth/login',
    PROFILE: 'auth/profile'
  }
};

export default {
  API_BASE_URL,
  ENDPOINTS
};
