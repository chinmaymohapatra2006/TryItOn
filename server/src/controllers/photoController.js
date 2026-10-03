const fs = require('fs');
const db = require('../db');
const cloudinaryService = require('../services/cloudinary');

const photoController = {
  // Upload and register user photo
  uploadUserPhoto: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Please provide an image file to upload',
        });
      }

      const filePath = req.file.path;
      const userId = req.user.id;

      // Upload to Cloudinary (or local fallback)
      const uploadResult = await cloudinaryService.uploadImage(filePath, {
        folder: 'tryiton/user_photos',
        tags: ['user_photo', `user_${userId}`],
      });

      // Mark all existing photos for this user as inactive so the new one is active by default
      db.prepare('UPDATE user_photos SET is_active = 0 WHERE user_id = ?').run(userId);

      // Insert new photo into database
      const insertStmt = db.prepare(`
        INSERT INTO user_photos (user_id, image_url, cloudinary_public_id, is_active)
        VALUES (?, ?, ?, 1)
      `);
      const result = insertStmt.run(userId, uploadResult.url, uploadResult.publicId);
      const newPhotoId = Number(result.lastInsertRowid);

      // Fetch inserted photo
      const photo = db.prepare('SELECT id, user_id, image_url, cloudinary_public_id, is_active, created_at FROM user_photos WHERE id = ?').get(newPhotoId);

      // If user has no avatar, update user avatar
      db.prepare("UPDATE users SET avatar_url = ? WHERE id = ? AND (avatar_url IS NULL OR avatar_url = '')").run(uploadResult.url, userId);

      console.log(`[Photo] User ${userId} uploaded photo #${photo.id}: ${uploadResult.url}`);

      return res.status(201).json({
        message: 'Photo uploaded successfully',
        photo: {
          id: photo.id,
          imageUrl: photo.image_url,
          publicId: photo.cloudinary_public_id,
          isActive: Boolean(photo.is_active),
          createdAt: photo.created_at,
          dimensions: { width: uploadResult.width, height: uploadResult.height },
          storage: uploadResult.storage,
        },
      });
    } catch (error) {
      console.error('[Photo Upload Error]:', error);
      return res.status(500).json({
        error: 'Upload Failed',
        message: error.message || 'Failed to process and store image upload',
      });
    }
  },

  // Get all photos uploaded by the user
  getUserPhotos: (req, res) => {
    try {
      const userId = req.user.id;
      const photos = db.prepare(`
        SELECT id, user_id, image_url, cloudinary_public_id, is_active, created_at 
        FROM user_photos 
        WHERE user_id = ? 
        ORDER BY created_at DESC
      `).all(userId);

      const formatted = photos.map((p) => ({
        id: p.id,
        imageUrl: p.image_url,
        publicId: p.cloudinary_public_id,
        isActive: Boolean(p.is_active),
        createdAt: p.created_at,
      }));

      return res.status(200).json({ photos: formatted });
    } catch (error) {
      console.error('[Get User Photos Error]:', error);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to retrieve user photos',
      });
    }
  },

  // Get active photo for the current user
  getActivePhoto: (req, res) => {
    try {
      const userId = req.user.id;
      const photo = db.prepare(`
        SELECT id, user_id, image_url, cloudinary_public_id, is_active, created_at 
        FROM user_photos 
        WHERE user_id = ? AND is_active = 1
        ORDER BY created_at DESC 
        LIMIT 1
      `).get(userId);

      if (!photo) {
        return res.status(200).json({ photo: null, message: 'No active photo found for user' });
      }

      return res.status(200).json({
        photo: {
          id: photo.id,
          imageUrl: photo.image_url,
          publicId: photo.cloudinary_public_id,
          isActive: true,
          createdAt: photo.created_at,
        },
      });
    } catch (error) {
      console.error('[Get Active Photo Error]:', error);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to retrieve active photo',
      });
    }
  },

  // Set a specific photo as the active model photo
  setActivePhoto: (req, res) => {
    try {
      const userId = req.user.id;
      const photoId = Number(req.params.id);

      const photo = db.prepare('SELECT id FROM user_photos WHERE id = ? AND user_id = ?').get(photoId, userId);
      if (!photo) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Photo not found or does not belong to the user',
        });
      }

      db.prepare('UPDATE user_photos SET is_active = 0 WHERE user_id = ?').run(userId);
      db.prepare('UPDATE user_photos SET is_active = 1 WHERE id = ?').run(photoId);

      return res.status(200).json({
        message: 'Photo set as active model photo',
        photoId,
      });
    } catch (error) {
      console.error('[Set Active Photo Error]:', error);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to update active photo',
      });
    }
  },

  // Delete a user photo
  deletePhoto: async (req, res) => {
    try {
      const userId = req.user.id;
      const photoId = Number(req.params.id);

      const photo = db.prepare('SELECT id, cloudinary_public_id FROM user_photos WHERE id = ? AND user_id = ?').get(photoId, userId);
      if (!photo) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Photo not found or does not belong to the user',
        });
      }

      // Delete from Cloudinary if possible
      if (photo.cloudinary_public_id) {
        await cloudinaryService.deleteImage(photo.cloudinary_public_id);
      }

      // Delete from SQLite
      db.prepare('DELETE FROM user_photos WHERE id = ?').run(photoId);

      // If this was the active photo, set the newest remaining photo as active
      const remaining = db.prepare('SELECT id FROM user_photos WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(userId);
      if (remaining) {
        db.prepare('UPDATE user_photos SET is_active = 1 WHERE id = ?').run(remaining.id);
      }

      return res.status(200).json({
        message: 'Photo deleted successfully',
        deletedId: photoId,
      });
    } catch (error) {
      console.error('[Delete Photo Error]:', error);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to delete photo',
      });
    }
  },
};

module.exports = photoController;
