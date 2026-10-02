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

export const checkDatabaseConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    return {
      connected: true,
      timestamp: result.rows[0].now,
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
    };
  }
};

export default pool;
