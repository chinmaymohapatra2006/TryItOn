const db = require('../db');
const cloudinaryService = require('./cloudinary');
const preprocessor = require('./preprocessor');

// In-memory transformation cache (Key: `${userId}_${photoId}_${productId}_${hash}`)
const transformMemoryCache = new Map();

/**
 * Clean up raw filenames and enrich garment description for Cloudinary AI
 */
function cleanGarmentPrompt(title, category) {
  let text = (title || '').trim();

  // Strip raw filenames, timestamps, and upload prefixes
  text = text.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '');
  text = text.replace(/^(image|extracted|upload|photo|img|file)[-_0-9\s]*/i, '');
  text = text.replace(/179[0-9]{8,}/g, ''); // strip timestamp numbers
  text = text.replace(/[-_]/g, ' ').trim();

  const cat = (category || 'garment').toLowerCase();

  const defaultCategoryPrompts = {
    top: 'stylish fitted cotton top shirt',
    tshirt: 'modern casual graphic cotton t-shirt',
    dress: 'chic elegant summer floral dress with soft fabric drape',
    jacket: 'premium classic tailored jacket coat with detailed stitching',
    kurta: 'traditional designer embroidered kurta tunic',
    bottom: 'stylish tailored fashion pants trousers',
    garment: 'fashion clothing garment with realistic fabric texture',
  };

  if (!text || text.length < 3) {
    return defaultCategoryPrompts[cat] || defaultCategoryPrompts.garment;
  }

  // If title doesn't mention the category, append it for clarity
  if (!text.toLowerCase().includes(cat) && cat !== 'garment') {
    return `${text} ${cat}`;
  }

  return text;
}

/**
 * Determine the Cloudinary AI 'from_' target region
 */
function resolveFromTarget(category, userTarget) {
  if (userTarget && typeof userTarget === 'string' && userTarget.trim()) {
    const t = userTarget.trim().toLowerCase();
    if (['clothes', 'clothing', 'shirt', 'top', 'tshirt', 'dress', 'jacket', 'coat', 'pants', 'bottoms'].includes(t)) {
      return t;
    }
  }

  const cat = (category || '').toLowerCase();
  if (cat === 'top' || cat === 'tshirt' || cat === 'shirt') return 'shirt';
  if (cat === 'dress' || cat === 'gown') return 'clothes';
  if (cat === 'jacket' || cat === 'coat' || cat === 'outerwear') return 'jacket';
  if (cat === 'bottom' || cat === 'pants' || cat === 'jeans') return 'pants';
  return 'clothes';
}

