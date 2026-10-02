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
    `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase transition-all ${
      isActive
        ? 'bg-[#1C1917] text-white shadow-sm'
        : 'text-[#69573A] hover:text-[#1C1917] hover:bg-[#F3EDE2]'
    }`;

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#FAF7F2]/90 border-b border-[#E8E1D5] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Brand */}
            <NavLink to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-[#1C1917] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-[#D5C4A1]" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-xl sm:text-2xl tracking-wider text-[#1C1917]">
                  TRYITON
                </span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-[#8C6D58] font-bold -mt-1">
                  Atelier & 3D Fitting
                </span>
              </div>
            </NavLink>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-2">
              <NavLink to="/" className={navLinkClass}>
                <span>Home</span>
              </NavLink>
              <NavLink to="/dashboard" className={navLinkClass}>
                <span>3D Fitting Studio</span>
              </NavLink>
            </nav>

            {/* Right Controls: Saved Looks, User Profile, Health */}
            <div className="flex items-center gap-3">
              {/* Saved Looks Button */}
              <button
                onClick={() => setLooksDrawerOpen(true)}
                title="Saved Outfits"
                className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E7DEC8] hover:border-[#8C6D58] text-[#1C1917] text-xs font-semibold tracking-wider uppercase transition-all shadow-sm"
              >
                <Bookmark className="w-3.5 h-3.5 text-[#8C6D58]" />
                <span className="hidden sm:inline">Wardrobe</span>
                {Boolean(savedLooks?.length > 0) && (
                  <span className="w-4 h-4 rounded-full bg-[#1C1917] text-white text-[10px] flex items-center justify-center font-bold">
                    {savedLooks.length}
                  </span>
                )}
              </button>

              {/* User Authentication Menu */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2 pl-1">
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-xs font-bold text-[#1C1917] truncate max-w-[120px]">{user?.name || 'Stylist'}</span>
                    <span className="text-[10px] text-[#8C6D58] truncate max-w-[120px]">{user?.email || ''}</span>
                  </div>
                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-2 rounded-full text-[#69573A] hover:text-[#9C5838] hover:bg-[#F3EDE2] transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#1C1917] hover:bg-[#292524] text-white text-xs font-semibold tracking-wider uppercase shadow-md transition-all hover:scale-[1.02]"
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
