import axios from 'axios';
import config from '@/config';

export const getMovimientosPacientes = async (token, sede_id) => {
    try {
        const response = await axios.get(`${config.URL_API}despachos-pacientes`, {
            // params: {
            //     sede_id: sede_id
            // },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.data;
        return result;
    } catch (error) {
        console.log('Error en getMovimientosPacientes:', error);
        return error;
    }
};