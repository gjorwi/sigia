import axios from 'axios';
import {lotes} from '@/bdUsers/lotes';

export const getLote = async () => {
    try {
        // const response = await axios.get(`/api/lotes`);
        // const data = response.data;
        const data = {
            success: true,
            message: "Lotes obtenidos correctamente",
            data: lotes
        };
        return data;
    } catch (error) {
        console.error('Error al obtener el lote:', error);
        const errorData = {
            success: false,
            message: "Cliente-Server Error al obtener los lotes",
            data: null
        }
        return errorData;
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
