import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  LogIn, 
  Sparkles, 
  ShieldCheck, 
  Loader2, 
  AlertCircle,
  User,
  Users
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/common/Logo';
import { HEALTHCARE_IMAGES, FALLBACK_IMAGE } from '@/assets/images';

export const LoginPage: React.FC = () => {
  const { login, switchRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password.trim());
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (role: 'elderly' | 'caregiver') => {
    setLoading(true);
    try {
      await switchRole(role);
      navigate(role === 'caregiver' ? '/caregiver' : '/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background visual ambience */}
      <div className="absolute inset-0 z-0">
        <img
          src={HEALTHCARE_IMAGES.hero}
          alt="Healthcare background"
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
          }}
          className="w-full h-full object-cover opacity-15 filter brightness-50 contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#050816]/95 to-[#08111F]/80" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="flex justify-center mb-4">
          <Logo size="lg" showTagline />
        </div>
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Welcome to NIGHTCARE Command
        </h2>
        <p className="mt-1.5 text-center text-xs sm:text-sm text-slate-400">
          Sign in to manage medications, health vitals, and connected care
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-[#0B1220]/95 border border-white/[0.08] py-8 px-6 sm:px-10 rounded-3xl shadow-2xl glass-panel-elevated">
          {errorMsg && (
            <div className="mb-5 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5 flex items-center gap-2.5 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* QUICK DEMO LOGIN FOR HACKATHON JUDGES */}
          <div className="mt-6 pt-5 border-t border-white/[0.08]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              One-Click Judge Demo Access
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('elderly')}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 rounded-xl text-left transition-colors group"
              >
                <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold">
                  <User className="w-3.5 h-3.5" />
                  <span>Lakshmi Devi</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Elderly User</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('caregiver')}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-purple-500/30 rounded-xl text-left transition-colors group"
              >
                <div className="flex items-center gap-1.5 text-purple-400 text-xs font-bold">
                  <Users className="w-3.5 h-3.5" />
                  <span>Rohan Verma</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Family Caregiver</div>
              </button>
            </div>
          </div>

          <div className="mt-5 text-center text-xs text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/signup" className="text-cyan-400 hover:underline font-semibold">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
