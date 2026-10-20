import React from 'react';
import {
  Wallet,
  TrendingDown,
  Wrench,
  Receipt,
  PieChart,
  Calendar,
} from 'lucide-react';
import {
  calculateCostPerKm,
  getCostPerKmAnalysis,
  calculateTotalMaintenanceCost,
  formatRupiah,
  formatKm,
} from '../../utils/calculators';

export default function CostAnalyticsCards({ vehicle, serviceLogs }) {
  if (!vehicle) return null;

  const currentOdo = vehicle.currentOdo || 0;
  const initialOdo = vehicle.initialOdo || 0;

  const totalCostRp = calculateTotalMaintenanceCost(serviceLogs);
  const costAnalysis = getCostPerKmAnalysis(totalCostRp, currentOdo, initialOdo, serviceLogs);
  const costPerKm = costAnalysis.costPerKm;
  const avgCostPerService =
    serviceLogs.length > 0 ? Math.round(totalCostRp / serviceLogs.length) : 0;

  // Category Spend Breakdown
  const categorySpend = serviceLogs.reduce((acc, log) => {
    const cat = log.category || 'ROUTINE_SERVICE';
    acc[cat] = (acc[cat] || 0) + (Number(log.costRp) || 0);
    return acc;
  }, {});

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'ROUTINE_SERVICE':
        return 'Servis Rutin';
      case 'PART_REPLACEMENT':
        return 'Ganti Part';
      case 'MODIFICATION':
        return 'Upgrade / Modif';
      case 'TAX_DOCUMENT':
        return 'Pajak STNK';
      case 'INSPECTION':
        return 'Inspeksi';
      default:
        return 'Lainnya';
    }
  };

  return (
    <div className="space-y-4">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Cost */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Total Biaya Servis</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-mono font-extrabold text-emerald-400">
              {formatRupiah(totalCostRp)}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1">
              Dari {serviceLogs.length} total catatan perawatan
            </div>
          </div>
        </div>

        {/* Cost per km */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Biaya Operasional / Km</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-mono font-extrabold text-amber-400">
              {formatRupiah(costPerKm)} <span className="text-sm font-normal text-slate-400">/ km</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center justify-between">
              <span className="truncate">{costAnalysis.detailText}</span>
              {costAnalysis.basisType === 'lifetime' && (
                <span className="text-[9px] text-amber-400/90 bg-amber-400/10 px-1.5 py-0.5 rounded font-mono shrink-0 ml-1">
                  Basis Odo
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Average per Service Event */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Rata-rata Per Servis</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-mono font-extrabold text-cyan-400">
              {formatRupiah(avgCostPerService)}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1">
              Frekuensi servis: {serviceLogs.length} kali kunjungan
            </div>
          </div>
        </div>
      </div>

      {/* Category Spend Distribution Bar */}
      {serviceLogs.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-400 font-semibold uppercase text-[11px]">
            <PieChart className="w-3.5 h-3.5 text-slate-300" />
            <span>Alokasi Biaya:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {Object.entries(categorySpend).map(([cat, amount]) => {
              const pct = totalCostRp > 0 ? Math.round((amount / totalCostRp) * 100) : 0;
              return (
                <div
                  key={cat}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2"
                >
                  <span className="text-slate-400">{getCategoryLabel(cat)}:</span>
                  <span className="font-bold text-white">{formatRupiah(amount)}</span>
                  <span className="text-emerald-400 text-[10px]">({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
