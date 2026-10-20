import React from 'react';
import {
  LayoutDashboard,
  Activity,
  ClipboardList,
  Wrench,
  Download,
  Upload,
  RefreshCw,
  Car,
  Flame,
  Bike,
  ShieldAlert,
  Cloud,
  X,
} from 'lucide-react';
import { calculateComponentHealth } from '../../utils/calculators';

export default function Sidebar({
  activeTab,
  setActiveTab,
  activeVehicle,
  activeComponents,
  onExport,
  onOpenImport,
  onResetData,
  onOpenCloudModal,
  isMobileOpen,
  setIsMobileOpen,
}) {
  // Count critical or warning parts to display alert badge in navigation
  const componentAlertCount = activeComponents.filter((comp) => {
    if (!activeVehicle) return false;
    const health = calculateComponentHealth(activeVehicle.currentOdo, comp);
    return health.status === 'critical' || health.status === 'warning';
  }).length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      desc: 'Telemetry & Ikhtisar',
    },
    {
      id: 'health',
      label: 'Kesehatan Part',
      icon: Activity,
      desc: 'Lifespan & Wear Bar',
      badge: componentAlertCount > 0 ? componentAlertCount : null,
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    },
    {
      id: 'logbook',
      label: 'Riwayat Servis',
      icon: ClipboardList,
      desc: 'Logbook & Biaya Per Km',
    },
    {
      id: 'tools',
      label: 'Kalkulator Teknis',
      icon: Wrench,
      desc: activeVehicle?.category === 'BICYCLE' ? 'Tekanan Ban & Gear' : 'Konsumsi BBM & Estimasi',
    },
  ];

  const getVehicleIcon = (category) => {
    switch (category) {
      case 'CAR':
        return <Car className="w-4 h-4 text-blue-400" />;
      case 'MOTORCYCLE':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'BICYCLE':
        return <Bike className="w-4 h-4 text-emerald-400" />;
      default:
        return <Wrench className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 max-w-[80vw] bg-slate-900 border-r border-slate-800 flex flex-col pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="font-mono text-sm font-bold tracking-wider text-white uppercase flex items-center gap-1.5">
                <span>VELO & MOTO</span>
              </div>
              <div className="text-[10px] font-mono text-emerald-400/90 tracking-widest uppercase">
                GARAGE LOGBOOK
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            Navigasi Utama
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (setIsMobileOpen) setIsMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  />
                  <div>
                    <div className="text-xs font-semibold leading-none">{item.label}</div>
                    <div className="text-[10px] text-slate-500 mt-1">{item.desc}</div>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Vehicle Telemetry Quick Card in Sidebar */}
        {activeVehicle && (
          <div className="p-3 mx-3 mb-3 rounded-lg bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Unit Aktif
              </span>
              <div className="p-1 rounded bg-slate-800">
                {getVehicleIcon(activeVehicle.category)}
              </div>
            </div>
            <div className="text-xs font-bold text-white truncate">{activeVehicle.name}</div>
            <div className="text-[11px] font-mono text-emerald-400 mt-0.5">
              {new Intl.NumberFormat('id-ID').format(activeVehicle.currentOdo)} km
            </div>
          </div>
        )}

        {/* Backup & System Tools Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/50 space-y-1 text-xs">
          <button
            onClick={() => {
              if (setIsMobileOpen) setIsMobileOpen(false);
              if (onOpenCloudModal) onOpenCloudModal();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-emerald-400 hover:bg-emerald-500/10 transition text-[11px] font-mono"
            title="Cadangkan atau pulihkan data dari Supabase Cloud"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Cloud Backup &amp; Sinkron</span>
          </button>

          <button
            onClick={onExport}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition text-[11px] font-mono"
            title="Download full JSON backup of your garage"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup (.JSON)</span>
          </button>

          <button
            onClick={onOpenImport}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition text-[11px] font-mono"
            title="Restore garage from a JSON file"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import / Restore (.JSON)</span>
          </button>

          <button
            onClick={() => {
              if (
                window.confirm(
                  'Kembalikan data ke contoh default? Perubahan yang belum di-export akan ditimpa.'
                )
              ) {
                onResetData();
              }
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition text-[11px] font-mono"
            title="Reset garage to starter sample data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset ke Sample Data</span>
          </button>
        </div>
      </aside>
    </>
  );
}
