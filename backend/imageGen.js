import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const generateImage = async (prompt) => {
  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
        },
        responseType: "arraybuffer",
      }
    );

    const base64Image = Buffer.from(response.data).toString("base64");
    return `data:image/jpeg;base64,${base64Image}`;

  } catch (err) {
    console.error("========== HUGGING FACE ERROR ==========");
    console.error("Status:", err.response?.status);
    console.error("Headers:", err.response?.headers);

    if (err.response?.data) {
      console.error("Body:", Buffer.from(err.response.data).toString());
    }

    throw err;
  }
};

export default generateImage;