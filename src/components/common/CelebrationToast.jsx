import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles, X, Wrench } from 'lucide-react';

export default function CelebrationToast({ toast, onClose }) {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-50 max-w-md w-full p-4 rounded-2xl bg-slate-900/90 backdrop-blur-2xl border border-emerald-500/50 shadow-2xl shadow-emerald-950/50 text-white overflow-hidden pointer-events-auto"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start gap-3.5 relative z-10">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
              {toast.type === 'package' ? (
                <Sparkles className="w-5 h-5 animate-spin-slow" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  {toast.badge || 'Servis Sukses'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <h4 className="font-bold text-sm text-white mt-0.5 truncate">
                {toast.title || 'Komponen Di-reset ke Kondisi Prima'}
              </h4>
              <p className="text-xs text-slate-300 font-mono mt-1 leading-relaxed">
                {toast.message}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
              title="Tutup Notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress bar line animating across the bottom */}
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 4.5, ease: 'linear' }}
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
