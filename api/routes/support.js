import express from 'express';
import axios from 'axios';

const router = express.Router();

const SYSTEM_PROMPT = `You are SwasthAI, the official customer support AI assistant for SwasthRoute (an emergency medicine delivery platform).
You assist:
- Patients (ordering medicines, tracking orders, prescription uploads, payment queries).
- Pharmacy Managers (inventory settings, commission rates, subscription plans: Standard=10%, Plus=5%, Elite=2%, expiry alerts).
- Riders (orders dispatch, navigation, location updates, earnings).

Guidelines:
1. Be polite, professional, and concise. Keep responses to 2-4 sentences where possible.
2. For urgent active delivery emergencies, refer users to the 24/7 Dispatch Hotline at +91 98765 43210.
3. Do not make up facts. If you do not know something, ask the user to contact SwasthRoute support at support@swasthroute.com.`;

router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn('[Gemini Support] API key is missing. Returning simulated fallback response.');
      return res.json({
        text: `Hello! I am SwasthAI. (API Key not configured). For support, contact support@swasthroute.com or call +91 98765 43210.`,
      });
    }

    // Format chat history to match Gemini API payload
    // Gemini roles: 'user', 'model'
    const contents = [];
    
    if (history && Array.isArray(history)) {
      history.forEach(msg => {
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      });
    }

    // Append the latest user query
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        contents,
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('Empty response from Gemini API');
    }

    res.json({ text: generatedText });
  } catch (error) {
    console.error('[Gemini Support Error]:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to generate support response',
      message: error.message
    });
  }
});

export default router;
