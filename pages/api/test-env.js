export default function handler(req, res) {
  // Check if the API key is available
  const apiKey = process.env.GEMINI_API_KEY;
  
  // Return a safe response that doesn't expose the full key
  res.status(200).json({
    envVarsLoaded: !!process.env.GEMINI_API_KEY,
    apiKeyAvailable: !!apiKey,
    apiKeyLength: apiKey ? apiKey.length : 0,
    apiKeyPrefix: apiKey ? `${apiKey.substring(0, 4)}...` : null,
    nodeEnv: process.env.NODE_ENV
  });
} 