import axios from 'axios';

export const postHospital = async (hospital) => {
    try {
        // const response = await axios.post('/api/hospitales', hospital);
        // const data = response.data;
        const data = {
            success: true,
            message: "Hospital guardado correctamente",
            data: hospital
        };
        return data;
    } catch (error) {
        console.error('Error al guardar el hospital:', error);
        const data = {
            success: false,
            message: "Cliente-Server Error al guardar el hospital",
            error: error.message
        };
        return data;
    }
};