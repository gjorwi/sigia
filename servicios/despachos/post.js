import axios from 'axios';
import config from '@/config';

export const postMovimiento = async (token,data) => {
  // console.log(JSON.stringify(data,null,2));
  console.log(token);
  try {
    const response = await axios.post(`${config.URL_API}movimiento/almacen/salida`, data, {
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

export const postMovimientosRecepcion = async (token, data) => {
  try {
    const response = await axios.post(`${config.URL_API}movimiento/almacen/entrada`, data, {
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
