import React, { useState } from 'react';
import { Calendar, AlertTriangle, CheckCircle2, AlertCircle, Edit2, Check, X, ShieldCheck } from 'lucide-react';
import { calculateTaxStatus, formatDate, parseCurrencyInput, formatRupiah } from '../../utils/calculators';

export default function TaxReminderCard({ vehicle, onUpdateVehicle, onAddServiceLog }) {
  const [isEditing, setIsEditing] = useState(false);
  const [stnkDate, setStnkDate] = useState(vehicle?.stnkExpiryDate || '');
  const [plateDate, setPlateDate] = useState(vehicle?.plateExpiryDate || '');
  const [isTaxInputOpen, setIsTaxInputOpen] = useState(false);
  const [taxAmountStr, setTaxAmountStr] = useState('1250000');

  if (!vehicle || vehicle.category === 'BICYCLE') return null;

  const stnkStatus = calculateTaxStatus(vehicle.stnkExpiryDate);
  const plateStatus = calculateTaxStatus(vehicle.plateExpiryDate);

  const handleSaveDates = (e) => {
    e.preventDefault();
    onUpdateVehicle(vehicle.id, {
      stnkExpiryDate: stnkDate,
      plateExpiryDate: plateDate,
    });
    setIsEditing(false);
  };

  const handleLogTaxPayment = () => {
    const cost = parseCurrencyInput(taxAmountStr);
    if (!cost) return;

    onAddServiceLog({
      vehicleId: vehicle.id,
      date: new Date().toISOString().split('T')[0],
      odometer: vehicle.currentOdo,
      category: 'TAX_DOCUMENT',
      title: `Pembayaran Pajak STNK ${vehicle.plateNumber}`,
      costRp: cost,
      workshop: 'Samsat / SIGNAL',
      notes: 'Pajak STNK tahunan dibayarkan lunas.',
      replacedComponentIds: [],
    });

    // Advance STNK by 1 year
    if (vehicle.stnkExpiryDate) {
      const currentExp = new Date(vehicle.stnkExpiryDate);
      currentExp.setFullYear(currentExp.getFullYear() + 1);
      const nextExp = currentExp.toISOString().split('T')[0];
      onUpdateVehicle(vehicle.id, { stnkExpiryDate: nextExp });
      setStnkDate(nextExp);
    }

    setIsTaxInputOpen(false);
    setTaxAmountStr('1250000');
  };

  const getStatusBadge = (statusObj) => {
    switch (statusObj.status) {
      case 'expired':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'critical':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse';
      case 'warning':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-white truncate">Pengingat Pajak STNK & Plat Nomor</h2>
            <p className="text-xs text-slate-400 font-mono truncate">
              Plat: {vehicle.plateNumber || '-'} • Telemetri Dokumen Kendaraan Bermotor
            </p>
          </div>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition flex items-center gap-1.5 border border-slate-700 shrink-0"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Ubah Tanggal</span>
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(false)}
            className="self-start sm:self-auto px-2 py-1 rounded text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSaveDates} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Jatuh Tempo Pajak Tahunan STNK
              </label>
              <input
                type="date"
                required
                value={stnkDate}
                onChange={(e) => setStnkDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Jatuh Tempo Plat Nomor 5 Tahun
              </label>
              <input
                type="date"
                required
                value={plateDate}
                onChange={(e) => setPlateDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white text-xs font-mono font-bold flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan Tanggal</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Annual STNK Tax Box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Pajak Tahunan STNK (PKB)
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getStatusBadge(
                    stnkStatus
                  )}`}
                >
                  {stnkStatus.label}
                </span>
              </div>
              <div className="text-base font-mono font-bold text-white">
                {formatDate(vehicle.stnkExpiryDate)}
              </div>
            </div>

            {isTaxInputOpen ? (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={taxAmountStr}
                    onChange={(e) => setTaxAmountStr(e.target.value)}
                    placeholder="Nominal Rp, contoh: 1250000"
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-emerald-500/40 text-emerald-400 font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                {taxAmountStr && (
                  <div className="text-[10px] font-mono text-emerald-400">
                    Format: {formatRupiah(parseCurrencyInput(taxAmountStr))}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleLogTaxPayment}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold flex items-center justify-center gap-1 transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Simpan &amp; Perpanjang</span>
                  </button>
                  <button
                    onClick={() => setIsTaxInputOpen(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono transition"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsTaxInputOpen(true)}
                className="mt-3 w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-400 text-xs font-mono font-semibold transition border border-slate-800 flex items-center justify-center gap-1.5 active:scale-95"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="sm:hidden">Bayar &amp; Perpanjang +1 Thn</span>
                <span className="hidden sm:inline">Sudah Bayar? Perpanjang +1 Tahun</span>
              </button>
            )}
          </div>

          {/* 5-Year Plate Box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Plat Nomor 5 Tahun (TNKB)
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getStatusBadge(
                    plateStatus
                  )}`}
                >
                  {plateStatus.label}
                </span>
              </div>
              <div className="text-base font-mono font-bold text-white">
                {formatDate(vehicle.plateExpiryDate)}
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-500 pt-3">
              Pergantian kaleng plat nomor fisik & cek fisik Samsat.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
