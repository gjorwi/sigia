import axios from 'axios';
import config from '@/config';

export const putActualizarFichaInsumos = async (id, payload, token) => {
  try {
    const response = await axios.put(`${config.URL_API}ficha-insumos`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar la ficha de insumos:', error);
    return {
      status: false,
      mensaje: error.response?.data?.mensaje || 'Error al actualizar la ficha de insumos',
      autenticacion: error.response?.data?.autenticacion
    };
  }
};

export const putActualizarFichaHospital = async (hospitalId, token) => {
  try {
    const response = await axios.put(`${config.URL_API}ficha-insumos/hospital/${hospitalId}`, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar la ficha del hospital:', error);
    return {
      status: false,
      mensaje: error.response?.data?.mensaje || 'Error al actualizar la ficha de insumos',
      autenticacion: error.response?.data?.autenticacion
    };
  }
};