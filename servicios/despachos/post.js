import axios from 'axios';
import config from '@/config';

export const postMovimiento = async (data,token) => {
  try {
    const response = await axios.post(`${config.URL_API}movimiento/central/salida`, data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    const result = await response.data;
    return result;
  } catch (error) {
    console.log('Error al despachar:', error);  
    return error;
  }
};
