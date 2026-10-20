import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car,
  Flame,
  Bike,
  X,
  Plus,
  Check,
  Calendar,
  Layers,
} from 'lucide-react';
import { fireSuccessCelebration } from '../../utils/confetti';

export default function AddVehicleModal({ isOpen, onClose, onAddVehicle }) {
  const [category, setCategory] = useState('CAR');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [currentOdo, setCurrentOdo] = useState('');
  const [notes, setNotes] = useState('');

  // Car / Motorcycle specific
  const [plateNumber, setPlateNumber] = useState('');
  const [stnkExpiryDate, setStnkExpiryDate] = useState('');
  const [plateExpiryDate, setPlateExpiryDate] = useState('');
  const [fuelType, setFuelType] = useState('RON 92 (Pertamax)');
  const [tankCapacityLiters, setTankCapacityLiters] = useState('');

  // Bicycle specific
  const [frameset, setFrameset] = useState('');
  const [groupset, setGroupset] = useState('');
  const [wheelset, setWheelset] = useState('');
  const [tireWidthMm, setTireWidthMm] = useState(28);
  const [riderWeightKg, setRiderWeightKg] = useState(70);
  const [bikeWeightKg, setBikeWeightKg] = useState(8.5);
  const [isTubeless, setIsTubeless] = useState(true);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setBrand('');
    setModel('');
    setCurrentOdo('');
    setPlateNumber('');
    setStnkExpiryDate('');
    setPlateExpiryDate('');
    setNotes('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      category,
      name: name.trim(),
      brand: brand.trim(),
      model: model.trim(),
      year: Number(year) || new Date().getFullYear(),
      currentOdo: Number(currentOdo) || 0,
      notes: notes.trim(),
      ...(category === 'BICYCLE'
        ? {
            frameset: frameset.trim(),
            groupset: groupset.trim(),
            wheelset: wheelset.trim(),
            tireWidthMm: Number(tireWidthMm) || 28,
            riderWeightKg: Number(riderWeightKg) || 70,
            bikeWeightKg: Number(bikeWeightKg) || 8.5,
            isTubeless,
          }
        : {
            plateNumber: plateNumber.trim().toUpperCase(),
            stnkExpiryDate,
            plateExpiryDate,
            fuelType,
            tankCapacityLiters: Number(tankCapacityLiters) || (category === 'CAR' ? 45 : 7),
          }),
    };

    onAddVehicle(payload);
    fireSuccessCelebration();
    resetForm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="w-full max-w-xl rounded-2xl bg-slate-900/90 backdrop-blur-2xl border border-slate-700/80 shadow-2xl overflow-hidden my-8 relative"
          >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">Tambah Kendaraan Baru</h3>
              <p className="text-[11px] text-slate-400">
                Pilih kategori dan lengkapi spesifikasi teknis
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
          {/* Category Selector Tabs */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">
              Kategori Kendaraan
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'CAR', label: 'Mobil (Car)', icon: Car, activeClass: 'border-blue-500 bg-blue-500/10 text-blue-400' },
                { id: 'MOTORCYCLE', label: 'Motor (Moto)', icon: Flame, activeClass: 'border-amber-500 bg-amber-500/10 text-amber-400' },
                { id: 'BICYCLE', label: 'Sepeda (Velo)', icon: Bike, activeClass: 'border-emerald-500 bg-emerald-500/10 text-emerald-400' },
              ].map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition ${
                      isSelected
                        ? cat.activeClass
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-semibold">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Name & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                Nama Panggilan / Alias *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={category === 'CAR' ? 'Civic Turbo RS' : category === 'MOTORCYCLE' ? 'NMAX Harian' : 'Strattos S8 Disc'}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                Merk / Pabrikan *
              </label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder={category === 'CAR' ? 'Honda' : category === 'MOTORCYCLE' ? 'Yamaha' : 'Polygon'}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Model & Year */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                Tipe / Varian Lengkap
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Misal: 1.5L Turbo CVT / Connected ABS"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                Tahun Produksi
              </label>
              <input
                type="number"
                min="1970"
                max="2035"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Odometer */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
              Odometer Awal (km) *
            </label>
            <input
              type="number"
              min="0"
              required
              value={currentOdo}
              onChange={(e) => setCurrentOdo(e.target.value)}
              placeholder="Jarak tempuh saat didaftarkan, misal: 15000"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-emerald-400 font-mono text-sm font-semibold focus:outline-none focus:border-emerald-500 transition"
            />
            <p className="text-[10px] text-slate-500 mt-1 font-mono">
              * Preset 5 komponen aus utama akan otomatis diatur berbasis odometer ini.
            </p>
          </div>

          {/* Dynamic Fields: CAR / MOTORCYCLE */}
          {category !== 'BICYCLE' ? (
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="text-[11px] font-mono font-semibold uppercase text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>Dokumen & Plat Nomor (Indonesia)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Plat Nomor (Nopol)
                  </label>
                  <input
                    type="text"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    placeholder="B 1234 GTR"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white uppercase font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Pajak STNK 1 Tahun
                  </label>
                  <input
                    type="date"
                    value={stnkExpiryDate}
                    onChange={(e) => setStnkExpiryDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Plat Nomor 5 Tahun
                  </label>
                  <input
                    type="date"
                    value={plateExpiryDate}
                    onChange={(e) => setPlateExpiryDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Bahan Bakar Rekomendasi
                  </label>
                  <input
                    type="text"
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    placeholder="RON 92 / RON 95 / Solar"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Kapasitas Tangki (Liter)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={tankCapacityLiters}
                    onChange={(e) => setTankCapacityLiters(e.target.value)}
                    placeholder={category === 'CAR' ? '45' : '7'}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Dynamic Fields: BICYCLE */
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="text-[11px] font-mono font-semibold uppercase text-emerald-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Spesifikasi Kokpit & Bobot Sepeda</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Frameset
                  </label>
                  <input
                    type="text"
                    value={frameset}
                    onChange={(e) => setFrameset(e.target.value)}
                    placeholder="Carbon Disc / Alloy"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Groupset
                  </label>
                  <input
                    type="text"
                    value={groupset}
                    onChange={(e) => setGroupset(e.target.value)}
                    placeholder="Shimano Ultegra 50/34 - 11/30"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">
                    Lebar Ban (mm/c)
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="60"
                    value={tireWidthMm}
                    onChange={(e) => setTireWidthMm(e.target.value)}
                    className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">
                    Bobot Rider (kg)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="150"
                    value={riderWeightKg}
                    onChange={(e) => setRiderWeightKg(e.target.value)}
                    className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">
                    Bobot Sepeda (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="4"
                    max="30"
                    value={bikeWeightKg}
                    onChange={(e) => setBikeWeightKg(e.target.value)}
                    className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="tubeless-check"
                  checked={isTubeless}
                  onChange={(e) => setIsTubeless(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="tubeless-check" className="text-xs text-slate-300 font-mono">
                  Setup Tubeless (Tekanan PSI ~9% lebih rendah)
                </label>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
              Catatan Tambahan
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan servis, tipe ban, atau histori kendaraan..."
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
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold font-mono transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/10"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Daftarkan Kendaraan</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )}
</AnimatePresence>
  );
}
