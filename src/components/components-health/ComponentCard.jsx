import React from 'react';
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
} from 'lucide-react';
import { calculateComponentHealth, formatKm, formatDate } from '../../utils/calculators';

export default function ComponentCard({
  component,
  currentOdo,
  onResetService,
  onDeleteComponent,
}) {
  const health = calculateComponentHealth(
    currentOdo,
    component.installedAtKm,
    component.lifespanKm
  );

  const getStatusBadge = () => {
    switch (health.status) {
      case 'critical':
        return {
          bg: 'bg-rose-500/15',
          border: 'border-rose-500/30',
          text: 'text-rose-400',
          barColor: 'bg-rose-500',
          cardGlow: 'border-rose-500/40 shadow-rose-950/20',
          icon: AlertCircle,
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/15',
          border: 'border-amber-500/30',
          text: 'text-amber-400',
          barColor: 'bg-amber-500',
          cardGlow: 'border-amber-500/30 shadow-amber-950/20',
          icon: AlertTriangle,
        };
      default:
        return {
          bg: 'bg-emerald-500/15',
          border: 'border-emerald-500/30',
          text: 'text-emerald-400',
          barColor: 'bg-emerald-500',
          cardGlow: 'border-slate-800',
          icon: CheckCircle2,
        };
    }
  };

  const style = getStatusBadge();
  const StatusIcon = style.icon;

  return (
    <div
      className={`p-5 rounded-2xl bg-slate-900 border ${style.cardGlow} shadow-lg transition flex flex-col justify-between space-y-4 relative overflow-hidden`}
    >
      {/* Top Meta */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700/80">
              {component.category || 'Komponen'}
            </span>
            <h3 className="font-bold text-base text-white mt-1.5 truncate">
              {component.name}
            </h3>
          </div>

          {/* Health Status Pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${style.bg} ${style.border} ${style.text} text-xs font-mono font-bold shrink-0`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{health.label}</span>
            <span className="text-white/80">({health.percentage}%)</span>
          </div>
        </div>

        {component.notes && (
          <p className="text-xs text-slate-400 line-clamp-1 mb-3">
            {component.notes}
          </p>
        )}

        {/* Dynamic Wear Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400">Status Keausan:</span>
            <span className={`font-bold ${style.text}`}>
              {health.remainingKm > 0
                ? `Sisa ${formatKm(health.remainingKm)}`
                : `Overdue ${formatKm(Math.abs(health.remainingKm))}`}
            </span>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-2.5 p-0.5 border border-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${style.barColor}`}
              style={{ width: `${health.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Telemetry Grid */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80 text-[11px] font-mono">
        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
          <span className="text-slate-500 block text-[10px]">Terpasang Pada:</span>
          <span className="text-slate-200 font-bold">{formatKm(component.installedAtKm)}</span>
        </div>

        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
          <span className="text-slate-500 block text-[10px]">Target Interval:</span>
          <span className="text-slate-200 font-bold">{formatKm(component.lifespanKm)}</span>
        </div>

        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
          <span className="text-slate-500 block text-[10px]">Jarak Dipakai:</span>
          <span className="text-amber-400 font-bold">{formatKm(health.kmElapsed)}</span>
        </div>

        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
          <span className="text-slate-500 block text-[10px]">Servis Terakhir:</span>
          <span className="text-slate-300 font-bold">{formatDate(component.lastServicedDate)}</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onResetService(component)}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 shadow-md ${
            health.status === 'critical'
              ? 'bg-rose-500 hover:bg-rose-400 text-slate-950 shadow-rose-500/20'
              : health.status === 'warning'
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/10'
          }`}
          title="Reset odometer pemasangan dan buat entri servis baru"
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
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/80 transition"
          title="Hapus komponen ini"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
