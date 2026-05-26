import response from '../../../utils/response.js';

const predictServiceBaseUrl = process.env.PREDICT_SERVICE_URL;

export const predictText = async (req, res, next) => {
  const { text } = req.validated;

  try {
    const predoctResponse = await fetch(`${predictServiceBaseUrl}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    const result = await predoctResponse.json();

    if (!predoctResponse.ok) {
      const errorMessage =
        result?.message || 'Gagal memproses permintaan ke model Prediksi';
      throw new Error(errorMessage);
    }

    return response(res, 200, 'Prediksi model Prediksi berhasil', {
      prediction: result,
    });
  } catch (error) {
    return next(error);
  }
};
