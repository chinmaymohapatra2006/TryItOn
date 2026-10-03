import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4500 }) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    const newToast = { id, type, title, message };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  const success = useCallback((message, title = 'Success') => {
    return addToast({ type: 'success', title, message });
  }, [addToast]);

  const error = useCallback((message, title = 'Error') => {
    return addToast({ type: 'error', title, message });
  }, [addToast]);

  const warning = useCallback((message, title = 'Warning') => {
    return addToast({ type: 'warning', title, message });
  }, [addToast]);

  const info = useCallback((message, title = 'Notice') => {
    return addToast({ type: 'info', title, message });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      
      {/* Toast Render Viewport */}
      <div 
        role="region"
        aria-label="Notifications"
        style={{
          position: 'fixed',
          top: '1.25rem',
          right: '1.25rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          maxWidth: '420px',
          width: 'calc(100vw - 2.5rem)',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => {
          const typeStyles = {
            success: {
              border: '1px solid rgba(16, 185, 129, 0.4)',
              bg: 'rgba(6, 44, 31, 0.92)',
              glow: 'rgba(16, 185, 129, 0.25)',
              icon: <CheckCircle2 size={18} color="#34d399" />,
              titleColor: '#34d399',
            },
            error: {
              border: '1px solid rgba(239, 68, 68, 0.4)',
              bg: 'rgba(50, 16, 16, 0.92)',
              glow: 'rgba(239, 68, 68, 0.25)',
              icon: <AlertCircle size={18} color="#f87171" />,
              titleColor: '#f87171',
            },
            warning: {
              border: '1px solid rgba(245, 158, 11, 0.4)',
              bg: 'rgba(45, 30, 8, 0.92)',
              glow: 'rgba(245, 158, 11, 0.25)',
              icon: <AlertTriangle size={18} color="#fbbf24" />,
              titleColor: '#fbbf24',
            },
            info: {
              border: '1px solid rgba(99, 102, 241, 0.4)',
              bg: 'rgba(17, 24, 48, 0.92)',
              glow: 'rgba(99, 102, 241, 0.25)',
              icon: <Info size={18} color="#818cf8" />,
              titleColor: '#818cf8',
            },
          }[toast.type] || {
            border: '1px solid rgba(255, 255, 255, 0.1)',
            bg: 'rgba(17, 24, 39, 0.92)',
            glow: 'none',
            icon: <Info size={18} color="#9ca3af" />,
            titleColor: '#ffffff',
          };

          return (
            <div
              key={toast.id}
              className="toast-item"
              style={{
                background: typeStyles.bg,
                backdropFilter: 'blur(16px)',
                border: typeStyles.border,
                borderRadius: '0.75rem',
                padding: '0.875rem 1rem',
                boxShadow: `0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px ${typeStyles.glow}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                pointerEvents: 'auto',
                animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ flexShrink: 0, marginTop: '2px' }}>
                {typeStyles.icon}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                {toast.title && (
                  <div style={{ fontWeight: '700', fontSize: '0.875rem', color: typeStyles.titleColor, marginBottom: '2px' }}>
                    {toast.title}
                  </div>
                )}
                <div style={{ fontSize: '0.8125rem', color: '#e5e7eb', lineHeight: 1.45, wordBreak: 'break-word' }}>
                  {toast.message}
                </div>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                aria-label="Close notification"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '0.25rem',
                  marginLeft: '0.25rem',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
