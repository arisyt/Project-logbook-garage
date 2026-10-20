import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gauge, X, Plus, AlertCircle, Check } from 'lucide-react';
import OdometerGuardAlert from '../common/OdometerGuardAlert';
import { validateOdometerInput } from '../../utils/calculators';

export default function QuickOdoModal({
  isOpen,
  onClose,
  vehicle,
  onSaveOdo,
}) {
  const [newOdo, setNewOdo] = useState('');
  const [error, setError] = useState('');
  const [isGuardConfirmed, setIsGuardConfirmed] = useState(false);

  useEffect(() => {
    if (vehicle && isOpen) {
      setNewOdo(String(vehicle.currentOdo || 0));
      setError('');
      setIsGuardConfirmed(false);
    }
  }, [vehicle, isOpen]);

  if (!vehicle) return null;

  const currentVal = Number(vehicle.currentOdo) || 0;
  const inputVal = Number(newOdo) || 0;
  const delta = inputVal - currentVal;
  const validation = validateOdometerInput(currentVal, inputVal);

  const handleQuickAdd = (kmToAdd) => {
    const updated = Math.max(0, inputVal + kmToAdd);
    setNewOdo(String(updated));
    setIsGuardConfirmed(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isNaN(inputVal) || inputVal < 0) {
      setError('Odometer harus berupa angka positif.');
      return;
    }

    if (validation.warningLevel !== 'none' && !isGuardConfirmed) {
      setError('Mohon centang kotak konfirmasi peringatan odometer di atas sebelum menyimpan.');
      return;
    }

    onSaveOdo(vehicle.id, inputVal);
    onClose();
  };

  const isSubmitDisabled = validation.warningLevel !== 'none' && !isGuardConfirmed;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="w-full max-w-md rounded-t-3xl md:rounded-2xl max-h-[92vh] md:max-h-[85vh] flex flex-col bg-slate-900/95 md:bg-slate-900/80 backdrop-blur-2xl border-t md:border border-slate-700/80 shadow-2xl overflow-hidden relative"
          >
            {/* Grab handle for mobile bottom sheet */}
            <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mt-2.5 mb-1 md:hidden shrink-0" />

            {/* Subtle glow */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="p-4 border-b border-slate-800/80 flex items-center justify-between relative z-10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Gauge className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white">Update Odometer</h3>
                  <p className="text-[11px] font-mono text-slate-400">{vehicle.name}</p>
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
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    Odometer Terkini (km)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      step="1"
                      required
                      autoFocus
                      value={newOdo}
                      onChange={(e) => {
                        setNewOdo(e.target.value);
                        setError('');
                        setIsGuardConfirmed(false);
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700 text-emerald-400 font-mono text-xl font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                      placeholder="Contoh: 28450"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs text-slate-500">
                      KM
                    </span>
                  </div>
                  {error && (
                    <p className="text-xs text-rose-400 flex items-center gap-1 mt-1.5 font-mono">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{error}</span>
                    </p>
                  )}
                </div>

                {/* Odometer Input Guard Alert */}
                <OdometerGuardAlert
                  currentOdo={currentVal}
                  newOdo={inputVal}
                  isConfirmed={isGuardConfirmed}
                  onToggleConfirm={(val) => {
                    setIsGuardConfirmed(val);
                    if (val) setError('');
                  }}
                />

                {/* Quick Increment Buttons */}
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1.5">
                    Tambah Cepat Jarak Tempuh
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {[25, 50, 100, 250].map((inc) => (
                      <button
                        type="button"
                        key={inc}
                        onClick={() => handleQuickAdd(inc)}
                        className="px-2 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/70 text-slate-300 font-mono text-xs font-medium transition flex items-center justify-center gap-1 active:scale-95"
                      >
                        <Plus className="w-3 h-3 text-emerald-400" />
                        <span>{inc} km</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delta Indicator */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400">Perubahan Jarak:</span>
                  <span
                    className={`font-bold ${
                      delta > 0
                        ? 'text-emerald-400'
                        : delta < 0
                        ? 'text-amber-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {delta > 0
                      ? `+${new Intl.NumberFormat('id-ID').format(delta)} km`
                      : `${new Intl.NumberFormat('id-ID').format(delta)} km`}
                  </span>
                </div>
              </div>

              {/* Sticky Footer Actions */}
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
                  className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition flex items-center gap-1.5 shadow-lg ${
                    isSubmitDisabled
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 active:scale-95'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan Odometer</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
