import React, { useState, useRef, useEffect } from 'react';
import { LogOut, ChevronDown, Cloud, HardDrive } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * UserMenu — avatar dropdown showing local/cloud info and quick actions.
 */
export default function UserMenu({ onOpenCloudModal }) {
  const { user, profile, isCloudConnected, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  const displayName = isCloudConnected
    ? profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User Cloud'
    : 'Pemilik Garasi';

  const subtitle = isCloudConnected ? user.email || 'Akun Cloud' : 'Mode Offline (Lokal)';
  const avatarUrl = isCloudConnected
    ? profile?.avatar_url || user.user_metadata?.avatar_url || ''
    : '';

  // Generate initials for fallback avatar
  const initials = isCloudConnected
    ? displayName
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'LK';

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar trigger */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-800 transition"
        aria-label="User menu"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-7 h-7 rounded-full object-cover border border-slate-700"
          />
        ) : (
          <div
            className={`w-7 h-7 rounded-full border flex items-center justify-center text-[11px] font-bold ${
              isCloudConnected
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                : 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300'
            }`}
          >
            {initials}
          </div>
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="fixed right-3 top-[calc(3.75rem+env(safe-area-inset-top,0px))] w-72 max-w-[calc(100vw-1.5rem)] sm:absolute sm:top-full sm:right-0 sm:mt-2 sm:w-64 rounded-2xl bg-slate-900/98 backdrop-blur-2xl border border-slate-700/80 shadow-2xl shadow-black/40 z-[60] overflow-hidden">
          {/* User info */}
          <div className="px-4 py-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-10 h-10 rounded-full object-cover border border-slate-700"
                />
              ) : (
                <div
                  className={`w-10 h-10 rounded-full border flex items-center justify-center text-sm font-bold ${
                    isCloudConnected
                      ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                      : 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300'
                  }`}
                >
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white truncate">{displayName}</div>
                <div className="text-[11px] text-slate-400 font-mono truncate">{subtitle}</div>
              </div>
            </div>
          </div>

          {/* Cloud Action Button */}
          <div className="p-2 border-b border-slate-800">
            <button
              onClick={() => {
                setIsOpen(false);
                if (onOpenCloudModal) onOpenCloudModal();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono text-emerald-400 hover:bg-emerald-500/10 transition"
            >
              <Cloud className="w-4 h-4 text-emerald-400" />
              <span>{isCloudConnected ? 'Menu Backup Cloud' : 'Cadangkan ke Cloud'}</span>
            </button>
          </div>

          {/* Sign Out / Status info */}
          {isCloudConnected ? (
            <button
              onClick={async () => {
                setIsOpen(false);
                await signOut();
              }}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-rose-400 hover:bg-rose-500/10 transition font-mono"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar dari Akun Cloud</span>
            </button>
          ) : (
            <div className="px-4 py-2.5 text-[11px] font-mono text-slate-400 flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Semua data tersimpan di perangkat (offline).</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
