import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  Trash2,
  Calendar,
  Gauge,
  MapPin,
  CheckCircle2,
  ArrowUpDown,
  Tag,
} from 'lucide-react';
import CostAnalyticsCards from './CostAnalyticsCards';
import AddServiceLogModal from './AddServiceLogModal';
import { formatRupiah, formatKm, formatDate } from '../../utils/calculators';

export default function ServiceLogbookView({
  vehicle,
  serviceLogs = [],
  components = [],
  onAddServiceLog,
  onDeleteServiceLog,
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('DATE_DESC'); // 'DATE_DESC' | 'ODO_DESC' | 'COST_DESC'

  if (!vehicle) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono">
        Tidak ada kendaraan aktif terpilih.
      </div>
    );
  }

  // Filtered and sorted logs
  const processedLogs = useMemo(() => {
    let result = [...serviceLogs];

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (log) =>
          log.title?.toLowerCase().includes(q) ||
          log.notes?.toLowerCase().includes(q) ||
          log.workshop?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'ALL') {
      result = result.filter((log) => log.category === selectedCategory);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'DATE_DESC') {
        return new Date(b.date) - new Date(a.date) || b.odometer - a.odometer;
      }
      if (sortBy === 'ODO_DESC') {
        return b.odometer - a.odometer;
      }
      if (sortBy === 'COST_DESC') {
        return b.costRp - a.costRp;
      }
      return 0;
    });

    return result;
  }, [serviceLogs, searchTerm, selectedCategory, sortBy]);

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'ROUTINE_SERVICE':
        return { label: 'Servis Rutin', bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
      case 'PART_REPLACEMENT':
        return { label: 'Ganti Part', bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
      case 'MODIFICATION':
        return { label: 'Upgrade / Modif', bg: 'bg-purple-500/15 text-purple-400 border-purple-500/30' };
      case 'TAX_DOCUMENT':
        return { label: 'Pajak STNK', bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
      case 'INSPECTION':
        return { label: 'Inspeksi', bg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' };
      default:
        return { label: 'Umum', bg: 'bg-slate-500/15 text-slate-400 border-slate-500/30' };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Top Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-950/80 backdrop-blur-xl border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Riwayat Servis & Analitik Biaya
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                {vehicle.name} • Total {serviceLogs.length} Catatan Masuk
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold font-mono transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Servis Baru</span>
        </button>
      </div>

      {/* Cost Analytics Overview Component */}
      <CostAnalyticsCards vehicle={vehicle} serviceLogs={serviceLogs} />

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari pekerjaan, bengkel, part..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        {/* Filter and Sort Group */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-300 font-mono text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="ROUTINE_SERVICE">Servis Rutin</option>
            <option value="PART_REPLACEMENT">Ganti Part</option>
            <option value="MODIFICATION">Upgrade / Modif</option>
            <option value="TAX_DOCUMENT">Pajak STNK</option>
            <option value="INSPECTION">Inspeksi</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-300 font-mono text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="DATE_DESC">Tanggal (Terbaru)</option>
            <option value="ODO_DESC">Odometer (Tertinggi)</option>
            <option value="COST_DESC">Biaya (Terbesar)</option>
          </select>
        </div>
      </div>

      {/* Logbook Records List */}
      {processedLogs.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-3">
          <ClipboardList className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="font-semibold text-white text-sm">Tidak ada riwayat servis yang cocok</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm || selectedCategory !== 'ALL'
              ? 'Coba sesuaikan kata kunci pencarian atau kategori filter Anda.'
              : 'Belum ada catatan servis untuk kendaraan ini. Klik tombol "Catat Servis Baru" di atas untuk memulai.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {processedLogs.map((log) => {
            const badge = getCategoryBadge(log.category);

            // Replaced component names
            const replacedNames = (log.replacedComponentIds || [])
              .map((id) => components.find((c) => c.id === id)?.name)
              .filter(Boolean);

            return (
              <div
                key={log.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left Meta & Content */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${badge.bg}`}
                    >
                      {badge.label}
                    </span>
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {formatDate(log.date)}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5 text-slate-500" />
                      {formatKm(log.odometer)}
                    </span>
                    {log.workshop && (
                      <>
                        <span className="text-slate-600">•</span>
                        <span className="text-xs font-sans text-slate-400 flex items-center gap-1 truncate">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          {log.workshop}
                        </span>
                      </>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-white">{log.title}</h3>

                  {log.notes && (
                    <p className="text-xs text-slate-300 font-sans leading-relaxed">
                      {log.notes}
                    </p>
                  )}

                  {/* Replaced Components Pills */}
                  {replacedNames.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Part Di-reset:</span>
                      {replacedNames.map((name, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                        >
                          ✓ {name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Cost & Delete Action */}
                <div className="flex items-center justify-between md:flex-col md:items-end gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-0 border-slate-800">
                  <div className="text-right">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                      Total Biaya
                    </div>
                    <div className="text-lg font-mono font-extrabold text-emerald-400">
                      {formatRupiah(log.costRp)}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm(`Hapus catatan servis "${log.title}"?`)) {
                        onDeleteServiceLog(log.id);
                      }
                    }}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                    title="Hapus catatan ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Log Modal */}
      <AddServiceLogModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        vehicle={vehicle}
        components={components}
        onAddServiceLog={onAddServiceLog}
      />
    </motion.div>
  );
}
