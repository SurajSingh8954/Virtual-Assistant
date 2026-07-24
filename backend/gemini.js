import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const aiResponse = async (command, assistantName, userName) => {
  const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });

  const prompt = `
You are an AI assistant named ${assistantName}, created by ${userName}.

Always reply with ONLY valid JSON.

Format:

{
  "type":"",
  "userInput":"",
  "response":""
}

Allowed types:

general
google-search
youtube-search
youtube-play
get-time
get-date
get-day
get-month
calculator-open
instagram-open
facebook-open
weather-show
generate-image

Rules:

- Never return markdown.
- Never return \`\`\`.
- Never explain your answer.
- Never write any text outside JSON.
- Always return valid JSON.
- For image generation use type="generate-image".
- For Google searches use type="google-search".
- For YouTube searches use type="youtube-search".
- For normal conversation use type="general".
- The response field can be short or long depending on the user's question.
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