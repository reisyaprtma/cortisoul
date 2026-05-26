import axios from 'axios';

const predictServiceBaseUrl =
  process.env.PREDICT_SERVICE_URL || process.env.AI_SERVICE_URL;

if (!predictServiceBaseUrl) {
  throw new Error('PREDICT_SERVICE_URL environment variable is not configured');
}

export const predictService = async (text) => {
  try {
    const response = await axios.post(`${predictServiceBaseUrl}/predict`, {
      text,
    });
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data ||
      error.message ||
      'Gagal memanggil layanan prediksi';
    throw new Error(errorMessage, { cause: error });
  }
};
