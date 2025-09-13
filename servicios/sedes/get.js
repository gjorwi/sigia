import config from '@/config';
import axios from 'axios';

export const getSedes = async (token) => {
    try {
        const response = await axios.get(`${config.URL_API}sedes`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.log('Error al obtener las sedes:', error);
        return error;
    }
};

export const getSedeById = async (id,token) => {
  try {
      const response = await axios.get(`${config.URL_API}sedes/${id}`, {
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          }
      });
      return response.data;
  } catch (error) {
      console.log('Error al obtener las sedes:', error);
      return error;
  }
};
export const getSedeByHospitalId = async (id,token) => {
  try {
      const response = await axios.get(`${config.URL_API}sedes/hospital/${id}`, {
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          }
      });
      return response.data;
  } catch (error) {
      console.log('Error al obtener las sedes:', error);
      return error;
  }
};
