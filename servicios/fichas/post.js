import axios from 'axios';

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