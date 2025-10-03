import axios from 'axios';
import config from '@/config';

export const postInventario = async (inventario,token) => {
  console.log('inventario: ' + JSON.stringify(inventario,null,2));
  try {
    const response = await axios.post(`${config.URL_API}inventario/registrar`, inventario, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = response.data;
    return data;
  } catch (error) {
    console.log('Error al crear el inventario:', error);
    return error;
  }
};