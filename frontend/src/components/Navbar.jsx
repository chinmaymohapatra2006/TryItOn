import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, LayoutDashboard, Home, User, LogOut, Bookmark } from 'lucide-react';
import HealthStatusBadge from './HealthStatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import AuthModal from './Auth/AuthModal.jsx';
import SavedLooksDrawer from './SavedLooks/SavedLooksDrawer.jsx';

export const Navbar = () => {
  const { user, isAuthenticated, logout, savedLooks } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [looksDrawerOpen, setLooksDrawerOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-sm'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
    }`;

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <NavLink to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-300 bg-clip-text text-transparent">
                  TryItOn
                </span>
                <span className="text-[10px] uppercase tracking-wider text-purple-400 font-semibold -mt-1">
                  3D Virtual Fitting
                </span>
              </div>
            </NavLink>

            {/* Navigation Links */}
            <nav className="flex items-center gap-2 sm:gap-4">
              <NavLink to="/" className={navLinkClass}>
                <Home className="w-4 h-4" />
                <span>Home</span>
              </NavLink>
              <NavLink to="/dashboard" className={navLinkClass}>
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </NavLink>
            </nav>

            {/* Right Controls: Saved Looks, User Profile, Health */}
            <div className="flex items-center gap-3">
              {/* Saved Looks Button */}
              <button
                onClick={() => setLooksDrawerOpen(true)}
                title="Saved Outfits"
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all hover:border-slate-700"
              >
                <Bookmark className="w-3.5 h-3.5 text-purple-400" />
                <span>Wardrobe</span>
                {savedLooks.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center font-bold">
                    {savedLooks.length}
                  </span>
                )}
              </button>

              {/* User Authentication Menu */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2 pl-1">
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-xs font-bold text-white truncate max-w-[120px]">{user.name}</span>
                    <span className="text-[10px] text-purple-400 truncate max-w-[120px]">{user.email}</span>
                  </div>
                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}

              {/* API Health indicator */}
              <HealthStatusBadge />
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal & Saved Looks Drawer */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <SavedLooksDrawer isOpen={looksDrawerOpen} onClose={() => setLooksDrawerOpen(false)} />
    </>
  );
};

export default Navbar;
