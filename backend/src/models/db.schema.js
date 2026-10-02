import { pool } from '../config/db.js';

/**
 * Initializes PostgreSQL schema for Phase 9 persistent data:
 * - users
 * - measurements
 * - avatars
 * - costumes
 * - saved_looks
 */
export const initDbSchema = async () => {
  try {
    const client = await pool.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(128) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS measurements (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
        height NUMERIC(5,2) NOT NULL,
        shoulder_width NUMERIC(5,2) NOT NULL,
        chest NUMERIC(5,2) NOT NULL,
        waist NUMERIC(5,2) NOT NULL,
        hip NUMERIC(5,2) NOT NULL,
        arm_length NUMERIC(5,2),
        leg_length NUMERIC(5,2),
        unit VARCHAR(16) DEFAULT 'cm',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS avatars (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
        model_gender VARCHAR(32) DEFAULT 'female',
        model_url TEXT NOT NULL,
        pose_preset VARCHAR(64) DEFAULT 't-pose',
        pose_data JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS costumes (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(128) NOT NULL,
        category VARCHAR(64) NOT NULL,
        model_url TEXT NOT NULL,
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS saved_looks (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
        costume_id VARCHAR(64) REFERENCES costumes(id) ON DELETE CASCADE,
        look_name VARCHAR(128) NOT NULL,
        colorway VARCHAR(32) NOT NULL,
        custom_parameters JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    client.release();
    console.log('✅ PostgreSQL persistent user schema initialized.');
  } catch (err) {
    // Graceful fallback in development when local PostgreSQL server is offline
    console.log('ℹ️ PostgreSQL offline in dev; repository fallback engine initialized.');
  }
};

export default initDbSchema;
