import dotenv from 'dotenv';

dotenv.config();

const SECRET_API_KEY = process.env.MEDIA_UPLOAD_API_KEY || 'tryiton_secure_media_token_2026';

/**
 * Authentication middleware to protect sensitive media operations (upload/delete)
 * Prevents unauthorized users from accessing upload pipelines.
 */
export const requireMediaAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const customKey = req.headers['x-api-key'];

  let providedKey = customKey;

  if (!providedKey && authHeader) {
    if (authHeader.startsWith('Bearer ')) {
      providedKey = authHeader.slice(7).trim();
    } else {
      providedKey = authHeader.trim();
    }
  }

  if (!providedKey || providedKey !== SECRET_API_KEY) {
    return res.status(401).json({
      status: 'fail',
      error: 'Unauthorized',
      message: 'Access denied: Valid authorization credentials required to perform media operations.'
    });
  }

  next();
};

export default requireMediaAuth;
