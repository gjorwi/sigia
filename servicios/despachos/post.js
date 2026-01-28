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
    return {
      status: false,
      mensaje: error.response?.data?.mensaje || 'Error al despachar',
      autenticacion: error.response?.data?.autenticacion||0
    };
  }
};
export const postMovimientoEstados = async (token,file) => {
  // console.log(JSON.stringify(data,null,2));
  console.log(token);
  try {
    const response = await axios.post(`${config.URL_API}movimiento/estados/import`, file, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
    });
    const result = await response.data;
    return result;
  } catch (error) {
    console.log('Error al importar:', error);  
    return {
      status: false,
      mensaje: error.response?.data?.mensaje || 'Error al importar',
      autenticacion: error.response?.data?.autenticacion||0
    };
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
    console.log('Error al recibir:', error);  
    return {
      status: false,
      mensaje: error.response?.data?.mensaje || 'Error al recibir',
      autenticacion: error.response?.data?.autenticacion||0
    };
  }
};
