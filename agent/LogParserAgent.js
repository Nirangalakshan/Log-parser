const axios = require("axios");
require("dotenv").config();

const OLLAMA_API = process.env.OLLAMA_API_URL;
const MODEL = process.env.MODEL_NAME || "mistral";

async function callLLM(prompt) {
  const res = await axios.post(`${OLLAMA_API}/api/generate`, {
    model: MODEL,
    prompt,
    stream: false,
  });

  return res.data.response;
}

async function runAgent({ logText, task }) {
  const basePrompt = `
You are an intelligent log analysis agent. Your task is: ${task}.

Analyze the log below. Each line contains one JSON object.

Return structured JSON results with fields like:
- Timestamp
- overVoltage
- memoryUsage
- errorCodes
- suggestedFix

Log:
${logText}
`;

  const result = await callLLM(basePrompt);
  try {
    return JSON.parse(result);
  } catch (err) {
    return { rawResponse: result, error: "Parsing failed" };
  }
}

module.exports = { runAgent };
