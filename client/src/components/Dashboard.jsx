import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/client';
import { Skeleton, SkeletonCard, SkeletonBanner } from './common/Skeleton';
import { 
  User, 
  Sparkles, 
  Camera, 
  Shirt, 
  History, 
  LogOut, 
  ShieldCheck, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  UploadCloud, 
  Check, 
  Eye, 
  Download,
  Compass,
  Zap,
  Circle
} from 'lucide-react';

export default function Dashboard({ onStartTryOn, onManagePhotos, onOpenWardrobe, onOpenHistory, onInspectSession }) {
  const { user, logout } = useAuth();
  const { success } = useToast();
  const [activePhoto, setActivePhoto] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [productsCount, setProductsCount] = useState(0);
  const [photosCount, setPhotosCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [photoRes, photosRes, productsRes, historyRes] = await Promise.all([
          api.get('/photos/active'),
          api.get('/photos'),
          api.get('/products'),
          api.get('/history'),
        ]);

        if (photoRes.data?.photo) {
          setActivePhoto(photoRes.data.photo);
        }
        setPhotosCount(photosRes.data?.photos?.length || 0);
        setProductsCount(productsRes.data?.products?.length || 0);
        setRecentSessions((historyRes.data?.sessions || []).slice(0, 3));
      } catch (err) {
        console.warn('[Dashboard] Data fetch warning:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formattedDate = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Today';

  const hasPhoto = !!activePhoto || photosCount > 0;
  const hasGarment = productsCount > 0;
  const hasHistory = recentSessions.length > 0;

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        <SkeletonBanner />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <SkeletonCard height="180px" />
          <SkeletonCard height="180px" />
        </div>
        <SkeletonCard height="240px" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* User Banner Card */}
      <div className="glass-card" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '220px',
          height: '220px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '1.25rem',
              background: 'linear-gradient(135deg, #6366f1, #ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: '800',
              color: '#ffffff',
              boxShadow: '0 8px 25px rgba(99, 102, 241, 0.35)',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              {activePhoto ? (
                <img src={activePhoto.imageUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.name ? user.name.charAt(0).toUpperCase() : 'U'
              )}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff' }}>
                  {user?.name || 'Fashion Explorer'}
                </h2>
                <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                  <ShieldCheck size={11} /> Authenticated
                </span>
              </div>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {user?.email} &bull; Member since {formattedDate}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={onManagePhotos}
              className="btn btn-secondary"
              style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
            >
              <Camera size={15} />
              <span>{activePhoto ? 'Change Photo' : 'Upload Photo'}</span>
            </button>

            <button
              onClick={() => {
                logout();
                success('You have signed out successfully.');
              }}
              className="btn btn-secondary"
              style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem', color: '#f87171' }}
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick-Start Wizard (Interactive Onboarding) */}
      <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(99, 102, 241, 0.3)', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(236, 72, 153, 0.05) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Compass size={18} color="#818cf8" />
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#ffffff' }}>
              Virtual Fitting Quick-Start Guide
            </h3>
          </div>
          <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
            {[hasPhoto, hasGarment, hasHistory].filter(Boolean).length}/3 Completed
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {/* Step 1 */}
          <div 
            onClick={onManagePhotos}
            className="glass-card-interactive"
            style={{
              background: hasPhoto ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
              border: hasPhoto ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)',
              borderRadius: '0.75rem',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: hasPhoto ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0
            }}>
              {hasPhoto ? <Check size={16} /> : '1'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#ffffff' }}>
                1. Upload Model Photo
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                {hasPhoto ? `${photosCount} photo(s) active` : 'Upload your portrait'}
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div 
            onClick={onOpenWardrobe}
            className="glass-card-interactive"
            style={{
              background: hasGarment ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
              border: hasGarment ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)',
              borderRadius: '0.75rem',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: hasGarment ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0
            }}>
              {hasGarment ? <Check size={16} /> : '2'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#ffffff' }}>
                2. Choose Garment
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                {hasGarment ? `${productsCount} item(s) in wardrobe` : 'Upload or paste URL'}
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div 
            onClick={onStartTryOn}
            className="glass-card-interactive"
            style={{
              background: hasHistory ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
              border: hasHistory ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)',
              borderRadius: '0.75rem',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: hasHistory ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0
            }}>
              {hasHistory ? <Check size={16} /> : '3'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#ffffff' }}>
                3. Generate Try-On
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                {hasHistory ? 'Session completed' : 'Launch virtual fitting'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {/* Model Photo Card */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8125rem', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>Active Model Photo</span>
            {activePhoto ? (
              <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                <Check size={10} /> Ready
              </span>
            ) : (
              <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
                Required
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{
              width: '70px',
              height: '90px',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              background: '#000000',
              border: '1px solid var(--border-color)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {activePhoto ? (
                <img src={activePhoto.imageUrl} alt="Active Model" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Camera size={24} color="#6b7280" />
              )}
            </div>

            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#ffffff' }}>
                {activePhoto ? 'Model Configured' : 'No Photo Uploaded'}
              </h4>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.2rem', marginBottom: '0.5rem' }}>
                {activePhoto ? `${photosCount} photo(s) in your profile gallery.` : 'Upload portrait to see clothes on yourself.'}
              </p>
              <button
                onClick={onManagePhotos}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              >
                <UploadCloud size={12} />
                <span>{activePhoto ? 'Manage Photos' : 'Upload Photo'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Wardrobe Card */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8125rem', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>Garment Wardrobe</span>
            <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
              <Shirt size={10} /> {productsCount} Items
            </span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{
              width: '70px',
              height: '90px',
              borderRadius: '0.5rem',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(236, 72, 153, 0.2))',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Shirt size={28} color="#ec4899" />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#ffffff' }}>
                Virtual Wardrobe
              </h4>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.2rem', marginBottom: '0.5rem' }}>
                Upload garments or paste product URLs to try on.
              </p>
              <button
                onClick={onOpenWardrobe}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              >
                <Shirt size={12} />
                <span>Manage Wardrobe</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Try-Ons Section */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={20} color="#818cf8" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#ffffff' }}>
              Recent Virtual Try-Ons
            </h3>
          </div>

          {recentSessions.length > 0 && (
            <button
              onClick={onOpenHistory}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
            >
              <span>View All History ↗</span>
            </button>
          )}
        </div>

        {recentSessions.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2.5rem 1rem',
            border: '1px dashed var(--border-color)',
            borderRadius: '0.75rem',
            color: '#9ca3af'
          }}>
            <Clock size={36} color="#6b7280" style={{ margin: '0 auto 0.75rem' }} />
            <h4 style={{ color: '#e5e7eb', fontWeight: '600', marginBottom: '0.25rem' }}>No Try-On Sessions Yet</h4>
            <p style={{ fontSize: '0.8125rem', maxWidth: '400px', margin: '0 auto 1.25rem' }}>
              Launch the virtual trial room to generate and save your first virtual fitting!
            </p>
            <button
              onClick={onStartTryOn}
              className="btn btn-primary"
              style={{ fontSize: '0.8125rem', padding: '0.5rem 1.25rem' }}
            >
              <Sparkles size={14} />
              <span>Start Virtual Try-On</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {recentSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => onInspectSession && onInspectSession(session)}
                className="glass-card-interactive"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  border: '1px solid var(--border-color)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ height: '180px', width: '100%', background: '#000' }}>
                  <img src={session.resultImageUrl} alt={session.garmentTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#ffffff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {session.garmentTitle}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.2rem' }}>
                    {session.garmentCategory} &bull; {new Date(session.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
