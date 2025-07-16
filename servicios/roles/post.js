
import axios from 'axios';

export const postUserRoles = async (user, permissions) => {
  try {
    // const response = await axios.post('/api/roles', {
    //   user,
    //   permissions,
    // });
    // const data = await response.data;
    const data = {
      success: true,
      message: "Roles y permisos guardados correctamente",
      data: {
        user,
        permissions
      }
    };
    return data;
  } catch (error) {
    console.log('Error al guardar roles y permisos:', error);
    const errorData = {
      success: false,
      message: "Cliente->Server Error al guardar roles y permisos",
      data: null
    }
    return errorData;
  }
};