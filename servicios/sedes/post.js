import axios from 'axios';
import config from '@/config';

export const postSede = async (data, token) => {
  try {
    const response = await axios.post(`${config.URL_API}sedes`, data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.log('Error al registrar sede:', error);
    return error;
  }
}