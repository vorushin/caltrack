import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Food description is required' });
    }

    // Debug: Check if API key is available (don't log the full key in production)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not defined in environment variables');
      return res.status(500).json({ error: 'API key configuration error' });
    }
    
    // Log a masked version of the key for debugging
    console.log(`API Key available: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);

    // Initialize the Google Generative AI with your API key
    const genAI = new GoogleGenerativeAI(apiKey);

    // Get the generative model - using gemini-2.0-flash instead of gemini-pro
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Construct the prompt for Gemini
    const prompt = `
      Analyze the following food description and estimate its nutritional content.
      Food description: "${description}"
      
      Please provide a detailed breakdown of:
      1. Total calories
      2. Protein (in grams)
      3. Carbohydrates (in grams)
      4. Fat (in grams)
      
      Return the result in JSON format like this:
      {
        "nutrition": {
          "calories": number,
          "protein": number,
          "carbs": number,
          "fat": number
        }
      }
      
      Only return the JSON object, nothing else.
    `;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract the JSON from the response
    let nutritionData;
    try {
      // Try to parse the entire response as JSON
      nutritionData = JSON.parse(text);
    } catch (e) {
      // If that fails, try to extract JSON from the text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        nutritionData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse nutrition data from AI response');
      }
    }

    return res.status(200).json(nutritionData);
  } catch (error) {
    console.error('Error analyzing food:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze food',
      details: error.message
    });
  }
} 