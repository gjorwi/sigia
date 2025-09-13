import axios from 'axios';
import config from '@/config';
export const putInsumo = async (insumo,token) => {
    console.log("insumo: "+JSON.stringify(insumo));
    try {
        const response = await axios.put(`${config.URL_API}insumos/${insumo.id}`, insumo, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al actualizar el insumo:', error);
        return error;
    }
};
export const putInsumoByCodigo = async (insumo,token) => {
    console.log("insumo: "+JSON.stringify(insumo));
    try {
        const response = await axios.put(`${config.URL_API}insumos/codigo/${insumo.codigo}`, insumo, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al actualizar el insumo:', error);
        return error;
    }
};
