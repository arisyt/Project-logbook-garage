import React, { useState } from 'react';
import {
  Fuel,
  TrendingUp,
  DollarSign,
  Plus,
  Trash2,
  Calendar,
  Gauge,
  Navigation,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  calculateFuelEfficiency,
  calculateTripCost,
  formatRupiah,
  formatKm,
  formatDate,
} from '../../utils/calculators';

export default function FuelCalculator({
  vehicle,
  fuelLogs = [],
  onAddFuelLog,
  onDeleteFuelLog,
}) {
  // --- Quick Calculator Form State ---
  const lastFuel = fuelLogs[0] || null;
  const [prevOdo, setPrevOdo] = useState(lastFuel ? String(lastFuel.odometer) : String(Math.max(0, (vehicle?.currentOdo || 0) - 350)));
  const [currOdo, setCurrOdo] = useState(String(vehicle?.currentOdo || 0));
  const [liters, setLiters] = useState('30');
  const [pricePerLiter, setPricePerLiter] = useState('15300'); // default Pertamax Turbo/RON 98 or 92
  const [isFullTank, setIsFullTank] = useState(true);
  const [gasStation, setGasStation] = useState('SPBU Pertamina');
  const [fillDate, setFillDate] = useState(new Date().toISOString().split('T')[0]);

  // --- Trip Cost Estimator State ---
  const [tripDistance, setTripDistance] = useState('150');
  const [tripEfficiency, setTripEfficiency] = useState('12');
  const [tripFuelPrice, setTripFuelPrice] = useState('15300');

  // Calculations
  const calculatedKmPerL = calculateFuelEfficiency(currOdo, prevOdo, liters);
  const distanceCovered = Math.max(0, (Number(currOdo) || 0) - (Number(prevOdo) || 0));
  const totalCostFill = Math.round((Number(liters) || 0) * (Number(pricePerLiter) || 0));
  const costPerKmFuel = distanceCovered > 0 ? Math.round(totalCostFill / distanceCovered) : 0;

  // Trip Estimator calculations
  const tripEstimate = calculateTripCost(tripDistance, tripEfficiency, tripFuelPrice);

  const handleSaveFuelLog = (e) => {
    e.preventDefault();
    if (!currOdo || !liters) return;

    onAddFuelLog({
      vehicleId: vehicle.id,
      date: fillDate,
      odometer: Number(currOdo) || 0,
      liters: Number(liters) || 0,
      totalCostRp: totalCostFill,
      pricePerLiterRp: Number(pricePerLiter) || 0,
      isFullTank,
      notes: `${gasStation.trim()} (${distanceCovered} km / ${liters} L = ${calculatedKmPerL} km/L)`,
    });
  };

  return (
    <div className="space-y-6">
      {/* 2-Column Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Full-to-Full Fuel Consumption Calculator */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Kalkulator BBM Full-to-Full</h2>
              <p className="text-xs text-slate-400 font-mono">
                Hitung efisiensi km/L dan biaya bahan bakar per kilometer
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveFuelLog} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Odo Pengisian Lalu (km)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={prevOdo}
                  onChange={(e) => setPrevOdo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Odo Saat Ini (km)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={currOdo}
                  onChange={(e) => setCurrOdo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-emerald-400 font-mono text-xs font-bold focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Volume Isi (Liter)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  required
                  value={liters}
                  onChange={(e) => setLiters(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Harga / Liter (Rp)
                </label>
                <input
                  type="number"
                  step="100"
                  min="0"
                  value={pricePerLiter}
                  onChange={(e) => setPricePerLiter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Nama SPBU / Tipe Bensin
                </label>
                <input
                  type="text"
                  value={gasStation}
                  onChange={(e) => setGasStation(e.target.value)}
                  placeholder="SPBU Pertamina / Shell"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Tanggal Pengisian
                </label>
                <input
                  type="date"
                  value={fillDate}
                  onChange={(e) => setFillDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="fulltank-check"
                checked={isFullTank}
                onChange={(e) => setIsFullTank(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="fulltank-check" className="text-xs text-slate-300 font-mono">
                Pengisian Full Tank (Perhitungan km/L akurat)
              </label>
            </div>

            {/* Calculated Output Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block uppercase">Jarak Tempuh</span>
                  <span className="text-sm font-bold text-white">{formatKm(distanceCovered)}</span>
                </div>

                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <span className="text-[10px] text-amber-400 block uppercase font-bold">Efisiensi</span>
                  <span className="text-base font-extrabold text-amber-400">
                    {calculatedKmPerL} <span className="text-[10px] font-normal">km/L</span>
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block uppercase">Biaya / Km</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {formatRupiah(costPerKmFuel)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs font-mono pt-1 text-slate-400">
                <span>Total Pengeluaran Bensin:</span>
                <span className="text-emerald-400 font-bold">{formatRupiah(totalCostFill)}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold font-mono transition flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Simpan ke Log BBM Kendaraan</span>
            </button>
          </form>
        </div>

        {/* Card 2: Trip Fuel Cost Estimator */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800 mb-4">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Estimator Biaya Perjalanan / Touring</h2>
                <p className="text-xs text-slate-400 font-mono">
                  Prediksi liter dan rupiah untuk rute jarak jauh
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Rencana Jarak Perjalanan (km)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={tripDistance}
                    onChange={(e) => setTripDistance(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-cyan-400 font-mono text-base font-bold focus:outline-none focus:border-cyan-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">
                    KM
                  </span>
                </div>
              </div>

              {/* Quick Trip Distance Presets */}
              <div className="flex gap-1.5 flex-wrap">
                {[50, 100, 200, 350, 500, 750].map((km) => (
                  <button
                    key={km}
                    type="button"
                    onClick={() => setTripDistance(String(km))}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 font-mono text-[11px] border border-slate-800 transition"
                  >
                    {km} km
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                    Konsumsi Rata-rata (km/L)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={tripEfficiency}
                    onChange={(e) => setTripEfficiency(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                    Harga Bahan Bakar (Rp/L)
                  </label>
                  <input
                    type="number"
                    step="100"
                    min="1000"
                    value={tripFuelPrice}
                    onChange={(e) => setTripFuelPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Trip Estimation Results */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 mt-4">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Estimasi Kebutuhan Perjalanan
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 block uppercase">
                  BBM Dibutuhkan
                </span>
                <span className="text-xl font-mono font-extrabold text-cyan-400">
                  {tripEstimate.litersNeeded} <span className="text-xs font-normal">Liter</span>
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 block uppercase">
                  Estimasi Biaya
                </span>
                <span className="text-xl font-mono font-extrabold text-emerald-400">
                  {formatRupiah(tripEstimate.totalTripCostRp)}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              💡 Tips: Tambahkan margin ~10-15% untuk kemacetan kota atau rute tanjakan.
            </div>
          </div>
        </div>
      </div>

      {/* Fuel Log History Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Fuel className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
              Catatan Pengisian BBM ({fuelLogs.length} Log)
            </h3>
          </div>
        </div>

        {fuelLogs.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-slate-500">
            Belum ada catatan BBM tersimpan untuk unit ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase">
                  <th className="pb-2.5 font-semibold">Tanggal</th>
                  <th className="pb-2.5 font-semibold">Odometer</th>
                  <th className="pb-2.5 font-semibold">Volume (L)</th>
                  <th className="pb-2.5 font-semibold">Harga / L</th>
                  <th className="pb-2.5 font-semibold">Total Biaya</th>
                  <th className="pb-2.5 font-semibold">Catatan / SPBU</th>
                  <th className="pb-2.5 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {fuelLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 text-slate-300 whitespace-nowrap">{formatDate(log.date)}</td>
                    <td className="py-3 text-slate-100 font-bold whitespace-nowrap">
                      {formatKm(log.odometer)}
                    </td>
                    <td className="py-3 text-cyan-400 font-bold whitespace-nowrap">{log.liters} L</td>
                    <td className="py-3 text-slate-400 whitespace-nowrap">
                      {formatRupiah(log.pricePerLiterRp)}
                    </td>
                    <td className="py-3 text-emerald-400 font-bold whitespace-nowrap">
                      {formatRupiah(log.totalCostRp)}
                    </td>
                    <td className="py-3 text-slate-300 max-w-xs truncate font-sans">
                      {log.notes || '-'}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => {
                          if (window.confirm('Hapus entri pengisian BBM ini?')) {
                            onDeleteFuelLog(log.id);
                          }
                        }}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
