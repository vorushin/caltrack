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
    console.log('Starting to parse form data');
    const form = formidable({ 
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    });
    
    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        return reject(err);
      }
      console.log('Form parsed successfully:', {
        fieldsKeys: Object.keys(fields),
        filesKeys: Object.keys(files),
        hasImage: !!files.image
      });
      resolve({ fields, files });
    });
  });
};

// Helper function to read file as base64
const readFileAsBase64 = (filePath) => {
  console.log(`Reading file as base64: ${filePath}`);
  const fileBuffer = fs.readFileSync(filePath);
  const base64Data = fileBuffer.toString('base64');
  console.log(`File converted to base64, length: ${base64Data.length}`);
  return base64Data;
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
  const mimeType = mimeTypes[extension] || 'application/octet-stream';
  console.log(`Determined MIME type: ${mimeType} for file with extension: ${extension}`);
  return mimeType;
};

export default async function handler(req, res) {
  console.log('=== analyze-food-image API called ===');
  
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the form data
    console.log('Parsing form data from request');
    const { fields, files } = await parseForm(req);
    
    const imageFile = files.image;
    const description = fields.description ? fields.description[0] : '';
    console.log('Form data extracted:', {
      hasImageFile: !!imageFile,
      description: description ? description.substring(0, 50) : '(none)'
    });

    if (!imageFile) {
      console.error('No image file provided in the request');
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log('Image file details:', {
      name: imageFile[0].originalFilename,
      size: imageFile[0].size,
      type: imageFile[0].mimetype,
      path: imageFile[0].filepath
    });

    // Get API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not defined in environment variables');
      return res.status(500).json({ error: 'API key configuration error' });
    }
    console.log('API key available');

    // Read the image file as base64
    const imageBase64 = readFileAsBase64(imageFile[0].filepath);
    const mimeType = getMimeType(imageFile[0].originalFilename);

    // Initialize the Google Generative AI with your API key
    console.log('Initializing Gemini API');
    const genAI = new GoogleGenerativeAI(apiKey);

    // Get the generative model that supports image inputs
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    console.log('Using model: gemini-2.0-flash');

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
    console.log('Prompt prepared');

    // Create content parts with the image
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType,
      },
    };
    console.log('Image part created for Gemini API');

    // Generate content with the image and prompt
    console.log('Sending request to Gemini API');
    const result = await model.generateContent([imagePart, prompt]);
    const response = await result.response;
    const text = response.text();
    console.log('Received response from Gemini API');
    
    // Extract the JSON from the response
    let nutritionData;
    try {
      // Try to parse the entire response as JSON
      console.log('Attempting to parse response as JSON');
      nutritionData = JSON.parse(text);
      console.log('Successfully parsed JSON response');
    } catch (e) {
      console.error('Failed to parse entire response as JSON, trying to extract JSON from text');
      // If that fails, try to extract JSON from the text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          nutritionData = JSON.parse(jsonMatch[0]);
          console.log('Successfully extracted and parsed JSON from text');
        } catch (parseError) {
          console.error('Failed to parse extracted JSON:', parseError);
          throw new Error('Failed to parse nutrition data from AI response');
        }
      } else {
        console.error('No JSON pattern found in the response');
        throw new Error('Failed to parse nutrition data from AI response');
      }
    }

    console.log('Final nutrition data:', nutritionData);

    // Clean up the temporary file
    fs.unlinkSync(imageFile[0].filepath);
    console.log('Temporary file cleaned up');

    console.log('Sending successful response to client');
    return res.status(200).json(nutritionData);
  } catch (error) {
    console.error('Error analyzing food image:', error);
    return res.status(500).json({
      error: 'Failed to analyze food image',
      details: error.message,
      stack: error.stack
    });
  }
} 