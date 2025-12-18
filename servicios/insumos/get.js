import axios from 'axios';
import config from '@/config';

export const getInsumos = async (token) => {
    try {
        const response = await axios.get(`${config.URL_API}insumos`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response?.data;
    } catch (error) {
        console.log('Error al obtener insumos:', error);
        return error;
    }
};

export const getInsumoById = async (id, token) => {
    try {
        const response = await axios.get(`${config.URL_API}insumos/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response?.data;
    } catch (error) {
        console.log('Error al obtener el insumo:', error);
        return error;
    }
};

export const getInsumoByCodigo = async (codigo, token) => {
    try {
        const response = await axios.get(`${config.URL_API}insumos/codigo/${codigo}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response?.data;
    } catch (error) {
        console.log('Error al obtener el insumo:', error);
        return error;
    }
};

export const getTrazabilidadInsumo = async (token, hospital_id, insumo_id, fecha, tipo_filtro) => {
    console.log("hospital_id: "+hospital_id);
    console.log("insumo_id: "+insumo_id);
    console.log("fecha: "+fecha);
    console.log("tipo_filtro: "+tipo_filtro);
    try {
        const response = await axios.get(`${config.URL_API}estadisticas/traza-insumo/hospital/${hospital_id}?insumo_id=${insumo_id}&fecha=${fecha}&tipo_filtro=${tipo_filtro}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response?.data;
    } catch (error) {
        console.log('Error al obtener la trazabilidad del insumo:', error);
        return error;
    }
};


