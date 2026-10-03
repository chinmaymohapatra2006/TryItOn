import React from 'react';
import { AlertCircle, RefreshCw, Upload, Link as LinkIcon, ShieldAlert } from 'lucide-react';

export default function ErrorFeedback({ error, errorType = 'GENERAL', onRetry, onSwitchAction }) {
  if (!error) return null;

  const getErrorMeta = () => {
    switch (errorType) {
      case 'UPLOAD_FAILED':
        return {
          title: 'Image Upload Interrupted',
          actionText: 'Choose Another Image',
          icon: <Upload size={20} color="#ef4444" />,
          suggestion: 'Ensure your image is in JPG, PNG, or WEBP format and under 10MB.',
        };
      case 'PRODUCT_EXTRACTION_FAILED':
        return {
          title: 'Product URL Extraction Failed',
          actionText: 'Upload Image Directly',
          icon: <LinkIcon size={20} color="#ef4444" />,
          suggestion: 'The shopping site might have strict anti-scraping protections. You can save the product photo and upload it directly.',
        };
      case 'CLOUDINARY_FAILED':
        return {
          title: 'Cloudinary AI Service Notice',
          actionText: 'Retry Processing',
          icon: <ShieldAlert size={20} color="#f59e0b" />,
          suggestion: 'Check your Cloudinary credentials in .env or try a different garment.',
        };
      case 'TIMEOUT':
        return {
          title: 'Request Timed Out',
          actionText: 'Retry Now',
          icon: <RefreshCw size={20} color="#f59e0b" />,
          suggestion: 'The AI generation pipeline is taking longer than usual. Please retry.',
        };
      default:
        return {
          title: 'Operation Failed',
          actionText: 'Retry',
          icon: <AlertCircle size={20} color="#ef4444" />,
          suggestion: 'Please verify your inputs and try again.',
        };
    }
  };

  const meta = getErrorMeta();

  return (
    <div style={{
      background: 'rgba(239, 68, 68, 0.12)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: '0.75rem',
      padding: '1.25rem',
      display: 'flex',
      gap: '1rem',
      alignItems: 'flex-start',
      marginBottom: '1.5rem'
    }}>
      <div style={{ marginTop: '2px', flexShrink: 0 }}>
        {meta.icon}
      </div>

      <div style={{ flex: 1 }}>
        <h4 style={{ color: '#f87171', fontWeight: '700', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>
          {meta.title}
        </h4>
        <p style={{ color: '#fca5a5', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
          {typeof error === 'string' ? error : error.message}
        </p>
        <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
          💡 {meta.suggestion}
        </p>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {onRetry && (
            <button
              onClick={onRetry}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
            >
              <RefreshCw size={13} />
              <span>Retry</span>
            </button>
          )}

          {onSwitchAction && (
            <button
              onClick={onSwitchAction}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
            >
              <span>{meta.actionText}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
