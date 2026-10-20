import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wrench,
  Fuel,
  Bike,
  Calendar,
  Layers,
  Gauge,
  Navigation,
  Clock,
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
  const isBicycle = vehicle?.category === 'BICYCLE';

  // Contextual tab list
  const motorTabs = [
    { id: 'FUEL', label: 'BBM Full-to-Full', icon: Fuel },
    { id: 'TAX', label: 'Pajak STNK', icon: Calendar },
    { id: 'TRIP', label: 'Estimator Rute', icon: Navigation },
    { id: 'LOGS', label: 'Riwayat BBM', icon: Clock },
    { id: 'ALL', label: 'Semua Tool', icon: Layers },
  ];

  const bikeTabs = [
    { id: 'PRESSURE', label: 'Tekanan Ban', icon: Gauge },
    { id: 'GEAR', label: 'Rasio Gir', icon: Bike },
    { id: 'MATRIX', label: 'Matriks Sprocket', icon: Layers },
    { id: 'ALL', label: 'Semua Tool', icon: Layers },
  ];

  const currentTabs = isBicycle ? bikeTabs : motorTabs;

  // Initial tab selection
  const [activeToolTab, setActiveToolTab] = useState(isBicycle ? 'PRESSURE' : 'FUEL');

  if (!vehicle) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono">
        Tidak ada kendaraan aktif terpilih.
      </div>
    );
  }

  // If vehicle changes type, ensure active tab is valid
  const validTabIds = currentTabs.map((t) => t.id);
  const selectedTab = validTabIds.includes(activeToolTab)
    ? activeToolTab
    : (isBicycle ? 'PRESSURE' : 'FUEL');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5 sm:space-y-6"
    >
      {/* Header Banner */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-950/90 backdrop-blur-xl border border-slate-800/80 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-white tracking-tight truncate">
                Kalkulator Teknis &amp; Utilitas Garasi
              </h1>
              <p className="text-xs text-slate-400 font-mono truncate">
                {vehicle.name} • {isBicycle ? 'Sepeda Balap / Gravel' : (vehicle.plateNumber || 'Kendaraan Bermotor')}
              </p>
            </div>
          </div>
        </div>

        {/* Responsive Horizontal Tool Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-mono w-full overflow-x-auto scrollbar-none py-1">
          {currentTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveToolTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition shrink-0 active:scale-95 ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Render */}
      <div className="space-y-6">
        {/* Motorized Tools */}
        {!isBicycle && (
          <>
            {/* STNK Card */}
            {(selectedTab === 'TAX' || selectedTab === 'ALL') && (
              <TaxReminderCard
                vehicle={vehicle}
                onUpdateVehicle={onUpdateVehicle}
                onAddServiceLog={onAddServiceLog}
              />
            )}

            {/* Fuel & Trip Calculator Card */}
            {(selectedTab === 'FUEL' || selectedTab === 'TRIP' || selectedTab === 'LOGS' || selectedTab === 'ALL') && (
              <FuelCalculator
                vehicle={vehicle}
                fuelLogs={fuelLogs}
                onAddFuelLog={onAddFuelLog}
                onDeleteFuelLog={onDeleteFuelLog}
                section={
                  selectedTab === 'FUEL'
                    ? 'CALCULATOR'
                    : selectedTab === 'TRIP'
                    ? 'TRIP'
                    : selectedTab === 'LOGS'
                    ? 'LOGS'
                    : 'ALL'
                }
              />
            )}
          </>
        )}

        {/* Bicycle Tools */}
        {isBicycle && (
          <BikeCalculators
            vehicle={vehicle}
            onUpdateVehicle={onUpdateVehicle}
            section={
              selectedTab === 'PRESSURE'
                ? 'PRESSURE'
                : selectedTab === 'GEAR'
                ? 'GEAR'
                : selectedTab === 'MATRIX'
                ? 'MATRIX'
                : 'ALL'
            }
          />
        )}
      </div>

      {/* Danger Zone: Delete Vehicle */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
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
          className="self-start sm:self-auto px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-mono font-semibold transition border border-rose-500/20 flex items-center gap-1.5 shrink-0 active:scale-95"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Hapus Unit Ini</span>
        </button>
      </div>
    </motion.div>
  );
}
