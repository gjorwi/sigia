import axios from 'axios';
import config from '@/config';
import {lotes} from '@/bdUsers/lotes';

export const getLote = async (token) => {
    try {
        const response = await axios.get(`${config.URL_API}/lotes`, {
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
export const getLoteById = async (id) => {
    try {
        // const response = await axios.get(`/api/lotes/${id}`);
        // const data = response.data;
        const result = lotes.find(lote => lote.id == id);
        if (!result) {
            const errorData = {
                success: true,
                message: "Lote no encontrado",
                data: null
            }
            return errorData;
        }
        const data = {
            success: true,
            message: "Lote obtenido correctamente",
            data: result
        };
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
