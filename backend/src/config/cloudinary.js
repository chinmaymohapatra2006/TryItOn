import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const folder = process.env.CLOUDINARY_FOLDER || 'tryiton_media';

const isConfigured = Boolean(
  cloudName && 
  apiKey && 
  apiSecret && 
  cloudName !== 'your_cloud_name' &&
  apiKey !== 'your_api_key'
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  console.log(`☁️ Cloudinary SDK configured successfully for cloud: ${cloudName}`);
} else {
  console.log(`ℹ️ Cloudinary credentials not detected; using secure local media fallback engine.`);
}

export { cloudinary, isConfigured, folder };
export default cloudinary;
