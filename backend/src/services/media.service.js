import { cloudinary, isConfigured, folder } from '../config/cloudinary.js';
import MediaModel from '../models/media.model.js';
import crypto from 'crypto';

export class MediaService {
  /**
   * Upload an image buffer and generate optimized asset & thumbnail URLs
   */
  static async uploadMedia(fileBuffer, fileMetadata = {}) {
    const {
      originalName = 'image.jpg',
      mimetype = 'image/jpeg',
      category = 'costume',
      customMetadata = {}
    } = fileMetadata;

    const uniqueId = `media_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // If live Cloudinary credentials are provided, upload via Cloudinary SDK stream
    if (isConfigured) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'image',
            public_id: uniqueId,
            transformation: [{ quality: 'auto', fetch_format: 'auto' }],
          },
          async (error, result) => {
            if (error) {
              return reject(new Error(`Cloudinary upload failed: ${error.message}`));
            }

            // Generate optimized square thumbnail URL via Cloudinary dynamic transformation
            const thumbnailUrl = cloudinary.url(result.public_id, {
              width: 300,
              height: 300,
              crop: 'fill',
              gravity: 'auto',
              quality: 'auto',
              fetch_format: 'auto',
              secure: true,
            });

            // Store metadata
            const savedRecord = await MediaModel.save({
              id: uniqueId,
              public_id: result.public_id,
              url: result.url,
              secure_url: result.secure_url,
              thumbnail_url: thumbnailUrl,
              format: result.format,
              width: result.width,
              height: result.height,
              bytes: result.bytes,
              category,
              metadata: {
                ...customMetadata,
                originalName,
                storageProvider: 'cloudinary',
              }
            });

            resolve(this.sanitizeMediaRecord(savedRecord));
          }
        );

        uploadStream.end(fileBuffer);
      });
    }

    // Local / Dev fallback adapter when Cloudinary keys are not yet provided
    const base64Data = fileBuffer.toString('base64');
    const dataUri = `data:${mimetype};base64,${base64Data}`;
    const extension = mimetype.split('/')[1] || 'jpg';

    const fallbackRecord = await MediaModel.save({
      id: uniqueId,
      public_id: `${folder}/${uniqueId}`,
      url: dataUri,
      secure_url: dataUri,
      thumbnail_url: dataUri,
      format: extension,
      width: 600,
      height: 600,
      bytes: fileBuffer.length,
      category,
      metadata: {
        ...customMetadata,
        originalName,
        storageProvider: 'local_fallback',
        note: 'Live Cloudinary keys can be supplied via CLOUDINARY_API_KEY in backend/.env'
      }
    });

    return this.sanitizeMediaRecord(fallbackRecord);
  }

  /**
   * Retrieve all media assets, optionally filtered by category
   */
  static async getMediaAssets(category = null) {
    const list = await MediaModel.findAll(category);
    return list.map(item => this.sanitizeMediaRecord(item));
  }

  /**
   * Retrieve a single media asset by ID
   */
  static async getMediaById(id) {
    const record = await MediaModel.findById(id);
    if (!record) return null;
    return this.sanitizeMediaRecord(record);
  }

  /**
   * Strip any sensitive backend credentials or internal keys from client responses
   */
  static sanitizeMediaRecord(record) {
    const { id, public_id, secure_url, url, thumbnail_url, format, width, height, bytes, category, metadata, created_at } = record;
    return {
      id,
      public_id,
      url: secure_url || url,
      thumbnail_url: thumbnail_url || url,
      format,
      width,
      height,
      bytes,
      category,
      metadata,
      created_at
    };
  }
}

export default MediaService;
