import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MedicineSchema = new mongoose.Schema({
  name: String,
  manufacturer: String,
  category: String,
  composition: String,
  status: String,
});

const Medicine = mongoose.models.Medicine || mongoose.model('Medicine', MedicineSchema);

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
          matrix[i - 1][j - 1] + 1,
          Math.min(
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function extractPrescriptionDetails(line) {
  const dosageMatch = line.match(/\b\d+\s*(?:mg|ml|mcg|g)\b/i);
  const dosage = dosageMatch ? dosageMatch[0] : '';

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

  const durationMatch = line.match(/\b\d+\s*(?:days?|weeks?|months?)\b/i);
  const duration = durationMatch ? durationMatch[0] : '';

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

async function runTest() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully.');

    const mockLines = [
      "Paracetaml 500mg 1 tab twice daily for 5 days after food",
      "kalpa 650mg once daily empty stomach",
      "comliflam 1 tab 1-0-1 for 3 days before food"
    ];

    const allMeds = await Medicine.find({ status: 'active' });
    console.log('\nAvailable Medicines in DB:', allMeds.map(m => m.name));

    console.log('\n--- SIMULATING PARSING ---');
    for (const line of mockLines) {
      console.log(`\nRaw Line: "${line}"`);

      // Clean line (strip dosage/freq/instr words)
      const cleaned = line
        .replace(/^[\d\.\)\-\s]+/, '')
        .replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten|once|twice|thrice|od|bd|tid|qid|pc|ac|hs|stat|prn)\b/gi, '')
        .replace(/\b(tab|tablet|cap|capsule|syrup|mg|ml|mcg|g|drops|cream|ointment)\b/gi, '')
        .replace(/[\(\)\[\]\.\,;:\*]/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();

      const details = extractPrescriptionDetails(line);
      console.log('Parsed Details:', details);

      const cleanedName = cleaned.toLowerCase();
      let bestMatch = null;
      let bestScore = 0;

      // 1. Direct match or Substring
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

      // 2. Levenshtein fuzzy match
      if (bestScore < 0.7) {
        const words = cleanedName.split(/\s+/).filter(w => w.length > 2 && !/^\d+$/.test(w));
        for (const m of allMeds) {
          const mName = m.name.toLowerCase();
          
          const distFull = getLevenshteinDistance(cleanedName, mName);
          const similarityFull = 1 - distFull / Math.max(cleanedName.length, mName.length);
          
          if (similarityFull > bestScore) {
            bestScore = similarityFull;
            bestMatch = m;
          }

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
      console.log(`Matched Catalog Medicine: ${catalogItem ? catalogItem.name : 'None'} (Similarity Score: ${bestScore.toFixed(2)})`);
    }

    await mongoose.disconnect();
    console.log('\nTest completed successfully.');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTest();
