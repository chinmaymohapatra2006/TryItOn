import React, { useState, useRef, useEffect } from 'react';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { SkeletonGrid } from '../common/Skeleton';
import { 
  Shirt, 
  Upload, 
  Link as LinkIcon, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Trash2, 
  Plus, 
  Check, 
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function ProductInput({ onProductSelected, selectedProduct }) {
  const { success, error, info } = useToast();
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'url'
  
  // Method A state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileTitle, setFileTitle] = useState('');
  const [fileCategory, setFileCategory] = useState('top');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Method B state
  const [productUrl, setProductUrl] = useState('');
  const [urlTitle, setUrlTitle] = useState('');
  const [urlCategory, setUrlCategory] = useState('dress');
  const [isExtracting, setIsExtracting] = useState(false);

  // Products list
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const fileInputRef = useRef(null);

  const categories = [
    { id: 'top', label: 'Top / Shirt' },
    { id: 'tshirt', label: 'T-Shirt' },
    { id: 'dress', label: 'Dress' },
    { id: 'jacket', label: 'Jacket / Coat' },
    { id: 'kurta', label: 'Kurta / Traditional' },
    { id: 'bottom', label: 'Pants / Bottom' },
    { id: 'garment', label: 'Other Garment' },
  ];

  // Curated demo garments
  const sampleGarments = [
    {
      title: 'Vintage Floral Summer Dress',
      category: 'dress',
      imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80',
    },
    {
      title: 'Classic Denim Street Jacket',
      category: 'jacket',
      imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80',
    },
    {
      title: 'Casual Minimalist Cotton Tee',
      category: 'tshirt',
      imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
    },
    {
      title: 'Urban Oversized Hoodie',
      category: 'outerwear',
      imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80',
    },
  ];

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await api.get('/products');
      setProducts(res.data.products || []);
    } catch (err) {
      console.warn('[ProductInput] Failed to load products:', err.message);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Method A Handlers
  const handleFileChange = (file) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      error('Please provide a JPG, PNG, or WEBP garment image.');
      return;
    }

    setSelectedFile(file);
    setFileTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    setPreviewUrl(URL.createObjectURL(file));
    info('Garment image staged. Click "Save to Wardrobe" to finalize.');
  };

  const handleUploadGarment = async () => {
    if (!selectedFile) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('title', fileTitle || 'Garment Piece');
    formData.append('category', fileCategory);

    try {
      const res = await api.post('/products/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      success(`Garment "${res.data.product.title}" saved to your wardrobe!`);
      setSelectedFile(null);
      setPreviewUrl(null);
      setFileTitle('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchProducts();
      if (onProductSelected) onProductSelected(res.data.product);
    } catch (err) {
      error(err.response?.data?.message || err.message || 'Failed to upload garment');
    } finally {
      setIsUploading(false);
    }
  };

  // Method B Handlers
  const handleExtractUrl = async () => {
    if (!productUrl.trim()) {
      error('Please enter a product URL to scrape.');
      return;
    }

    setIsExtracting(true);

    try {
      const res = await api.post('/products/extract-url', {
        url: productUrl.trim(),
        title: urlTitle.trim() || undefined,
        category: urlCategory,
      });

      success(`Garment successfully extracted from URL: "${res.data.product.title}"`);
      setProductUrl('');
      setUrlTitle('');
      await fetchProducts();
      if (onProductSelected) onProductSelected(res.data.product);
    } catch (err) {
      error(err.response?.data?.message || err.message || 'Failed to extract product from URL');
    } finally {
      setIsExtracting(false);
    }
  };

  // Preset sample loader
  const handleImportSample = async (sample) => {
    setIsExtracting(true);

    try {
      const res = await api.post('/products/extract-url', {
        url: sample.imageUrl,
        title: sample.title,
        category: sample.category,
      });

      success(`Sample garment added: "${sample.title}"`);
      await fetchProducts();
      if (onProductSelected) onProductSelected(res.data.product);
    } catch (err) {
      error(err.response?.data?.message || err.message || 'Failed to import sample');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Remove this garment from your wardrobe?')) return;
    try {
      await api.delete(`/products/${id}`);
      success('Garment removed from wardrobe.');
      await fetchProducts();
    } catch (err) {
      error('Failed to delete product');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Product Input Section */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Shirt size={22} color="#ec4899" />
              <h2 style={{ fontSize: '1.375rem', fontWeight: '800', color: '#ffffff' }}>
                Add Clothing & Garments
              </h2>
            </div>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
              Choose your preferred method: Upload a clothing image or paste a shopping product link.
            </p>
          </div>

          {/* Method Toggle Buttons */}
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '0.25rem',
            borderRadius: '0.625rem',
            border: '1px solid var(--border-color)'
          }}>
            <button
              onClick={() => setActiveTab('upload')}
              className="btn"
              style={{
                fontSize: '0.8125rem',
                padding: '0.4rem 0.85rem',
                background: activeTab === 'upload' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
                color: activeTab === 'upload' ? '#ffffff' : '#9ca3af',
              }}
            >
              <Upload size={14} />
              <span>Method A: Upload Image</span>
            </button>

            <button
              onClick={() => setActiveTab('url')}
              className="btn"
              style={{
                fontSize: '0.8125rem',
                padding: '0.4rem 0.85rem',
                background: activeTab === 'url' ? 'linear-gradient(135deg, #ec4899, #db2777)' : 'transparent',
                color: activeTab === 'url' ? '#ffffff' : '#9ca3af',
              }}
            >
              <LinkIcon size={14} />
              <span>Method B: Product URL</span>
            </button>
          </div>
        </div>

        {/* METHOD A: UPLOAD GARMENT IMAGE */}
        {activeTab === 'upload' && (
          <div>
            {!previewUrl ? (
              <div
                onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
                }}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                style={{
                  border: dragActive ? '2px dashed #6366f1' : '2px dashed var(--border-color)',
                  background: dragActive ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '1rem',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginBottom: '1.5rem'
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                  style={{ display: 'none' }}
                />
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(99, 102, 241, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.2)',
                }}>
                  <Shirt size={26} color="#818cf8" />
                </div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: '700', color: '#f3f4f6', marginBottom: '0.35rem' }}>
                  Upload clothing photo (shirt, dress, kurta, etc.)
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>
                  Drag & drop or click to browse JPG, PNG, WEBP files
                </p>
              </div>
            ) : (
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '0.75rem',
                border: '1px solid var(--border-color)',
                padding: '1.25rem',
                display: 'flex',
                gap: '1.5rem',
                alignItems: 'center',
                flexWrap: 'wrap',
                marginBottom: '1.5rem'
              }}>
                <div style={{ width: '130px', height: '160px', borderRadius: '0.5rem', overflow: 'hidden', background: '#000', flexShrink: 0 }}>
                  <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                <div style={{ flex: 1, minWidth: '220px' }}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#9ca3af', marginBottom: '0.25rem' }}>
                      Garment Title
                    </label>
                    <input
                      type="text"
                      value={fileTitle}
                      onChange={(e) => setFileTitle(e.target.value)}
                      placeholder="e.g. Navy Blue Cotton Shirt"
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.375rem',
                        color: '#ffffff',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#9ca3af', marginBottom: '0.25rem' }}>
                      Category
                    </label>
                    <select
                      value={fileCategory}
                      onChange={(e) => setFileCategory(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        background: '#1f2937',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.375rem',
                        color: '#ffffff',
                        fontSize: '0.875rem'
                      }}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={handleUploadGarment}
                      disabled={isUploading}
                      className="btn btn-primary"
                      style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
                    >
                      {isUploading ? 'Uploading...' : 'Save to Wardrobe'}
                    </button>
                    <button
                      onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                      disabled={isUploading}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.8125rem', padding: '0.5rem 0.75rem' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* METHOD B: EXTRACT FROM PRODUCT URL */}
        {activeTab === 'url' && (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '600', color: '#e5e7eb', marginBottom: '0.5rem' }}>
                Paste Shopping Product URL
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                  <LinkIcon size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="url"
                    value={productUrl}
                    onChange={(e) => setProductUrl(e.target.value)}
                    placeholder="https://www.example.com/product/floral-dress..."
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.75rem 0.625rem 2.25rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.5rem',
                      color: '#ffffff',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <select
                  value={urlCategory}
                  onChange={(e) => setUrlCategory(e.target.value)}
                  style={{
                    padding: '0.625rem 0.75rem',
                    background: '#1f2937',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.5rem',
                    color: '#ffffff',
                    fontSize: '0.875rem'
                  }}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>

                <button
                  onClick={handleExtractUrl}
                  disabled={isExtracting}
                  className="btn btn-primary"
                  style={{ background: 'linear-gradient(135deg, #ec4899, #db2777)', padding: '0.625rem 1.25rem' }}
                >
                  {isExtracting ? (
                    <>
                      <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Extracting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      <span>Extract Garment</span>
                    </>
                  )}
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                Our automated scraper will analyze OpenGraph tags, JSON-LD schema, and download the primary garment image.
              </p>
            </div>
          </div>
        )}

        {/* Curated Presets Bar */}
        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', color: '#cbd5e1', fontWeight: '600' }}>
              ✨ Or Try A Ready-Made Sample Garment:
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
            {sampleGarments.map((sample, idx) => (
              <div
                key={idx}
                onClick={() => handleImportSample(sample)}
                className="glass-card-interactive"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <img
                  src={sample.imageUrl}
                  alt={sample.title}
                  style={{ width: '36px', height: '44px', objectFit: 'cover', borderRadius: '0.25rem' }}
                />
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#ffffff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {sample.title}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#ec4899', textTransform: 'capitalize' }}>
                    {sample.category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wardrobe Products Gallery */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#ffffff' }}>
              Your Garment Wardrobe ({products.length})
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>
              Select a garment below to pair with your model photo in the virtual trial room
            </p>
          </div>
          <button
            onClick={fetchProducts}
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
          >
            <RefreshCw size={13} style={{ animation: loadingProducts ? 'spin 1s linear infinite' : 'none' }} />
            <span>Refresh</span>
          </button>
        </div>

        {loadingProducts ? (
          <SkeletonGrid count={3} cardHeight="260px" />
        ) : products.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2.5rem 1rem',
            border: '1px dashed var(--border-color)',
            borderRadius: '0.75rem',
            color: '#9ca3af'
          }}>
            <Shirt size={36} color="#6b7280" style={{ margin: '0 auto 0.75rem' }} />
            <h4 style={{ color: '#e5e7eb', fontWeight: '600', marginBottom: '0.25rem' }}>Your Wardrobe is Empty</h4>
            <p style={{ fontSize: '0.8125rem', marginBottom: '1rem' }}>
              Add your first clothing piece via Method A (image upload) or Method B (URL paste) above.
            </p>
            <button
              onClick={() => setActiveTab('upload')}
              className="btn btn-primary"
              style={{ fontSize: '0.8125rem', padding: '0.5rem 1.25rem' }}
            >
              <Plus size={14} />
              <span>Add Clothing Item</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '1.25rem' }}>
            {products.map((item) => {
              const isSelected = selectedProduct && selectedProduct.id === item.id;
              return (
                <div
                  key={item.id}
                  style={{
                    position: 'relative',
                    borderRadius: '0.875rem',
                    overflow: 'hidden',
                    background: '#111827',
                    border: isSelected ? '2px solid #ec4899' : '1px solid var(--border-color)',
                    boxShadow: isSelected ? '0 0 16px rgba(236, 72, 153, 0.4)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Garment Image */}
                  <div style={{ height: '200px', width: '100%', background: '#000' }}>
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  {/* Top Badges */}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    right: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pointerEvents: 'none'
                  }}>
                    <span className="badge badge-info" style={{ fontSize: '0.65rem', textTransform: 'capitalize' }}>
                      {item.category}
                    </span>
                    <span className="badge badge-secondary" style={{ fontSize: '0.6rem' }}>
                      {item.sourceType === 'url' ? 'URL' : 'Upload'}
                    </span>
                  </div>

                  {/* Body & Actions */}
                  <div style={{ padding: '0.875rem' }}>
                    <h4 style={{
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      color: '#ffffff',
                      marginBottom: '0.75rem',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden'
                    }}>
                      {item.title}
                    </h4>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button
                        onClick={() => onProductSelected && onProductSelected(item)}
                        className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.4rem 0.65rem',
                          flex: 1,
                          background: isSelected ? 'linear-gradient(135deg, #ec4899, #db2777)' : undefined
                        }}
                      >
                        {isSelected ? (
                          <>
                            <Check size={12} />
                            <span>Selected</span>
                          </>
                        ) : (
                          <span>Select Garment</span>
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteProduct(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#9ca3af',
                          cursor: 'pointer',
                          padding: '0.35rem',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Delete Garment"
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
    </div>
  );
}
