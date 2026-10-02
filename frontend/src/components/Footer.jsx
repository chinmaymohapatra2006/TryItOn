import React, { useState } from 'react';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="border-t border-[#E8E1D5] bg-[#F5F0EB] text-[#1C1917] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">
          {/* Brand Info */}
          <div className="space-y-4">
            <div>
              <span className="font-serif font-bold text-2xl tracking-wider text-[#1C1917]">
                THREAD & STYLE
              </span>
              <p className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#8C6D58] mt-0.5">
                TRYITON ATELIER CO.
              </p>
            </div>
            <p className="text-xs text-[#6E5341] leading-relaxed">
              Timeless fashion for every occasion. Experience precision 3D virtual fittings tailored to your exact measurements.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#8C6D58]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time 3D Simulation</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#1C1917]">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-[#6E5341]">
              <li>
                <Link to="/" className="hover:text-[#1C1917] transition-colors">
                  Home Collection
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[#1C1917] transition-colors">
                  3D Fitting Room
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[#1C1917] transition-colors">
                  Body Sizing Studio
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[#1C1917] transition-colors">
                  Wardrobe & Saved Looks
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#1C1917]">
              Customer Service
            </h4>
            <ul className="space-y-2 text-xs text-[#6E5341]">
              <li className="hover:text-[#1C1917] cursor-pointer transition-colors">
                Anthropometric Sizing Guide
              </li>
              <li className="hover:text-[#1C1917] cursor-pointer transition-colors">
                Fabric Ease Guarantee
              </li>
              <li className="hover:text-[#1C1917] cursor-pointer transition-colors">
                Returns & Exchanges
              </li>
              <li className="hover:text-[#1C1917] cursor-pointer transition-colors">
                Privacy & Data Security
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#1C1917]">
              Newsletter
            </h4>
            <p className="text-xs text-[#6E5341] leading-relaxed">
              Subscribe to get updates on new arrivals, fabric releases, and exclusive 3D collections.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#EBDDCE] text-[#382920] text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Thank you for subscribing!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-3.5 py-2 rounded-lg bg-white border border-[#D9C4AF] text-xs text-[#1C1917] placeholder-[#A88B74] focus:outline-none focus:border-[#1C1917]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1C1917] hover:bg-[#382920] text-white rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors"
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom copyright & technical stack badges */}
        <div className="mt-14 pt-8 border-t border-[#E8E1D5] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8A734C]">
          <p>© 2026 THREAD & STYLE / TRYITON CO. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Production Ready</span>
            <span>•</span>
            <span>Three.js WebGL & React</span>
            <span>•</span>
            <span>Cloudinary Optimized</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
