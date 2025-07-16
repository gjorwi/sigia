import axios from 'axios';

export const putUser = async (user) => {
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
            message: "Usuario actualizado correctamente",
            data: user
        };
        return data;
    } catch (error) {
        console.log(error);
        const errorData = {
            success: false,
            message: 'Cliente-Server Error al actualizar el usuario',
            data: null
        }
        return errorData;
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
