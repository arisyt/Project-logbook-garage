import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, X, Check, DollarSign, MapPin, Calendar, Gauge } from 'lucide-react';
import { formatKm, formatRupiah, parseCurrencyInput } from '../../utils/calculators';
import { fireSuccessCelebration } from '../../utils/confetti';

export default function ServiceResetModal({
  isOpen,
  onClose,
  component,
  vehicle,
  onConfirmReset,
}) {
  const [costRp, setCostRp] = useState('');
  const [workshop, setWorkshop] = useState('Bengkel Langganan');
  const [notes, setNotes] = useState('');
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (component && isOpen) {
      setNotes(`Ganti / Servis berkala ${component.name}.`);
      setCostRp('');
      setServiceDate(new Date().toISOString().split('T')[0]);
    }
  }, [component, isOpen]);

  if (!component || !vehicle) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmReset(component.id, {
      date: serviceDate,
      costRp: parseCurrencyInput(costRp),
      workshop: workshop.trim() || 'Bengkel / DIY',
      notes: notes.trim(),
      title: `Servis / Reset ${component.name}`,
      category: 'PART_REPLACEMENT',
    });

    // Trigger visual confetti explosion
    fireSuccessCelebration();

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="w-full max-w-md rounded-t-3xl md:rounded-2xl max-h-[92vh] md:max-h-[85vh] flex flex-col bg-slate-900/95 md:bg-slate-900/85 backdrop-blur-2xl border-t md:border border-slate-700/80 shadow-2xl overflow-hidden relative"
          >
            {/* Grab handle for mobile bottom sheet */}
            <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mt-2.5 mb-1 md:hidden shrink-0" />

            {/* Subtle glow */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="p-4 border-b border-slate-800/80 flex items-center justify-between relative z-10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white">Servis Sekarang & Reset</h3>
                  <p className="text-[11px] font-mono text-emerald-400">{component.name}</p>
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
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden relative z-10">
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs font-mono space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Kendaraan:</span>
                    <span className="text-white font-bold">{vehicle.name}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Odometer Servis:</span>
                    <span className="text-emerald-400 font-bold">{formatKm(vehicle.currentOdo)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Target Interval:</span>
                    <span className="text-slate-300">{formatKm(component.lifespanKm)}</span>
                  </div>
                  {component.lifespanMonths && (
                    <div className="flex justify-between text-slate-400">
                      <span>Target Waktu:</span>
                      <span className="text-cyan-400 font-bold">{component.lifespanMonths} Bulan</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                    Tanggal Servis
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={serviceDate}
                      onChange={(e) => setServiceDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                    Biaya Servis / Sparepart (Rp)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={costRp}
                      onChange={(e) => setCostRp(e.target.value)}
                      placeholder="Contoh: 350000 atau 350.000 (0 jika DIY)"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700 text-emerald-400 font-mono text-sm font-bold focus:outline-none focus:border-emerald-500 transition"
                    />
                    <div className="text-[10px] font-mono mt-1 text-slate-500">
                      {costRp ? (
                        <span className="text-emerald-400 font-semibold">
                          Format: {formatRupiah(parseCurrencyInput(costRp))}
                        </span>
                      ) : (
                        <span>Ketik nominal bebas (contoh: 350000 atau 350.000)</span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                    Nama Bengkel / Toko / DIY
                  </label>
                  <input
                    type="text"
                    value={workshop}
                    onChange={(e) => setWorkshop(e.target.value)}
                    placeholder="Contoh: Bengkel Resmi / DIY Garasi Rumah"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                    Catatan / Rincian Servis
                  </label>
                  <textarea
                    rows="2"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Merk oli, spesifikasi suku cadang baru..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Action Buttons */}
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
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold font-mono transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan & Reset ke {formatKm(vehicle.currentOdo)}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
