const generateImage = async (prompt) => {
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
  return imageUrl;
};

export default generateImage;