import axios from 'axios';
import config from '@/config';

export const postLote = async (lote,token) => {
    try {
        const response = await axios.post(`${config.URL_API}/lotes`, lote, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = response.data;
        return data;
    } catch (error) {
        console.log('Error al crear el lote:', error);
        return error;
    }
};