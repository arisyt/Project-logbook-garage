import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, ShieldAlert, CheckSquare, Square } from 'lucide-react';
import { validateOdometerInput, formatKm } from '../../utils/calculators';

export default function OdometerGuardAlert({
  currentOdo,
  newOdo,
  isConfirmed,
  onToggleConfirm,
}) {
  const validation = validateOdometerInput(currentOdo, newOdo);

  if (!validation || validation.warningLevel === 'none') {
    return null;
  }

  const isDanger = validation.warningLevel === 'danger';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className={`p-3.5 rounded-xl border text-xs font-mono space-y-2.5 overflow-hidden ${
          isDanger
            ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
            : 'bg-amber-500/10 border-amber-500/40 text-amber-300'
        }`}
      >
        <div className="flex items-start gap-2.5">
          {isDanger ? (
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <span className="font-bold uppercase tracking-wider block text-[10px]">
              {isDanger ? 'Validasi Keamanan Odometer' : 'Peringatan Lonjakan Jarak'}
            </span>
            <p className="mt-0.5 text-slate-200 leading-relaxed text-[11px]">
              {validation.message}
            </p>
          </div>
        </div>

        {/* Checkbox confirmation to allow intentional updates */}
        <div
          onClick={() => onToggleConfirm(!isConfirmed)}
          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition select-none border ${
            isConfirmed
              ? 'bg-slate-900 border-emerald-500/50 text-emerald-300'
              : 'bg-slate-950/80 border-slate-700/80 text-slate-300 hover:border-slate-600'
          }`}
        >
          {isConfirmed ? (
            <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <Square className="w-4 h-4 text-slate-500 shrink-0" />
          )}
          <span className="text-[11px] font-medium leading-tight">
            {validation.isBackward
              ? 'Konfirmasi: Saya sengaja melakukan koreksi mundur odometer'
              : 'Konfirmasi: Angka lonjakan jarak tempuh ini sudah sesuai'}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
