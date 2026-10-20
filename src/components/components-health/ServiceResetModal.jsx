import React, { useState, useEffect } from 'react';
import { Wrench, X, Check, DollarSign, MapPin, Calendar, Gauge } from 'lucide-react';
import { formatKm, formatRupiah, parseCurrencyInput } from '../../utils/calculators';

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
    if (component) {
      setNotes(`Ganti / Servis berkala ${component.name}.`);
      setCostRp('');
      setServiceDate(new Date().toISOString().split('T')[0]);
    }
  }, [component, isOpen]);

  if (!isOpen || !component || !vehicle) return null;

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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-mono space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Kendaraan:</span>
              <span className="text-white font-bold">{vehicle.name}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Odometer Servis:</span>
              <span className="text-emerald-400 font-bold">{formatKm(vehicle.currentOdo)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Interval Rekomendasi:</span>
              <span className="text-slate-300">{formatKm(component.lifespanKm)}</span>
            </div>
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
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
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
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-emerald-400 font-mono text-sm font-bold focus:outline-none focus:border-emerald-500"
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
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              Catatan / Spesifikasi Part Baru
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Merk oli, seri kampas rem, atau nomor invoice..."
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
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
              <span>Simpan & Reset ke {formatKm(vehicle.currentOdo)}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
