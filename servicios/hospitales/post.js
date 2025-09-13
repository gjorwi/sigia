import axios from 'axios';
import config from '@/config';

export const postHospital = async (hospital, token) => {
    try {
        const response = await axios.post(`${config.URL_API}hospitales`, hospital, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const data = response.data;
        return data;
    } catch (error) {
        console.error('Error al guardar el hospital:', error);
        const data = {
            success: false,
            message: "Cliente-Server Error al guardar el hospital",
            error: error.message
        };
        return data;
    }
};