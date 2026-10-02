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
    <div className="bg-white border border-[#E9E1D6] rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E8DFC8]">
        <div>
          <h2 className="font-serif text-xl font-medium text-[#1C1917] flex items-center gap-2">
            <Cloud className="w-5 h-5 text-[#8C6D58]" />
            Cloudinary Media Pipeline
          </h2>
          <p className="text-xs text-[#6E5341] mt-1">
            Optimized image delivery, automated thumbnail generation, and costume asset storage.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            title="Refresh Media"
            className="p-2 rounded-full bg-[#FAF7F2] border border-[#E7DEC8] hover:border-[#8C6D58] text-[#1C1917] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#8C6D58]' : ''}`} />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#1C1917] hover:bg-[#2E2824] text-white text-xs font-semibold uppercase tracking-wider shadow transition-all"
          >
            <UploadCloud className="w-4 h-4 text-[#D5C4A1]" />
            <span>Upload Media</span>
          </button>
        </div>
      </div>

      {/* Cloudinary Integration Status Bar */}
      <div className="my-5 p-4 rounded-xl bg-[#FAF7F2] border border-[#E9E1D6] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white border border-[#E8DFC8] flex items-center justify-center text-[#8C6D58] shadow-xs">
            <Cloud className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#6E5341]">Engine Provider</span>
            <p className="font-semibold text-[#1C1917] capitalize">
              {status?.cloudinary?.provider === 'cloudinary' ? 'Cloudinary Cloud' : 'Secure Fallback Engine'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white border border-[#E8DFC8] flex items-center justify-center text-emerald-700 shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#6E5341]">Credentials Security</span>
            <p className="font-semibold text-emerald-800">Backend Isolated (Zero Exposure)</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white border border-[#E8DFC8] flex items-center justify-center text-[#8C6D58] shadow-xs">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#6E5341]">Dynamic Thumbnails</span>
            <p className="font-semibold text-[#1C1917]">c_fill 300x300 Auto-Optimized</p>
          </div>
        </div>
      </div>

      {/* Media Thumbnails Grid */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-[#6E5341] text-xs">
          <div className="w-6 h-6 border-2 border-[#8C6D58] border-t-transparent rounded-full animate-spin mb-2" />
          <span>Retrieving assets from media storage...</span>
        </div>
      ) : assets.length === 0 ? (
        <div className="py-12 text-center text-[#6E5341] text-xs">
          <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <span>No media assets found. Click "Upload Media" to add your first costume photo!</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {assets.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#E9E1D6] hover:border-[#8C6D58] hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Thumbnail Display */}
              <div className="relative aspect-square w-full overflow-hidden bg-[#F3EDE2]">
                <img
                  src={item.thumbnail_url || item.url}
                  alt={item.metadata?.title || 'Costume media'}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur text-[10px] font-semibold text-[#1C1917] uppercase shadow-xs">
                  {item.format || 'jpg'}
                </span>
              </div>

              {/* Card Meta */}
              <div className="p-3">
                <h4 className="text-xs font-semibold text-[#1C1917] truncate">
                  {item.metadata?.title || item.public_id?.split('/')?.pop() || 'Costume Asset'}
                </h4>
                <div className="flex items-center justify-between text-[10px] text-[#6E5341] mt-1">
                  <span>{item.category}</span>
                  {item.bytes > 0 && <span>{(item.bytes / 1024).toFixed(0)} KB</span>}
                </div>
              </div>

              {/* View Original Link Overlay */}
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="absolute inset-0 bg-[#1C1917]/70 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-xs text-white font-semibold transition-opacity backdrop-blur-xs"
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
