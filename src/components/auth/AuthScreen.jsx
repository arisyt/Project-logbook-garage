import React, { useState } from 'react';
import { Settings, Wrench, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * AuthScreen — full-screen dark "Tactical Garage" login/register page.
 */
export default function AuthScreen() {
  const { signInWithGoogle, signInWithEmail, signUp } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        await signUp(email, password, fullName);
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      if (err.message?.toLowerCase().includes('provider is not enabled') || err.message?.toLowerCase().includes('unsupported provider')) {
        setError('Google Provider belum diaktifkan di Supabase Dashboard. Silakan masuk menggunakan Email atau aktifkan Google Provider di dashboard Supabase Anda.');
      } else {
        setError(err.message || 'Gagal masuk dengan Google.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Card */}
      <div className="w-full max-w-sm bg-slate-900/80 backdrop-blur-2xl border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden relative z-10">
        {/* Header */}
        <div className="p-8 pb-6 text-center space-y-3">
          {/* Logo icon */}
          <div className="flex justify-center">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 relative">
              <Wrench className="w-8 h-8 text-emerald-400" />
              <Settings className="w-4 h-4 text-emerald-300 absolute -bottom-1 -right-1" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Velo &amp; Moto Garage
          </h1>
          <p className="text-xs text-slate-400 font-mono leading-relaxed">
            Garasi digital Anda. Catat kendaraan,<br />
            pantau suku cadang, lacak servis.
          </p>
        </div>

        <div className="px-6 pb-8 space-y-4">
          {/* Google Sign In */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm font-medium transition active:scale-95"
          >
            {/* Google SVG icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Lanjutkan dengan Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-xs text-slate-500 font-mono">atau</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Email Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1 uppercase tracking-wider">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama Anda"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@contoh.com"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-xl text-sm font-bold font-mono transition flex items-center justify-center gap-2 ${
                isSubmitting
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-95 shadow-lg shadow-emerald-500/20'
              }`}
            >
              {isSubmitting ? (
                <span className="animate-spin rounded-full w-4 h-4 border-2 border-slate-600 border-t-emerald-400" />
              ) : null}
              {mode === 'login' ? 'Masuk' : 'Daftar Akun Baru'}
            </button>
          </form>

          {/* Toggle mode */}
          <p className="text-center text-xs text-slate-500 font-mono">
            {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition"
            >
              {mode === 'login' ? 'Daftar di sini' : 'Masuk'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
