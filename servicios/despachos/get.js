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
        console.log('Error al obtener despachos:', error);
        return error;
    }
};
export const getMovimientosRecepcion = async (token, idSede, page = 1) => {
    try {
        const response = await axios.get(`${config.URL_API}movimientos-stock/destino_sede/${idSede}?page=${page}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        const data = response.data;
        return data;
    } catch (error) {
        console.log('Error al obtener despachos:', error);
        return error;
    }
};
export const getEnTransito = async (token, idSede) => {
    console.log('token', token);
    console.log('idSede', idSede);
    try {
        const response = await axios.get(`${config.URL_API}repartidor/movimientos-en-camino/${idSede}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        const data = response.data;
        return data;
    } catch (error) {
        console.log('Error al obtener despachos:', error);
        return error;
    }
};
export const getEnTransitoAdmin = async (token, idSede) => {
    try {
        const response = await axios.get(`${config.URL_API}repartidor/movimientos-en-camino/origen/${idSede}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        const data = response.data;
        return data;
    } catch (error) {
        console.log('Error al obtener despachos:', error);
        return error;
    }
};

export const getHistorialMovimientos = async (token, idSede) => {
    try {
        const response = await axios.get(`${config.URL_API}movimientos-stock/historial/origen/${idSede}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        const data = response.data;
        return data;
    } catch (error) {
        console.log('Error al obtener historial:', error);
        return error;
    }
};

export const getMovimientosHospital = async (token, idHospital) => {
    try {
        const response = await axios.get(`${config.URL_API}estadisticas/movimientos/hospital/${idHospital}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        const data = response.data;
        return data;
    } catch (error) {
        console.log('Error al obtener despachos:', error);
        return error;
    }
};

