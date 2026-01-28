import axios from 'axios';
import config from '@/config';

export const deleteInsumo = async (insumo, token) => {
  try {
    const response = await axios.delete(`${config.URL_API}insumos/${insumo.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.log('Error al eliminar el insumo:', error);
    return {
      status: false,
      mensaje: error.response?.data?.mensaje || 'Error al eliminar el insumo',
      autenticacion: error.response?.data?.autenticacion
    };
  }
};
