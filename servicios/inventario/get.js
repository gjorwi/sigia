import axios from 'axios';
import config from '@/config';

export const getInventario = async (token,id) => {
  console.log("id: "+id);
  try {
    const response = await axios.get(`${config.URL_API}inventario/sede/${id}`, {
      headers: {
        'Content-Type': 'application/json',
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

export const getInsumosPorVencer = async (token, hospitalId, limite = 5) => {
  try {
    const response = await axios.get(`${config.URL_API}inventario/hospital/${hospitalId}/por-vencer`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      params: {
        limite
      }
    });
    const data = response.data;
    return data;
  } catch (error) {
    console.log('Error al obtener insumos por vencer:', error);  
    return error;
  }
};

export const getInventarioHospital = async (token, hospitalId) => {
  try {
    const response = await axios.get(`${config.URL_API}estadisticas/inventario/hospital/${hospitalId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const data = response.data;
    return data;
  } catch (error) {
    console.log('Error al obtener inventario del hospital:', error);  
    return error;
  }
};