import axios from 'axios';
import config from '@/config';

export const postUser = async (formData, token) => {
    try {
        const response = await axios.post(`${config.URL_API}users`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
      return error;
    }
};