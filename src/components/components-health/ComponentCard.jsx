import React from 'react';
import { motion } from 'framer-motion';
import {
  Wrench,
  RotateCcw,
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Gauge,
  Sparkles,
} from 'lucide-react';
import { calculateComponentHealth, formatKm, formatDate } from '../../utils/calculators';

export default function ComponentCard({
  component,
  currentOdo,
  onResetService,
  onDeleteComponent,
}) {
  // Dual-Threshold calculation (KM & Months)
  const health = calculateComponentHealth(currentOdo, component);

  const getStatusBadge = () => {
    switch (health.status) {
      case 'critical':
        return {
          bg: 'bg-rose-500/15',
          border: 'border-rose-500/40',
          text: 'text-rose-400',
          gradientBar: 'from-rose-600 via-rose-500 to-red-400',
          glowEffect: 'border-rose-500/60 shadow-xl shadow-rose-950/40 ring-1 ring-rose-500/30',
          pulseClass: 'animate-pulse',
          icon: AlertCircle,
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/15',
          border: 'border-amber-500/40',
          text: 'text-amber-400',
          gradientBar: 'from-amber-600 via-amber-500 to-yellow-400',
          glowEffect: 'border-amber-500/40 shadow-lg shadow-amber-950/20',
          pulseClass: '',
          icon: AlertTriangle,
        };
      default:
        return {
          bg: 'bg-emerald-500/15',
          border: 'border-emerald-500/30',
          text: 'text-emerald-400',
          gradientBar: 'from-emerald-600 via-emerald-500 to-teal-400',
          glowEffect: 'border-slate-800/80 hover:border-slate-700/80 hover:shadow-emerald-500/5',
          pulseClass: '',
          icon: CheckCircle2,
        };
    }
  };

  const style = getStatusBadge();
  const StatusIcon = style.icon;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.3 }}
      className={`p-5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border ${style.glowEffect} shadow-lg transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group`}
    >
      {/* Background ambient lighting */}
      <div
        className={`absolute -right-16 -top-16 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-20 ${
          health.status === 'critical'
            ? 'bg-rose-500'
            : health.status === 'warning'
            ? 'bg-amber-500'
            : 'bg-emerald-500'
        }`}
      />

      {/* Top Meta */}
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-slate-800/80 text-slate-400 border border-slate-700/80">
                {component.category || 'Komponen'}
              </span>
              {component.lifespanMonths && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{component.lifespanMonths} bln</span>
                </span>
              )}
            </div>
            <h3 className="font-bold text-base text-white mt-1.5 truncate group-hover:text-emerald-300 transition">
              {component.name}
            </h3>
          </div>

          {/* Health Status Pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border ${style.bg} ${style.border} ${style.text} text-xs font-mono font-bold shrink-0 ${style.pulseClass}`}
          >
            <StatusIcon className="w-3.5 h-3.5 shrink-0" />
            <span>{health.label}</span>
            <span className="text-white/80">({health.percentage}%)</span>
          </div>
        </div>

        {component.notes && (
          <p className="text-xs text-slate-400 line-clamp-1 mb-3 font-mono">
            {component.notes}
          </p>
        )}

        {/* Dynamic Wear Progress Bar with Modern Gradient */}
        <div className="space-y-1.5 mt-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400 text-[11px] flex items-center gap-1">
              {health.limitingFactor === 'time' ? (
                <>
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span>Limit: Waktu</span>
                </>
              ) : (
                <>
                  <Gauge className="w-3 h-3 text-emerald-400" />
                  <span>Limit: Jarak</span>
                </>
              )}
            </span>
            <span className={`font-bold ${style.text}`}>
              {health.urgencyText}
            </span>
          </div>

          {/* Progress bar container */}
          <div className="w-full bg-slate-950/80 rounded-full h-2.5 p-0.5 border border-slate-800/80 overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${health.percentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full bg-gradient-to-r ${style.gradientBar}`}
            />
          </div>
        </div>
      </div>

      {/* Telemetry Grid */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80 text-[11px] font-mono relative z-10">
        <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
          <span className="text-slate-500 block text-[10px]">Terpasang Pada:</span>
          <span className="text-slate-200 font-bold">{formatKm(component.installedAtKm)}</span>
        </div>

        <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
          <span className="text-slate-500 block text-[10px]">Target Interval:</span>
          <span className="text-slate-200 font-bold">
            {formatKm(component.lifespanKm)}
            {component.lifespanMonths ? ` / ${component.lifespanMonths} bln` : ''}
          </span>
        </div>

        <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
          <span className="text-slate-500 block text-[10px]">Jarak Dipakai:</span>
          <span className="text-amber-400 font-bold">{formatKm(health.kmElapsed)}</span>
        </div>

        <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
          <span className="text-slate-500 block text-[10px]">Servis Terakhir:</span>
          <span className="text-slate-300 font-bold">{formatDate(component.lastServicedDate)}</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center gap-2 pt-1 relative z-10">
        <button
          onClick={() => onResetService(component)}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 shadow-md active:scale-95 ${
            health.status === 'critical'
              ? 'bg-rose-500 hover:bg-rose-400 text-slate-950 shadow-rose-500/20'
              : health.status === 'warning'
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/10'
          }`}
          title="Reset odometer pemasangan dan buat entri riwayat servis"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Servis Sekarang</span>
        </button>

        <button
          onClick={() => {
            if (window.confirm(`Hapus pantauan komponen "${component.name}"?`)) {
              onDeleteComponent(component.id);
            }
          }}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/80 transition active:scale-90"
          title="Hapus komponen ini"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
