import axios from 'axios';
export const putHospital = async (formData) => {
  try {
    // const response = await axios.put('/api/hospitales', formData);
    // const result = response.data;
    const result = {
        success: true,
        message: "Hospital actualizado correctamente",
        data: formData
    };
    return result;
  } catch (error) {
    console.log(error);
    const errorData = {
      success: false,
      message: 'Cliente-Server Error al actualizar el hospital',
      data: null
    }
    return errorData;
  }
};