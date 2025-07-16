import axios from 'axios';
export const deleteUser = async (user) => {
    try {
        // const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`);
        // const data = await response.data;
        const data = {
            success: true,
            message: "Usuario eliminado correctamente",
            data: user
        };
        return data;
    } catch (error) {
        console.error('Error al eliminar el usuario:', error);
        const errorData = {
            success: false,
            message: "Cliente->Server Error al eliminar el usuario",
            data: null
        }
        return errorData;
    }
};