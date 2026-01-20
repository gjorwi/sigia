import axios from 'axios';
import config from '@/config';

export const deleteFichaHospital = async (hospitalId, token) => {
  try {
    const response = await axios.delete(`${config.URL_API}ficha-insumos/hospital/${hospitalId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al eliminar la ficha:', error);
    return {
      status: false,
      mensaje: error.response?.data?.mensaje || 'Error al eliminar la ficha de insumos',
      autenticacion: error.response?.data?.autenticacion
    };
  }
};
export const deleteFicha = async (fichaId, token) => {
  try {
    const response = await axios.delete(`${config.URL_API}ficha-insumos/hospital/${hospitalId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al eliminar la ficha:', error);
    return {
      status: false,
      mensaje: error.response?.data?.mensaje || 'Error al eliminar la ficha de insumos',
      autenticacion: error.response?.data?.autenticacion
    };
  }
};
