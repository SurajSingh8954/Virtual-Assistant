import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const generateImage = async (prompt) => {
  const response = await axios.post(
    "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
    { inputs: prompt },
    {
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
      },
      responseType: "arraybuffer", // image comes back as raw bytes
    }
  );

  // Convert to base64 so we can send it straight to the frontend as a data URL
  const base64Image = Buffer.from(response.data, "binary").toString("base64");
  return `data:image/jpeg;base64,${base64Image}`;
};

export default generateImage;