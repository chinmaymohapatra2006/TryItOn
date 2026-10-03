import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Dashboard from './components/Dashboard';
import PhotoUploader from './components/photos/PhotoUploader';
import ProductInput from './components/products/ProductInput';
import TryOnStudio from './components/tryon/TryOnStudio';
import TryOnResultView from './components/results/TryOnResultView';
import TryOnHistory from './components/history/TryOnHistory';
import HealthStatus from './components/HealthStatus';
import { 
  Sparkles, 
  User, 
  LogIn, 
  UserPlus, 
  LayoutDashboard, 
  Activity, 
  LogOut,
  CheckCircle2,
  Cpu,
  ArrowRight,
  Shirt,
  Camera,
  History,
  Menu,
  X
} from 'lucide-react';

function MainLayout() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { info, success } = useToast();
  const [currentView, setCurrentView] = useState(() => (isAuthenticated ? 'dashboard' : 'overview'));
  const [selectedGarment, setSelectedGarment] = useState(null);
  const [activeModelPhoto, setActiveModelPhoto] = useState(null);
  const [activeResultData, setActiveResultData] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync view when auth state changes
  useEffect(() => {
    if (isAuthenticated && (currentView === 'login' || currentView === 'register')) {
      setCurrentView('dashboard');
    }
  }, [isAuthenticated]);

  // Keyboard shortcut listener (Escape to navigate back or close menus)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (mobileMenuOpen) setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    success('You have been signed out.');
    setCurrentView('overview');
  };

  const phases = [
    { num: 1, title: 'Project Foundation', desc: 'React 19 + Express 4.21 + SQLite + Health API', status: 'completed' },
    { num: 2, title: 'Authentication', desc: 'Bcrypt Hashing, JWT Sessions, Protected Routes', status: 'completed' },
    { num: 3, title: 'User Photo System', desc: 'Drag-and-Drop Photo Upload & Cloud Storage', status: 'completed' },
    { num: 4, title: 'Product Input System', desc: 'Garment Upload (Method A) & URL Scraping (Method B)', status: 'completed' },
    { num: 5, title: 'Image Preprocessing', desc: 'Person Validation & Garment Background Isolation', status: 'completed' },
    { num: 6, title: 'Cloudinary AI Try-On', desc: 'Generative AI Virtual Try-On Pipeline', status: 'completed' },
    { num: 7, title: 'Try-On Result System', desc: 'Split Slider, High-Res Download, Regeneration', status: 'completed' },
    { num: 8, title: 'Try-On History', desc: 'Saved Sessions & Interactive Wardrobe Gallery', status: 'completed' },
    { num: 9, title: 'UI/UX Polish', desc: 'Toast Notifications, Skeletons, Mobile Navigation', status: 'completed' },
  ];

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
        <div style={{ textAlign: 'center' }}>
          <Sparkles size={36} color="#818cf8" style={{ animation: 'spin 2s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ fontWeight: '600', color: '#e5e7eb' }}>Initializing TryItOn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem', position: 'relative' }}>
        <div 
          onClick={() => setCurrentView(isAuthenticated ? 'dashboard' : 'overview')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', userSelect: 'none' }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #6366f1, #ec4899)',
            padding: '0.65rem',
            borderRadius: '0.85rem',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s ease',
          }}
          className="brand-logo"
          >
            <Sparkles size={24} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.625rem', fontWeight: '800', letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              TryItOn <span className="gradient-text">AI</span>
            </h1>
            <p style={{ fontSize: '0.8125rem', color: '#9ca3af', margin: 0 }}>Virtual Trial Room Platform</p>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }} className="desktop-nav">
          <button
            onClick={() => setCurrentView('overview')}
            className={`btn ${currentView === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.8125rem', padding: '0.45rem 0.85rem' }}
          >
            <Activity size={15} />
            <span>Overview & Health</span>
          </button>

          {isAuthenticated ? (
            <>
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`btn ${currentView === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8125rem', padding: '0.45rem 0.85rem' }}
              >
                <LayoutDashboard size={15} />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setCurrentView('studio')}
                className={`btn ${currentView === 'studio' || currentView === 'result' ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  fontSize: '0.8125rem',
                  padding: '0.45rem 0.85rem',
                  background: (currentView === 'studio' || currentView === 'result') ? 'linear-gradient(135deg, #ec4899, #8b5cf6)' : undefined
                }}
              >
                <Sparkles size={15} />
                <span>Trial Studio</span>
              </button>

              <button
                onClick={() => setCurrentView('history')}
                className={`btn ${currentView === 'history' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8125rem', padding: '0.45rem 0.85rem' }}
              >
                <History size={15} />
                <span>History</span>
              </button>

              <button
                onClick={() => setCurrentView('photos')}
                className={`btn ${currentView === 'photos' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8125rem', padding: '0.45rem 0.85rem' }}
              >
                <Camera size={15} />
                <span>My Photos</span>
              </button>

              <button
                onClick={() => setCurrentView('wardrobe')}
                className={`btn ${currentView === 'wardrobe' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8125rem', padding: '0.45rem 0.85rem' }}
              >
                <Shirt size={15} />
                <span>Wardrobe</span>
              </button>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '0.35rem 0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--border-color)',
                fontSize: '0.8125rem',
                color: '#e5e7eb'
              }}>
                <div className="pulse-dot online"></div>
                <span style={{ fontWeight: '500' }}>{user?.name || user?.email}</span>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ fontSize: '0.8125rem', padding: '0.45rem 0.75rem', color: '#f87171' }}
                title="Sign Out"
              >
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setCurrentView('login')}
                className={`btn ${currentView === 'login' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8125rem', padding: '0.45rem 0.9rem' }}
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </button>

              <button
                onClick={() => setCurrentView('register')}
                className={`btn ${currentView === 'register' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8125rem', padding: '0.45rem 0.9rem' }}
              >
                <UserPlus size={15} />
                <span>Register</span>
              </button>
            </>
          )}
        </nav>
      </header>

      {/* Main View Router */}
      <main style={{ minHeight: '65vh' }}>
        {currentView === 'overview' && (
          <div>
            {/* Hero Section */}
            <div className="glass-card" style={{ marginBottom: '2rem', padding: '2.25rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                width: '280px',
                height: '280px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, transparent 70%)',
                pointerEvents: 'none'
              }} />

              <div style={{ maxWidth: '750px', position: 'relative', zIndex: 1 }}>
                <span className="badge badge-success" style={{ marginBottom: '1rem' }}>
                  <CheckCircle2 size={13} /> All Systems Verified & Active
                </span>
                <h2 style={{ fontSize: '2.25rem', fontWeight: '800', lineHeight: 1.2, marginBottom: '0.85rem' }}>
                  Experience Next-Gen <span className="gradient-text">Virtual Fashion</span>
                </h2>
                <p style={{ color: '#9ca3af', fontSize: '1.0625rem', lineHeight: 1.7, marginBottom: '1.75rem' }}>
                  TryItOn delivers an AI-powered virtual trial room combining portrait stance analysis, 
                  product extraction, Cloudinary generative replacement, and interactive comparison slider.
                </p>

                <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
                  {isAuthenticated ? (
                    <>
                      <button 
                        onClick={() => setCurrentView('studio')}
                        className="btn btn-primary"
                        style={{ padding: '0.75rem 1.5rem', fontSize: '0.9375rem' }}
                      >
                        <Sparkles size={18} />
                        <span>Launch Virtual Fitting</span>
                        <ArrowRight size={16} />
                      </button>
                      <button 
                        onClick={() => setCurrentView('dashboard')}
                        className="btn btn-secondary"
                        style={{ padding: '0.75rem 1.25rem', fontSize: '0.9375rem' }}
                      >
                        <LayoutDashboard size={18} />
                        <span>My Dashboard</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => setCurrentView('register')}
                        className="btn btn-primary"
                        style={{ padding: '0.75rem 1.5rem', fontSize: '0.9375rem' }}
                      >
                        <UserPlus size={18} />
                        <span>Get Started Free</span>
                      </button>
                      <button 
                        onClick={() => setCurrentView('login')}
                        className="btn btn-secondary"
                        style={{ padding: '0.75rem 1.25rem', fontSize: '0.9375rem' }}
                      >
                        <LogIn size={18} />
                        <span>Sign In</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Real-time Health Check Component */}
            <HealthStatus />

            {/* Phase Roadmap Overview */}
            <div style={{ marginTop: '2.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#f3f4f6' }}>
                Project Architecture & Phase Status
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                {phases.map((phase) => (
                  <div 
                    key={phase.num}
                    className="glass-card"
                    style={{
                      borderColor: 'rgba(99, 102, 241, 0.35)',
                      background: 'rgba(99, 102, 241, 0.06)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#818cf8', letterSpacing: '0.05em' }}>
                        PHASE {phase.num}
                      </span>
                      <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                        <CheckCircle2 size={11} /> Ready
                      </span>
                    </div>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#f9fafb', marginBottom: '0.35rem' }}>
                      {phase.title}
                    </h4>
                    <p style={{ fontSize: '0.8125rem', color: '#9ca3af', lineHeight: 1.5 }}>
                      {phase.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === 'login' && (
          <div style={{ padding: '2rem 0' }}>
            <LoginForm 
              onSwitchToRegister={() => setCurrentView('register')}
              onSuccess={() => setCurrentView('dashboard')}
            />
          </div>
        )}

        {currentView === 'register' && (
          <div style={{ padding: '2rem 0' }}>
            <RegisterForm 
              onSwitchToLogin={() => setCurrentView('login')}
              onSuccess={() => setCurrentView('dashboard')}
            />
          </div>
        )}

        {currentView === 'dashboard' && (
          <Dashboard 
            onStartTryOn={() => setCurrentView('studio')}
            onManagePhotos={() => setCurrentView('photos')}
            onOpenWardrobe={() => setCurrentView('wardrobe')}
            onOpenHistory={() => setCurrentView('history')}
            onInspectSession={(session) => {
              setActiveResultData({
                sessionId: session.id,
                resultImageUrl: session.resultImageUrl,
                userImageUrl: session.userImageUrl,
                productImageUrl: session.productImageUrl,
                garmentTitle: session.garmentTitle,
                garmentCategory: session.garmentCategory,
                transformationDetails: session.transformationDetails,
              });
              setCurrentView('result');
            }}
          />
        )}

        {currentView === 'studio' && (
          <TryOnStudio 
            activeModelPhoto={activeModelPhoto}
            selectedGarment={selectedGarment}
            onTryAnother={() => setCurrentView('wardrobe')}
          />
        )}

        {currentView === 'result' && activeResultData && (
          <TryOnResultView 
            resultData={activeResultData}
            onTryAnother={() => setCurrentView('wardrobe')}
            onRegenerated={(newRes) => setActiveResultData(newRes)}
          />
        )}

        {currentView === 'history' && (
          <TryOnHistory 
            onStartFirstTryOn={() => setCurrentView('studio')}
            onInspectSession={(session) => {
              setActiveResultData({
                sessionId: session.id,
                resultImageUrl: session.resultImageUrl,
                userImageUrl: session.userImageUrl,
                productImageUrl: session.productImageUrl,
                garmentTitle: session.garmentTitle,
                garmentCategory: session.garmentCategory,
                transformationDetails: session.transformationDetails,
              });
              setCurrentView('result');
            }}
          />
        )}

        {currentView === 'photos' && (
          <PhotoUploader 
            onPhotoSelected={(photo) => {
              setActiveModelPhoto(photo);
            }}
          />
        )}

        {currentView === 'wardrobe' && (
          <ProductInput 
            selectedProduct={selectedGarment}
            onProductSelected={(prod) => {
              setSelectedGarment(prod);
              setCurrentView('studio');
            }}
          />
        )}
      </main>

      {/* Mobile Bottom Floating Navigation Bar */}
      {isAuthenticated && (
        <nav 
          aria-label="Mobile Navigation"
          style={{
            position: 'fixed',
            bottom: '1rem',
            left: '1rem',
            right: '1rem',
            background: 'rgba(17, 24, 39, 0.92)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--border-color)',
            borderRadius: '1rem',
            padding: '0.5rem 0.75rem',
            display: 'none',
            justifyContent: 'space-around',
            alignItems: 'center',
            zIndex: 900,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          }}
          className="mobile-bottom-bar"
        >
          <button
            onClick={() => setCurrentView('dashboard')}
            style={{
              background: 'transparent',
              border: 'none',
              color: currentView === 'dashboard' ? '#818cf8' : '#9ca3af',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              fontSize: '0.65rem',
              fontWeight: '600',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <LayoutDashboard size={18} />
            <span>Home</span>
          </button>

          <button
            onClick={() => setCurrentView('studio')}
            style={{
              background: 'transparent',
              border: 'none',
              color: currentView === 'studio' || currentView === 'result' ? '#ec4899' : '#9ca3af',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              fontSize: '0.65rem',
              fontWeight: '600',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <Sparkles size={18} />
            <span>Try-On</span>
          </button>

          <button
            onClick={() => setCurrentView('photos')}
            style={{
              background: 'transparent',
              border: 'none',
              color: currentView === 'photos' ? '#818cf8' : '#9ca3af',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              fontSize: '0.65rem',
              fontWeight: '600',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <Camera size={18} />
            <span>Photos</span>
          </button>

          <button
            onClick={() => setCurrentView('wardrobe')}
            style={{
              background: 'transparent',
              border: 'none',
              color: currentView === 'wardrobe' ? '#818cf8' : '#9ca3af',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              fontSize: '0.65rem',
              fontWeight: '600',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <Shirt size={18} />
            <span>Wardrobe</span>
          </button>

          <button
            onClick={() => setCurrentView('history')}
            style={{
              background: 'transparent',
              border: 'none',
              color: currentView === 'history' ? '#818cf8' : '#9ca3af',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              fontSize: '0.65rem',
              fontWeight: '600',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <History size={18} />
            <span>History</span>
          </button>
        </nav>
      )}

      {/* Footer */}
      <footer style={{ marginTop: '3.5rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', color: '#6b7280', fontSize: '0.8125rem' }}>
        <p>TryItOn AI Virtual Trial Room &bull; Strictly Phase-Wise Verified Development</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainLayout />
      </ToastProvider>
    </AuthProvider>
  );
}
