import axios from 'axios';
import config from '@/config';

export const putUser = async (user, token) => {
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
        return {
            status: false,
            mensaje: error.response?.data?.mensaje || 'Error de conexión'
        };
    }
};

export const putChangePassword = async (data, token) => {
    try {
        const response = await axios.put(`${config.URL_API}users/change-password/`, {data}, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.log(error);
        return {
            status: false,
            mensaje: error.response?.data?.mensaje || 'Error al actualizar la contraseña',
            autenticacion: error.response?.data?.autenticacion || 0
        };
    }
};

export const putChangePasswordEmail = async (user) => {
    try {
        const response = await axios.put(`${config.URL_API}users/${user.id}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(user),
        });
        return response.data;
    } catch (error) {
        console.log(error);
        return {
            status: false,
            mensaje: error.response?.data?.mensaje || 'Error de conexión'
        };
    }
};

