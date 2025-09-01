import { v2 as cloudinary } from 'cloudinary';

// Enhanced logging for debugging in production
const cloudName = process.env.CLOUD_NAME || 'drall4ntv';
const apiKey = process.env.CLOUD_API_KEY || '919696223163162';
const apiSecret = process.env.CLOUD_API_SECRET || 'ciN9ETYXD7OlUYBJtBGR206aRqs';

// Log configuration with better masking
console.log('Cloudinary Config:', {
  cloud_name: cloudName,
  api_key: apiKey ? '***' + apiKey.substring(apiKey.length - 4) : undefined,
  api_secret: apiSecret ? '***' : undefined,
  environment: process.env.NODE_ENV || 'development',
});

try {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  
  // Verify configuration is working
  console.log('Cloudinary configured successfully');
} catch (error) {
  console.error('Error configuring Cloudinary:', error.message);
}

export default cloudinary;