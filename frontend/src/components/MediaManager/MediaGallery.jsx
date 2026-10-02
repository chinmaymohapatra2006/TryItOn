import React, { useState, useEffect } from 'react';
import { fetchMediaAssets, fetchCloudinaryStatus } from '../../services/mediaApi.js';
import MediaUploadModal from './MediaUploadModal.jsx';
import { Cloud, UploadCloud, RefreshCw, Image as ImageIcon, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const MediaGallery = () => {
  const [assets, setAssets] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [mediaList, statusInfo] = await Promise.all([
      fetchMediaAssets(),
      fetchCloudinaryStatus()
    ]);
    setAssets(mediaList);
    setStatus(statusInfo);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUploadSuccess = (newAsset) => {
    setAssets((prev) => [newAsset, ...prev]);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cloud className="w-5 h-5 text-indigo-400" />
            Cloudinary Media Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Optimized image delivery, automated thumbnail generation, and costume asset storage.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            title="Refresh Media"
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Media</span>
          </button>
        </div>
      </div>

      {/* Cloudinary Integration Status Bar */}
      <div className="my-5 p-4 rounded-xl bg-slate-950/60 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Cloud className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Engine Provider</span>
            <p className="font-semibold text-white capitalize">
              {status?.cloudinary?.provider === 'cloudinary' ? 'Cloudinary Cloud' : 'Secure Fallback Engine'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Credentials Security</span>
            <p className="font-semibold text-emerald-400">Secret Protected (Backend Only)</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Dynamic Thumbnails</span>
            <p className="font-semibold text-slate-200">c_fill 300x300 Auto-Optimized</p>
          </div>
        </div>
      </div>

      {/* Media Thumbnails Grid */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-2" />
          <span>Retrieving assets from media storage...</span>
        </div>
      ) : assets.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-xs">
          <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <span>No media assets found. Click "Upload Media" to add your first costume photo!</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {assets.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              {/* Thumbnail Display */}
              <div className="relative aspect-square w-full overflow-hidden bg-slate-900">
                <img
                  src={item.thumbnail_url || item.url}
                  alt={item.metadata?.title || 'Costume media'}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-slate-950/80 backdrop-blur text-[10px] font-semibold text-purple-300 uppercase">
                  {item.format || 'jpg'}
                </span>
              </div>

              {/* Card Meta */}
              <div className="p-3">
                <h4 className="text-xs font-bold text-white truncate">
                  {item.metadata?.title || item.public_id.split('/').pop()}
                </h4>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span>{item.category}</span>
                  {item.bytes > 0 && <span>{(item.bytes / 1024).toFixed(0)} KB</span>}
                </div>
              </div>

              {/* View Original Link Overlay */}
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-xs text-white font-semibold transition-opacity backdrop-blur-sm"
              >
                <span>View Full Asset</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <MediaUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default MediaGallery;
