import axios from 'axios';
import config from '@/config';

export const getStats = async (token,sede_id) => {
    try {
    const response = await axios.get(`${config.URL_API}estadisticas/dashboard/sede/${sede_id}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await response.data;
    return data;
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        throw error;
    }
};