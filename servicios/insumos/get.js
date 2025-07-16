import axios from 'axios';
import { insumos } from '@/bdUsers/insumos';

export const getInsumos = async () => {
    try {
        // const response = await axios.get('/api/insumos');
        // const data = response.data;
        const data = {
            success: true,
            message: "Insumos obtenidos correctamente",
            data: insumos
        };
        return data;
    } catch (error) {
        console.error('Error al obtener insumos:', error);
        const errorData = {
            success: false,
            message: "Cliente->Server Error al obtener los insumos",
            data: null
        }
        return errorData;
    }
};

export const getInsumoById = async (id) => {
    try {
        // const response = await axios.get(`/api/insumos/${id}`);
        // const data = response.data;
        const result = insumos.find(insumo => insumo.id == id);
        if (!result) {
            const errorData = {
                success: true,
                message: "Insumo no encontrado",
                data: null
            }
            return errorData;
        }
        const data = {
            success: true,
            message: "Insumo obtenido correctamente",
            data: result
        };
        return data;
    } catch (error) {
        console.error('Error al obtener el insumo:', error);
        const errorData = {
            success: false,
            message: "Cliente->Server Error al obtener el insumo",
            data: null
        }
        return errorData;
    }
};
