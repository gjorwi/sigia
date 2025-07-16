import axios from 'axios';

export async function putLote(lote) {
    try {
        // const response = await axios.put(`/api/lotes/${lote.id}`, lote);
        // const data = response.data;
        const data = {
            success: true,
            message: "Lote actualizado correctamente",
            data: lote
        };
        return data;
    } catch (error) {
        console.error('Error al actualizar el lote:', error);
        const errorData = {
            success: false,
            message: "Cliente-Server Error al actualizar el lote",
            data: null
        }
        return errorData;
    }
}