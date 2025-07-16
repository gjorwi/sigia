import axios from 'axios';
export const postInsumo = async (insumo) => {
    try {
        // const response = await axios.post('/api/insumos', insumo);
        // const data = response.data;
        const data = {
            success: true,
            message: "Insumo guardado correctamente",
            data: insumo
        };
        return data;
    } catch (error) {
        console.error('Error al crear el insumo:', error);
        const errorData = {
            success: false,
            message: 'Cliente-Server Error al crear el insumo',
            data: null
        }
        return errorData;
    }
};