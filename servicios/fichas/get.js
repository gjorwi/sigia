import axios from "axios";
import config from '@/config';

export const getFichaById = async (id, token) => {
  try {
    const response = await axios.get(`${config.URL_API}fichas/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = response.data;

    const fichaData = {
      success: true,
      message: "Ficha obtenida correctamente",
      data: data
    };
    return fichaData;
  } catch (error) {
    console.error(error);
    const errorData = {
      success: false,
      message: "Cliente-Server Error al obtener la ficha",
      data: null
    }
    return errorData;
  }
};

export const getFichaHospitalById = async (id, token) => {
  try {
    const response = await axios.get(`${config.URL_API}ficha-insumos/hospital/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(error);
    const errorData = {
      success: false,
      message: "Cliente-Server Error al obtener la ficha",
      data: null
    }
    return errorData;
  }
};
