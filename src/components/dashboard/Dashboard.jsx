import React from 'react';
import { motion } from 'framer-motion';
import {
  Gauge,
  Wallet,
  TrendingDown,
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Car,
  Flame,
  Bike,
  Plus,
  ArrowRight,
  ShieldAlert,
  Fuel,
  Weight,
  Layers,
  RotateCcw,
} from 'lucide-react';
import {
  calculateComponentHealth,
  calculateCostPerKm,
  getCostPerKmAnalysis,
  calculateTotalMaintenanceCost,
  calculateTaxStatus,
  calculateBikeTirePressure,
  formatRupiah,
  formatKm,
  formatDate,
} from '../../utils/calculators';

export default function Dashboard({
  activeVehicle,
  activeComponents,
  activeServiceLogs,
  activeFuelLogs,
  onOpenQuickOdo,
  onNavigateTab,
  onResetComponent,
}) {
  if (!activeVehicle) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono">
        Tidak ada kendaraan aktif. Silakan tambahkan unit baru.
      </div>
    );
  }

  // --- Calculations ---
  const currentOdo = activeVehicle.currentOdo || 0;
  const initialOdo = activeVehicle.initialOdo || 0;
  const totalSpendRp = calculateTotalMaintenanceCost(activeServiceLogs);
  const costAnalysis = getCostPerKmAnalysis(totalSpendRp, currentOdo, initialOdo, activeServiceLogs);
  const costPerKm = costAnalysis.costPerKm;

  // Component Health counts (Dual-Threshold: KM & Months)
  const evaluatedComponents = activeComponents.map((c) => ({
    ...c,
    health: calculateComponentHealth(currentOdo, c),
  }));

  const healthyCount = evaluatedComponents.filter((c) => c.health.status === 'healthy').length;
  const warningCount = evaluatedComponents.filter((c) => c.health.status === 'warning').length;
  const criticalCount = evaluatedComponents.filter((c) => c.health.status === 'critical').length;

  const urgentComponents = evaluatedComponents
    .filter((c) => c.health.status === 'critical' || c.health.status === 'warning')
    .sort((a, b) => a.health.percentage - b.health.percentage);

  // Contextual items
  const isMotorized = activeVehicle.category !== 'BICYCLE';
  const stnkStatus = isMotorized ? calculateTaxStatus(activeVehicle.stnkExpiryDate) : null;
  const plateStatus = isMotorized ? calculateTaxStatus(activeVehicle.plateExpiryDate) : null;

  // Bicycle specific
  const bikePressure =
    activeVehicle.category === 'BICYCLE'
      ? calculateBikeTirePressure({
          riderWeightKg: activeVehicle.riderWeightKg,
          bikeWeightKg: activeVehicle.bikeWeightKg,
          tireWidthMm: activeVehicle.tireWidthMm,
          surface: 'dry_tarmac',
          isTubeless: activeVehicle.isTubeless,
        })
      : null;

  const getCategoryMeta = (cat) => {
    switch (cat) {
      case 'CAR':
        return { label: 'MOBIL', icon: Car, color: 'text-blue-400', bg: 'bg-blue-500/10' };
      case 'MOTORCYCLE':
        return { label: 'MOTOR', icon: Flame, color: 'text-amber-400', bg: 'bg-amber-500/10' };
      case 'BICYCLE':
        return { label: 'SEPEDA', icon: Bike, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
      default:
        return { label: 'UNIT', icon: Gauge, color: 'text-slate-400', bg: 'bg-slate-500/10' };
    }
  };

  const meta = getCategoryMeta(activeVehicle.category);
  const VehicleIcon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* 1. Vehicle Hero Telemetry Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-950/80 backdrop-blur-xl border border-slate-800/80 relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border border-slate-700 ${meta.bg} ${meta.color}`}>
                {meta.label}
              </span>
              <span className="text-xs font-mono text-slate-400">{activeVehicle.year}</span>
              {isMotorized && (
                <span className="text-xs font-mono font-bold tracking-wider text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                  {activeVehicle.plateNumber}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {activeVehicle.name}
            </h1>

            <p className="text-xs text-slate-400 font-mono">
              {activeVehicle.category === 'BICYCLE'
                ? `${activeVehicle.brand} • ${activeVehicle.frameset} • ${activeVehicle.groupset}`
                : `${activeVehicle.brand} ${activeVehicle.model} • ${activeVehicle.fuelType || 'Bensin'}`}
            </p>
          </div>

          {/* Quick Odometer Telemetry Block */}
          <div className="flex items-center gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800 self-start md:self-auto">
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Gauge className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Total Odometer
              </div>
              <div className="text-2xl font-mono font-extrabold text-emerald-400">
                {new Intl.NumberFormat('id-ID').format(currentOdo)} <span className="text-sm font-normal text-slate-400">km</span>
              </div>
              <button
                onClick={onOpenQuickOdo}
                className="text-[11px] font-mono text-slate-400 hover:text-emerald-400 transition flex items-center gap-1 mt-0.5"
              >
                <span>Update Jarak Tempuh</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Key Telemetry 4-Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Maintenance Spend */}
        <div className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-lg hover:shadow-emerald-500/5 hover:border-slate-700/80 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Total Servis</span>
            <div className="p-2 rounded-xl bg-slate-800/80 text-slate-300 border border-slate-700/60">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-mono font-bold text-white">
              {formatRupiah(totalSpendRp)}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1">
              Dari {activeServiceLogs.length} riwayat servis
            </div>
          </div>
        </div>

        {/* Card 2: Cost per Kilometer */}
        <div className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-lg hover:shadow-emerald-500/5 hover:border-slate-700/80 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Biaya / Km</span>
            <div className="p-2 rounded-xl bg-slate-800/80 text-amber-400 border border-amber-500/20">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-mono font-bold text-amber-400">
              {formatRupiah(costPerKm)} <span className="text-xs text-slate-400">/ km</span>
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

        {/* Card 3: Component Health Breakdown */}
        <div className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-lg hover:shadow-emerald-500/5 hover:border-slate-700/80 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Status Komponen</span>
            <div className="p-2 rounded-xl bg-slate-800/80 text-emerald-400 border border-emerald-500/20">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 font-mono text-xs sm:text-sm font-bold">
              <span className="text-emerald-400">{healthyCount} Aman</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400">{warningCount} Servis</span>
              <span className="text-slate-600">•</span>
              <span className="text-rose-400">{criticalCount} Overdue</span>
            </div>
            <button
              onClick={() => onNavigateTab('health')}
              className="text-[11px] font-mono text-slate-400 hover:text-emerald-400 transition flex items-center gap-1 mt-1.5"
            >
              <span>Lihat Detail Part</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 4: Contextual Telemetry (Tax for Car/Motor, Tire Pressure for Bike) */}
        {isMotorized ? (
          <div className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-lg hover:shadow-emerald-500/5 hover:border-slate-700/80 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Pajak STNK Tahunan</span>
              <div className="p-2 rounded-xl bg-slate-800/80 text-blue-400 border border-blue-500/20">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                    stnkStatus?.status === 'expired'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : stnkStatus?.status === 'critical'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : stnkStatus?.status === 'warning'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {stnkStatus?.label || 'TIDAK DIATUR'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-1">
                Jatuh tempo: {formatDate(activeVehicle.stnkExpiryDate)}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-lg hover:shadow-emerald-500/5 hover:border-slate-700/80 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Tekanan Ban Ideal</span>
              <div className="p-2 rounded-xl bg-slate-800/80 text-cyan-400 border border-cyan-500/20">
                <Gauge className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-sm font-mono font-bold text-cyan-400">
                F: {bikePressure?.frontPsi} PSI / R: {bikePressure?.rearPsi} PSI
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-1">
                {activeVehicle.riderWeightKg} kg rider • {activeVehicle.tireWidthMm}c {activeVehicle.isTubeless ? 'Tubeless' : 'Tubes'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Urgent Component Attention Banner (if warning or critical) */}
      {urgentComponents.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-rose-500/40 shadow-xl shadow-rose-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>Komponen Membutuhkan Perhatian ({urgentComponents.length} Part)</span>
            </div>
            <button
              onClick={() => onNavigateTab('health')}
              className="text-xs font-mono text-slate-400 hover:text-white transition flex items-center gap-1"
            >
              <span>Kelola Semua Part</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {urgentComponents.slice(0, 3).map((comp) => (
              <div
                key={comp.id}
                className={`p-3.5 rounded-xl transition ${
                  comp.health.status === 'critical'
                    ? 'bg-slate-950/80 border border-rose-500/50 shadow-md shadow-rose-950/30 ring-1 ring-rose-500/20'
                    : 'bg-slate-950/80 border border-slate-800/80'
                } space-y-2`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{comp.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{comp.category}</div>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold whitespace-nowrap ${
                      comp.health.status === 'critical'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {comp.health.label}
                  </span>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        comp.health.status === 'critical'
                          ? 'bg-gradient-to-r from-rose-600 to-red-400'
                          : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                      }`}
                      style={{ width: `${comp.health.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono mt-1 text-slate-400">
                    <span>{comp.health.urgencyText}</span>
                    <button
                      onClick={() => onResetComponent(comp.id)}
                      className="text-emerald-400 hover:underline flex items-center gap-0.5"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>Servis</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Recent Maintenance Logbook Activity */}
      <div className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
              Riwayat Servis Terkini
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab('logbook')}
            className="text-xs font-mono text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1"
          >
            <span>Buka Logbook Lengkap</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {activeServiceLogs.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-slate-500">
            Belum ada catatan servis untuk kendaraan ini.
          </div>
        ) : (
          <>
            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase">
                    <th className="pb-2.5 font-semibold">Tanggal</th>
                    <th className="pb-2.5 font-semibold">Odometer</th>
                    <th className="pb-2.5 font-semibold">Servis & Pekerjaan</th>
                    <th className="pb-2.5 font-semibold">Bengkel / Tempat</th>
                    <th className="pb-2.5 font-semibold text-right">Biaya (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {activeServiceLogs.slice(0, 4).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 text-slate-300 whitespace-nowrap">
                        {formatDate(log.date)}
                      </td>
                      <td className="py-3 text-slate-300 font-bold whitespace-nowrap">
                        {formatKm(log.odometer)}
                      </td>
                      <td className="py-3 text-white max-w-xs truncate font-sans">
                        <div className="font-semibold text-xs text-white">{log.title}</div>
                        <div className="text-[10px] text-slate-400 truncate">{log.notes || '-'}</div>
                      </td>
                      <td className="py-3 text-slate-400 whitespace-nowrap font-sans">
                        {log.workshop || 'DIY / Bengkel'}
                      </td>
                      <td className="py-3 text-right text-emerald-400 font-bold whitespace-nowrap">
                        {formatRupiah(log.costRp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Vertical Timeline Cards (< md) */}
            <div className="md:hidden space-y-3">
              {activeServiceLogs.slice(0, 4).map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 relative pl-4 space-y-2"
                >
                  <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r bg-emerald-500/70" />

                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">{formatDate(log.date)}</span>
                    <span className="font-bold text-slate-200 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                      {formatKm(log.odometer)}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-white leading-snug">
                      {log.title}
                    </h4>
                    {log.notes && (
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 font-sans">
                        {log.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs">
                    <span className="text-[11px] font-mono text-slate-500">
                      {log.workshop || 'DIY / Bengkel'}
                    </span>
                    <span className="font-mono font-bold text-emerald-400">
                      {formatRupiah(log.costRp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
