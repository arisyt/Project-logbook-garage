import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wrench,
  Fuel,
  Bike,
  Calendar,
  Layers,
  Car,
  Flame,
  Settings,
  Trash2,
} from 'lucide-react';
import FuelCalculator from './FuelCalculator';
import BikeCalculators from './BikeCalculators';
import TaxReminderCard from './TaxReminderCard';

export default function ToolsView({
  vehicle,
  fuelLogs = [],
  onAddFuelLog,
  onDeleteFuelLog,
  onUpdateVehicle,
  onDeleteVehicle,
  onAddServiceLog,
}) {
  const [activeToolTab, setActiveToolTab] = useState('DEFAULT'); // 'DEFAULT' | 'FUEL' | 'BIKE' | 'TAX'

  if (!vehicle) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono">
        Tidak ada kendaraan aktif terpilih.
      </div>
    );
  }

  const isBicycle = vehicle.category === 'BICYCLE';

  // Determine which tool to show
  const currentView =
    activeToolTab === 'DEFAULT'
      ? isBicycle
        ? 'BIKE'
        : 'MOTORIZED'
      : activeToolTab;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-950/80 backdrop-blur-xl border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Kalkulator Teknis & Utilitas Garasi
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                {vehicle.name} • {isBicycle ? 'Utilitas Sepeda Balap / Gravel' : 'Utilitas Kendaraan Bermotor'}
              </p>
            </div>
          </div>
        </div>

        {/* Tool Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveToolTab('DEFAULT')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeToolTab === 'DEFAULT'
                ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Mode Otomatis ({isBicycle ? 'Sepeda' : 'Mesin'})
          </button>

          <button
            onClick={() => setActiveToolTab('BIKE')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
              activeToolTab === 'BIKE'
                ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Ban & Gear</span>
          </button>

          <button
            onClick={() => setActiveToolTab('FUEL')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
              activeToolTab === 'FUEL'
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Fuel className="w-3.5 h-3.5" />
            <span>BBM & Trip</span>
          </button>
        </div>
      </div>

      {/* Main Tool Render */}
      {currentView === 'MOTORIZED' && (
        <div className="space-y-6">
          <TaxReminderCard
            vehicle={vehicle}
            onUpdateVehicle={onUpdateVehicle}
            onAddServiceLog={onAddServiceLog}
          />
          <FuelCalculator
            vehicle={vehicle}
            fuelLogs={fuelLogs}
            onAddFuelLog={onAddFuelLog}
            onDeleteFuelLog={onDeleteFuelLog}
          />
        </div>
      )}

      {currentView === 'BIKE' && (
        <div className="space-y-6">
          <BikeCalculators
            vehicle={vehicle}
            onUpdateVehicle={onUpdateVehicle}
          />
        </div>
      )}

      {currentView === 'FUEL' && (
        <div className="space-y-6">
          <FuelCalculator
            vehicle={vehicle}
            fuelLogs={fuelLogs}
            onAddFuelLog={onAddFuelLog}
            onDeleteFuelLog={onDeleteFuelLog}
          />
        </div>
      )}

      {/* Danger Zone: Delete Vehicle */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center justify-between text-xs">
        <div>
          <div className="font-semibold text-white">Kelola Unit Kendaraan</div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
            Hapus unit "{vehicle.name}" beserta komponen dan seluruh riwayat servis terkait dari garasi.
          </div>
        </div>

        <button
          onClick={() => {
            if (
              window.confirm(
                `Apakah Anda yakin ingin menghapus "${vehicle.name}" dari garasi? Seluruh riwayat servis dan komponen akan dihapus.`
              )
            ) {
              onDeleteVehicle(vehicle.id);
            }
          }}
          className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-mono font-semibold transition border border-rose-500/20 flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Hapus Unit Ini</span>
        </button>
      </div>
    </motion.div>
  );
}
