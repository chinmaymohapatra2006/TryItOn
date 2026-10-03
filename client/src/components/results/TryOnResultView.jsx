import React, { useState } from 'react';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { 
  CheckCircle2, 
  Download, 
  RefreshCw, 
  Shirt, 
  Camera, 
  Sparkles, 
  Sliders, 
  Maximize2, 
  Share2, 
  Check, 
  ArrowLeft, 
  ShieldCheck, 
  Zap, 
  Info
} from 'lucide-react';

export default function TryOnResultView({ resultData, onTryAnother, onRegenerated }) {
  const { success, error, info } = useToast();
  const [currentResult, setCurrentResult] = useState(resultData);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [sliderPos, setSliderPos] = useState(50); // percentage for split slider
  const [copiedLink, setCopiedLink] = useState(false);
  const [viewMode, setViewMode] = useState('split_slider'); // 'split_slider' | 'triptych' | 'focused'

  // Regenerate handler
  const handleRegenerate = async () => {
    setIsRegenerating(true);
    info('Regenerating AI fitting with refreshed seed...');
    try {
      const response = await api.post('/tryon/regenerate', {
        sessionId: currentResult.sessionId,
      });
      setCurrentResult(response.data.result);
      if (onRegenerated) onRegenerated(response.data.result);
      success('Fitting regenerated with updated composition!');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to regenerate virtual try-on');
    } finally {
      setIsRegenerating(false);
    }
  };

  // Direct download handler (fetches as blob to prevent cross-origin download restrictions)
  const handleDownload = async () => {
    try {
      info('Downloading high-resolution fitting image...');
      const response = await fetch(currentResult.resultImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const cleanTitle = (currentResult.garmentTitle || 'tryon').toLowerCase().replace(/[^a-z0-9]/g, '-');
      link.download = `tryiton-${cleanTitle}-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      success('Image downloaded successfully!');
    } catch (e) {
      window.open(currentResult.resultImageUrl, '_blank');
    }
  };

  // Copy shareable link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentResult.resultImageUrl);
    setCopiedLink(true);
    success('Shareable image link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Slider drag handler
  const handleSliderMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percent);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner Card */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)'
            }}>
              <CheckCircle2 size={26} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff' }}>
                Virtual Trial Completed!
              </h2>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                Fitted Garment: <strong>{currentResult.garmentTitle}</strong> &bull; Session #{currentResult.sessionId}
              </p>
            </div>
          </div>

          {/* View Mode Controls */}
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '0.25rem',
            borderRadius: '0.625rem',
            border: '1px solid var(--border-color)',
            gap: '0.25rem'
          }}>
            <button
              onClick={() => setViewMode('split_slider')}
              className="btn"
              style={{
                fontSize: '0.75rem',
                padding: '0.35rem 0.75rem',
                background: viewMode === 'split_slider' ? '#6366f1' : 'transparent',
                color: '#ffffff'
              }}
            >
              <Sliders size={13} />
              <span>Split Slider</span>
            </button>
            <button
              onClick={() => setViewMode('triptych')}
              className="btn"
              style={{
                fontSize: '0.75rem',
                padding: '0.35rem 0.75rem',
                background: viewMode === 'triptych' ? '#6366f1' : 'transparent',
                color: '#ffffff'
              }}
            >
              <span>3-Way View</span>
            </button>
            <button
              onClick={() => setViewMode('focused')}
              className="btn"
              style={{
                fontSize: '0.75rem',
                padding: '0.35rem 0.75rem',
                background: viewMode === 'focused' ? '#6366f1' : 'transparent',
                color: '#ffffff'
              }}
            >
              <span>Focused Result</span>
            </button>
          </div>
        </div>

        {/* 1. INTERACTIVE SPLIT BEFORE/AFTER SLIDER */}
        {viewMode === 'split_slider' && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.75rem' }}>
            <div
              onMouseMove={handleSliderMove}
              onTouchMove={(e) => {
                if (e.touches[0]) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
                  setSliderPos((x / rect.width) * 100);
                }
              }}
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '480px',
                height: '560px',
                borderRadius: '1rem',
                overflow: 'hidden',
                background: '#000000',
                border: '2px solid rgba(99, 102, 241, 0.4)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
                cursor: 'ew-resize',
                userSelect: 'none'
              }}
            >
              {/* After Image (AI Result) - Full width */}
              <img
                src={currentResult.resultImageUrl}
                alt="After"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  pointerEvents: 'none'
                }}
              />

              {/* Before Image (Original Model) - Clipped by slider percentage */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${sliderPos}%`,
                height: '100%',
                overflow: 'hidden',
                borderRight: '2px solid #ffffff',
                boxShadow: '2px 0 10px rgba(0, 0, 0, 0.5)',
                pointerEvents: 'none'
              }}>
                <img
                  src={currentResult.userImageUrl}
                  alt="Before"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '480px',
                    height: '560px',
                    objectFit: 'cover'
                  }}
                />
              </div>

              {/* Split Line & Handle */}
              <div style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${sliderPos}%`,
                width: '3px',
                background: '#ffffff',
                transform: 'translateX(-50%)',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: '#6366f1',
                  border: '3px solid #ffffff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  color: '#ffffff',
                  fontWeight: '800'
                }}>
                  ⟷
                </div>
              </div>

              {/* Badges on bottom */}
              <div style={{ position: 'absolute', bottom: '12px', left: '12px', pointerEvents: 'none' }}>
                <span className="badge badge-secondary" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
                  Original Photo
                </span>
              </div>

              <div style={{ position: 'absolute', bottom: '12px', right: '12px', pointerEvents: 'none' }}>
                <span className="badge badge-success" style={{ background: 'rgba(16,185,129,0.85)', backdropFilter: 'blur(4px)', color: '#ffffff' }}>
                  AI Try-On Result
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 2. TRIPTYCH 3-WAY VIEW */}
        {viewMode === 'triptych' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
            {/* Step 1: Model */}
            <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
              <span className="badge badge-secondary" style={{ marginBottom: '0.5rem', fontSize: '0.65rem' }}>
                1. Original Model Photo
              </span>
              <div style={{ height: '320px', borderRadius: '0.5rem', overflow: 'hidden', background: '#000' }}>
                <img src={currentResult.userImageUrl} alt="Model" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>

            {/* Step 2: Garment */}
            <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
              <span className="badge badge-info" style={{ marginBottom: '0.5rem', fontSize: '0.65rem' }}>
                2. Selected Garment
              </span>
              <div style={{ height: '320px', borderRadius: '0.5rem', overflow: 'hidden', background: '#000' }}>
                <img src={currentResult.productImageUrl} alt="Garment" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            </div>

            {/* Step 3: AI Result */}
            <div style={{ textAlign: 'center', background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '2px solid #6366f1' }}>
              <span className="badge badge-success" style={{ marginBottom: '0.5rem', fontSize: '0.65rem' }}>
                3. Virtual Try-On Result
              </span>
              <div style={{ height: '320px', borderRadius: '0.5rem', overflow: 'hidden', background: '#000' }}>
                <img src={currentResult.resultImageUrl} alt="AI Result" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          </div>
        )}

        {/* 3. FOCUSED RESULT VIEW */}
        {viewMode === 'focused' && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.75rem' }}>
            <div style={{
              width: '100%',
              maxWidth: '460px',
              borderRadius: '1rem',
              overflow: 'hidden',
              background: '#000',
              border: '2px solid rgba(99, 102, 241, 0.4)',
              boxShadow: '0 15px 35px rgba(0,0,0,0.5)'
            }}>
              <img src={currentResult.resultImageUrl} alt="Focused" style={{ width: '100%', height: 'auto', maxHeight: '580px', objectFit: 'contain', display: 'block' }} />
            </div>
          </div>
        )}

        {/* Action Toolbar */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.875rem',
          flexWrap: 'wrap',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-color)'
        }}>
          <button
            onClick={handleDownload}
            className="btn btn-primary"
            style={{ padding: '0.65rem 1.35rem', fontSize: '0.875rem' }}
          >
            <Download size={16} />
            <span>Download High-Res Result</span>
          </button>

          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="btn btn-secondary"
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem' }}
          >
            <RefreshCw size={15} style={{ animation: isRegenerating ? 'spin 1s linear infinite' : 'none' }} />
            <span>{isRegenerating ? 'Regenerating...' : 'Regenerate Fitting'}</span>
          </button>

          <button
            onClick={onTryAnother}
            className="btn btn-secondary"
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem' }}
          >
            <Shirt size={15} />
            <span>Try Another Garment</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="btn btn-secondary"
            style={{ padding: '0.65rem 1rem', fontSize: '0.875rem' }}
          >
            {copiedLink ? <Check size={15} color="#34d399" /> : <Share2 size={15} />}
            <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
          </button>
        </div>

        {/* Technical Details Footer */}
        <div style={{
          marginTop: '1.5rem',
          padding: '0.875rem 1.25rem',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '0.5rem',
          border: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: '#9ca3af',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <span>Target Region: <strong style={{ color: '#e5e7eb' }}>{currentResult.transformationDetails?.targetRegion || 'Upper Body'}</strong></span>
          <span>Facial Fidelity: <strong style={{ color: '#34d399' }}>100% Preserved</strong></span>
          <span>Engine: <strong style={{ color: '#818cf8' }}>{currentResult.transformationDetails?.engine || 'Cloudinary AI'}</strong></span>
        </div>
      </div>
    </div>
  );
}
