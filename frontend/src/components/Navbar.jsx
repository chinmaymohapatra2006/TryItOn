import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, LayoutDashboard, Home } from 'lucide-react';
import HealthStatusBadge from './HealthStatusBadge.jsx';

export const Navbar = () => {
  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-sm'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
    }`;

  return (
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

          {/* Status Indicator */}
          <div className="flex items-center gap-3">
            <HealthStatusBadge />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
