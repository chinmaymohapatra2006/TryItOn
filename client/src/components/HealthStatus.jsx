import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Activity, Database, Cloud, CheckCircle2, XCircle, RefreshCw, Server } from 'lucide-react';

export default function HealthStatus() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latency, setLatency] = useState(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    const startTime = performance.now();
    try {
      const response = await api.get('/health');
      const endTime = performance.now();
      setLatency(Math.round(endTime - startTime));
      setHealthData(response.data);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend server');
      setHealthData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="glass-card" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'rgba(99, 102, 241, 0.2)',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Server size={22} color="#818cf8" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#f3f4f6' }}>System & API Health Check</h3>
            <p style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>Real-time communication status with Express backend & SQLite</p>
          </div>
        </div>

        <button 
          onClick={checkHealth} 
          disabled={loading}
          className="btn btn-secondary"
          style={{ fontSize: '0.8125rem', padding: '0.4rem 0.85rem' }}
        >
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          {loading ? 'Checking...' : 'Ping API'}
        </button>
      </div>

      {loading && !healthData && !error && (
        <div style={{ padding: '1.5rem', textAlign: 'center', color: '#9ca3af' }}>
          <p>Connecting to backend API at <code>http://localhost:5000/api/health</code>...</p>
        </div>
      )}

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '0.5rem',
          padding: '1rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem'
        }}>
          <XCircle size={20} color="#ef4444" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <h4 style={{ color: '#f87171', fontWeight: '600', fontSize: '0.9375rem' }}>Backend Connection Failed</h4>
            <p style={{ color: '#fca5a5', fontSize: '0.8125rem', marginTop: '0.25rem' }}>{error}</p>
            <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.5rem' }}>
              Ensure the backend server is running on <code>http://localhost:5000</code>.
            </p>
          </div>
        </div>
      )}

      {healthData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {/* API Status Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-color)',
            borderRadius: '0.75rem',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>Express API</span>
              <span className="badge badge-success">
                <span className="pulse-dot online"></span>
                {healthData.status}
              </span>
            </div>
            <div style={{ fontSize: '1.125rem', fontWeight: '700', color: '#f9fafb' }}>
              {healthData.service}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              Latency: <strong style={{ color: '#34d399' }}>{latency}ms</strong> • v{healthData.version}
            </div>
          </div>

          {/* SQLite DB Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-color)',
            borderRadius: '0.75rem',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>Database</span>
              <span className={`badge ${healthData.database === 'connected' ? 'badge-success' : 'badge-warning'}`}>
                <Database size={12} />
                {healthData.database}
              </span>
            </div>
            <div style={{ fontSize: '1.125rem', fontWeight: '700', color: '#f9fafb' }}>
              SQLite 3 Local DB
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              File: <code>database/tryiton.db</code>
            </div>
          </div>

          {/* Cloudinary Integration Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-color)',
            borderRadius: '0.75rem',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>Cloudinary AI</span>
              <span className={`badge ${healthData.cloudinaryConfigured ? 'badge-success' : 'badge-warning'}`}>
                <Cloud size={12} />
                {healthData.cloudinaryConfigured ? 'Configured' : 'Env Needed'}
              </span>
            </div>
            <div style={{ fontSize: '1.125rem', fontWeight: '700', color: '#f9fafb' }}>
              Image & AI Engine
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              {healthData.cloudinaryConfigured ? 'Ready for image processing' : 'Provide API keys in .env'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
