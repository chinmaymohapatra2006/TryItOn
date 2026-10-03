const aiTryOn = require('../services/aiTryOn');

const tryonController = {
  // Execute Cloudinary AI Try-On
  generateTryOn: async (req, res) => {
    try {
      const { userPhotoId, productId, sessionId, options } = req.body;
      const userId = req.user ? req.user.id : null;

      if (!userPhotoId || !productId) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Both userPhotoId and productId are required to generate a virtual try-on',
        });
      }

      const result = await aiTryOn.executeTryOn({
        userPhotoId,
        productId,
        userId,
        sessionId,
        options,
      });

      return res.status(200).json({
        message: 'Virtual try-on completed successfully',
        result,
      });
    } catch (error) {
      console.error('[Generate Try-On Error]:', error.message);
      return res.status(422).json({
        error: 'Try-On Generation Failed',
        message: error.message || 'Failed to process virtual try-on transformation',
      });
    }
  },

  // Get Try-On Session details
  getSession: (req, res) => {
    try {
      const sessionId = Number(req.params.id);
      const userId = req.user ? req.user.id : null;

      const session = aiTryOn.getSessionById(sessionId, userId);
      if (!session) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Try-on session not found',
        });
      }

      return res.status(200).json({ session });
    } catch (error) {
      console.error('[Get Session Error]:', error.message);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to retrieve try-on session',
      });
    }
  },

  // Regenerate Try-On Session
  regenerateTryOn: async (req, res) => {
    try {
      const { sessionId, options } = req.body;
      const userId = req.user ? req.user.id : null;

      if (!sessionId) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'sessionId is required to regenerate a fitting',
        });
      }

      const result = await aiTryOn.regenerateSession(sessionId, userId, options);
      return res.status(200).json({
        message: 'Virtual try-on regenerated successfully',
        result,
      });
    } catch (error) {
      console.error('[Regenerate Try-On Error]:', error.message);
      return res.status(422).json({
        error: 'Regeneration Failed',
        message: error.message || 'Failed to regenerate virtual try-on',
      });
    }
  },
};

module.exports = tryonController;
