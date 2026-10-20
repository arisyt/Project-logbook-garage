import React, { useState, useRef, useEffect } from 'react';
import {
  Car,
  Flame,
  Bike,
  ChevronDown,
  Plus,
  Check,
  Gauge,
} from 'lucide-react';

export default function VehicleSelector({
  vehicles,
  activeVehicle,
  onSelectVehicle,
  onOpenAddModal,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCategoryMeta = (category) => {
    switch (category) {
      case 'CAR':
        return {
          label: 'MOBIL',
          icon: Car,
          badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
        };
      case 'MOTORCYCLE':
        return {
          label: 'MOTOR',
          icon: Flame,
          badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        };
      case 'BICYCLE':
        return {
          label: 'SEPEDA',
          icon: Bike,
          badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        };
      default:
        return {
          label: 'UNIT',
          icon: Gauge,
          badgeClass: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
        };
    }
  };

  const currentMeta = getCategoryMeta(activeVehicle?.category);
  const CurrentIcon = currentMeta.icon;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-slate-600 transition shadow-sm text-left group"
      >
        <div className="p-2 rounded-lg bg-slate-800 text-slate-200 group-hover:text-emerald-400 transition">
          <CurrentIcon className="w-4 h-4" />
        </div>

        <div className="min-w-0 pr-1">
          <div className="flex items-center gap-2">
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold border ${currentMeta.badgeClass}`}
            >
              {currentMeta.label}
            </span>
            <span className="text-xs font-semibold text-white truncate max-w-[150px] sm:max-w-[220px]">
              {activeVehicle?.name || 'Pilih Kendaraan'}
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
            {activeVehicle?.category === 'BICYCLE' ? (
              <span>{activeVehicle?.groupset || 'Road / Gravel'}</span>
            ) : (
              <span>{activeVehicle?.plateNumber || '-'}</span>
            )}
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-medium">
              {new Intl.NumberFormat('id-ID').format(activeVehicle?.currentOdo || 0)} km
            </span>
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
              Garasi Kendaraan ({vehicles.length})
            </span>
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenAddModal();
              }}
              className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition text-[11px] font-mono font-medium"
            >
              <Plus className="w-3 h-3" />
              <span>Unit Baru</span>
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto p-1.5 space-y-1">
            {vehicles.map((veh) => {
              const meta = getCategoryMeta(veh.category);
              const Icon = meta.icon;
              const isSelected = veh.id === activeVehicle?.id;

              return (
                <button
                  key={veh.id}
                  onClick={() => {
                    onSelectVehicle(veh.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition ${
                    isSelected
                      ? 'bg-slate-800/90 border border-slate-700'
                      : 'hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected ? 'bg-slate-950 text-emerald-400' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-white truncate max-w-[160px]">
                          {veh.name}
                        </span>
                        <span
                          className={`px-1 rounded text-[9px] font-mono font-bold border ${meta.badgeClass}`}
                        >
                          {meta.label}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>
                          {veh.category === 'BICYCLE' ? veh.brand : veh.plateNumber || veh.brand}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-emerald-400">
                          {new Intl.NumberFormat('id-ID').format(veh.currentOdo)} km
                        </span>
                      </div>
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
