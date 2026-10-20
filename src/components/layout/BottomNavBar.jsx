import React, { useState } from 'react';
import {
  LayoutDashboard,
  Activity,
  Plus,
  BookOpen,
  Wrench,
  Gauge,
  ClipboardList,
  Droplet,
  X,
} from 'lucide-react';

/**
 * BottomNavBar — mobile-only (lg:hidden) fixed bottom navigation with a centre FAB.
 *
 * Props:
 *   activeTab       — current active tab string
 *   onTabChange     — callback(tabId: string)
 *   componentAlerts — number of critical/warning components (shows red badge on Health tab)
 *   onQuickOdo      — open QuickOdoModal
 *   onQuickService  — open AddServiceLogModal
 *   onQuickFuel     — (future) open fuel log quick entry
 */
export default function BottomNavBar({
  activeTab,
  onTabChange,
  componentAlerts = 0,
  isMotorized = true,
  onQuickOdo,
  onQuickService,
  onQuickFuel,
}) {
  const [fabOpen, setFabOpen] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'health',    label: 'Kesehatan',  icon: Activity },
    { id: '__fab__',   label: '',           icon: Plus },  // centre FAB placeholder
    { id: 'logbook',   label: 'Logbook',   icon: BookOpen },
    { id: 'tools',     label: 'Tools',     icon: Wrench },
  ];

  const handleTabPress = (id) => {
    if (id === '__fab__') {
      setFabOpen((prev) => !prev);
    } else {
      setFabOpen(false);
      onTabChange(id);
    }
  };

  const quickActions = [
    {
      label: 'Update Odometer',
      icon: Gauge,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/15 border-emerald-500/30',
      onPress: () => { setFabOpen(false); onQuickOdo?.(); },
    },
    {
      label: 'Catat Servis',
      icon: ClipboardList,
      color: 'text-blue-400',
      bg: 'bg-blue-500/15 border-blue-500/30',
      onPress: () => { setFabOpen(false); onQuickService?.(); },
    },
    {
      label: isMotorized ? 'Isi BBM' : 'Tekanan Ban',
      icon: isMotorized ? Droplet : Gauge,
      color: isMotorized ? 'text-amber-400' : 'text-cyan-400',
      bg: isMotorized ? 'bg-amber-500/15 border-amber-500/30' : 'bg-cyan-500/15 border-cyan-500/30',
      onPress: () => { setFabOpen(false); onQuickFuel?.(); },
    },
  ];

  return (
    <>
      {/* Dim overlay when FAB is open */}
      {fabOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setFabOpen(false)}
        />
      )}

      {/* Quick Actions Popup */}
      {fabOpen && (
        <div className="fixed bottom-24 inset-x-0 z-40 flex justify-center lg:hidden px-4">
          <div className="flex flex-col gap-2 w-full max-w-xs">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={action.onPress}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${action.bg} backdrop-blur-xl shadow-xl transition active:scale-95`}
                >
                  <div className={`p-2 rounded-xl bg-slate-900/80 ${action.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-sm font-semibold ${action.color}`}>{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 backdrop-blur-2xl border-t border-slate-800/80 pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className="flex items-end justify-around px-2 pt-2 pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isFab = tab.id === '__fab__';
            const isActive = activeTab === tab.id;

            if (isFab) {
              return (
                <button
                  key="fab"
                  onClick={() => handleTabPress('__fab__')}
                  className={`flex flex-col items-center justify-center mb-2 transition-transform active:scale-90 ${
                    fabOpen ? 'rotate-45' : ''
                  }`}
                  aria-label="Quick actions"
                >
                  <div className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/40 border-4 border-slate-900 transition">
                    {fabOpen ? (
                      <X className="w-6 h-6 text-slate-950" />
                    ) : (
                      <Plus className="w-6 h-6 text-slate-950" />
                    )}
                  </div>
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => handleTabPress(tab.id)}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-0 relative"
                aria-label={tab.label}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition ${
                      isActive ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  />
                  {/* Badge for health tab */}
                  {tab.id === 'health' && componentAlerts > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white">
                      {componentAlerts > 9 ? '9+' : componentAlerts}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-mono transition truncate ${
                    isActive ? 'text-emerald-400 font-semibold' : 'text-slate-500'
                  }`}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 inset-x-3 h-0.5 rounded-full bg-emerald-400" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
