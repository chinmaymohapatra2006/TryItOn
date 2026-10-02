import MediaService from '../services/media.service.js';
import { isConfigured, folder } from '../config/cloudinary.js';

export const uploadMediaFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'No media file uploaded. Expected multipart form-data with field "file" or "image".'
      });
    }

    const { category = 'costume', costumeId, title } = req.body;

    const result = await MediaService.uploadMedia(req.file.buffer, {
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      category,
      customMetadata: {
        costumeId,
        title,
        uploadedAt: new Date().toISOString()
      }
    });

    return res.status(201).json({
      status: 'success',
      message: 'Media asset uploaded and processed successfully.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const listMediaAssets = async (req, res, next) => {
  try {
    const { category } = req.query;
    const mediaList = await MediaService.getMediaAssets(category);
    return res.status(200).json({
      status: 'success',
      count: mediaList.length,
      data: mediaList
    });
  } catch (error) {
    next(error);
  }
};

export const getMediaDetails = async (req, res, next) => {
  try {
    const media = await MediaService.getMediaById(req.params.id);
    if (!media) {
      return res.status(404).json({
        status: 'fail',
        message: 'Media asset not found.'
      });
    }
    return res.status(200).json({
      status: 'success',
      data: media
    });
  } catch (error) {
    next(error);
  }
};

export const getCloudinaryStatus = async (req, res) => {
  return res.status(200).json({
    status: 'ok',
    cloudinary: {
      configured: isConfigured,
      targetFolder: folder,
      provider: isConfigured ? 'cloudinary' : 'local_fallback',
      supportsThumbnails: true,
      supportsOptimizedDelivery: true
    }
  });
};
