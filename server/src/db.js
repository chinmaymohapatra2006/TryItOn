const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const config = require('./config');

// Ensure database directory exists
const dbDir = path.dirname(config.dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize native SQLite Database with optimal PRAGMA settings
const db = new DatabaseSync(config.dbPath);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA busy_timeout = 5000;');
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA synchronous = NORMAL;');
db.exec('PRAGMA cache_size = -20000;'); // 20MB cache memory

console.log(`[Database] Connected to SQLite database at: ${config.dbPath}`);

// Initialize schema tables & indexes
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT,
      category TEXT DEFAULT 'garment',
      source_type TEXT DEFAULT 'upload',
      source_url TEXT,
      image_url TEXT NOT NULL,
      cloudinary_public_id TEXT,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS user_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      image_url TEXT NOT NULL,
      cloudinary_public_id TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tryon_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      product_id INTEGER,
      user_image_url TEXT NOT NULL,
      user_image_public_id TEXT,
      product_image_url TEXT NOT NULL,
      product_image_public_id TEXT,
      result_image_url TEXT,
      result_public_id TEXT,
      status TEXT DEFAULT 'pending',
      error_message TEXT,
      transformation_params TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    );

    -- Performance Indexes (Phase 12)
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_user_photos_user_id ON user_photos(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_photos_active ON user_photos(user_id, is_active);
    CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_source_url ON products(source_url);
    CREATE INDEX IF NOT EXISTS idx_tryon_sessions_user_id ON tryon_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_tryon_sessions_user_status ON tryon_sessions(user_id, status);
    CREATE INDEX IF NOT EXISTS idx_tryon_sessions_user_created ON tryon_sessions(user_id, created_at DESC);
  `);
  console.log('[Database] Schema & performance indexes initialized successfully');
}

// Run schema initialization
initSchema();

module.exports = db;
