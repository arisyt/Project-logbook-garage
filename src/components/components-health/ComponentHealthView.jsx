import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Plus,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Filter,
  RefreshCw,
  Sparkles,
  LayoutGrid,
  Table as TableIcon,
  RotateCcw,
  Trash2,
  Zap,
  Droplet,
  Cog,
  Repeat,
  ShieldAlert,
} from 'lucide-react';
import ComponentCard from './ComponentCard';
import ServiceResetModal from './ServiceResetModal';
import AddComponentModal from './AddComponentModal';
import AddServiceLogModal from '../logbook/AddServiceLogModal';
import { calculateComponentHealth, formatKm, formatDate } from '../../utils/calculators';
import { COMPONENT_PRESETS, MOTOR_SERVICE_PACKAGES } from '../../data/presets';

export default function ComponentHealthView({
  vehicle,
  components = [],
  onResetComponentService,
  onAddComponent,
  onDeleteComponent,
  onAddServiceLog,
  onSyncPresets,
}) {
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'ATTENTION' | 'HEALTHY' | 'CRITICAL'
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [viewMode, setViewMode] = useState('GRID'); // 'GRID' | 'TABLE'

  // Modals state
  const [activeResetComponent, setActiveResetComponent] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState(null);

  if (!vehicle) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono">
        Tidak ada kendaraan aktif terpilih.
      </div>
    );
  }

  const isMotorcycle = vehicle.category === 'MOTORCYCLE';

  // Categories list for filter
  const categories = useMemo(() => {
    const set = new Set(components.map((c) => c.category || 'Umum'));
    return ['ALL', ...Array.from(set)];
  }, [components]);

  // Evaluated components with exact status:
  // - Hijau (Aman > 25%)
  // - Kuning (Waktunya Servis < 25%)
  // - Merah (Overdue / Telat Servis: sisa KM <= 0)
  const evaluated = useMemo(() => {
    return components.map((comp) => ({
      ...comp,
      health: calculateComponentHealth(vehicle.currentOdo, comp),
    }));
  }, [components, vehicle.currentOdo]);

  const healthyCount = evaluated.filter((c) => c.health.status === 'healthy').length;
  const warningCount = evaluated.filter((c) => c.health.status === 'warning').length;
  const criticalCount = evaluated.filter((c) => c.health.status === 'critical').length;

  // Filtered components list
  const filteredComponents = useMemo(() => {
    return evaluated.filter((item) => {
      // Status filter
      if (filterStatus === 'HEALTHY' && item.health.status !== 'healthy') return false;
      if (filterStatus === 'WARNING' && item.health.status !== 'warning') return false;
      if (filterStatus === 'CRITICAL' && item.health.status !== 'critical') return false;
      if (filterStatus === 'ATTENTION' && item.health.status === 'healthy') return false;

      // Category filter
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [evaluated, filterStatus, selectedCategory]);

  // Handler to load all standard presets for the vehicle via the store's syncVehiclePresets action
  const handleSyncPresets = () => {
    if (onSyncPresets) {
      onSyncPresets(vehicle.id);
    }
  };

  const handleOpenPackageService = (pkgId) => {
    setSelectedPackageId(pkgId);
    setIsServiceModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Prediktif Kesehatan Komponen & Lifespan
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                {vehicle.name} • Odometer: {new Intl.NumberFormat('id-ID').format(vehicle.currentOdo)} km
                {isMotorcycle && ' • Mode Motor Granular (Termasuk Ban Tubeless & Ban Dalam)'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Preset sync button */}
          <button
            onClick={handleSyncPresets}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition flex items-center gap-1.5 border border-slate-700"
            title="Muat preset standar lengkap untuk kendaraan ini"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isMotorcycle ? 'Muat Preset Motor & Ban' : 'Preset Standar'}</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold font-mono transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Part</span>
          </button>
        </div>
      </div>

      {/* Quick Action: Smart Bundle Servis Motor (Paket Reset Otomatis) */}
      {isMotorcycle && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                Smart Preset & Reset Komponen Motor (Quick Bundles)
              </h2>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              1-Click Batch Reset
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Pilih paket servis di bawah untuk mencatat servis dan langsung me-reset keausan suku cadang terkait ke 100% aman:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
            {MOTOR_SERVICE_PACKAGES.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => handleOpenPackageService(pkg.id)}
                className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 text-left transition group shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
                    {pkg.name}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                    {pkg.description}
                  </div>
                </div>
                <div className="mt-2 text-[10px] font-mono text-emerald-400 font-semibold flex items-center justify-between">
                  <span>{pkg.badge}</span>
                  <span className="group-hover:translate-x-0.5 transition">→</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Metric Telemetry Pills with Exact Health Thresholds */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setFilterStatus('ALL')}
          className={`p-4 rounded-xl border text-left transition ${
            filterStatus === 'ALL'
              ? 'bg-slate-800/90 border-slate-600'
              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Total Suku Cadang
          </div>
          <div className="text-xl font-mono font-bold text-white mt-1">
            {components.length} <span className="text-xs text-slate-500 font-normal">Part</span>
          </div>
        </button>

        <button
          onClick={() => setFilterStatus('HEALTHY')}
          className={`p-4 rounded-xl border text-left transition ${
            filterStatus === 'HEALTHY'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Aman (&gt;25%)</span>
          </div>
          <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
            {healthyCount}
          </div>
        </button>

        <button
          onClick={() => setFilterStatus('WARNING')}
          className={`p-4 rounded-xl border text-left transition ${
            filterStatus === 'WARNING'
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Waktunya Servis (&lt;25%)</span>
          </div>
          <div className="text-xl font-mono font-bold text-amber-400 mt-1">
            {warningCount}
          </div>
        </button>

        <button
          onClick={() => setFilterStatus('CRITICAL')}
          className={`p-4 rounded-xl border text-left transition ${
            filterStatus === 'CRITICAL'
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-[10px] font-mono uppercase tracking-wider text-rose-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            <span>Overdue / Telat Servis</span>
          </div>
          <div className="text-xl font-mono font-bold text-rose-400 mt-1">
            {criticalCount}
          </div>
        </button>
      </div>

      {/* Filter Toolbar & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono">
            <Filter className="w-3.5 h-3.5" />
            <span>Kategori:</span>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? 'Semua Kategori' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Toggle: Grid vs Table */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-950 border border-slate-800">
            <button
              onClick={() => setViewMode('GRID')}
              className={`p-1.5 rounded flex items-center gap-1 text-[11px] font-mono transition ${
                viewMode === 'GRID'
                  ? 'bg-slate-800 text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Tampilan Grid Kartu"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid Kartu</span>
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`p-1.5 rounded flex items-center gap-1 text-[11px] font-mono transition ${
                viewMode === 'TABLE'
                  ? 'bg-slate-800 text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Tampilan Tabel Ringkas"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tabel Ringkas</span>
            </button>
          </div>

          <span className="text-slate-400 font-mono text-[11px]">
            {filteredComponents.length} part
          </span>
        </div>
      </div>

      {/* Main Content: Grid vs Table */}
      {filteredComponents.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-3">
          <Activity className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="font-semibold text-white text-sm">Tidak ada komponen ditemukan</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Tidak ada komponen yang cocok dengan filter yang dipilih. Silakan ubah filter atau klik tombol "Muat 14 Part Motor".
          </p>
          <button
            onClick={() => {
              setFilterStatus('ALL');
              setSelectedCategory('ALL');
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-mono transition"
          >
            Reset Filter
          </button>
        </div>
      ) : viewMode === 'GRID' ? (
        /* 1. Grid of Component Cards with Staggered Framer Motion Animation */
        <motion.div
          key={`${vehicle.id}-${filterStatus}-${selectedCategory}`}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.04,
              },
            },
          }}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredComponents.map((comp) => (
            <ComponentCard
              key={comp.id}
              component={comp}
              currentOdo={vehicle.currentOdo}
              onResetService={(c) => setActiveResetComponent(c)}
              onDeleteComponent={onDeleteComponent}
            />
          ))}
        </motion.div>
      ) : (
        /* 2. Structured Table View */
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase">
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Suku Cadang</th>
                <th className="pb-3 font-semibold">Kategori</th>
                <th className="pb-3 font-semibold">Sisa Umur (% & Bar)</th>
                <th className="pb-3 font-semibold">Sisa / Target</th>
                <th className="pb-3 font-semibold">Terpasang Pada</th>
                <th className="pb-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredComponents.map((comp) => {
                const h = comp.health;
                const statusDot =
                  h.status === 'critical'
                    ? 'bg-rose-500 ring-rose-500/30'
                    : h.status === 'warning'
                    ? 'bg-amber-500 ring-amber-500/30'
                    : 'bg-emerald-500 ring-emerald-500/30';

                const statusText =
                  h.status === 'critical'
                    ? 'text-rose-400'
                    : h.status === 'warning'
                    ? 'text-amber-400'
                    : 'text-emerald-400';

                return (
                  <tr key={comp.id} className="hover:bg-slate-800/40 transition">
                    {/* Status indicator */}
                    <td className="py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ring-2 ${statusDot}`} />
                        <span className={`text-[10px] font-bold ${statusText}`}>
                          {h.label}
                        </span>
                      </div>
                    </td>

                    {/* Component Name & Note */}
                    <td className="py-3 font-sans whitespace-nowrap">
                      <div className="font-bold text-white text-xs">{comp.name}</div>
                      {comp.notes && (
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">
                          {comp.notes}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3 text-slate-400 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-950 border border-slate-800">
                        {comp.category || 'Umum'}
                      </span>
                    </td>

                    {/* Progress Bar & Percentage */}
                    <td className="py-3 min-w-[140px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-950 rounded-full h-2 p-0.5 border border-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              h.status === 'critical'
                                ? 'bg-rose-500'
                                : h.status === 'warning'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${h.percentage}%` }}
                          />
                        </div>
                        <span className={`text-[11px] font-bold w-10 text-right ${statusText}`}>
                          {h.percentage}%
                        </span>
                      </div>
                    </td>

                    {/* Remaining / Target */}
                    <td className="py-3 whitespace-nowrap">
                      <span className={`font-bold ${statusText}`}>
                        {h.remainingKm > 0 ? formatKm(h.remainingKm) : `Overdue ${formatKm(Math.abs(h.remainingKm))}`}
                      </span>
                      <span className="text-slate-500 text-[10px] block">
                        Target: {formatKm(comp.lifespanKm)}
                      </span>
                    </td>

                    {/* Installed At */}
                    <td className="py-3 text-slate-300 whitespace-nowrap text-[11px]">
                      <div>{formatKm(comp.installedAtKm)}</div>
                      <div className="text-[10px] text-slate-500">{formatDate(comp.lastServicedDate)}</div>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setActiveResetComponent(comp)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono font-semibold transition flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Servis</span>
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus pantauan komponen "${comp.name}"?`)) {
                              onDeleteComponent(comp.id);
                            }
                          }}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Single Component Reset Modal */}
      <ServiceResetModal
        isOpen={Boolean(activeResetComponent)}
        onClose={() => setActiveResetComponent(null)}
        component={activeResetComponent}
        vehicle={vehicle}
        onConfirmReset={onResetComponentService}
      />

      {/* Add Custom Component Modal */}
      <AddComponentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        vehicle={vehicle}
        onAddComponent={onAddComponent}
      />

      {/* Multi-Component Service Log Modal from Quick Bundles */}
      {onAddServiceLog && (
        <AddServiceLogModal
          isOpen={isServiceModalOpen}
          onClose={() => {
            setIsServiceModalOpen(false);
            setSelectedPackageId(null);
          }}
          vehicle={vehicle}
          components={components}
          onAddServiceLog={onAddServiceLog}
          initialPackageId={selectedPackageId}
        />
      )}
    </div>
  );
}
