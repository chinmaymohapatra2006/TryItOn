import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { User, Lock, Mail, X, Loader2, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, loading, authError } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password || (isRegister && !name)) {
      setLocalError('Please fill in all required fields.');
      return;
    }

    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      setLocalError(err.message || 'Authentication failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-white border border-[#E8DFC8] p-8 shadow-2xl text-[#1C1917]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8DFC8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1C1917] text-[#D5C4A1] flex items-center justify-center shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-medium text-[#1C1917]">
                {isRegister ? 'Create Your Atelier Profile' : 'Sign In to Wardrobe'}
              </h3>
              <p className="text-[11px] text-[#6E5341]">Save custom measurements, avatar poses, and favorite looks.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#6E5341] hover:text-[#1C1917] hover:bg-[#FAF7F2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-[#FAF7F2] rounded-full my-5 border border-[#E7DEC8]">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setLocalError(null); }}
            className={`py-2 text-xs font-semibold uppercase tracking-wider rounded-full transition-all ${
              !isRegister ? 'bg-[#1C1917] text-white shadow-xs' : 'text-[#6E5341] hover:text-[#1C1917]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setLocalError(null); }}
            className={`py-2 text-xs font-semibold uppercase tracking-wider rounded-full transition-all ${
              isRegister ? 'bg-[#1C1917] text-white shadow-xs' : 'text-[#6E5341] hover:text-[#1C1917]'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mira Kapoor"
                  className="w-full bg-[#FAF7F2] border border-[#D9C4AF] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                />
                <User className="w-4 h-4 text-[#8C6D58] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#1C1917] mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="fashion@example.com"
                className="w-full bg-[#FAF7F2] border border-[#D9C4AF] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
              />
              <Mail className="w-4 h-4 text-[#8C6D58] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1917] mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#FAF7F2] border border-[#D9C4AF] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
              />
              <Lock className="w-4 h-4 text-[#8C6D58] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {(localError || authError) && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{localError || authError}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#1C1917] hover:bg-[#2E2824] text-white text-xs font-semibold uppercase tracking-wider shadow transition-all disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
