import pg from 'pg';
import { config } from './index.js';

const { Pool } = pg;

export const pool = new Pool(
  config.db.connectionString
    ? { connectionString: config.db.connectionString }
    : {
        host: config.db.host,
        port: config.db.port,
        database: config.db.database,
        user: config.db.user,
        password: config.db.password,
      }
);

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

import { LocalDb } from './localDb.js';

export const checkDatabaseConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    return {
      connected: true,
      provider: 'PostgreSQL Server',
      timestamp: result.rows[0].now,
    };
  } catch (error) {
    const localReady = LocalDb.isReady();
    return {
      connected: localReady,
      provider: localReady ? 'Local MVP Database (Active & Persistent)' : 'disconnected',
      timestamp: new Date().toISOString(),
      fallback: true
    };
  }
};

export default pool;
