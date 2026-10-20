import React, { useState } from 'react';
import {
  Cloud,
  CloudUpload,
  CloudDownload,
  ShieldCheck,
  HardDrive,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  User,
  X,
  FileJson,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function CloudSyncModal({
  isOpen,
  onClose,
  onBackupToCloud,
  onRestoreFromCloud,
  onExportJson,
  onOpenImportJson,
  lastBackupTime,
}) {
  const {
    user,
    isCloudConnected,
    signInWithGoogle,
    signInWithEmail,
    signUp,
    signOut,
  } = useAuth();

  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: '' }
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen) return null;

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage(null);

    if (password.length < 8) {
      setStatusMessage({ type: 'error', text: 'Password minimal 8 karakter.' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (authMode === 'login') {
        await signInWithEmail(email, password);
        setStatusMessage({ type: 'success', text: 'Berhasil masuk ke akun cloud Supabase!' });
      } else {
        await signUp(email, password, fullName);
        setStatusMessage({
          type: 'success',
          text: 'Pendaftaran berhasil! Silakan periksa email untuk konfirmasi atau langsung masuk.',
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Gagal autentikasi cloud. Periksa koneksi internet Anda.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setStatusMessage(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Gagal masuk dengan Google.',
      });
    }
  };

  const handleManualBackup = async () => {
    if (!onBackupToCloud) return;
    setStatusMessage(null);
    setIsSyncing(true);
    try {
      const res = await onBackupToCloud();
      if (res && res.error) {
        setStatusMessage({ type: 'error', text: `Gagal backup ke cloud: ${res.error}` });
      } else {
        setStatusMessage({
          type: 'success',
          text: 'Semua data garasi berhasil dicadangkan ke database cloud Supabase!',
        });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal mencadangkan data.' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualRestore = async () => {
    if (!onRestoreFromCloud) return;
    if (
      !window.confirm(
        'PERINGATAN: Pulihkan data dari cloud akan menimpa data garasi lokal saat ini. Lanjutkan?'
      )
    ) {
      return;
    }
    setStatusMessage(null);
    setIsSyncing(true);
    try {
      const res = await onRestoreFromCloud();
      if (res && res.error) {
        setStatusMessage({ type: 'error', text: `Gagal memulihkan: ${res.error}` });
      } else {
        setStatusMessage({
          type: 'success',
          text: 'Data garasi berhasil dipulihkan dari cloud ke penyimpanan perangkat!',
        });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal memulihkan data.' });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border-t md:border border-slate-700/80 rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] md:max-h-[90vh]">
        {/* Grab handle for mobile bottom sheet */}
        <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mt-2.5 mb-1 md:hidden shrink-0" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Sinkronisasi &amp; Backup Cloud
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {isCloudConnected ? 'Terhubung ke Supabase' : 'Mode Offline / Lokal Aktif'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] md:pb-5">
          {/* Status Banner */}
          {isCloudConnected ? (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-semibold">
                  <Wifi className="w-4 h-4 text-emerald-400" />
                  <span>AKUN CLOUD TERHUBUNG</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Online
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Masuk sebagai:{' '}
                <strong className="text-white font-mono">{user?.email || 'User Cloud'}</strong>
              </p>
              {lastBackupTime && (
                <p className="text-[11px] text-slate-400 font-mono">
                  Terakhir dicadangkan: {new Date(lastBackupTime).toLocaleString('id-ID')}
                </p>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-semibold">
                  <HardDrive className="w-4 h-4 text-cyan-400" />
                  <span>PENYIMPANAN OFFLINE LOKAL</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  100% Offline
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Aplikasi bekerja penuh tanpa server. Data garasi tersimpan aman di memori perangkat
                Anda. Server/database hanya opsional untuk cadangan (backup).
              </p>
            </div>
          )}

          {/* Feedback message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl border text-xs font-mono flex items-start gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Connected Actions */}
          {isCloudConnected ? (
            <div className="space-y-2.5">
              <button
                onClick={handleManualBackup}
                disabled={isSyncing}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition active:scale-95 disabled:opacity-50"
              >
                <CloudUpload className="w-4 h-4" />
                <span>
                  {isSyncing ? 'Mencadangkan ke Cloud...' : 'Cadangkan Data ke Cloud Sekarang'}
                </span>
              </button>

              <button
                onClick={handleManualRestore}
                disabled={isSyncing}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-mono transition active:scale-95 disabled:opacity-50"
              >
                <CloudDownload className="w-4 h-4" />
                <span>Pulihkan (Restore) Data dari Cloud</span>
              </button>

              <button
                onClick={async () => {
                  await signOut();
                  setStatusMessage({ type: 'success', text: 'Berhasil keluar dari akun cloud.' });
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs font-mono transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar dari Akun Cloud (Kembali ke Offline Penuh)</span>
              </button>
            </div>
          ) : (
            /* Not Connected: Cloud Login/Register Form */
            <div className="space-y-4 pt-1">
              <div className="text-xs text-slate-400 font-mono">
                Masuk akun Supabase untuk cadangan (backup) &amp; pemulihan (restore) cloud:
              </div>

              {/* Mode switch */}
              <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`py-1.5 rounded-lg transition font-semibold ${
                    authMode === 'login'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Masuk (Login)
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`py-1.5 rounded-lg transition font-semibold ${
                    authMode === 'register'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Daftar Akun Baru
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-3">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                      Nama Pemilik Garasi
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nama Anda"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@contoh.com"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 8 karakter"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono transition active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting
                    ? 'Memproses...'
                    : authMode === 'login'
                    ? 'Masuk & Sinkronkan'
                    : 'Daftar Akun Cloud'}
                </button>
              </form>

              {/* Google login */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-2 text-[10px] font-mono text-slate-500 uppercase">
                  atau
                </span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-mono transition active:scale-95"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Masuk dengan Akun Google</span>
              </button>
            </div>
          )}

          {/* Offline JSON Section */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
              <FileJson className="w-3.5 h-3.5 text-amber-400" />
              <span className="uppercase">Cadangan File Lokal (Tanpa Akun)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  if (onExportJson) onExportJson();
                }}
                className="py-2 px-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-[11px] font-mono transition text-center"
              >
                Export File .JSON
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenImportJson) onOpenImportJson();
                }}
                className="py-2 px-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-[11px] font-mono transition text-center"
              >
                Import File .JSON
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
