import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from parent directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in environment variables');
  process.exit(1);
}

async function fixIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully.');

    const db = mongoose.connection.db;
    const collection = db.collection('carts');

    console.log('Checking for userId_1 index...');
    const indexes = await collection.indexes();
    const hasUserIdIndex = indexes.some(idx => idx.name === 'userId_1');

    if (hasUserIdIndex) {
      console.log('Dropping legacy unique index: userId_1...');
      await collection.dropIndex('userId_1');
      console.log('Successfully dropped userId_1 index.');
    } else {
      console.log('Legacy index userId_1 not found. It might have already been dropped.');
    }

    console.log('Verifying compound index { userId: 1, city: 1, pincode: 1 }...');
    const hasCompoundIndex = indexes.some(idx => idx.name.includes('userId_1_city_1_pincode_1'));
    if (!hasCompoundIndex) {
      console.log('Compound index not found. Mongoose will create it on next application start.');
    } else {
      console.log('Compound index already exists.');
    }

  } catch (error) {
    console.error('Error fixing indexes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
}

fixIndexes();
