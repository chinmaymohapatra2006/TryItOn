const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const config = require('../config');

// Bypass 3rd-party network calls during automated test suites to avoid eating quota & network latency
const isTest = process.env.NODE_ENV === 'test' || 
               process.env.npm_lifecycle_event === 'test' || 
               process.argv.some(arg => arg.includes('test'));

const isConfigured = !isTest && Boolean(
  config.cloudinary.cloudName &&
  config.cloudinary.apiKey &&
  config.cloudinary.apiSecret
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });
  console.log(`[Cloudinary] Initialized with cloud: ${config.cloudinary.cloudName}`);
} else {
  console.log(`[Cloudinary] ${isTest ? 'Running in test isolation mode.' : 'API keys not set. Running in local storage fallback mode.'}`);
}

const cloudinaryService = {
  isConfigured: () => isConfigured,

  /**
   * Upload an image file to Cloudinary or local fallback
   * @param {string} filePath Local file path to upload
   * @param {object} options Upload options (folder, tags, etc.)
   */
  uploadImage: async (filePath, options = {}) => {
    const folder = options.folder || 'tryiton/general';

    if (isConfigured) {
      try {
        const result = await cloudinary.uploader.upload(filePath, {
          folder,
          resource_type: 'image',
          ...options,
        });

        return {
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          storage: 'cloudinary',
        };
      } catch (err) {
        console.error('[Cloudinary Upload Error]:', err.message);
        throw new Error(`Cloudinary upload failed: ${err.message}`);
      }
    } else {
      // Local fallback / test mode
      const fileName = path.basename(filePath);
      const publicId = `${folder}/${fileName}`.replace(/\.[^/.]+$/, '');
      const localUrl = `http://localhost:${config.port}/uploads/${fileName}`;

      let stats = { size: 0 };
      try {
        stats = fs.statSync(filePath);
      } catch (e) {
        // file stat fallback
      }

      return {
        url: localUrl,
        publicId: publicId,
        format: path.extname(filePath).replace('.', '') || 'jpg',
        width: 800,
        height: 1200,
        bytes: stats.size,
        storage: 'local',
      };
    }
  },

  /**
   * Delete an image from Cloudinary
   * @param {string} publicId
   */
  deleteImage: async (publicId) => {
    if (!publicId) return;
    if (isConfigured) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.warn(`[Cloudinary Delete Error for ${publicId}]:`, err.message);
      }
    }
  },

  /**
   * Generate Cloudinary transformation URL
   */
  url: (publicId, options) => {
    if (isConfigured && publicId) {
      return cloudinary.url(publicId, options);
    }
    return null;
  }
};

module.exports = cloudinaryService;
