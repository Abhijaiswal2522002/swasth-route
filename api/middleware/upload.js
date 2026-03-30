import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Pharmacy Images Storage
const pharmacyStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'swasth/pharmacies',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
  },
});

// User Avatars Storage
const userStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'swasth/users',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 500, height: 500, crop: 'fill' }],
  },
});

export const uploadPharmacy = multer({ storage: pharmacyStorage });
export const uploadUser = multer({ storage: userStorage });

export default cloudinary;
