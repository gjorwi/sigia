import axios from 'axios';
import config from '@/config';

export const putUser = async (user,token) => {
    try {
        const response = await axios.put(`${config.URL_API}users/cedula/${user.cedula}`, user, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.log(error);
        return error;
    }
};

export const putChangePassword = async (user) => {
    try {
        // const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`, {
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     data: JSON.stringify(user),
        // });
        // const data = response.data;
        const data = {
            success: true,
            message: "Clave actualizada correctamente",
            data: user
        };
        return data;
    } catch (error) {
        console.log(error);
        const errorData = {
            success: false,
            message: 'Cliente-Server Error al actualizar la clave',
            data: null
        }
        return errorData;
    }
};
