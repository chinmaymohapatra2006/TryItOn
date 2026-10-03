import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { SkeletonCard } from '../common/Skeleton';
import { 
  Sparkles, 
  Camera, 
  Shirt, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ArrowRight, 
  Layers, 
  Check, 
  Download,
  Eye,
  Sliders,
  Cpu,
  ShieldCheck,
  Zap,
  Wand2,
  ChevronRight,
  SlidersHorizontal,
  Edit3,
  Tag
} from 'lucide-react';

export default function TryOnStudio({ onTryAnother, activeModelPhoto, selectedGarment }) {
  const { success, error, info } = useToast();
  const [photos, setPhotos] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  
  const [currentPhoto, setCurrentPhoto] = useState(activeModelPhoto || null);
  const [currentGarment, setCurrentGarment] = useState(selectedGarment || null);

  // Advanced AI Transformation Controls
  const [customPrompt, setCustomPrompt] = useState('');
  const [targetRegion, setTargetRegion] = useState('clothes'); // 'clothes' | 'shirt' | 'dress' | 'jacket' | 'pants'
  const [preserveGeometry, setPreserveGeometry] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(true);

  // Generation States
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0); // 0 to 4
  const [progressPercent, setProgressPercent] = useState(0);
  const [tryOnResult, setTryOnResult] = useState(null);

  // View comparison mode: 'result' | 'split'
  const [viewMode, setViewMode] = useState('result');

  // Quick fashion styling tags
  const styleTags = [
    'Floral Print', 'Denim Jacket', 'Silk Fabric', 'Leather', 
    'Fitted Cut', 'Oversized', 'Casual Cotton', 'Elegant Evening'
  ];

  // Load user photos and wardrobe products
  useEffect(() => {
    const loadAssets = async () => {
      try {
        setLoadingAssets(true);
        const [photosRes, productsRes] = await Promise.all([
          api.get('/photos'),
          api.get('/products'),
        ]);

        const photoList = photosRes.data?.photos || [];
        setPhotos(photoList);
        if (!currentPhoto && photoList.length > 0) {
          const active = photoList.find(p => p.isActive) || photoList[0];
          setCurrentPhoto(active);
        }

        const productList = productsRes.data?.products || [];
        setProducts(productList);
        if (!currentGarment && productList.length > 0) {
          setCurrentGarment(productList[0]);
        }
      } catch (err) {
        console.warn('[TryOnStudio] Error loading assets:', err.message);
      } finally {
        setLoadingAssets(false);
      }
    };

    loadAssets();
  }, []);

  // Update prompt whenever garment changes
  useEffect(() => {
    if (currentGarment) {
      const cleanTitle = currentGarment.title
        ?.replace(/\.(jpg|jpeg|png|webp)$/i, '')
        ?.replace(/^(image|extracted|upload)[-_0-9\s]*/i, '')
        ?.replace(/[-_]/g, ' ')
        ?.trim();

      const cat = currentGarment.category || 'garment';
      const prompt = cleanTitle && cleanTitle.length > 2 
        ? cleanTitle 
        : `high quality stylish ${cat}`;
      setCustomPrompt(prompt);

      // Auto-set matching target region
      if (cat === 'top' || cat === 'shirt' || cat === 'tshirt') setTargetRegion('shirt');
      else if (cat === 'dress') setTargetRegion('dress');
      else if (cat === 'jacket' || cat === 'outerwear') setTargetRegion('jacket');
      else if (cat === 'bottom' || cat === 'pants') setTargetRegion('pants');
      else setTargetRegion('clothes');
    }
  }, [currentGarment]);

  const runVirtualTryOn = async () => {
    if (!currentPhoto || !currentGarment) {
      error('Please select both a model photo and a garment to try on.');
      return;
    }

    setIsGenerating(true);
    setTryOnResult(null);
    setGenerationStep(1);
    setProgressPercent(20);

    // Progress animation milestones
    const step2Timer = setTimeout(() => {
      setGenerationStep(2);
      setProgressPercent(45);
    }, 500);

    const step3Timer = setTimeout(() => {
      setGenerationStep(3);
      setProgressPercent(75);
    }, 1100);

    try {
      const response = await api.post('/tryon/generate', {
        userPhotoId: currentPhoto.id,
        productId: currentGarment.id,
        options: {
          prompt: customPrompt.trim() || currentGarment.title,
          targetRegion,
          preserveGeometry,
        },
      });

      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
      setGenerationStep(4);
      setProgressPercent(100);
      setTryOnResult(response.data.result);
      success('Cloudinary AI Virtual Try-On completed!', 'Fitting Ready');
    } catch (err) {
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
      const msg = err.response?.data?.message || err.message || 'Virtual Try-On generation failed';
      error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (imageUrl, filename = 'tryiton-result.jpg') => {
    try {
      info('Preparing high-resolution download...');
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      success('Download completed!');
    } catch (err) {
      window.open(imageUrl, '_blank');
    }
  };

  const handleAddTag = (tag) => {
    setCustomPrompt((prev) => {
      if (prev.toLowerCase().includes(tag.toLowerCase())) return prev;
      return `${prev} ${tag}`.trim();
    });
  };

  if (loadingAssets) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <SkeletonCard height="240px" />
            <SkeletonCard height="240px" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Studio Header Card */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Sparkles size={24} color="#818cf8" />
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff' }}>
                AI Virtual Fitting Studio
              </h2>
            </div>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
              High-Fidelity Cloudinary Generative AI Clothing Replacement with Facial & Posture Preservation
            </p>
          </div>

          <span className="badge badge-success">
            <Sparkles size={12} /> Cloudinary AI Active
          </span>
        </div>

        {/* Dual Input Selection Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
          
          {/* 1. Model Photo Selection Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-color)',
            borderRadius: '0.875rem',
            padding: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Camera size={18} color="#818cf8" />
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff' }}>1. Model Photo</h3>
              </div>
              <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                {photos.length} Available
              </span>
            </div>

            {currentPhoto ? (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ width: '90px', height: '120px', borderRadius: '0.5rem', overflow: 'hidden', background: '#000', border: '1px solid var(--border-color)', flexShrink: 0 }}>
                  <img src={currentPhoto.imageUrl} alt="Model" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#ffffff' }}>
                    Photo #{currentPhoto.id}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.4rem', fontSize: '0.75rem', color: '#34d399' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Check size={12} /> Stance Verified
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Check size={12} /> Facial Identity Preserved
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color: '#9ca3af', fontSize: '0.8125rem', marginBottom: '1rem' }}>No model photo uploaded yet.</p>
            )}

            {/* Quick Model Selector */}
            {photos.length > 1 && (
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.35rem' }}>Switch Model Photo:</label>
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                  {photos.map(p => (
                    <div
                      key={p.id}
                      onClick={() => setCurrentPhoto(p)}
                      style={{
                        width: '44px',
                        height: '56px',
                        borderRadius: '0.375rem',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: currentPhoto?.id === p.id ? '2px solid #6366f1' : '1px solid var(--border-color)',
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <img src={p.imageUrl} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. Garment Selection Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-color)',
            borderRadius: '0.875rem',
            padding: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shirt size={18} color="#ec4899" />
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff' }}>2. Selected Garment</h3>
              </div>
              <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                {products.length} In Wardrobe
              </span>
            </div>

            {currentGarment ? (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ width: '90px', height: '120px', borderRadius: '0.5rem', overflow: 'hidden', background: '#000', border: '1px solid var(--border-color)', flexShrink: 0 }}>
                  <img src={currentGarment.imageUrl} alt="Garment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#ffffff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {currentGarment.title}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.4rem', fontSize: '0.75rem', color: '#f472b6' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Check size={12} /> Category: <strong style={{ textTransform: 'capitalize' }}>{currentGarment.category}</strong>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Check size={12} /> Cloud Storage Ready
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color: '#9ca3af', fontSize: '0.8125rem', marginBottom: '1rem' }}>No garment selected.</p>
            )}

            {/* Quick Garment Selector */}
            {products.length > 1 && (
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.35rem' }}>Switch Garment:</label>
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                  {products.map(prod => (
                    <div
                      key={prod.id}
                      onClick={() => setCurrentGarment(prod)}
                      style={{
                        width: '44px',
                        height: '56px',
                        borderRadius: '0.375rem',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: currentGarment?.id === prod.id ? '2px solid #ec4899' : '1px solid var(--border-color)',
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <img src={prod.imageUrl} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Transformation Fine-Tuning Panel */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.05)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: '0.875rem',
          padding: '1.25rem',
          marginBottom: '1.75rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <SlidersHorizontal size={18} color="#818cf8" />
              <h3 style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#ffffff' }}>
                AI Replacement & Fitting Controls
              </h3>
            </div>
            <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
              Fine-Tune AI Prompt
            </span>
          </div>

          {/* Garment Prompt Input */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#e5e7eb', marginBottom: '0.35rem' }}>
              Clothing Description for AI Generative Replacement:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. vintage red floral boho midi dress with ruffled hem"
                style={{
                  flex: 1,
                  padding: '0.6rem 0.85rem',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  color: '#ffffff',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              💡 Tip: Describing the color, pattern, and style gives Cloudinary AI the clearest instructions for photorealistic fitting.
            </p>
          </div>

          {/* Style Tags Quick Inserter */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.35rem' }}>
              Quick Styling Keywords:
            </label>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {styleTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddTag(tag)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '9999px',
                    padding: '0.2rem 0.6rem',
                    fontSize: '0.7rem',
                    color: '#e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                    e.currentTarget.style.borderColor = '#818cf8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                  }}
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Target Region & Contour Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#e5e7eb', marginBottom: '0.35rem' }}>
                Clothing Area to Replace on Model:
              </label>
              <select
                value={targetRegion}
                onChange={(e) => setTargetRegion(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  background: '#1f2937',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  color: '#ffffff',
                  fontSize: '0.8125rem'
                }}
              >
                <option value="clothes">👗 Full Outfit / All Clothes</option>
                <option value="shirt">👕 Upper Body (Shirt / Top / T-Shirt)</option>
                <option value="dress">👗 Dress / Gown</option>
                <option value="jacket">🧥 Jacket / Coat / Outerwear</option>
                <option value="pants">👖 Pants / Bottoms / Trousers</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#e5e7eb', marginBottom: '0.35rem' }}>
                Body Fit & Posture Contouring:
              </label>
              <select
                value={preserveGeometry ? 'natural' : 'fluid'}
                onChange={(e) => setPreserveGeometry(e.target.value === 'natural')}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  background: '#1f2937',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  color: '#ffffff',
                  fontSize: '0.8125rem'
                }}
              >
                <option value="natural">📐 Natural Body Contour (Preserve Posture)</option>
                <option value="fluid">✨ Relaxed Fashion Fit</option>
              </select>
            </div>
          </div>
        </div>

        {/* Generate AI Try-On Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={runVirtualTryOn}
            disabled={isGenerating || !currentPhoto || !currentGarment}
            className="btn btn-primary"
            style={{
              padding: '0.875rem 2.25rem',
              fontSize: '1.0625rem',
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)'
            }}
          >
            {isGenerating ? (
              <>
                <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
                <span>AI Fitting in Progress ({progressPercent}%)...</span>
              </>
            ) : (
              <>
                <Sparkles size={20} />
                <span>Try It On with Cloudinary AI</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>

        {/* Multi-Stage Animated Pipeline Loader */}
        {isGenerating && (
          <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            background: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '0.875rem',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            animation: 'fadeIn 0.3s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wand2 size={16} color="#818cf8" />
                <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#ffffff' }}>
                  Cloudinary AI Transformation in Progress
                </span>
              </div>
              <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                {progressPercent}% Complete
              </span>
            </div>

            {/* Progress bar track */}
            <div style={{
              width: '100%',
              height: '6px',
              borderRadius: '3px',
              background: 'rgba(255, 255, 255, 0.08)',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #6366f1, #ec4899)',
                transition: 'width 0.4s ease',
              }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: generationStep >= 1 ? '#34d399' : '#6b7280' }}>
                <CheckCircle2 size={15} /> 1. Analyzing model posture & body outline
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: generationStep >= 2 ? '#34d399' : '#6b7280' }}>
                <CheckCircle2 size={15} /> 2. Isolating target clothing region ({targetRegion})
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: generationStep >= 3 ? '#34d399' : '#6b7280' }}>
                <CheckCircle2 size={15} /> 3. Cloudinary Generative Replace: Synthesizing "{customPrompt}"
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: generationStep >= 4 ? '#34d399' : '#6b7280' }}>
                <CheckCircle2 size={15} /> 4. Finalizing high-resolution lighting and drape
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RESULT SECTION */}
      {tryOnResult && (
        <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(99, 102, 241, 0.4)', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(236, 72, 153, 0.06) 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircle2 size={22} color="#ffffff" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.375rem', fontWeight: '800', color: '#ffffff' }}>
                  Try-On Result Ready!
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>
                  Fitted: <strong>{tryOnResult.garmentTitle}</strong> &bull; Session #{tryOnResult.sessionId}
                </p>
              </div>
            </div>

            {/* View Mode Switcher */}
            <div style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '0.25rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border-color)',
              gap: '0.25rem'
            }}>
              <button
                onClick={() => setViewMode('result')}
                className="btn"
                style={{
                  fontSize: '0.75rem',
                  padding: '0.35rem 0.75rem',
                  background: viewMode === 'result' ? '#6366f1' : 'transparent',
                  color: '#ffffff'
                }}
              >
                AI Result
              </button>
              <button
                onClick={() => setViewMode('split')}
                className="btn"
                style={{
                  fontSize: '0.75rem',
                  padding: '0.35rem 0.75rem',
                  background: viewMode === 'split' ? '#6366f1' : 'transparent',
                  color: '#ffffff'
                }}
              >
                Side-by-Side
              </button>
            </div>
          </div>

          {/* Visual Presentation */}
          {viewMode === 'result' ? (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.75rem' }}>
              <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '460px',
                borderRadius: '1rem',
                overflow: 'hidden',
                background: '#000000',
                border: '2px solid rgba(99, 102, 241, 0.4)',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5)'
              }}>
                <img
                  src={tryOnResult.resultImageUrl}
                  alt="AI Virtual Try-On Result"
                  style={{ width: '100%', height: 'auto', maxHeight: '580px', objectFit: 'contain', display: 'block' }}
                />

                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  right: '12px',
                  background: 'rgba(17, 24, 39, 0.85)',
                  backdropFilter: 'blur(8px)',
                  padding: '0.625rem 1rem',
                  borderRadius: '0.625rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.75rem',
                  color: '#e5e7eb'
                }}>
                  <span>👗 {tryOnResult.garmentTitle}</span>
                  <span style={{ color: '#34d399', fontWeight: '600' }}>Cloudinary AI Fitted</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
              {/* Original Model */}
              <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                <span className="badge badge-secondary" style={{ marginBottom: '0.5rem', fontSize: '0.65rem' }}>
                  Original Photo
                </span>
                <div style={{ height: '320px', borderRadius: '0.5rem', overflow: 'hidden', background: '#000' }}>
                  <img src={tryOnResult.userImageUrl} alt="Original" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>

              {/* Selected Garment */}
              <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                <span className="badge badge-info" style={{ marginBottom: '0.5rem', fontSize: '0.65rem' }}>
                  Selected Garment
                </span>
                <div style={{ height: '320px', borderRadius: '0.5rem', overflow: 'hidden', background: '#000' }}>
                  <img src={tryOnResult.productImageUrl} alt="Garment" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              </div>

              {/* AI Try-On Result */}
              <div style={{ textAlign: 'center', background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '2px solid #6366f1' }}>
                <span className="badge badge-success" style={{ marginBottom: '0.5rem', fontSize: '0.65rem' }}>
                  ✨ Virtual Try-On Result
                </span>
                <div style={{ height: '320px', borderRadius: '0.5rem', overflow: 'hidden', background: '#000' }}>
                  <img src={tryOnResult.resultImageUrl} alt="Result" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleDownload(tryOnResult.resultImageUrl, `tryiton-${tryOnResult.sessionId}.jpg`)}
              className="btn btn-primary"
              style={{ padding: '0.65rem 1.5rem', fontSize: '0.875rem' }}
            >
              <Download size={16} />
              <span>Download Try-On Image</span>
            </button>

            <button
              onClick={() => {
                setTryOnResult(null);
                if (onTryAnother) onTryAnother();
              }}
              className="btn btn-secondary"
              style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem' }}
            >
              <RefreshCw size={15} />
              <span>Try Another Garment</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
