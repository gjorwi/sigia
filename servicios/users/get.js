import axios from 'axios';
//Simular usuarios
import { users } from '@/bdUsers/usuarios';

export const getUsers = async () => {
    try {
        // const response = await axios.get('/api/users');
        // const data = await response.data;
        const data = {
            success: true,
            message: "Usuarios obtenidos correctamente",
            data: users
        };
        return data;
    } catch (error) {
        console.log(error);
        const errorData = {
            success: false,
            message: "Cliente->Server Error al obtener los usuarios",
            data: null
        }
        return errorData;
    }
};

export const getUserById = async (id) => {
    try {
        // const response = await axios.get(`/api/users/${id}`);
        // const data = await response.data;
        const user = users.find(user => user.id == id);
        if (!user) {
            const errorData = {
                success: true,
                message: "Usuario no encontrado",
                data: null
            }
            return errorData;
        }
        const data = {
            success: true,
            message: "Usuario obtenido correctamente",
            data: user
        };
        return data;
    } catch (error) {
        console.log(error);
        const errorData = {
            success: false,
            message: "Cliente->Server Error al obtener el usuario",
            data: null
        }
        return errorData;
    }
};

