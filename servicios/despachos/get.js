import axios from "axios";
import { despachos } from "@/bdUsers/despachos";

export const getDespachos = async () => {
    try {
        // const response = await axios.get('/api/insumos');
        // const data = response.data;
        const data = {
            success: true,
            message: "Despachos obtenidos correctamente",
            data: despachos
        };
        return data;
    } catch (error) {
        console.error('Error al obtener despachos:', error);
        const errorData = {
            success: false,
            message: "Cliente->Server Error al obtener los despachos",
            data: null
        }
        return errorData;
    }
};