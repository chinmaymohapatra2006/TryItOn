const preprocessor = require('../services/preprocessor');

const preprocessController = {
  // Validate User Photo
  validateUserPhoto: async (req, res) => {
    try {
      const { userPhotoId } = req.body;
      const userId = req.user ? req.user.id : null;

      if (!userPhotoId) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'userPhotoId is required',
        });
      }

      const result = await preprocessor.prepareUserImage(Number(userPhotoId), userId);
      return res.status(200).json({
        message: 'User photo validated and prepared successfully',
        data: result,
      });
    } catch (error) {
      console.error('[Preprocess User Photo Error]:', error.message);
      return res.status(422).json({
        error: 'Preprocessing Failed',
        message: error.message,
      });
    }
  },

  // Prepare Garment Image
  prepareGarment: async (req, res) => {
    try {
      const { productId } = req.body;
      const userId = req.user ? req.user.id : null;

      if (!productId) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'productId is required',
        });
      }

      const result = await preprocessor.prepareGarmentImage(Number(productId), userId);
      return res.status(200).json({
        message: 'Garment image normalized and prepared successfully',
        data: result,
      });
    } catch (error) {
      console.error('[Preprocess Garment Error]:', error.message);
      return res.status(422).json({
        error: 'Preprocessing Failed',
        message: error.message,
      });
    }
  },

  // Prepare Dual Pair for Try-On Session
  preparePair: async (req, res) => {
    try {
      const { userPhotoId, productId } = req.body;
      const userId = req.user ? req.user.id : null;

      if (!userPhotoId || !productId) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Both userPhotoId and productId are required to prepare a try-on session',
        });
      }

      const result = await preprocessor.prepareTryOnPair(Number(userPhotoId), Number(productId), userId);
      return res.status(200).json({
        message: 'Try-on inputs successfully prepared and staged for AI transformation',
        data: result,
      });
    } catch (error) {
      console.error('[Preprocess Pair Error]:', error.message);
      return res.status(422).json({
        error: 'Preprocessing Failed',
        message: error.message,
      });
    }
  },
};

module.exports = preprocessController;
