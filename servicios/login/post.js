import axios from "axios";
import config from "../../config";

export const postLogin = async (data) => {
  try {
    const response = await axios.post(`${config.URL_API}login`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};