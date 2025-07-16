import axios from 'axios';

export const postLote = async (lote) => {
    try {
        // const response = await axios.post('/api/lotes', lote);
        // const data = response.data;
        const data = {
            success: true,
            message: "Lote guardado correctamente",
            data: lote
        };
        return data;
    } catch (error) {
        console.error('Error al crear el lote:', error);
        const errorData = {
            success: false,
            message: 'Cliente-Server Error al crear el lote',
            data: null
        }
        return errorData;
    }
};