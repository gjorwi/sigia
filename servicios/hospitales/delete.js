import axios from 'axios';
import config from '@/config';

export const deleteHospital = async (hospitalId, token) => {
  try {
    const response = await axios.delete(`${config.URL_API}hospitales/${hospitalId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al eliminar el hospital:', error);
    return {
      status: false,
      mensaje: error.response?.data?.mensaje || 'Error al eliminar el hospital',
      autenticacion: error.response?.data?.autenticacion
    };
  }
};