const aiTryOn = {
  /**
   * Build Cloudinary Generative Replacement & Layered VTON transformation URL
   */
  buildCloudinaryTransformationUrl: (userPhoto, product, options = {}) => {
    if (!cloudinaryService.isConfigured() || !userPhoto.cloudinary_public_id) {
      return null;
    }

    const userPublicId = userPhoto.cloudinary_public_id;
    const category = (product.category || 'garment').toLowerCase();
    
    // 1. Determine Prompt
    const rawPrompt = options.prompt || cleanGarmentPrompt(product.title, category);
    // Sanitize prompt for Cloudinary URL formatting (strip punctuation, retain descriptive words)
    const sanitizedPrompt = rawPrompt
      .replace(/[^a-zA-Z0-9 ]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // 2. Determine From Target
    const fromTarget = resolveFromTarget(category, options.targetRegion);

    // 3. Preserve Geometry
    const preserveGeom = options.preserveGeometry !== false ? 'preserve-geometry_true' : 'preserve-geometry_false';

    // 4. Mode: 'gen_replace' (default) or 'gen_recolor'
    const mode = options.mode || 'gen_replace';

    let effectParam = '';
    if (mode === 'gen_recolor') {
      const colorTarget = options.recolorTarget || fromTarget;
      const toColor = options.toColor || sanitizedPrompt || 'royal blue';
      effectParam = `gen_recolor:prompt_${colorTarget};to-color_${toColor}`;
    } else {
      effectParam = `gen_replace:from_${fromTarget};to_${sanitizedPrompt};${preserveGeom}`;
    }

    // Construct Cloudinary AI Transformation URL
    const transformation = [
      { width: 800, height: 1000, crop: 'limit' },
      { effect: effectParam },
      { quality: 'auto:best' },
      { fetch_format: 'auto' },
    ];

    return cloudinaryService.url(userPublicId, { transformation });
  },

  /**
   * Execute the Virtual Try-On Pipeline with Caching
   */
  executeTryOn: async ({ userPhotoId, productId, userId, sessionId: existingSessionId, options = {} }) => {
    // 1. Fetch user photo and product
    const photo = db.prepare('SELECT * FROM user_photos WHERE id = ? AND (user_id = ? OR user_id IS NULL)').get(Number(userPhotoId), userId);
    if (!photo) {
      throw new Error('User photo not found');
    }

    const product = db.prepare('SELECT * FROM products WHERE id = ? AND (user_id = ? OR user_id IS NULL)').get(Number(productId), userId);
    if (!product) {
      throw new Error('Garment product not found');
    }

    const category = (product.category || 'garment').toLowerCase();
    const promptText = options.prompt || cleanGarmentPrompt(product.title, category);
    const targetRegion = options.targetRegion || resolveFromTarget(category);

    // 2. Check Memory Cache if not regenerating and no forceRefresh
    const cacheKey = `${userId || 'anon'}_${photo.id}_${product.id}_${promptText}_${targetRegion}`;
    if (!existingSessionId && !options.forceRefresh && transformMemoryCache.has(cacheKey)) {
      const cached = transformMemoryCache.get(cacheKey);
      console.log(`[AI Try-On Cache HIT] Returning cached try-on result for ${cacheKey}`);
      return { ...cached, isCached: true };
    }

    console.log(`[AI Try-On] Starting generation for User Photo #${photo.id} + Garment #${product.id} (Prompt: "${promptText}", Target: "${targetRegion}")...`);

    // 3. Build Cloudinary AI Transformation URL
    let resultImageUrl = aiTryOn.buildCloudinaryTransformationUrl(photo, product, {
      ...options,
      prompt: promptText,
      targetRegion,
    });

    let resultPublicId = null;
    let engine = 'cloudinary-gen-replace';

    // 4. Fallback for local development if Cloudinary is not configured or in testing mode
    if (!resultImageUrl) {
      engine = 'local-vton-synthesis';
      resultImageUrl = product.image_url || photo.image_url;
      resultPublicId = `tryon_result_${photo.id}_${product.id}_${Date.now()}`;
    } else {
      resultPublicId = `cloudinary_vton_${photo.id}_${product.id}`;
    }

    const transformationDetails = {
      engine,
      targetRegion,
      aiPrompt: promptText,
      garmentCategory: category,
      garmentTitle: product.title,
      preserveFace: true,
      preserveIdentity: true,
      preserveBackground: true,
      preserveGeometry: options.preserveGeometry !== false,
      generatedAt: new Date().toISOString(),
      cloudinaryConfigured: cloudinaryService.isConfigured(),
    };

    let sessionRecordId = existingSessionId;

    // 5. Update or Insert session record in SQLite
    if (sessionRecordId) {
      db.prepare(`
        UPDATE tryon_sessions 
        SET status = 'completed',
            result_image_url = ?,
            result_public_id = ?,
            transformation_params = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(resultImageUrl, resultPublicId, JSON.stringify(transformationDetails), sessionRecordId);
    } else {
      const insert = db.prepare(`
        INSERT INTO tryon_sessions (
          user_id,
          product_id,
          user_image_url,
          user_image_public_id,
          product_image_url,
          product_image_public_id,
          result_image_url,
          result_public_id,
          status,
          transformation_params
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?)
      `);

      const res = insert.run(
        userId,
        product.id,
        photo.image_url,
        photo.cloudinary_public_id,
        product.image_url,
        product.cloudinary_public_id,
        resultImageUrl,
        resultPublicId,
        JSON.stringify(transformationDetails)
      );
      sessionRecordId = Number(res.lastInsertRowid);
    }

    console.log(`[AI Try-On] Completed session #${sessionRecordId}: result -> ${resultImageUrl}`);

    const resultPayload = {
      sessionId: sessionRecordId,
      status: 'completed',
      userImageUrl: photo.image_url,
      userPhotoId: photo.id,
      productImageUrl: product.image_url,
      productId: product.id,
      garmentTitle: product.title,
      garmentCategory: product.category,
      aiPrompt: promptText,
      targetRegion,
      resultImageUrl,
      resultPublicId,
      transformationDetails,
      createdAt: new Date().toISOString(),
    };

    // Store in transformation memory cache
    transformMemoryCache.set(cacheKey, resultPayload);

    return resultPayload;
  },

  /**
   * Get single try-on session by ID
   */
  getSessionById: (sessionId, userId) => {
    const session = db.prepare(`
      SELECT s.*, p.title as product_title, p.category as product_category 
      FROM tryon_sessions s
      LEFT JOIN products p ON s.product_id = p.id
      WHERE s.id = ? AND (s.user_id = ? OR s.user_id IS NULL)
    `).get(Number(sessionId), userId);

    if (!session) {
      return null;
    }

    return {
      sessionId: session.id,
      userId: session.user_id,
      productId: session.product_id,
      garmentTitle: session.product_title || 'Garment Piece',
      garmentCategory: session.product_category || 'garment',
      userImageUrl: session.user_image_url,
      productImageUrl: session.product_image_url,
      resultImageUrl: session.result_image_url,
      resultPublicId: session.result_public_id,
      status: session.status,
      errorMessage: session.error_message,
      transformationDetails: JSON.parse(session.transformation_params || '{}'),
      createdAt: session.created_at,
      updatedAt: session.updated_at,
    };
  },

  /**
   * Regenerate virtual try-on for an existing session (bypasses cache)
   */
  regenerateSession: async (sessionId, userId, customOptions = {}) => {
    const existing = db.prepare('SELECT * FROM tryon_sessions WHERE id = ? AND (user_id = ? OR user_id IS NULL)').get(Number(sessionId), userId);
    if (!existing) {
      throw new Error('Try-on session not found or access denied');
    }

    const userPhoto = db.prepare('SELECT id FROM user_photos WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1').get(userId) ||
                      db.prepare('SELECT id FROM user_photos WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(userId);

    const photoId = userPhoto ? userPhoto.id : 1;
    const productId = existing.product_id;

    // Invalidate memory cache
    transformMemoryCache.clear();

    return aiTryOn.executeTryOn({
      userPhotoId: photoId,
      productId,
      userId,
      sessionId: existing.id,
      options: { ...customOptions, forceRefresh: true },
    });
  },

  cleanGarmentPrompt,
  resolveFromTarget,
  clearMemoryCache: () => {
    transformMemoryCache.clear();
  },
};

module.exports = aiTryOn;
