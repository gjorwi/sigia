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

