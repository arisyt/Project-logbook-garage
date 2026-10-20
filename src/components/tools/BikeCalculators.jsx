import React, { useState } from 'react';
import {
  Bike,
  Gauge,
  Sliders,
  Wind,
  Check,
  Zap,
  HelpCircle,
  RotateCw,
  Layers,
} from 'lucide-react';
import {
  calculateBikeTirePressure,
  calculateGearRatioAndSpeed,
} from '../../utils/calculators';
import { WHEEL_CIRCUMFERENCE_PRESETS } from '../../data/presets';

export default function BikeCalculators({ vehicle, onUpdateVehicle }) {
  // --- 1. Tire Pressure State ---
  const [riderWeightKg, setRiderWeightKg] = useState(vehicle?.riderWeightKg || 68);
  const [bikeWeightKg, setBikeWeightKg] = useState(vehicle?.bikeWeightKg || 8.5);
  const [tireWidthMm, setTireWidthMm] = useState(vehicle?.tireWidthMm || 28);
  const [surface, setSurface] = useState('dry_tarmac'); // 'dry_tarmac' | 'wet_tarmac' | 'gravel'
  const [isTubeless, setIsTubeless] = useState(vehicle?.isTubeless ?? true);

  // Pressure calculations
  const pressure = calculateBikeTirePressure({
    riderWeightKg,
    bikeWeightKg,
    tireWidthMm,
    surface,
    isTubeless,
  });

  const handleSaveToBikeProfile = () => {
    onUpdateVehicle(vehicle.id, {
      riderWeightKg: Number(riderWeightKg) || 70,
      bikeWeightKg: Number(bikeWeightKg) || 8.5,
      tireWidthMm: Number(tireWidthMm) || 28,
      isTubeless,
    });
    alert('Spesifikasi tersimpan ke profil sepeda ini!');
  };

  // --- 2. Gear Ratio & Speed State ---
  const [chainringTeeth, setChainringTeeth] = useState(50);
  const [cassetteTeeth, setCassetteTeeth] = useState(17);
  const [cadenceRpm, setCadenceRpm] = useState(85);
  const [wheelCircumferenceMm, setWheelCircumferenceMm] = useState(2136);

  // Sample Cassette Cogs for Matrix Table
  const sampleCassette11s = [11, 12, 13, 14, 15, 17, 19, 21, 24, 27, 30];

  const gearTelemetry = calculateGearRatioAndSpeed({
    chainringTeeth,
    cassetteTeeth,
    cadenceRpm,
    wheelCircumferenceMm,
  });

  return (
    <div className="space-y-6">
      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Frank Berto Smart Tire Pressure Calculator */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Kalkulator Tekanan Ban Sepeda</h2>
                <p className="text-xs text-slate-400 font-mono">
                  Model Frank Berto (Optimasi rolling resistance & kenyamanan)
                </p>
              </div>
            </div>

            <button
              onClick={handleSaveToBikeProfile}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-mono transition border border-emerald-500/30 flex items-center gap-1"
              title="Simpan parameter ini ke data sepeda aktif"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan Profil</span>
            </button>
          </div>

          <div className="space-y-4">
            {/* Weights */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Bobot Rider (kg)
                </label>
                <input
                  type="number"
                  min="30"
                  max="150"
                  value={riderWeightKg}
                  onChange={(e) => setRiderWeightKg(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Bobot Sepeda + Aksesoris (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="4"
                  max="30"
                  value={bikeWeightKg}
                  onChange={(e) => setBikeWeightKg(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Tire Width with Quick Width Buttons */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Lebar Ban (mm / c)
                </label>
                <span className="text-xs font-mono font-bold text-emerald-400">{tireWidthMm} mm</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[25, 28, 30, 32, 38].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setTireWidthMm(w)}
                    className={`py-1.5 rounded text-xs font-mono transition ${
                      Number(tireWidthMm) === w
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {w}c
                  </button>
                ))}
              </div>
            </div>

            {/* Surface Selector */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Kondisi Permukaan Jalan
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'dry_tarmac', label: 'Aspal Mulus (Dry)' },
                  { id: 'wet_tarmac', label: 'Aspal Kasar / Basah' },
                  { id: 'gravel', label: 'Gravel / Kasar' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSurface(s.id)}
                    className={`p-2 rounded-lg border text-center font-medium transition ${
                      surface === s.id
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tubeless Toggle */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Setup Tubeless</div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Menurunkan tekanan ~9% untuk daya cengkeram lebih tinggi tanpa risiko pinch-flat
                </div>
              </div>
              <input
                type="checkbox"
                checked={isTubeless}
                onChange={(e) => setIsTubeless(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            {/* Pressure Output Gauges */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex justify-between">
                <span>Rekomendasi Tekanan (42% F / 58% R)</span>
                <span className="text-emerald-400">Total: {pressure.totalWeightKg} kg</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Front Wheel */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">
                    Ban Depan (Front)
                  </span>
                  <div className="text-2xl font-mono font-extrabold text-cyan-400">
                    {pressure.frontPsi} <span className="text-xs font-normal text-slate-400">PSI</span>
                  </div>
                  <div className="text-xs font-mono text-slate-400">{pressure.frontBar} Bar</div>
                </div>

                {/* Rear Wheel */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">
                    Ban Belakang (Rear)
                  </span>
                  <div className="text-2xl font-mono font-extrabold text-emerald-400">
                    {pressure.rearPsi} <span className="text-xs font-normal text-slate-400">PSI</span>
                  </div>
                  <div className="text-xs font-mono text-slate-400">{pressure.rearBar} Bar</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Gear Ratio & Cadence Speed Calculator */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Gear Ratio & Speed Cadence</h2>
                <p className="text-xs text-slate-400 font-mono">
                  Rasio gigi, development distance, dan estimasi kecepatan (km/h)
                </p>
              </div>
            </div>

            {/* Chainring presets */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Front Chainring (Teeth)
              </label>
              <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
                {[
                  { label: '50T (Compact)', val: 50 },
                  { label: '34T (Inner)', val: 34 },
                  { label: '52T (Semi)', val: 52 },
                  { label: '36T (Inner)', val: 36 },
                ].map((ring) => (
                  <button
                    key={ring.val}
                    type="button"
                    onClick={() => setChainringTeeth(ring.val)}
                    className={`py-1.5 rounded transition ${
                      chainringTeeth === ring.val
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {ring.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rear Cassette Cog selector */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Rear Sprocket / Cassette (Teeth)
                </label>
                <span className="text-xs font-mono font-bold text-purple-400">{cassetteTeeth}T</span>
              </div>
              <div className="grid grid-cols-6 gap-1 font-mono text-xs">
                {[11, 13, 15, 17, 19, 21, 24, 27, 30, 32, 34].map((cog) => (
                  <button
                    key={cog}
                    type="button"
                    onClick={() => setCassetteTeeth(cog)}
                    className={`py-1.5 rounded transition ${
                      cassetteTeeth === cog
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {cog}T
                  </button>
                ))}
              </div>
            </div>

            {/* Cadence Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Target Cadence (Pedal RPM)
                </label>
                <span className="text-xs font-mono font-bold text-emerald-400">{cadenceRpm} RPM</span>
              </div>
              <input
                type="range"
                min="50"
                max="120"
                step="5"
                value={cadenceRpm}
                onChange={(e) => setCadenceRpm(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-0.5">
                <span>50 RPM (Tanjakan berat)</span>
                <span>85-90 RPM (Optimal)</span>
                <span>120 RPM (Sprint)</span>
              </div>
            </div>

            {/* Wheel circumference selector */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                Ukuran Roda & Ban
              </label>
              <select
                value={wheelCircumferenceMm}
                onChange={(e) => setWheelCircumferenceMm(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
              >
                {WHEEL_CIRCUMFERENCE_PRESETS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Telemetry Output Box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 mt-4">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Hasil Rasio ({chainringTeeth}T × {cassetteTeeth}T @ {cadenceRpm} RPM)
            </div>

            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Gear Ratio</span>
                <span className="text-base font-extrabold text-white">{gearTelemetry.gearRatio}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Development</span>
                <span className="text-base font-extrabold text-cyan-400">
                  {gearTelemetry.developmentMeters}m
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <span className="text-[10px] text-purple-400 block uppercase font-bold">
                  Kecepatan
                </span>
                <span className="text-xl font-extrabold text-purple-300">
                  {gearTelemetry.speedKmh} <span className="text-xs font-normal">km/h</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Speed Matrix across entire Cassette */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Matriks Kecepatan Komplit ({chainringTeeth}T Chainring @ {cadenceRpm} RPM)</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Tabel rasio gir untuk sprocket 11-speed
          </span>
        </div>

        <div className="overflow-x-auto">
          <div className="grid grid-cols-11 gap-2 min-w-[700px] text-center font-mono">
            {sampleCassette11s.map((cog) => {
              const res = calculateGearRatioAndSpeed({
                chainringTeeth,
                cassetteTeeth: cog,
                cadenceRpm,
                wheelCircumferenceMm,
              });
              const isSelected = cassetteTeeth === cog;

              return (
                <div
                  key={cog}
                  onClick={() => setCassetteTeeth(cog)}
                  className={`p-2.5 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-lg'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold">{cog}T</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{res.gearRatio}x</div>
                  <div className="text-xs font-extrabold text-emerald-400 mt-1">
                    {res.speedKmh}
                  </div>
                  <div className="text-[9px] text-slate-500">km/h</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
