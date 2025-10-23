import axios from 'axios';
import config from '@/config';
export const putHospital = async (formData, token) => {
  try {
    const response = await axios.put(`${config.URL_API}hospitales/cod_sicm/${formData.cod_sicm}`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const result = response.data;
    return result;
  } catch (error) {
    console.log(error);
    const errorData = {
      status: false,
      message: 'Cliente-Server Error al actualizar el hospital',
      data: null
    }
    return errorData;
  }
};