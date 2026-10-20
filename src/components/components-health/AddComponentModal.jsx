import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Check, Activity, ShieldCheck, Clock } from 'lucide-react';
import { COMPONENT_PRESETS } from '../../data/presets';

export default function AddComponentModal({
  isOpen,
  onClose,
  vehicle,
  onAddComponent,
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Umum');
  const [installedAtKm, setInstalledAtKm] = useState(vehicle?.currentOdo || 0);
  const [lifespanKm, setLifespanKm] = useState('10000');
  const [lifespanMonths, setLifespanMonths] = useState('');
  const [notes, setNotes] = useState('');

  if (!vehicle) return null;

  const presetsForCategory = COMPONENT_PRESETS[vehicle.category] || [];

  const handleApplyPresetTemplate = (preset) => {
    setName(preset.name);
    setCategory(preset.category);
    setLifespanKm(String(preset.lifespanKm));
    setLifespanMonths(preset.lifespanMonths ? String(preset.lifespanMonths) : '');
    setNotes(preset.description || '');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddComponent({
      vehicleId: vehicle.id,
      name: name.trim(),
      category: category.trim() || 'Umum',
      installedAtKm: Number(installedAtKm) || 0,
      lifespanKm: Math.max(10, Number(lifespanKm) || 5000),
      lifespanMonths: lifespanMonths ? Number(lifespanMonths) : null,
      notes: notes.trim(),
    });

    setName('');
    setLifespanMonths('');
    setNotes('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="w-full max-w-md rounded-2xl bg-slate-900/90 backdrop-blur-2xl border border-slate-700/80 shadow-2xl overflow-hidden relative"
          >
            {/* Subtle glow */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="p-4 border-b border-slate-800/80 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white">Tambah Komponen Pantauan</h3>
                  <p className="text-[11px] text-slate-400">{vehicle.name}</p>
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
            <form onSubmit={handleSubmit} className="p-5 space-y-4 relative z-10 max-h-[85vh] overflow-y-auto">
              {/* Quick preset selector shortcuts */}
              {presetsForCategory.length > 0 && (
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1.5">
                    Template Preset Cepat
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {presetsForCategory.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyPresetTemplate(preset)}
                        className="px-2 py-1 rounded bg-slate-800/70 hover:bg-slate-700 text-slate-300 text-[10px] font-mono border border-slate-700/80 transition"
                      >
                        + {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Nama Komponen / Part *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Rantai KMC X11, Kampas Rem Belakang, Aki"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Kategori Part
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Pelumasan, Drivetrain..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              {/* Dual-Threshold Lifespan Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                    Target Lifespan (km) *
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="50"
                    required
                    value={lifespanKm}
                    onChange={(e) => setLifespanKm(e.target.value)}
                    placeholder="Misal: 3000"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700 text-emerald-400 font-mono text-xs font-bold focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>Masa Pakai (Bulan)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={lifespanMonths}
                    onChange={(e) => setLifespanMonths(e.target.value)}
                    placeholder="Opsional (misal: 6)"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700 text-cyan-400 font-mono text-xs font-bold focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Odometer Saat Pemasangan (km)
                </label>
                <input
                  type="number"
                  min="0"
                  value={installedAtKm}
                  onChange={(e) => setInstalledAtKm(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500 transition"
                />
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                  Default ke odometer saat ini ({vehicle.currentOdo} km).
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Catatan / Merk / Tipe
                </label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Spesifikasi part, ukuran, atau kode barang..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 transition"
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
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold font-mono transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan Komponen</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
