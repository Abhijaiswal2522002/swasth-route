import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import Medicine from '../models/Medicine.js';
import Pharmacy from '../models/Pharmacy.js';
import { uploadPharmacy } from '../middleware/upload.js';
import { createWorker } from 'tesseract.js';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Helper: Levenshtein Distance for fuzzy string matching
function getLevenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Helper: Parse structured details using regular expressions for Tesseract fallback
function extractPrescriptionDetails(line) {
  // Dosage (e.g. 500mg, 650 mg, 10ml, 5 ml)
  const dosageMatch = line.match(/\b\d+\s*(?:mg|ml|mcg|g)\b/i);
  const dosage = dosageMatch ? dosageMatch[0] : '';

  // Frequency (e.g. 1-0-1, once daily, twice a day, bd, od, tid, qid)
  let frequency = '';
  const freqPatterns = [
    /\b(?:once|twice|thrice)\s+(?:daily|a\s+day)\b/i,
    /\b(?:od|bd|tid|qid|hs|prn|stat)\b/i,
    /\b\d\s*-\s*\d\s*-\s*\d\s*(?:-\s*\d)?\b/
  ];
  for (const pattern of freqPatterns) {
    const match = line.match(pattern);
    if (match) {
      frequency = match[0];
      break;
    }
  }

  // Duration (e.g. 5 days, 1 week, 10 days)
  const durationMatch = line.match(/\b\d+\s*(?:days?|weeks?|months?)\b/i);
  const duration = durationMatch ? durationMatch[0] : '';

  // Instructions (e.g. after food, before food, empty stomach, pc, ac)
  let instructions = '';
  const instPatterns = [
    /\b(?:after|before|with)\s+food\b/i,
    /\bempty\s+stomach\b/i,
    /\b(?:pc|ac)\b/i
  ];
  for (const pattern of instPatterns) {
    const match = line.match(pattern);
    if (match) {
      instructions = match[0];
      break;
    }
  }

  return { dosage, frequency, duration, instructions };
}

/**
 * OCR / Prescription Analysis Endpoint
 * Leverages Google Gemini Vision API for high-fidelity parsing if GEMINI_API_KEY is defined.
 * Otherwise, falls back to an offline-safe local Tesseract OCR with Levenshtein-based fuzzy catalog lookup.
 */
