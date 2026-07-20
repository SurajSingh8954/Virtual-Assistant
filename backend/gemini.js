import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const aiResponse = async (command, assistantName, userName) => {
  const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });

  const prompt = `
You are a virtual assistant named ${assistantName} created by ${userName}.

Respond ONLY with a JSON object in this format:

{
  "type":"general",
  "userInput":"",
  "response":""
}

Types:
- general
- google-search
- youtube-search
- youtube-play
- get-time
- get-date
- get-day
- get-month
- calculator-open
- instagram-open
- facebook-open
- weather-show

Rules:
- Remove assistant name from userInput.
- If Google/YouTube search, keep only the search query in userInput.
- If asked who created you, answer ${userName}.
- Return ONLY JSON.
`;

  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content: prompt,
        },
        {
          role: "user",
          content: command,
        },
      ],
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default aiResponse;