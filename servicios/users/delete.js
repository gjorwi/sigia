import axios from 'axios';
import config from '@/config';

export const deleteUser = async (user, token) => {
    try {
        const response = await axios.delete(`${config.URL_API}users/${user.id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.data;
        return data;
    } catch (error) {
        console.log('Error al eliminar el usuario:', error);
        return error;
    }
};