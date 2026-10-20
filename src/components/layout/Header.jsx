import React from 'react';
import {
  Menu,
  Gauge,
  Edit3,
  Calendar,
  AlertTriangle,
  HardDrive,
  Car,
  Flame,
  Bike,
} from 'lucide-react';
import VehicleSelector from './VehicleSelector';
import { calculateTaxStatus } from '../../utils/calculators';

export default function Header({
  vehicles,
  activeVehicle,
  onSelectVehicle,
  onOpenAddModal,
  onOpenQuickOdo,
  onToggleMobileMenu,
}) {
  // Check tax status if motorized
  const isMotorized = activeVehicle && activeVehicle.category !== 'BICYCLE';
  const stnkStatus = isMotorized ? calculateTaxStatus(activeVehicle.stnkExpiryDate) : null;

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & Vehicle Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
          aria-label="Toggle Mobile Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <VehicleSelector
          vehicles={vehicles}
          activeVehicle={activeVehicle}
          onSelectVehicle={onSelectVehicle}
          onOpenAddModal={onOpenAddModal}
        />
      </div>

      {/* Right: Quick Odometer Pill & Local Storage indicator */}
      <div className="flex items-center gap-3">
        {/* Tax Warning Pill (if motorized & critical/expired) */}
        {isMotorized && stnkStatus && (stnkStatus.status === 'critical' || stnkStatus.status === 'expired') && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="font-semibold">STNK: {stnkStatus.label}</span>
          </div>
        )}

        {/* Quick Odometer Badge & Edit Button */}
        {activeVehicle && (
          <button
            onClick={onOpenQuickOdo}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700 hover:border-emerald-500/60 transition group text-left shadow-inner"
            title="Klik untuk update odometer cepat"
          >
            <div className="p-1 rounded bg-slate-800 text-slate-400 group-hover:text-emerald-400 transition">
              <Gauge className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-500 leading-none">
                Odometer
              </div>
              <div className="text-xs font-mono font-bold text-emerald-400 group-hover:text-emerald-300 transition">
                {new Intl.NumberFormat('id-ID').format(activeVehicle.currentOdo)} km
              </div>
            </div>
            <Edit3 className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 transition ml-1" />
          </button>
        )}

        {/* Local-first status indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950/40 border border-slate-800/80 text-[10px] font-mono text-slate-400">
          <HardDrive className="w-3 h-3 text-emerald-500" />
          <span className="hidden xl:inline">LOCAL STORAGE</span>
        </div>
      </div>
    </header>
  );
}
