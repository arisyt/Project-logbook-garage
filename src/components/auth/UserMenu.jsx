import React, { useState, useRef, useEffect } from 'react';
import { LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * UserMenu — avatar dropdown showing user info and a sign-out button.
 * Renders as a clickable avatar; dropdown appears on click.
 */
export default function UserMenu() {
  const { user, profile, signOut } = useAuth();
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

  const displayName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const email = user.email || '';
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || '';

  // Generate initials for fallback avatar
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

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
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[11px] font-bold text-emerald-400">
            {initials}
          </div>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-60 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl shadow-black/40 z-[60] overflow-hidden">
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
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-sm font-bold text-emerald-400">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white truncate">{displayName}</div>
                <div className="text-[11px] text-slate-400 font-mono truncate">{email}</div>
              </div>
            </div>
          </div>

          {/* Sign Out */}
          <button
            onClick={async () => {
              setIsOpen(false);
              await signOut();
            }}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-rose-400 hover:bg-rose-500/10 transition font-mono"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      )}
    </div>
  );
}
