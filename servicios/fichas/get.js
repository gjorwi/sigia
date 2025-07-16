import axios from "axios";
import { fichas } from "@/bdUsers/fichas";

export const getFichaById = async (id) => {
  try {
    // const response = await axios.get(`http://localhost:3000/api/fichas/${id}`);
    // const data = response.data;
    const data = fichas.find(ficha => ficha.idHospital == id);
    if (!data) {
      const errorData = {
        success: true,
        message: "Ficha no encontrada",
        data: null
      }
      return errorData;
    }
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
   