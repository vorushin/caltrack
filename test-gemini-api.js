// This script tests your Gemini API key directly
// Run it with: node test-gemini-api.js

require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiAPI() {
  console.log('Testing Gemini API connection...');
  
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ ERROR: GEMINI_API_KEY is not defined in .env.local file');
    console.log('Make sure you have created a .env.local file with your API key');
    return;
  }
  
  console.log(`API Key found: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);
  console.log(`API Key length: ${apiKey.length} characters`);
  
  try {
    // Initialize the Google Generative AI with your API key
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // Simple test prompt
    const prompt = 'Hello, can you tell me what 2+2 is?';
    
    console.log('Sending test request to Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ SUCCESS! Received response from Gemini API:');
    console.log('-------------------------------------------');
    console.log(text);
    console.log('-------------------------------------------');
    console.log('Your API key is working correctly!');
  } catch (error) {
    console.error('❌ ERROR connecting to Gemini API:', error.message);
    console.log('\nPossible issues:');
    console.log('1. The API key might be invalid or expired');
    console.log('2. There might be formatting issues with the API key (spaces, quotes, etc.)');
    console.log('3. You might have reached your API quota or rate limits');
    console.log('4. There might be network connectivity issues');
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.log('\nThe API key appears to be invalid. Please check that:');
      console.log('- You copied the entire key correctly from AI Studio');
      console.log('- There are no extra spaces or characters');
      console.log('- The key is properly formatted in .env.local (no quotes needed)');
    }
  }
}

// Install dotenv if not already installed
try {
  require('dotenv');
} catch (e) {
  console.log('Installing required dependencies...');
  require('child_process').execSync('npm install dotenv', { stdio: 'inherit' });
  console.log('Dependencies installed.');
}

testGeminiAPI(); 