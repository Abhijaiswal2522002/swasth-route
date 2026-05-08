import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MedicineSchema = new mongoose.Schema({
    name: String,
    barcode: String,
    status: String
});

const Medicine = mongoose.models.Medicine || mongoose.model('Medicine', MedicineSchema);

async function checkMedicines() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const medicines = await Medicine.find({ barcode: { $exists: true, $ne: null } });
        console.log(`Found ${medicines.length} medicines with barcodes:`);
        medicines.forEach(m => {
            console.log(`- Name: ${m.name}, Barcode: "${m.barcode}", Status: ${m.status}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkMedicines();
