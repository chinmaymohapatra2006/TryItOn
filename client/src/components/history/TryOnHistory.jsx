import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { SkeletonGrid } from '../common/Skeleton';
import { 
  History, 
  Sparkles, 
  Trash2, 
  Download, 
  Eye, 
  RefreshCw, 
  Shirt, 
  Calendar, 
  ArrowRight, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock
} from 'lucide-react';

export default function TryOnHistory({ onInspectSession, onTryAgain, onStartFirstTryOn }) {
  const { success, error, info } = useToast();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/history');
      setSessions(res.data?.sessions || []);
    } catch (err) {
      console.warn('[TryOnHistory] Failed to load history:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this try-on result from your history?')) return;

    try {
      await api.delete(`/history/${sessionId}`);
      success('Try-on record removed from history.');
      await fetchHistory();
    } catch (err) {
      error('Failed to delete session');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear your entire try-on history?')) return;
    try {
      await api.post('/history/clear-all');
      success('All try-on history cleared.');
      await fetchHistory();
    } catch (err) {
      error('Failed to clear history');
    }
  };

  const handleDownload = async (session, e) => {
    e.stopPropagation();
    try {
      info('Downloading try-on photo...');
      const response = await fetch(session.resultImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const cleanTitle = (session.garmentTitle || 'tryon').toLowerCase().replace(/[^a-z0-9]/g, '-');
      link.download = `tryiton-${cleanTitle}-${session.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      success('Download completed!');
    } catch (err) {
      window.open(session.resultImageUrl, '_blank');
    }
  };

  // Filtered sessions
  const filteredSessions = sessions.filter((s) => {
    const matchesSearch = (s.garmentTitle || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || (s.garmentCategory || '').toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Card */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <History size={24} color="#818cf8" />
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff' }}>
                My Try-On History
              </h2>
            </div>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
              Revisit, compare, and download all your past AI virtual fittings.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              onClick={fetchHistory}
              className="btn btn-secondary"
              style={{ fontSize: '0.8125rem', padding: '0.45rem 0.85rem' }}
            >
              <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              <span>Refresh</span>
            </button>

            {sessions.length > 0 && (
              <button
                onClick={handleClearAll}
                className="btn btn-secondary"
                style={{ fontSize: '0.8125rem', padding: '0.45rem 0.85rem', color: '#f87171' }}
              >
                <Trash2 size={13} />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Search & Filter Controls */}
        {sessions.length > 0 && (
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <Search size={15} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by garment title..."
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  color: '#ffffff',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={15} color="#9ca3af" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: '#1f2937',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  color: '#ffffff',
                  fontSize: '0.875rem'
                }}
              >
                <option value="all">All Categories</option>
                <option value="top">Tops & Shirts</option>
                <option value="dress">Dresses</option>
                <option value="jacket">Jackets & Outerwear</option>
                <option value="kurta">Kurta</option>
                <option value="bottom">Pants & Bottoms</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* History Grid Showcase */}
      {loading ? (
        <SkeletonGrid count={3} cardHeight="340px" />
      ) : sessions.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <Sparkles size={30} color="#818cf8" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.5rem' }}>
            No Virtual Try-On Sessions Yet
          </h3>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
            Transform your style today! Upload your photo, pick a garment, and experience Cloudinary AI fittings.
          </p>
          <button
            onClick={onStartFirstTryOn}
            className="btn btn-primary"
            style={{ padding: '0.65rem 1.5rem', fontSize: '0.9375rem' }}
          >
            <Sparkles size={16} />
            <span>Start Your First Fitting</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {filteredSessions.map((session) => {
            const formattedTime = new Date(session.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={session.id}
                onClick={() => onInspectSession && onInspectSession(session)}
                className="glass-card glass-card-interactive"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {/* Result Image */}
                <div style={{ height: '280px', width: '100%', background: '#000000', position: 'relative' }}>
                  <img
                    src={session.resultImageUrl}
                    alt={session.garmentTitle}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {/* Top Badges */}
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    right: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pointerEvents: 'none'
                  }}>
                    <span className="badge badge-success" style={{ fontSize: '0.65rem', pointerEvents: 'auto' }}>
                      <CheckCircle2 size={10} /> Completed
                    </span>
                    <span className="badge badge-info" style={{ fontSize: '0.65rem', textTransform: 'capitalize', pointerEvents: 'auto' }}>
                      {session.garmentCategory}
                    </span>
                  </div>

                  {/* Small Model thumbnail inset */}
                  <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '10px',
                    width: '42px',
                    height: '52px',
                    borderRadius: '0.375rem',
                    overflow: 'hidden',
                    border: '2px solid rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                    background: '#000'
                  }}>
                    <img src={session.userImageUrl} alt="Model" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </div>

                {/* Card Content */}
                <div style={{ padding: '1rem' }}>
                  <h4 style={{
                    fontSize: '0.9375rem',
                    fontWeight: '700',
                    color: '#ffffff',
                    marginBottom: '0.35rem',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden'
                  }}>
                    {session.garmentTitle}
                  </h4>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '1rem' }}>
                    <Clock size={12} />
                    <span>{formattedTime}</span>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onInspectSession) onInspectSession(session);
                      }}
                      className="btn btn-primary"
                      style={{ fontSize: '0.75rem', padding: '0.4rem 0.65rem', flex: 1 }}
                    >
                      <Eye size={13} />
                      <span>Inspect</span>
                    </button>

                    <button
                      onClick={(e) => handleDownload(session, e)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.4rem 0.65rem' }}
                      title="Download Image"
                    >
                      <Download size={13} />
                    </button>

                    <button
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#9ca3af',
                        cursor: 'pointer',
                        padding: '0.4rem',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Delete Session"
                    >
                      <Trash2 size={15} color="#ef4444" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
