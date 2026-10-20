import React, { useState, useEffect } from 'react';
import { Gauge, X, Plus, AlertCircle, Check } from 'lucide-react';

export default function QuickOdoModal({
  isOpen,
  onClose,
  vehicle,
  onSaveOdo,
}) {
  const [newOdo, setNewOdo] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (vehicle) {
      setNewOdo(String(vehicle.currentOdo || 0));
      setError('');
    }
  }, [vehicle, isOpen]);

  if (!isOpen || !vehicle) return null;

  const currentVal = Number(vehicle.currentOdo) || 0;
  const inputVal = Number(newOdo) || 0;
  const delta = inputVal - currentVal;

  const handleQuickAdd = (kmToAdd) => {
    setNewOdo(String(Math.max(0, inputVal + kmToAdd)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isNaN(inputVal) || inputVal < 0) {
      setError('Odometer harus berupa angka positif.');
      return;
    }
    if (inputVal < currentVal) {
      const confirmLower = window.confirm(
        `Odometer baru (${inputVal} km) lebih rendah dari odometer saat ini (${currentVal} km). Apakah Anda yakin ingin memundurkan odometer?`
      );
      if (!confirmLower) return;
    }

    onSaveOdo(vehicle.id, inputVal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Odometer Terkini (km)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="1"
                required
                autoFocus
                value={newOdo}
                onChange={(e) => {
                  setNewOdo(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 font-mono text-xl font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                placeholder="Contoh: 28450"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs text-slate-500">
                KM
              </span>
            </div>
            {error && (
              <p className="text-xs text-rose-400 flex items-center gap-1 mt-1.5 font-mono">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
          </div>

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
                  className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300 font-mono text-xs font-medium transition flex items-center justify-center gap-1"
                >
                  <Plus className="w-3 h-3 text-emerald-400" />
                  <span>{inc} km</span>
                </button>
              ))}
            </div>
          </div>

          {/* Delta Indicator */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center text-xs font-mono">
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
              {delta > 0 ? `+${new Intl.NumberFormat('id-ID').format(delta)} km` : `${new Intl.NumberFormat('id-ID').format(delta)} km`}
            </span>
          </div>

          {/* Footer Actions */}
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
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold font-mono transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/10"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan Odometer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
