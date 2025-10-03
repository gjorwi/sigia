import axios from 'axios';
import config from '@/config';

export const getInventario = async (token,id) => {
  try {
    const response = await axios.get(`${config.URL_API}inventario/sede/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = response.data;
    return data;
  } catch (error) {
    console.log('Error al obtener el inventario:', error);  
    return error;
  }
};