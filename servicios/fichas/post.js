import axios from 'axios';
import config from '@/config';

export const postFicha = async (formData) => {
  try {
    // const response = await axios.post('/api/fichas', formData);
    // const data = response.data;
    const data = {
      success: true,
      message: "Ficha guardada correctamente",
      data: formData
    };
    return data;
  } catch (error) {
    console.error('Error al crear la ficha:', error);
    const errorData = {
      success: false,
      message: 'Cliente-Server Error al crear la ficha',
      data: null
    }
    return errorData;
  }
};

export const postGenerarFicha = async (hospitalId, token) => {
  try {
    const response = await axios.post(`${config.URL_API}ficha-insumos/generar/${hospitalId}`, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al generar la ficha:', error);
    return {
      status: false,
      mensaje: error.response?.data?.mensaje || 'Error al generar la ficha de insumos',
      autenticacion: error.response?.data?.autenticacion
    };
  }
};