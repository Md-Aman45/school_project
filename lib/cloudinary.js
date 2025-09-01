import { v2 as cloudinary } from 'cloudinary';

// Log environment variables for debugging
console.log('Cloudinary Config:', {
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY ? '***' : undefined,
  api_secret: process.env.CLOUD_API_SECRET ? '***' : undefined,
});

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME || 'drall4ntv',
  api_key: process.env.CLOUD_API_KEY || '919696223163162',
  api_secret: process.env.CLOUD_API_SECRET || 'ciN9ETYXD7OlUYBJtBGR206aRqs',
});

export default cloudinary;