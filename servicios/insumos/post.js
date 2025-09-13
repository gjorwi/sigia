import axios from 'axios';
import config from '@/config';
export const postInsumo = async (insumo, token) => {
    try {
        const response = await axios.post(`${config.URL_API}insumos`, insumo, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const data = response.data;
        return data;
    } catch (error) {
        console.error('Error al crear el insumo:', error);
        return error;
    }
};