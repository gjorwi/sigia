import axios from "axios"
import config from '@/config';

export const getMovimientos = async (token,idSede) => {
    try {
        const response = await axios.get(`${config.URL_API}movimientos-stock/origen_sede/${idSede}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        const data = response.data;
        return data;
    } catch (error) {
        console.error('Error al obtener despachos:', error);
        const errorData = {
            success: false,
            message: "Cliente->Server Error al obtener los despachos",
            data: null
        }
        return errorData;
    }
};
export const getMovimientosRecepcion = async (token,idSede) => {
    try {
        const response = await axios.get(`${config.URL_API}movimientos-stock/destino_sede/${idSede}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        const data = response.data;
        return data;
    } catch (error) {
        console.error('Error al obtener despachos:', error);
        const errorData = {
            success: false,
            message: "Cliente->Server Error al obtener los despachos",
            data: null
        }
        return errorData;
    }
};