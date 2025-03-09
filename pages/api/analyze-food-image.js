import { GoogleGenerativeAI } from '@google/generative-ai';
import formidable from 'formidable';
import fs from 'fs';

// Disable the default body parser to handle form data
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to parse form data
const parseForm = async (req) => {
  return new Promise((resolve, reject) => {
    const form = formidable({ 
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    });
    
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
};

// Helper function to read file as base64
const readFileAsBase64 = (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);
  return fileBuffer.toString('base64');
};

// Helper function to get MIME type from file path
const getMimeType = (filePath) => {
  const extension = filePath.split('.').pop().toLowerCase();
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
  };
  return mimeTypes[extension] || 'application/octet-stream';
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the form data
    const { fields, files } = await parseForm(req);
    const imageFile = files.image;
    const description = fields.description ? fields.description[0] : '';

    if (!imageFile) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Get API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not defined in environment variables');
      return res.status(500).json({ error: 'API key configuration error' });
    }

    // Read the image file as base64
    const imageBase64 = readFileAsBase64(imageFile[0].filepath);
    const mimeType = getMimeType(imageFile[0].originalFilename);

    // Initialize the Google Generative AI with your API key
    const genAI = new GoogleGenerativeAI(apiKey);

    // Get the generative model that supports image inputs
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Prepare the prompt
    let prompt = 'Analyze this food image and estimate its nutritional content.';
    if (description) {
      prompt += ` Additional information: ${description}`;
    }
    
    prompt += `
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

    // Create content parts with the image
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType,
      },
    };

    // Generate content with the image and prompt
    const result = await model.generateContent([imagePart, prompt]);
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

    // Clean up the temporary file
    fs.unlinkSync(imageFile[0].filepath);

    return res.status(200).json(nutritionData);
  } catch (error) {
    console.error('Error analyzing food image:', error);
    return res.status(500).json({
      error: 'Failed to analyze food image',
      details: error.message,
    });
  }
} 