import React, { useState, useRef, useEffect } from 'react';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { SkeletonGrid } from '../common/Skeleton';
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Trash2, 
  Check, 
  Camera, 
  Info, 
  ShieldCheck, 
  User,
  Plus
} from 'lucide-react';

export default function PhotoUploader({ onPhotoSelected, currentActivePhoto }) {
  const { success, error, info } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [photosList, setPhotosList] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);

  const fileInputRef = useRef(null);

  // Fetch existing user photos
  const fetchPhotos = async () => {
    try {
      setLoadingPhotos(true);
      const res = await api.get('/photos');
      const photos = res.data.photos || [];
      setPhotosList(photos);
      const active = photos.find(p => p.isActive) || photos[0];
      if (active && onPhotoSelected) {
        onPhotoSelected(active);
      }
    } catch (err) {
      console.warn('[PhotoUploader] Failed to fetch photos:', err.message);
    } finally {
      setLoadingPhotos(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  // Validate and stage file for preview
  const handleFile = (file) => {
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      error('Unsupported format. Please upload a JPG, PNG, or WEBP photograph.');
      return;
    }

    // Validate size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      error('Image size exceeds 10MB limit. Please upload a smaller file.');
      return;
    }

    setSelectedFile(file);
    setFileDetails({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: file.type.split('/')[1].toUpperCase(),
    });

    // Create local object URL for instant preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    info('Photograph staged for upload. Click "Save as Model Photo" to finalize.');
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemoveSelection = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileDetails(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await api.post('/photos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newPhoto = response.data.photo;
      success('Photograph uploaded and saved to trial room successfully!');
      handleRemoveSelection();
      await fetchPhotos();
      if (onPhotoSelected) {
        onPhotoSelected(newPhoto);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to upload photo';
      error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleSetActive = async (photoId) => {
    try {
      await api.put(`/photos/${photoId}/active`);
      success('Active model photo updated!');
      await fetchPhotos();
    } catch (err) {
      error('Failed to switch active model photo');
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('Are you sure you want to delete this photo from your wardrobe profile?')) return;
    try {
      await api.delete(`/photos/${photoId}`);
      success('Photo deleted from gallery.');
      await fetchPhotos();
    } catch (err) {
      error('Failed to delete photo');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Upload Zone Card */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Camera size={22} color="#818cf8" />
              <h2 style={{ fontSize: '1.375rem', fontWeight: '800', color: '#ffffff' }}>
                Upload Your Photograph
              </h2>
            </div>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
              Upload a clear front-facing portrait to serve as your personal virtual trial model.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-info">
              <ShieldCheck size={12} /> Secure Cloud Storage
            </span>
          </div>
        </div>

        {/* File Drag and Drop / Preview Container */}
        {!previewUrl ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            style={{
              border: dragActive ? '2px dashed #6366f1' : '2px dashed var(--border-color)',
              background: dragActive ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.02)',
              borderRadius: '1rem',
              padding: '3rem 1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleInputChange}
              style={{ display: 'none' }}
            />
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.2)',
            }}>
              <Upload size={28} color="#818cf8" />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#f3f4f6', marginBottom: '0.5rem' }}>
              Drag & Drop your photo here, or <span style={{ color: '#818cf8', textDecoration: 'underline' }}>browse</span>
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#9ca3af', maxWidth: '400px', margin: '0 auto' }}>
              Supports JPG, PNG, and WEBP formats up to 10MB in resolution.
            </p>
          </div>
        ) : (
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '1rem',
            border: '1px solid var(--border-color)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Image Preview Box */}
              <div style={{
                position: 'relative',
                width: '160px',
                height: '210px',
                borderRadius: '0.75rem',
                overflow: 'hidden',
                background: '#000000',
                border: '1px solid var(--border-color)',
                flexShrink: 0
              }}>
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Staged File Information */}
              <div style={{ flex: 1, minWidth: '220px' }}>
                <div className="badge badge-info" style={{ marginBottom: '0.5rem' }}>
                  Staged for Upload
                </div>
                <h4 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.25rem', wordBreak: 'break-all' }}>
                  {fileDetails?.name}
                </h4>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem', color: '#9ca3af', marginBottom: '1.25rem' }}>
                  <span>Size: <strong style={{ color: '#e5e7eb' }}>{fileDetails?.size}</strong></span>
                  <span>Format: <strong style={{ color: '#e5e7eb' }}>{fileDetails?.type}</strong></span>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="btn btn-primary"
                    style={{ padding: '0.625rem 1.25rem' }}
                  >
                    {uploading ? (
                      <>
                        <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                        <span>Uploading to Cloudinary...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        <span>Save as My Model Photo</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    disabled={uploading}
                    className="btn btn-secondary"
                    style={{ padding: '0.625rem 1rem' }}
                  >
                    <RefreshCw size={15} />
                    <span>Replace</span>
                  </button>

                  <button
                    onClick={handleRemoveSelection}
                    disabled={uploading}
                    className="btn btn-secondary"
                    style={{ padding: '0.625rem 1rem', color: '#f87171' }}
                  >
                    <X size={15} />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Photo Guidelines helper */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem 1.25rem',
          background: 'rgba(99, 102, 241, 0.05)',
          borderRadius: '0.75rem',
          border: '1px solid rgba(99, 102, 241, 0.15)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          fontSize: '0.8125rem',
          color: '#cbd5e1'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span><strong>Good Lighting:</strong> Well-lit natural light without harsh shadows.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span><strong>Clear Stance:</strong> Facing forward with visible torso/shoulders.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span><strong>Clean Background:</strong> Solid or uncluttered background works best.</span>
          </div>
        </div>
      </div>

      {/* Model Photos Gallery Section */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#ffffff' }}>
              Your Saved Model Photos ({photosList.length})
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>
              Select which photo to use as your active model for virtual trials
            </p>
          </div>
          <button
            onClick={fetchPhotos}
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
          >
            <RefreshCw size={13} style={{ animation: loadingPhotos ? 'spin 1s linear infinite' : 'none' }} />
            <span>Refresh</span>
          </button>
        </div>

        {loadingPhotos ? (
          <SkeletonGrid count={3} cardHeight="260px" />
        ) : photosList.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2.5rem 1rem',
            border: '1px dashed var(--border-color)',
            borderRadius: '0.75rem',
            color: '#9ca3af'
          }}>
            <User size={36} color="#6b7280" style={{ margin: '0 auto 0.75rem' }} />
            <h4 style={{ color: '#e5e7eb', fontWeight: '600', marginBottom: '0.25rem' }}>No Model Photos Yet</h4>
            <p style={{ fontSize: '0.8125rem', marginBottom: '1rem' }}>
              Upload your first photograph above to unlock the virtual trial fitting room!
            </p>
            <button
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="btn btn-primary"
              style={{ fontSize: '0.8125rem', padding: '0.5rem 1.25rem' }}
            >
              <Plus size={14} />
              <span>Upload Photo Now</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.25rem' }}>
            {photosList.map((photo) => (
              <div
                key={photo.id}
                style={{
                  position: 'relative',
                  borderRadius: '0.875rem',
                  overflow: 'hidden',
                  background: '#111827',
                  border: photo.isActive ? '2px solid #6366f1' : '1px solid var(--border-color)',
                  boxShadow: photo.isActive ? '0 0 16px rgba(99, 102, 241, 0.4)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Image */}
                <div style={{ height: '220px', width: '100%', background: '#000' }}>
                  <img
                    src={photo.imageUrl}
                    alt={`Model #${photo.id}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Top badges */}
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
                  {photo.isActive && (
                    <span className="badge badge-success" style={{ fontSize: '0.65rem', pointerEvents: 'auto' }}>
                      <Check size={10} /> Active Model
                    </span>
                  )}
                </div>

                {/* Action footer */}
                <div style={{
                  padding: '0.75rem',
                  background: 'rgba(17, 24, 39, 0.95)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  {!photo.isActive ? (
                    <button
                      onClick={() => handleSetActive(photo.id)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', flex: 1 }}
                    >
                      Set Active
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: '600' }}>
                      In Use
                    </span>
                  )}

                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#9ca3af',
                      cursor: 'pointer',
                      padding: '0.35rem',
                      borderRadius: '0.375rem',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Delete Photo"
                  >
                    <Trash2 size={15} color="#ef4444" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
