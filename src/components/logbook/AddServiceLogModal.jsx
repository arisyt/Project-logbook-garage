import React, { useState, useEffect } from 'react';
import {
  Plus,
  X,
  Check,
  ClipboardList,
  Wrench,
  Calendar,
  MapPin,
  DollarSign,
  CheckSquare,
  Square,
  Sparkles,
  Zap,
  Droplet,
  Cog,
  Repeat,
  ShieldAlert,
  Info,
} from 'lucide-react';
import {
  formatKm,
  formatRupiah,
  matchComponentByKey,
  calculateComponentHealth,
  parseCurrencyInput,
} from '../../utils/calculators';
import { MOTOR_SERVICE_PACKAGES } from '../../data/presets';

export default function AddServiceLogModal({
  isOpen,
  onClose,
  vehicle,
  components = [],
  onAddServiceLog,
  initialPackageId = null,
}) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [odometer, setOdometer] = useState(vehicle?.currentOdo || 0);
  const [category, setCategory] = useState('ROUTINE_SERVICE');
  const [title, setTitle] = useState('');
  const [costRp, setCostRp] = useState('');
  const [workshop, setWorkshop] = useState('');
  const [notes, setNotes] = useState('');

  // Smart Reset States
  const [autoResetEnabled, setAutoResetEnabled] = useState(true);
  const [selectedPackageId, setSelectedPackageId] = useState('CUSTOM');
  const [selectedComponentIds, setSelectedComponentIds] = useState([]);

  // Sync state when opened
  useEffect(() => {
    if (vehicle && isOpen) {
      setOdometer(vehicle.currentOdo || 0);
      setDate(new Date().toISOString().split('T')[0]);

      if (initialPackageId) {
        applyPackagePreset(initialPackageId);
      } else if (vehicle.category === 'MOTORCYCLE') {
        applyPackagePreset('oli_rutin');
      } else {
        setSelectedPackageId('CUSTOM');
        setSelectedComponentIds([]);
      }
    }
  }, [vehicle, isOpen, initialPackageId]);

  if (!isOpen || !vehicle) return null;

  const isMotorcycle = vehicle.category === 'MOTORCYCLE';

  /**
   * Apply a service package preset (e.g. Paket Ganti Oli Rutin, Tune Up, CVT Lengkap)
   */
  const applyPackagePreset = (packageId) => {
    setSelectedPackageId(packageId);

    if (packageId === 'CUSTOM') {
      return;
    }

    const pkg = MOTOR_SERVICE_PACKAGES.find((p) => p.id === packageId);
    if (!pkg) return;

    // Match components for active vehicle
    const matchedIds = [];
    pkg.keys.forEach((key) => {
      components.forEach((comp) => {
        if (matchComponentByKey(key, comp)) {
          if (!matchedIds.includes(comp.id)) {
            matchedIds.push(comp.id);
          }
        }
      });
    });

    setSelectedComponentIds(matchedIds);

    // Auto-suggest Title & Category if appropriate
    if (!title || MOTOR_SERVICE_PACKAGES.some((p) => title.includes(p.name))) {
      setTitle(`${pkg.name} (${vehicle.name})`);
    }
    if (pkg.defaultCategory) {
      setCategory(pkg.defaultCategory);
    }
  };

  /**
   * Toggle individual component
   */
  const toggleComponentSelect = (compId) => {
    setSelectedPackageId('CUSTOM'); // Switch to custom if user manually edits
    setSelectedComponentIds((prev) =>
      prev.includes(compId) ? prev.filter((id) => id !== compId) : [...prev, compId]
    );
  };

  /**
   * Select All / Clear All
   */
  const handleSelectAll = (select) => {
    setSelectedPackageId('CUSTOM');
    if (select) {
      setSelectedComponentIds(components.map((c) => c.id));
    } else {
      setSelectedComponentIds([]);
    }
  };

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setOdometer(vehicle.currentOdo || 0);
    setTitle('');
    setCostRp('');
    setWorkshop('');
    setNotes('');
    setSelectedComponentIds([]);
    setSelectedPackageId('CUSTOM');
    setAutoResetEnabled(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddServiceLog({
      vehicleId: vehicle.id,
      date,
      odometer: Number(odometer) || 0,
      category,
      title: title.trim(),
      costRp: parseCurrencyInput(costRp),
      workshop: workshop.trim() || 'Bengkel / DIY',
      notes: notes.trim(),
      replacedComponentIds: autoResetEnabled ? selectedComponentIds : [],
    });

    resetForm();
    onClose();
  };

  const categories = [
    { id: 'ROUTINE_SERVICE', label: 'Servis Rutin Berkala' },
    { id: 'PART_REPLACEMENT', label: 'Ganti Sparepart' },
    { id: 'MODIFICATION', label: 'Upgrade / Modifikasi' },
    { id: 'TAX_DOCUMENT', label: 'Pajak STNK / Administrasi' },
    { id: 'INSPECTION', label: 'Inspeksi & Diagnostic' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">Catat Servis / Perawatan Baru</h3>
              <p className="text-[11px] font-mono text-slate-400">
                {vehicle.name} • Odometer: {new Intl.NumberFormat('id-ID').format(vehicle.currentOdo)} km
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Smart Preset & Reset Komponen Otomatis Section */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="auto-reset-toggle"
                  checked={autoResetEnabled}
                  onChange={(e) => setAutoResetEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                />
                <label
                  htmlFor="auto-reset-toggle"
                  className="text-xs font-mono font-bold text-emerald-400 cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Aktifkan Reset Komponen Otomatis</span>
                </label>
              </div>

              {autoResetEnabled && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  {selectedComponentIds.length} part dipilih
                </span>
              )}
            </div>

            {autoResetEnabled && (
              <div className="space-y-3 pt-1 border-t border-slate-800/80">
                {/* Motor Quick Package Presets */}
                {isMotorcycle ? (
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                        Pilih Preset Paket Servis Motor:
                      </span>
                      <button
                        type="button"
                        onClick={() => applyPackagePreset('CUSTOM')}
                        className={`text-[10px] font-mono transition ${
                          selectedPackageId === 'CUSTOM'
                            ? 'text-cyan-400 font-bold underline'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Pilih Manual / Kustom
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {MOTOR_SERVICE_PACKAGES.map((pkg) => {
                        const isSelected = selectedPackageId === pkg.id;
                        return (
                          <button
                            type="button"
                            key={pkg.id}
                            onClick={() => applyPackagePreset(pkg.id)}
                            className={`p-2 rounded-lg border text-left text-xs font-mono transition flex flex-col justify-between ${
                              isSelected
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                            }`}
                          >
                            <div className="font-bold truncate text-[11px] leading-tight">
                              {pkg.name}
                            </div>
                            <div className="text-[9px] text-slate-400 truncate mt-1">
                              {pkg.badge}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-slate-400">
                      Pilih komponen yang baru diservis/diganti:
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectAll(true)}
                        className="text-[10px] font-mono text-emerald-400 hover:underline"
                      >
                        Centang Semua
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectAll(false)}
                        className="text-[10px] font-mono text-slate-400 hover:underline"
                      >
                        Bersihkan
                      </button>
                    </div>
                  </div>
                )}

                {/* Interactive Component Checklist */}
                <div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mb-1">
                    <span>Daftar Suku Cadang Terkait:</span>
                    <span>Klik kotak untuk mencentang/membatalkan</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
                    {components.map((comp) => {
                      const isChecked = selectedComponentIds.includes(comp.id);
                      const health = calculateComponentHealth(
                        odometer || vehicle.currentOdo,
                        comp.installedAtKm,
                        comp.lifespanKm
                      );

                      return (
                        <div
                          key={comp.id}
                          onClick={() => toggleComponentSelect(comp.id)}
                          className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition select-none ${
                            isChecked
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-600 shrink-0" />
                            )}
                            <span className="truncate font-medium text-white">{comp.name}</span>
                          </div>

                          {/* Mini health pill */}
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold shrink-0 ${
                              health.status === 'critical'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : health.status === 'warning'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {health.percentage}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <p className="text-[10px] font-mono text-slate-400 bg-slate-900/60 p-2 rounded border border-slate-800">
                  ⚡ Odometer pasang komponen terpilih akan otomatis di-reset ke <span className="text-emerald-400 font-bold">{odometer} km</span>. Progress wear bar akan segar kembali ke 100% aman (0% wear).
                </p>
              </div>
            )}
          </div>

          {/* Title / Jenis Servis */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
              Judul Servis / Pekerjaan *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Paket Servis CVT Lengkap + Ganti Oli"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Kategori Servis
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left border transition ${
                    category === cat.id
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Odometer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                Tanggal Servis *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                Odometer Saat Servis (km) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-emerald-400 font-mono text-xs font-bold focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Cost & Workshop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                Total Biaya (Rp)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={costRp}
                onChange={(e) => setCostRp(e.target.value)}
                placeholder="Contoh: 185000 atau 185.000"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-emerald-400 font-mono text-xs font-bold focus:outline-none focus:border-emerald-500 transition"
              />
              <div className="text-[10px] font-mono mt-1 text-slate-500">
                {costRp ? (
                  <span className="text-emerald-400 font-semibold">
                    Format: {formatRupiah(parseCurrencyInput(costRp))}
                  </span>
                ) : (
                  <span>Ketik nominal bebas (contoh: 150000 atau 150.000)</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                Nama Bengkel / DIY
              </label>
              <input
                type="text"
                value={workshop}
                onChange={(e) => setWorkshop(e.target.value)}
                placeholder="Bengkel AHASS / Yamaha DDS / DIY Rumah"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
              Catatan Servis / Rincian
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan merk oli, berat roller yang dipasang, atau nomor faktur..."
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold font-mono transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/10"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan Catatan & Reset Komponen</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
