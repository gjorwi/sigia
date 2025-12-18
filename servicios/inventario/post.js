import axios from 'axios';
import config from '@/config';

export const postInventario = async (inventario, token) => {
  console.log('inventario: ' + JSON.stringify(inventario, null, 2));
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
    return {
      status: false,
      mensaje: error.response?.data?.mensaje || 'Error de conexión'
    };
  }
};

export const postInventarioDirecto = async (data, token) => {
  console.log('data: ' + JSON.stringify(data, null, 2));
  try {
    const response = await axios.post(`${config.URL_API}ingresos-directos`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.log('Error al registrar ingreso directo:', error);
    return {
      status: false,
      mensaje: error.response?.data?.mensaje || 'Error de conexión'
    };
  }
};

export const postInventarioDirectoFile = async (token,file) => {
 try {
    const response = await axios.post(`${config.URL_API}ingresos-directos-file`, file, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.log('Error al registrar ingreso directo file:', error);
    return {
      status: false,
      mensaje: error.response?.data?.mensaje || 'Error de conexión'
    };
  }
};