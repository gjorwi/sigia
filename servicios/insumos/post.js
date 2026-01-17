import axios from 'axios';
import config from '@/config';
export const postInsumo = async (insumo, token) => {
    try {
        const response = await axios.post(`${config.URL_API}insumos`, insumo, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const data = response.data;
        return data;
    } catch (error) {
        // Manejo específico del error 429 (Rate Limit)
        if (error.response && error.response.status === 429) {
            const retryAfterHeader = error.response?.headers?.['retry-after'];
            const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : NaN;
            const waitMs = Number.isFinite(retryAfterSeconds)
                ? Math.max(0, retryAfterSeconds) * 1000
                : 1500;

            await new Promise(resolve => setTimeout(resolve, waitMs));

            try {
                const retryResponse = await axios.post(`${config.URL_API}insumos`, insumo, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                return retryResponse.data;
            } catch (retryError) {
                return {
                    status: false,
                    mensaje: 'Demasiadas solicitudes. Por favor, espere un momento e intente nuevamente.',
                    rateLimitError: true
                };
            }
        }

        console.error('Error al crear el insumo:', error);
        
        return {
            status: false,
            mensaje: 'Error al crear el insumo.',
            error: error
        };
    }
};