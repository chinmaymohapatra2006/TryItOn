import React, { useState } from 'react';
import { uploadMediaAsset } from '../../services/mediaApi.js';
import { COSTUME_CATALOG } from '../../config/costumeMetadata.js';
import { UploadCloud, X, CheckCircle2, AlertCircle, Loader2, Key } from 'lucide-react';

export const MediaUploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('costume');
  const [costumeId, setCostumeId] = useState('kurta-female');
  const [authKey, setAuthKey] = useState('tryiton_secure_media_token_2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (!selected.type.startsWith('image/')) {
        setError('Only image files (JPEG, PNG, WebP) are allowed.');
        return;
      }
      setFile(selected);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selected);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an image file to upload.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title || file.name);
      formData.append('category', category);
      formData.append('costumeId', costumeId);

      const uploadedAsset = await uploadMediaAsset(formData, authKey);
      setSuccess('Media uploaded & optimized thumbnail generated successfully!');
      if (onUploadSuccess) {
        onUploadSuccess(uploadedAsset);
      }
      setTimeout(() => {
        setFile(null);
        setPreview(null);
        setTitle('');
        setSuccess(null);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Upload Media to Cloudinary</h3>
              <p className="text-[11px] text-slate-400">Secure backend asset storage & dynamic thumbnail generation.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* File Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Costume Image File
            </label>
            <div className="border-2 border-dashed border-slate-700 hover:border-purple-500/50 rounded-xl p-4 text-center cursor-pointer transition-colors relative bg-slate-950/40">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {preview ? (
                <div className="flex items-center justify-center gap-4">
                  <img src={preview} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-slate-700 shadow-md" />
                  <div className="text-left text-xs">
                    <p className="font-semibold text-white truncate max-w-[200px]">{file.name}</p>
                    <p className="text-slate-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                    <span className="text-purple-400 text-[11px] hover:underline mt-1 inline-block">Change file</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-2">
                  <UploadCloud className="w-8 h-8 text-slate-500 mb-1" />
                  <span className="text-xs font-medium text-slate-300">Click to choose image or drag & drop</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">JPEG, PNG, WebP up to 10MB</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                Title / Label
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Kurta Front Studio Shot"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                Attach to Costume
              </label>
              <select
                value={costumeId}
                onChange={(e) => setCostumeId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                {COSTUME_CATALOG.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Security Authorization Key (Protected Operations Test) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Key className="w-3 h-3 text-purple-400" />
                <span>Backend Authorization Key</span>
              </label>
              <span className="text-[10px] text-slate-500">Required by protected API</span>
            </div>
            <input
              type="password"
              value={authKey}
              onChange={(e) => setAuthKey(e.target.value)}
              placeholder="Authorization key"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Tip: Modify this key to test that unauthorized users are rejected with HTTP 401.
            </p>
          </div>

          {/* Status feedback */}
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/25 transition-all disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{loading ? 'Uploading...' : 'Upload & Generate Thumbnail'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MediaUploadModal;
