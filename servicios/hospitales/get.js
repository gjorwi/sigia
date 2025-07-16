import axios from 'axios';
import { hospitales } from '@/bdUsers/hospitales';

export const getHospitales = async () => {
    try {
        // const response = await axios.get('/api/hospitales');
        // const data = response.data;
        const data = {
            success: true,
            message: "Hospitales obtenidos correctamente",
            data: hospitales
        };
        return data;
    } catch (error) {
        console.error('Error al obtener los hospitales:', error);
        const errorData = {
            success: false,
            message: "Cliente-Server Error al obtener los hospitales",
            data: null
        }
        return errorData;
    }
};

export const getHospitalById = async (rif) => {
    try {
        // const response = await axios.get(`/api/hospitales/${rif}`);
        // const data = response.data;
        const result = hospitales.find(hospital => hospital.rif == rif);
        if (!result) {
            const errorData = {
                success: true,
                message: "Hospital no encontrado",
                data: null
            }
            return errorData;
        }
        const data = {
            success: true,
            message: "Hospital obtenido correctamente",
            data: result
        };
        return data;
    } catch (error) {
        console.error('Error al obtener el hospital:', error);
        const errorData = {
            success: false,
            message: "Cliente-Server Error al obtener el hospital",
            data: null
        }
        return errorData;
    }
};