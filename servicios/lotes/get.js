import axios from 'axios';
import config from '@/config';

export const getLote = async (token) => {
    try {
        const response = await axios.get(`${config.URL_API}lotes`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = response.data;
        return data;
    } catch (error) {
        console.log('Error al obtener el lote:', error);
        return error;
    }
}
export const getLoteById = async (id, token) => {
    try {
        const response = await axios.get(`${config.URL_API}lotes/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = response.data;

        return data;
    } catch (error) {
        console.error('Error al obtener el lote:', error);
        const errorData = {
            success: false,
            message: "Cliente-Server Error al obtener el lote",
            data: null
        }
        return errorData;
    }
}
