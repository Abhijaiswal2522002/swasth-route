import { createWorker } from 'tesseract.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testOCR() {
  try {
    const imagePath = path.join(__dirname, '../../public/0_UMAMxjWMV_eDSw6u.jpg');
    console.log('Image path:', imagePath);
    if (!fs.existsSync(imagePath)) {
      console.error('Image file does not exist');
      return;
    }

    const imageBuffer = fs.readFileSync(imagePath);
    console.log('Image read. Initializing Tesseract worker...');

    // Initialize with local langPath pointing to the api directory containing eng.traineddata
    const apiDir = path.join(__dirname, '..');
    console.log('Using langPath:', apiDir);

    const worker = await createWorker('eng', 1, {
      logger: m => console.log('Tesseract progress:', m),
      langPath: apiDir,
      cachePath: apiDir,
    });

    console.log('Worker initialized. Recognizing...');
    const { data: { text } } = await worker.recognize(imageBuffer);
    console.log('--- RECOGNIZED TEXT ---');
    console.log(text);
    console.log('-----------------------');

    await worker.terminate();
  } catch (error) {
    console.error('OCR Error:', error);
  }
}

testOCR();
