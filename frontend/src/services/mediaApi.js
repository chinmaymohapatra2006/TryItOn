const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Fetch all media assets or filter by category
 */
export const fetchMediaAssets = async (category = null) => {
  try {
    const url = category ? `${API_BASE_URL}/media?category=${encodeURIComponent(category)}` : `${API_BASE_URL}/media`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch media assets`);
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error('Error fetching media assets:', error);
    return [];
  }
};

/**
 * Fetch Cloudinary service status and configuration info
 */
export const fetchCloudinaryStatus = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/media/status`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch media status`);
    return await res.json();
  } catch (error) {
    return {
      status: 'error',
      cloudinary: { configured: false, provider: 'offline' }
    };
  }
};

/**
 * Upload an image asset to Cloudinary through the secure backend proxy
 */
export const uploadMediaAsset = async (formData, authKey = 'tryiton_secure_media_token_2026') => {
  const res = await fetch(`${API_BASE_URL}/media/upload`, {
    method: 'POST',
    headers: {
      'x-api-key': authKey,
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Upload failed with HTTP ${res.status}`);
  }

  return data.data;
};

export default {
  fetchMediaAssets,
  fetchCloudinaryStatus,
  uploadMediaAsset,
};
