const fs = require('fs');
const path = require('path');
const db = require('../db');
const cloudinaryService = require('../services/cloudinary');
const scraperService = require('../services/scraper');

const uploadsDir = path.resolve(__dirname, '../../../uploads');

const productController = {
  // Method A: Direct Garment Image Upload
  uploadProductImage: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Please provide a garment image file to upload',
        });
      }

      const filePath = req.file.path;
      const userId = req.user ? req.user.id : null;
      const rawTitle = req.body.title ? req.body.title.trim() : '';
      const category = req.body.category ? req.body.category.trim().toLowerCase() : 'garment';

      const defaultNames = {
        top: 'Classic Cotton Shirt',
        tshirt: 'Graphic Casual Tee',
        dress: 'Floral Summer Dress',
        jacket: 'Tailored Street Jacket',
        kurta: 'Embroidered Kurta',
        bottom: 'Tailored Slim Pants',
        garment: 'Fashion Garment Piece',
      };

      const title = (rawTitle && !rawTitle.match(/^image[-_0-9]+/i))
        ? rawTitle
        : (defaultNames[category] || 'Fashion Garment Piece');


      // Upload to Cloudinary (folder: tryiton/products)
      const uploadResult = await cloudinaryService.uploadImage(filePath, {
        folder: 'tryiton/products',
        tags: ['product_garment', `category_${category}`],
      });

      // Save reference to SQLite
      const insertStmt = db.prepare(`
        INSERT INTO products (user_id, title, category, source_type, source_url, image_url, cloudinary_public_id, metadata)
        VALUES (?, ?, ?, 'upload', NULL, ?, ?, ?)
      `);

      const metadata = JSON.stringify({
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        bytes: uploadResult.bytes,
      });

      const result = insertStmt.run(userId, title, category, uploadResult.url, uploadResult.publicId, metadata);
      const newProductId = Number(result.lastInsertRowid);

      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(newProductId);

      console.log(`[Product] Method A: Uploaded product #${product.id} (${title}) -> ${uploadResult.url}`);

      return res.status(201).json({
        message: 'Product uploaded successfully',
        product: {
          id: product.id,
          title: product.title,
          category: product.category,
          sourceType: product.source_type,
          sourceUrl: product.source_url,
          imageUrl: product.image_url,
          publicId: product.cloudinary_public_id,
          metadata: JSON.parse(product.metadata || '{}'),
          createdAt: product.created_at,
        },
      });
    } catch (error) {
      console.error('[Product Upload Error]:', error);
      return res.status(500).json({
        error: 'Upload Failed',
        message: error.message || 'Failed to process product image upload',
      });
    }
  },

  // Method B: Product URL Extraction & Scraping
  extractProductFromUrl: async (req, res) => {
    let downloadedFilePath = null;
    try {
      const { url, category: reqCategory, title: reqTitle } = req.body;

      if (!url || typeof url !== 'string' || (!url.startsWith('http://') && !url.startsWith('https://'))) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Please provide a valid HTTP or HTTPS product URL',
        });
      }

      const userId = req.user ? req.user.id : null;
      console.log(`[Product] Method B: Extracting garment from URL: ${url}`);

      // 1. Scrape product information and download product image locally
      const extracted = await scraperService.extractProductInfo(url.trim(), uploadsDir);
      downloadedFilePath = extracted.localFilePath;

      const finalTitle = reqTitle ? reqTitle.trim() : extracted.title;
      const finalCategory = reqCategory ? reqCategory.trim().toLowerCase() : 'garment';

      // 2. Upload extracted garment image to Cloudinary
      const uploadResult = await cloudinaryService.uploadImage(downloadedFilePath, {
        folder: 'tryiton/products',
        tags: ['product_garment', 'source_url', `category_${finalCategory}`],
      });

      // 3. Clean up temporary downloaded file
      if (downloadedFilePath && fs.existsSync(downloadedFilePath)) {
        try {
          fs.unlinkSync(downloadedFilePath);
        } catch (e) {
          // ignore cleanup errors
        }
      }

      // 4. Save reference in SQLite
      const insertStmt = db.prepare(`
        INSERT INTO products (user_id, title, category, source_type, source_url, image_url, cloudinary_public_id, metadata)
        VALUES (?, ?, ?, 'url', ?, ?, ?, ?)
      `);

      const metadata = JSON.stringify({
        originalImageUrl: extracted.originalImageUrl,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        bytes: uploadResult.bytes,
      });

      const result = insertStmt.run(userId, finalTitle, finalCategory, url.trim(), uploadResult.url, uploadResult.publicId, metadata);
      const newProductId = Number(result.lastInsertRowid);

      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(newProductId);

      console.log(`[Product] Method B: Extracted & saved product #${product.id} (${finalTitle}) from ${url}`);

      return res.status(201).json({
        message: 'Product successfully extracted and imported into wardrobe',
        product: {
          id: product.id,
          title: product.title,
          category: product.category,
          sourceType: product.source_type,
          sourceUrl: product.source_url,
          imageUrl: product.image_url,
          publicId: product.cloudinary_public_id,
          metadata: JSON.parse(product.metadata || '{}'),
          createdAt: product.created_at,
        },
      });
    } catch (error) {
      // Clean up temp file on error
      if (downloadedFilePath && fs.existsSync(downloadedFilePath)) {
        try { fs.unlinkSync(downloadedFilePath); } catch (e) {}
      }

      console.error('[Product Extract Error]:', error.message);
      return res.status(422).json({
        error: 'Extraction Failed',
        message: error.message || 'Failed to extract product from the provided URL. Try uploading the image directly.',
      });
    }
  },

  // Get all user products (and sample garments if list is empty)
  getProducts: (req, res) => {
    try {
      const userId = req.user ? req.user.id : null;
      let products = [];

      if (userId) {
        products = db.prepare(`
          SELECT * FROM products 
          WHERE user_id = ? OR user_id IS NULL 
          ORDER BY created_at DESC
        `).all(userId);
      } else {
        products = db.prepare(`
          SELECT * FROM products 
          WHERE user_id IS NULL 
          ORDER BY created_at DESC
        `).all();
      }

      const formatted = products.map((p) => ({
        id: p.id,
        title: p.title,
        category: p.category,
        sourceType: p.source_type,
        sourceUrl: p.source_url,
        imageUrl: p.image_url,
        publicId: p.cloudinary_public_id,
        metadata: JSON.parse(p.metadata || '{}'),
        createdAt: p.created_at,
      }));

      return res.status(200).json({ products: formatted });
    } catch (error) {
      console.error('[Get Products Error]:', error);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to retrieve products',
      });
    }
  },

  // Get product by ID
  getProductById: (req, res) => {
    try {
      const productId = Number(req.params.id);
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);

      if (!product) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Product not found',
        });
      }

      return res.status(200).json({
        product: {
          id: product.id,
          title: product.title,
          category: product.category,
          sourceType: product.source_type,
          sourceUrl: product.source_url,
          imageUrl: product.image_url,
          publicId: product.cloudinary_public_id,
          metadata: JSON.parse(product.metadata || '{}'),
          createdAt: product.created_at,
        },
      });
    } catch (error) {
      console.error('[Get Product By ID Error]:', error);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to retrieve product',
      });
    }
  },

  // Delete product
  deleteProduct: async (req, res) => {
    try {
      const userId = req.user ? req.user.id : null;
      const productId = Number(req.params.id);

      const product = db.prepare('SELECT * FROM products WHERE id = ? AND (user_id = ? OR user_id IS NULL)').get(productId, userId);
      if (!product) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Product not found or access denied',
        });
      }

      if (product.cloudinary_public_id) {
        await cloudinaryService.deleteImage(product.cloudinary_public_id);
      }

      db.prepare('DELETE FROM products WHERE id = ?').run(productId);

      return res.status(200).json({
        message: 'Product deleted successfully',
        deletedId: productId,
      });
    } catch (error) {
      console.error('[Delete Product Error]:', error);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to delete product',
      });
    }
  },
};

module.exports = productController;
