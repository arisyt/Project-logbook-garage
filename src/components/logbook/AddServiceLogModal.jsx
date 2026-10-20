import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  validateOdometerInput,
} from '../../utils/calculators';
import { MOTOR_SERVICE_PACKAGES } from '../../data/presets';
import { fireSuccessCelebration } from '../../utils/confetti';
import OdometerGuardAlert from '../common/OdometerGuardAlert';

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
  const [isGuardConfirmed, setIsGuardConfirmed] = useState(false);
  const [formError, setFormError] = useState('');

  // Smart Reset States
  const [autoResetEnabled, setAutoResetEnabled] = useState(true);
  const [selectedPackageId, setSelectedPackageId] = useState('CUSTOM');
  const [selectedComponentIds, setSelectedComponentIds] = useState([]);

  // Sync state when opened
  useEffect(() => {
    if (vehicle && isOpen) {
      setOdometer(vehicle.currentOdo || 0);
      setDate(new Date().toISOString().split('T')[0]);
      setIsGuardConfirmed(false);
      setFormError('');

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

  if (!vehicle) return null;

  const isMotorcycle = vehicle.category === 'MOTORCYCLE';
  const currentVehicleOdo = Number(vehicle.currentOdo) || 0;
  const inputOdo = Number(odometer) || 0;
  const odoValidation = validateOdometerInput(currentVehicleOdo, inputOdo);

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
    setSelectedPackageId('CUSTOM');
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
    setIsGuardConfirmed(false);
    setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Judul kegiatan servis tidak boleh kosong.');
      return;
    }

    if (odoValidation.warningLevel !== 'none' && !isGuardConfirmed) {
      setFormError('Mohon centang kotak konfirmasi peringatan odometer sebelum menyimpan.');
      return;
    }

    onAddServiceLog({
      vehicleId: vehicle.id,
      date,
      odometer: inputOdo,
      category,
      title: title.trim(),
      costRp: parseCurrencyInput(costRp),
      workshop: workshop.trim() || 'Bengkel / DIY',
      notes: notes.trim(),
      replacedComponentIds: autoResetEnabled ? selectedComponentIds : [],
    });

    // Fire celebratory confetti if components were reset or service logged
    fireSuccessCelebration();

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

  const isSubmitDisabled = odoValidation.warningLevel !== 'none' && !isGuardConfirmed;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="w-full max-w-2xl rounded-t-3xl md:rounded-2xl max-h-[92vh] md:max-h-[88vh] flex flex-col bg-slate-900/95 md:bg-slate-900/90 backdrop-blur-2xl border-t md:border border-slate-700/80 shadow-2xl overflow-hidden relative"
          >
            {/* Grab handle for mobile bottom sheet */}
            <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mt-2.5 mb-1 md:hidden shrink-0" />

            {/* Ambient subtle glow */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="p-4 border-b border-slate-800/80 flex items-center justify-between relative z-10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden relative z-10">
              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Smart Preset & Reset Komponen Otomatis Section */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="autoResetToggle"
                      checked={autoResetEnabled}
                      onChange={(e) => setAutoResetEnabled(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0 cursor-pointer"
                    />
                    <label
                      htmlFor="autoResetToggle"
                      className="text-xs font-semibold text-emerald-400 cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Aktifkan Smart Reset Suku Cadang Terkait Otomatis</span>
                    </label>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    {selectedComponentIds.length} part dipilih
                  </span>
                </div>

                {autoResetEnabled && (
                  <div className="space-y-3 pt-1 border-t border-slate-800/80">
                    {/* Preset Buttons for Motorcycle */}
                    {isMotorcycle && (
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">
                          Preset Paket Servis Motor:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                          {MOTOR_SERVICE_PACKAGES.map((pkg) => {
                            const isSelected = selectedPackageId === pkg.id;
                            return (
                              <button
                                key={pkg.id}
                                type="button"
                                onClick={() => applyPackagePreset(pkg.id)}
                                className={`p-2 rounded-lg border text-left text-xs font-mono transition flex flex-col justify-between ${
                                  isSelected
                                    ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 ring-1 ring-emerald-500/50'
                                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                                }`}
                              >
                                <div className="flex items-center justify-between font-bold">
                                  <span className="truncate">{pkg.name}</span>
                                  {isSelected && <Check className="w-3 h-3 text-emerald-400 shrink-0" />}
                                </div>
                                <span className="text-[9px] text-slate-400 truncate mt-1">
                                  {pkg.description}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Quick Tools: Select All / Clear */}
                    {components.length > 0 && (
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
                        {components.map((comp) => {
                          const isChecked = selectedComponentIds.includes(comp.id);
                          const health = calculateComponentHealth(
                            odometer || vehicle.currentOdo,
                            comp
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
                      ⚡ Suku cadang terpilih akan di-reset ke odometer <span className="text-emerald-400 font-bold">{odometer} km</span> & tanggal servis hari ini.
                    </p>
                  </div>
                )}
              </div>

              {/* Title & Category */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Nama Servis / Pekerjaan *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setFormError('');
                  }}
                  placeholder="Contoh: Paket Ganti Oli + Servis CVT Berkala"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700 text-white font-medium text-xs focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Kategori Servis
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono transition text-left ${
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
                    className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                    Odometer Saat Servis (km) *
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    required
                    value={odometer}
                    onChange={(e) => {
                      setOdometer(e.target.value);
                      setIsGuardConfirmed(false);
                      setFormError('');
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700 text-emerald-400 font-mono text-xs font-bold focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Odometer Guard Alert */}
              <OdometerGuardAlert
                currentOdo={currentVehicleOdo}
                newOdo={inputOdo}
                isConfirmed={isGuardConfirmed}
                onToggleConfirm={(val) => {
                  setIsGuardConfirmed(val);
                  if (val) setFormError('');
                }}
              />

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
                    className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700 text-emerald-400 font-mono text-xs font-bold focus:outline-none focus:border-emerald-500 transition"
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
                    className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 transition"
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
                  className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              {formError && (
                <p className="text-xs text-rose-400 font-mono bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/30">
                  {formError}
                </p>
              )}
            </div>

            {/* Sticky Action Buttons */}
            <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-md pt-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] md:pb-3 px-5 border-t border-slate-800/80 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold font-mono transition flex items-center gap-1.5 shadow-lg ${
                  isSubmitDisabled
                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 active:scale-95'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Simpan Catatan & Reset Komponen</span>
              </button>
            </div>
          </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
