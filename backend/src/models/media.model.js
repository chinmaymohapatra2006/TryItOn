import { pool } from '../config/db.js';
import crypto from 'crypto';

// In-memory fallback repository when PostgreSQL is not running
const inMemoryMediaStore = new Map();

// Initialize sample costume media assets
const sampleCostumes = [
  {
    id: 'media_sample_1',
    public_id: 'costumes/kurta_female_preview',
    url: '/costumes/thumbnails/kurta.jpg',
    secure_url: '/costumes/thumbnails/kurta.jpg',
    thumbnail_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&h=300&q=80',
    format: 'jpg',
    width: 600,
    height: 800,
    bytes: 48200,
    category: 'costume',
    resource_type: 'image',
    metadata: { costumeId: 'kurta-female', title: 'Embroidered Silk Kurta' },
    created_at: new Date().toISOString()
  },
  {
    id: 'media_sample_2',
    public_id: 'costumes/sherwani_female_preview',
    url: '/costumes/thumbnails/sherwani.jpg',
    secure_url: '/costumes/thumbnails/sherwani.jpg',
    thumbnail_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&h=300&q=80',
    format: 'jpg',
    width: 600,
    height: 800,
    bytes: 52100,
    category: 'costume',
    metadata: { costumeId: 'sherwani-female', title: 'Royal Brocade Sherwani' },
    created_at: new Date().toISOString()
  },
  {
    id: 'media_sample_3',
    public_id: 'costumes/shirt_female_preview',
    url: '/costumes/thumbnails/shirt.jpg',
    secure_url: '/costumes/thumbnails/shirt.jpg',
    thumbnail_url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=300&h=300&q=80',
    format: 'jpg',
    width: 600,
    height: 800,
    bytes: 41200,
    category: 'costume',
    metadata: { costumeId: 'shirt-female', title: 'Classic Silk Shirt' },
    created_at: new Date().toISOString()
  }
];

sampleCostumes.forEach(c => inMemoryMediaStore.set(c.id, c));

export const MediaModel = {
  async createTableIfNotExists() {
    try {
      const client = await pool.connect();
      await client.query(`
        CREATE TABLE IF NOT EXISTS media_assets (
          id VARCHAR(64) PRIMARY KEY,
          public_id VARCHAR(255) NOT NULL,
          url TEXT NOT NULL,
          secure_url TEXT NOT NULL,
          thumbnail_url TEXT,
          format VARCHAR(32),
          width INTEGER,
          height INTEGER,
          bytes INTEGER,
          category VARCHAR(64) DEFAULT 'general',
          resource_type VARCHAR(64) DEFAULT 'image',
          metadata JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
      client.release();
    } catch {
      // Graceful fallback when PostgreSQL server is offline in dev
    }
  },

  async save(mediaData) {
    const record = {
      id: mediaData.id || `media_${crypto.randomUUID()}`,
      public_id: mediaData.public_id,
      url: mediaData.url,
      secure_url: mediaData.secure_url || mediaData.url,
      thumbnail_url: mediaData.thumbnail_url || mediaData.url,
      format: mediaData.format || 'jpg',
      width: mediaData.width || 800,
      height: mediaData.height || 600,
      bytes: mediaData.bytes || 0,
      category: mediaData.category || 'general',
      resource_type: mediaData.resource_type || 'image',
      metadata: mediaData.metadata || {},
      created_at: new Date().toISOString()
    };

    // Always store in memory
    inMemoryMediaStore.set(record.id, record);

    // Try persisting to PostgreSQL
    try {
      const client = await pool.connect();
      await client.query(
        `INSERT INTO media_assets (id, public_id, url, secure_url, thumbnail_url, format, width, height, bytes, category, resource_type, metadata, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO UPDATE SET url = $3, secure_url = $4, thumbnail_url = $5;`,
        [record.id, record.public_id, record.url, record.secure_url, record.thumbnail_url, record.format, record.width, record.height, record.bytes, record.category, record.resource_type, JSON.stringify(record.metadata), record.created_at]
      );
      client.release();
    } catch {
      // Fallback in memory
    }

    return record;
  },

  async findAll(category = null) {
    let list = Array.from(inMemoryMediaStore.values());
    if (category) {
      list = list.filter(m => m.category === category);
    }
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async findById(id) {
    return inMemoryMediaStore.get(id) || null;
  }
};

export default MediaModel;
