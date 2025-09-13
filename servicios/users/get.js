import axios from 'axios';
import config from '@/config';

export const getUsers = async (token) => {
    try {
        const response = await axios.get(`${config.URL_API}users`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.log(error);
        return error;
    }
};

export const getUserById = async (id, token) => {
    try {
        const response = await axios.get(`${config.URL_API}users/cedula/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Estoy aqui');
        return response.data;
    } catch (error) {
        console.log('Estoy aqui2');
        console.log(error);
        return error;
    }
};

// export const getUserById = async (id, token) => {
//     try {
//         // const response = await axios.get(`/api/users/${id}`);
//         // const data = await response.data;
//         const user = users.find(user => user.id == id);
//         if (!user) {
//             const errorData = {
//                 success: true,
//                 message: "Usuario no encontrado",
//                 data: null
//             }
//             return errorData;
//         }
//         const data = {
//             success: true,
//             message: "Usuario obtenido correctamente",
//             data: user
//         };
//         return data;
//     } catch (error) {
//         console.log(error);
//         const errorData = {
//             success: false,
//             message: "Cliente->Server Error al obtener el usuario",
//             data: null
//         }
//         return errorData;
//     }
// };

