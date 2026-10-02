import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import RootLayout from './layouts/RootLayout.jsx';
import GlobalErrorBoundary from './components/Common/GlobalErrorBoundary.jsx';
import { Loader2 } from 'lucide-react';

// Lazy loaded page components for optimal production chunk delivery
const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));

// Accessible, smooth fallback loader during code-split chunk loading
const PageLoader = () => (
  <div 
    role="status" 
    aria-label="Loading page content"
    className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400 text-xs"
  >
    <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-3" />
    <span className="font-medium text-slate-300">Loading TryItOn Studio...</span>
  </div>
);

export const App = () => {
  return (
    <GlobalErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<HomePage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </GlobalErrorBoundary>
  );
};

export default App;
