import axios from 'axios';
import config from '@/config';

export const postRepartidorSeguimiento = async (token, data) => {
  try {
    const response = await axios.post(`${config.URL_API}repartidor/seguimiento`, data,{
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });
    const result = await response.data;
    return result;
  } catch (error) {
    console.log('Error al crear el repartidor:', error);
    return error;
  }
}