import { checkDatabaseConnection } from '../config/db.js';

export const getHealthStatus = async () => {
  const dbStatus = await checkDatabaseConnection();

  return {
    status: 'ok',
    message: 'TryItOn API is running smoothly',
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(2)}s`,
    environment: process.env.NODE_ENV || 'development',
    services: {
      server: 'healthy',
      database: dbStatus.connected ? 'connected' : 'disconnected (configured)',
    },
    version: '1.0.0'
  };
};
