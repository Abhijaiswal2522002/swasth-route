import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from workspace root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('ERROR: GEMINI_API_KEY is missing from environment variables.');
  process.exit(1);
}

async function testGeminiFirstAid() {
  const ambulanceType = 'icu';
  const description = 'An elderly person collapsed, has sudden chest tightness and is breathing very shallowly.';

  console.log('Testing Google Gemini connection...');
  console.log(`Prompt Description: "${description}"`);

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const prompt = `You are an emergency medical response assistant. The patient is waiting for an ambulance of type "${ambulanceType}". Emergency description: "${description || 'unknown medical crisis'}". Provide a JSON list of exactly 4 clear, short, actionable first-aid instructions (maximum 15 words per instruction) for bystanders to perform right now. Focus on immediate safety, positioning, and vitals check. Do not write introductory or explanatory text. Output must be a valid JSON array of strings. Example: ["Keep the patient in a sitting position to aid breathing", "Loosen tight clothing around neck", "Gather all active medications", "Do not give any food or liquids"].`;

    const response = await axios.post(geminiUrl, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('\n--- Raw Response ---');
    console.log(rawText);

    if (rawText) {
      const parsed = JSON.parse(rawText.trim());
      console.log('\n--- Parsed JSON list ---');
      console.log(parsed);
      console.log('\nSUCCESS: Gemini connection and JSON parse validated.');
    } else {
      console.error('ERROR: Received empty text from Gemini.');
    }
  } catch (err) {
    console.error('ERROR: Gemini API call failed:', err.response?.data || err.message);
  }
}

testGeminiFirstAid();
