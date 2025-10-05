import axios from 'axios';
import config from '@/config';

/**
 * Servicio para registrar despacho a paciente (salida definitiva del almacén)
 * @param {string} token - Token de autenticación
 * @param {Object} data - Datos del despacho a paciente
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const postDespachoAPaciente = async (token, data) => {
  try {
    const response = await axios.post(`${config.URL_API}despachos-pacientes`, data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.data;
    return result;
  } catch (error) {
    console.log('Error en postDespachoAPaciente:', error);
    return error;
  }
};

/**
 * Servicio para obtener historial de despachos a pacientes
 * @param {string} token - Token de autenticación
 * @param {number} sedeId - ID de la sede
 * @param {Object} filtros - Filtros opcionales (fecha, paciente, etc.)
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const getHistorialDespachosPacientes = async (token, sedeId, filtros = {}) => {
  try {
    const params = {
      sede_id: sedeId,
      ...filtros
    };

    const response = await axios.get(`${config.URL_API}despachos-pacientes`, {
      params,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.data;
    return result;
  } catch (error) {
    console.log('Error en getHistorialDespachosPacientes:', error);
    return error;
  }
};
