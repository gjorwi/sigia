import axios from 'axios';
import { hospitales } from '@/bdUsers/hospitales';
import config from '@/config';

export const getHospitales = async (token) => {
    try {
        const response = await axios.get(`${config.URL_API}hospitales`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.log('Error al obtener los hospitales:', error);
        const errorData = {
            success: false,
            message: "Cliente-Server Error al obtener los hospitales",
            data: null
        }
        return errorData;
    }
};

export const getHospitalById = async (rif,token) => {
    try {
        const response = await axios.get(`${config.URL_API}hospitales/rif/${rif}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const data = response.data;
        return data;
    } catch (error) {
        console.log('Error al obtener el hospital:', error);
        const errorData = {
            success: false,
            message: "Cliente-Server Error al obtener el hospital",
            data: null
        }
        return errorData;
    }
};