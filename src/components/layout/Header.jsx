import React from 'react';
import {
  Menu,
  Gauge,
  Edit3,
  Calendar,
  AlertTriangle,
  HardDrive,
  Cloud,
  Car,
  Flame,
  Bike,
} from 'lucide-react';
import VehicleSelector from './VehicleSelector';
import UserMenu from '../auth/UserMenu';
import { useAuth } from '../../context/AuthContext';
import { calculateTaxStatus } from '../../utils/calculators';

export default function Header({
  vehicles,
  activeVehicle,
  onSelectVehicle,
  onOpenAddModal,
  onOpenQuickOdo,
  onToggleMobileMenu,
  onOpenCloudModal,
}) {
  const { isCloudConnected } = useAuth();

  // Check tax status if motorized
  const isMotorized = activeVehicle && activeVehicle.category !== 'BICYCLE';
  const stnkStatus = isMotorized ? calculateTaxStatus(activeVehicle.stnkExpiryDate) : null;

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-2xl sticky top-0 z-30 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-3 px-3 sm:px-6 pl-[max(0.75rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] flex items-center justify-between gap-2 sm:gap-4 transition-all">
      {/* Left: Mobile hamburger & Vehicle Selector */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700 transition shrink-0"
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
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Tax Warning Pill (if motorized & critical/expired) */}
        {isMotorized && stnkStatus && (stnkStatus.status === 'critical' || stnkStatus.status === 'expired') && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="font-semibold">STNK: {stnkStatus.label}</span>
          </div>
        )}

        {/* Quick Odometer Badge on Desktop/Tablet */}
        {activeVehicle && (
          <button
            onClick={onOpenQuickOdo}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700 hover:border-emerald-500/60 transition group text-left shadow-inner"
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

        {/* Local-first / Cloud status badge (interactive - hidden on mobile where UserMenu handles it) */}
        <button
          type="button"
          onClick={onOpenCloudModal}
          className="hidden sm:flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-emerald-500/40 text-[10px] font-mono transition text-slate-300"
          title="Klik untuk buka pengaturan Backup & Cloud"
        >
          {isCloudConnected ? (
            <>
              <Cloud className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden sm:inline text-emerald-400 font-bold">CLOUD SYNC</span>
            </>
          ) : (
            <>
              <HardDrive className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="hidden sm:inline text-cyan-300">OFFLINE</span>
            </>
          )}
        </button>

        {/* User Account / Sign Out Dropdown */}
        <UserMenu onOpenCloudModal={onOpenCloudModal} />
      </div>
    </header>
  );
}
