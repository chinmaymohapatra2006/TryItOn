const db = require('../db');
const cloudinaryService = require('../services/cloudinary');

const historyController = {
  // Get all try-on history sessions for the current authenticated user
  getHistory: (req, res) => {
    try {
      const userId = req.user.id;

      const sessions = db.prepare(`
        SELECT 
          s.id,
          s.user_id,
          s.product_id,
          s.user_image_url,
          s.user_image_public_id,
          s.product_image_url,
          s.product_image_public_id,
          s.result_image_url,
          s.result_public_id,
          s.status,
          s.error_message,
          s.transformation_params,
          s.created_at,
          s.updated_at,
          p.title as product_title,
          p.category as product_category
        FROM tryon_sessions s
        LEFT JOIN products p ON s.product_id = p.id
        WHERE s.user_id = ?
        ORDER BY s.created_at DESC
      `).all(userId);

      const formatted = sessions.map((s) => ({
        id: s.id,
        userId: s.user_id,
        productId: s.product_id,
        garmentTitle: s.product_title || 'Garment Piece',
        garmentCategory: s.product_category || 'garment',
        userImageUrl: s.user_image_url,
        productImageUrl: s.product_image_url,
        resultImageUrl: s.result_image_url,
        resultPublicId: s.result_public_id,
        status: s.status,
        transformationDetails: JSON.parse(s.transformation_params || '{}'),
        createdAt: s.created_at,
        updatedAt: s.updated_at,
      }));

      return res.status(200).json({ sessions: formatted });
    } catch (error) {
      console.error('[Get History Error]:', error);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to retrieve try-on history',
      });
    }
  },

  // Get single session details
  getSessionById: (req, res) => {
    try {
      const userId = req.user.id;
      const sessionId = Number(req.params.id);

      const session = db.prepare(`
        SELECT 
          s.*,
          p.title as product_title,
          p.category as product_category
        FROM tryon_sessions s
        LEFT JOIN products p ON s.product_id = p.id
        WHERE s.id = ? AND s.user_id = ?
      `).get(sessionId, userId);

      if (!session) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Try-on session not found or access denied',
        });
      }

      return res.status(200).json({
        session: {
          id: session.id,
          userId: session.user_id,
          productId: session.product_id,
          garmentTitle: session.product_title || 'Garment Piece',
          garmentCategory: session.product_category || 'garment',
          userImageUrl: session.user_image_url,
          productImageUrl: session.product_image_url,
          resultImageUrl: session.result_image_url,
          resultPublicId: session.result_public_id,
          status: session.status,
          transformationDetails: JSON.parse(session.transformation_params || '{}'),
          createdAt: session.created_at,
          updatedAt: session.updated_at,
        },
      });
    } catch (error) {
      console.error('[Get Session Error]:', error);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to retrieve session',
      });
    }
  },

  // Delete specific try-on session
  deleteSession: async (req, res) => {
    try {
      const userId = req.user.id;
      const sessionId = Number(req.params.id);

      const session = db.prepare('SELECT id, result_public_id FROM tryon_sessions WHERE id = ? AND user_id = ?').get(sessionId, userId);
      if (!session) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Try-on session not found or access denied',
        });
      }

      // Delete Cloudinary asset if possible
      if (session.result_public_id) {
        await cloudinaryService.deleteImage(session.result_public_id);
      }

      // Delete from SQLite
      db.prepare('DELETE FROM tryon_sessions WHERE id = ?').run(sessionId);

      console.log(`[History] Deleted try-on session #${sessionId} for user #${userId}`);

      return res.status(200).json({
        message: 'Try-on session deleted successfully',
        deletedId: sessionId,
      });
    } catch (error) {
      console.error('[Delete Session Error]:', error);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to delete session',
      });
    }
  },

  // Clear all history for user
  clearAllHistory: (req, res) => {
    try {
      const userId = req.user.id;
      const result = db.prepare('DELETE FROM tryon_sessions WHERE user_id = ?').run(userId);

      return res.status(200).json({
        message: 'All try-on history cleared successfully',
        deletedCount: result.changes,
      });
    } catch (error) {
      console.error('[Clear History Error]:', error);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to clear history',
      });
    }
  },
};

module.exports = historyController;
