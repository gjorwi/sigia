import axios from 'axios';

export async function deleteLote(id) {
    try {
        // const response = await axios.delete(`/api/lotes/${id}`);
        // const data = response.data;
        const data = {
            success: true,
            message: "Lote eliminado correctamente",
            data: id
        };
        return data;
    } catch (error) {
        console.error('Error al eliminar el lote:', error);
        const errorData = {
            success: false,
            message: "Cliente-Server Error al eliminar el lote",
            data: null
        }
        return errorData;
    }
}