router.post('/analyze', verifyToken, uploadPharmacy.single('prescription'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No prescription image provided' });
    }

    const imageUrl = req.file?.path || req.file?.url || req.file?.secure_url;
    if (!imageUrl) {
      return res.status(400).json({ error: 'Unable to get uploaded image URL for OCR' });
    }

    console.log(`[Prescription] Image uploaded by ${req.user.role}: ${imageUrl}`);

    // Download image data
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(imageResponse.data);

    let recognizedText = '';
    let extractedMedicines = [];
    let patientName = '';
    let doctorName = '';

    // Check if Gemini API is available
    if (process.env.GEMINI_API_KEY) {
      console.log('[Prescription] Using Google Gemini AI Vision API for analysis');
      try {
        const base64Data = imageBuffer.toString('base64');
        const mimeType = req.file.mimetype || 'image/jpeg';
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
        
        const prompt = `You are a professional medical system. Analyze the uploaded prescription image and return a JSON object with the list of identified medicines. 
For each medicine, extract:
- name: The clean generic or brand name of the medicine (spelled correctly, e.g. "Paracetamol", "Comliflame", "Kalpal").
- dosage: The strength/dosage if specified (e.g. "500mg", "650mg", "10ml").
- frequency: How often to take it (e.g. "1-0-1", "twice daily", "once a day", "BD").
- duration: For how long to take it (e.g. "5 days", "1 week").
- instructions: Instructions like "after food", "before food", "empty stomach", etc.

Also try to extract the patient's name (patientName) and doctor's name (doctorName) if visible.

Format the response strictly as a JSON object, without any markdown formatting blocks or extra text:
{
  "patientName": "...",
  "doctorName": "...",
  "extractedMedicines": [
    {
      "name": "...",
      "dosage": "...",
      "frequency": "...",
      "duration": "...",
      "instructions": "..."
    }
  ]
}`;

        const response = await axios.post(geminiUrl, {
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                  }
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json"
          }
        }, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 20000
        });

        const geminiResult = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log('[Prescription] Gemini raw response:', geminiResult);
        
        let parsedResult = {};
        if (geminiResult) {
          try {
            parsedResult = JSON.parse(geminiResult.trim());
          } catch (e) {
            const jsonMatch = geminiResult.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              parsedResult = JSON.parse(jsonMatch[0].trim());
            }
          }
        }

        patientName = parsedResult.patientName || '';
        doctorName = parsedResult.doctorName || '';
        recognizedText = parsedResult.extractedMedicines?.map(m => `${m.name} ${m.dosage || ''} ${m.frequency || ''}`).join('\n') || '';
        
        const rawMedicines = parsedResult.extractedMedicines || [];
        const allMeds = await Medicine.find({ status: 'active' });

        for (const rawMed of rawMedicines) {
          let bestMatch = null;
          let bestScore = 0;
          const cleanedName = rawMed.name.trim().toLowerCase();

          // 1. Substring/Exact lookup
          for (const m of allMeds) {
            const mName = m.name.toLowerCase();
            if (mName === cleanedName) {
              bestMatch = m;
              bestScore = 1.0;
              break;
            }
            if (cleanedName.includes(mName) || mName.includes(cleanedName)) {
              const score = Math.min(mName.length, cleanedName.length) / Math.max(mName.length, cleanedName.length);
              if (score > bestScore) {
                bestMatch = m;
                bestScore = score;
              }
            }
          }

          // 2. Levenshtein fuzzy lookup
          if (bestScore < 0.8) {
            for (const m of allMeds) {
              const mName = m.name.toLowerCase();
              const dist = getLevenshteinDistance(cleanedName, mName);
              const similarity = 1 - dist / Math.max(cleanedName.length, mName.length);
              if (similarity > bestScore) {
                bestScore = similarity;
                bestMatch = m;
              }
            }
          }

          const catalogItem = bestScore >= 0.7 ? bestMatch : null;
          let inventoryItem = null;
          let status = catalogItem ? 'Out of Stock' : 'Not found in catalog';
          
          if (catalogItem) {
            status = 'Found in catalog';
            if (req.user.role === 'pharmacy' && req.user.id) {
              const pharmacy = await Pharmacy.findById(req.user.id);
              if (pharmacy) {
                inventoryItem = pharmacy.inventory.find(
                  inv => inv.medicineId?.toString() === catalogItem._id.toString()
                );
                status = inventoryItem ? 'In Stock' : 'Out of Stock';
              }
            }
          }

          extractedMedicines.push({
            raw: `${rawMed.name} ${rawMed.dosage || ''}`,
            name: catalogItem?.name || rawMed.name,
            dosage: rawMed.dosage || '',
            frequency: rawMed.frequency || '',
            duration: rawMed.duration || '',
            instructions: rawMed.instructions || '',
            medicine: catalogItem,
            inventory: inventoryItem,
            status
          });
        }

        return res.json({
          message: 'Prescription analyzed successfully (AI)',
          imageUrl,
          patientName,
          doctorName,
          recognizedText,
          extractedMedicines,
        });

      } catch (err) {
        console.error('[Prescription] Gemini API call failed, falling back to Tesseract OCR:', err.message);
      }
    }

    // Fallback: Offline Tesseract OCR + Local Details Regex + Fuzzy Match
    console.log('[Prescription] Running Tesseract OCR offline fallback');
    
    // Initialize worker pointing to local API directory (where eng.traineddata resides)
    const worker = await createWorker('eng', 1, {
      logger: () => {},
      langPath: path.join(__dirname, '..'),
      cachePath: path.join(__dirname, '..'),
    });

    const { data: { text: recognizedTextText } } = await worker.recognize(imageBuffer);
    await worker.terminate();

    recognizedText = recognizedTextText;

    const lines = recognizedText
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean);

    const medicineLines = lines.filter(line => /\b(mg|ml|mcg|g|tablet|tab|capsule|cap|syrup|drops|cream|ointment|tablet|tab|bd|tid|od|qid|once|twice)\b/i.test(line));
    const candidates = medicineLines.length > 0 ? medicineLines : lines;

    const allMeds = await Medicine.find({ status: 'active' });

    for (const line of candidates) {
      const cleaned = line
        .replace(/^[\d\.\)\-\s]+/, '')
        .replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten|once|twice|thrice|od|bd|tid|qid|pc|ac|hs|stat|prn)\b/gi, '')
        .replace(/\b(tab|tablet|cap|capsule|syrup|mg|ml|mcg|g|drops|cream|ointment)\b/gi, '')
        .replace(/[\(\)\[\]\.\,;:\*]/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();

      if (!cleaned) {
        continue;
      }

      // Extract regex details
      const details = extractPrescriptionDetails(line);

      // Match database
      const cleanedName = cleaned.toLowerCase();
      let bestMatch = null;
      let bestScore = 0;

      // 1. Direct Lookup
      for (const m of allMeds) {
        const mName = m.name.toLowerCase();
        if (mName === cleanedName) {
          bestMatch = m;
          bestScore = 1.0;
          break;
        }
        if (cleanedName.includes(mName) || mName.includes(cleanedName)) {
          const score = Math.min(mName.length, cleanedName.length) / Math.max(mName.length, cleanedName.length);
          if (score > bestScore) {
            bestMatch = m;
            bestScore = score;
          }
        }
      }

      // 2. Levenshtein fuzzy matching
      if (bestScore < 0.7) {
        const words = cleanedName.split(/\s+/).filter(w => w.length > 2 && !/^\d+$/.test(w));
        for (const m of allMeds) {
          const mName = m.name.toLowerCase();
          
          // Test similarity of entire cleaned string
          const distFull = getLevenshteinDistance(cleanedName, mName);
          const similarityFull = 1 - distFull / Math.max(cleanedName.length, mName.length);
          
          if (similarityFull > bestScore) {
            bestScore = similarityFull;
            bestMatch = m;
          }

          // Test individual words
          for (const word of words) {
            const distWord = getLevenshteinDistance(word, mName);
            const similarityWord = 1 - distWord / Math.max(word.length, mName.length);
            if (similarityWord > bestScore) {
              bestScore = similarityWord;
              bestMatch = m;
            }
          }
        }
      }

      const catalogItem = bestScore >= 0.7 ? bestMatch : null;
      let inventoryItem = null;
      let status = catalogItem ? 'Out of Stock' : 'Not found in catalog';
      
      if (catalogItem) {
        status = 'Found in catalog';
        if (req.user.role === 'pharmacy' && req.user.id) {
          const pharmacy = await Pharmacy.findById(req.user.id);
          if (pharmacy) {
            inventoryItem = pharmacy.inventory.find(
              inv => inv.medicineId?.toString() === catalogItem._id.toString()
            );
            status = inventoryItem ? 'In Stock' : 'Out of Stock';
          }
        }
      }

      extractedMedicines.push({
        raw: line,
        name: catalogItem?.name || cleaned,
        dosage: details.dosage,
        frequency: details.frequency,
        duration: details.duration,
        instructions: details.instructions,
        medicine: catalogItem,
        inventory: inventoryItem,
        status,
      });
    }

    res.json({
      message: 'Prescription analyzed successfully',
      imageUrl,
      recognizedText,
      extractedMedicines,
    });

  } catch (error) {
    console.error('Prescription Analysis Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

