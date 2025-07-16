import axios from 'axios';

export const putInsumo = async (insumo) => {
    try {
        // const response = await axios.put(`/api/insumos/${insumo.id}`, insumo);
        // const data = response.data;
        const data = {
            success: true,
            message: "Insumo se actualizó correctamente",
            data: insumo
        };
        return data;
    } catch (error) {
        console.error('Error al actualizar el insumo:', error);
        const errorData = {
            success: false,
            message: "Cliente->Server Error al actualizar el insumo",
            data: null
        }
        return errorData;
    }
};