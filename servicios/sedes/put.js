import config from '@/config';
import axios from 'axios';

export const updateSede = async (sede, token) => {
    try {
        const response = await axios.put(`${config.URL_API}sedes/${sede.id}`, sede, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.log('Error al actualizar la sede:', error);
        return error;
    }
};