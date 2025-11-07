import axios from "axios";
import config from '@/config';

export const consultarCedula = async (cedula, token) => {
    try {
        console.log('Consultando cédula:', cedula);
        console.log('Tipo cédula:', typeof cedula);
        console.log('Token:', token);
        const response = await axios.post(`${config.URL_API}cedula/consultar`, {cedula}, {
            
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        return response.data;
    } catch (error) {
        console.log('Error al consultar cédula:', error);
        return error;
    }
};
