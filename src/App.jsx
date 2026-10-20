import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useGarageStore } from './hooks/useGarageStore';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import BottomNavBar from './components/layout/BottomNavBar';
import Dashboard from './components/dashboard/Dashboard';
import ComponentHealthView from './components/components-health/ComponentHealthView';
import ServiceLogbookView from './components/logbook/ServiceLogbookView';
import ToolsView from './components/tools/ToolsView';
import QuickOdoModal from './components/layout/QuickOdoModal';
import AddVehicleModal from './components/layout/AddVehicleModal';
import AddServiceLogModal from './components/logbook/AddServiceLogModal';
import ImportModal from './components/layout/ImportModal';
import CloudSyncModal from './components/layout/CloudSyncModal';
import CelebrationToast from './components/common/CelebrationToast';

/**
 * AppContent — offline-first application shell that renders the full application
 * directly without blocking on remote auth/network servers.
 */
function AppContent() {
  const { user } = useAuth();

  const {
    vehicles,
    activeVehicle,
    activeComponents,
    activeServiceLogs,
    activeFuelLogs,
    activeTab,
    setActiveTab,
    setActiveVehicleId,
    updateOdometer,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    addComponent,
    deleteComponent,
    resetComponentService,
    syncVehiclePresets,
    addServiceLog,
    deleteServiceLog,
    addFuelLog,
    deleteFuelLog,
    exportGarageBackupJSON,
    importGarageBackupJSON,
    resetToSampleData,
    initStore,
    backupToCloud,
    restoreFromCloud,
    lastCloudBackup,
  } = useGarageStore();

  // Modal states
  const [isQuickOdoOpen, setIsQuickOdoOpen] = useState(false);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [celebrationToast, setCelebrationToast] = useState(null);

  // Initialize data load when user is available and cloud connected
  useEffect(() => {
    if (user?.id) {
      initStore(user.id);
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Status Bar styling for Android mobile shell
  useEffect(() => {
    try {
      StatusBar.setStyle({ style: Style.Dark });
      StatusBar.setBackgroundColor({ color: '#090D16' });
    } catch {
      // Non-native web fallback
    }
  }, []);

  // Track freshest navigation & modal states without re-attaching listeners
  const backStateRef = useRef({
    isQuickOdoOpen,
    isAddVehicleOpen,
    isImportOpen,
    isAddServiceOpen,
    isCloudModalOpen,
    isMobileMenuOpen,
    activeTab,
  });

  useEffect(() => {
    backStateRef.current = {
      isQuickOdoOpen,
      isAddVehicleOpen,
      isImportOpen,
      isAddServiceOpen,
      isCloudModalOpen,
      isMobileMenuOpen,
      activeTab,
    };
  });

  // Android Native Back Button Hardware Listener (Single robust registration)
  useEffect(() => {
    let handle = null;
    let isMounted = true;

    CapApp.addListener('backButton', () => {
      const s = backStateRef.current;
      if (s.isQuickOdoOpen) { setIsQuickOdoOpen(false); return; }
      if (s.isAddVehicleOpen) { setIsAddVehicleOpen(false); return; }
      if (s.isImportOpen) { setIsImportOpen(false); return; }
      if (s.isAddServiceOpen) { setIsAddServiceOpen(false); return; }
      if (s.isCloudModalOpen) { setIsCloudModalOpen(false); return; }
      if (s.isMobileMenuOpen) { setIsMobileMenuOpen(false); return; }

      if (s.activeTab !== 'dashboard') {
        setActiveTab('dashboard');
        return;
      }

      CapApp.exitApp();
    })
      .then((h) => {
        if (!isMounted) {
          h.remove();
        } else {
          handle = h;
        }
      })
      .catch(() => {
        // Fallback for non-Capacitor web environments
      });

    return () => {
      isMounted = false;
      if (handle && typeof handle.remove === 'function') {
        handle.remove();
      }
    };
  }, []);

  // Derived: count of components that need attention (for BottomNavBar badge)
  const componentAlerts = useMemo(() => {
    return activeComponents.filter((c) => {
      const odoSinceService = (activeVehicle?.currentOdo || 0) - (c.lastServicedKm || 0);
      const kmPct = c.lifespanKm > 0 ? odoSinceService / c.lifespanKm : 0;
      return kmPct >= 0.75;
    }).length;
  }, [activeComponents, activeVehicle]);

  // Wrap resetComponentService with visual celebration toast
  const handleResetComponentWithToast = (compId, details) => {
    const targetComp = activeComponents.find((c) => c.id === compId);
    resetComponentService(compId, details);
    setCelebrationToast({
      title: 'Servis Komponen Sukses!',
      message: `${targetComp?.name || 'Suku cadang'} telah di-reset ke kondisi prima (100% aman). Catatan servis otomatis dibuat.`,
      type: 'single',
      badge: 'Servis Selesai',
    });
  };

  // Wrap addServiceLog with visual celebration toast
  const handleAddServiceLogWithToast = (logData) => {
    addServiceLog(logData);
    const count = logData.replacedComponentIds?.length || 0;
    setCelebrationToast({
      title: 'Catatan Servis Berhasil Disimpan!',
      message:
        count > 0
          ? `${count} komponen terkait otomatis di-reset ke odometer ${new Intl.NumberFormat('id-ID').format(logData.odometer)} km.`
          : `Riwayat servis "${logData.title}" berhasil ditambahkan ke logbook.`,
      type: count > 1 ? 'package' : 'service',
      badge: count > 0 ? 'Smart Bundle Reset' : 'Servis Masuk',
    });
    setIsAddServiceOpen(false);
  };

  // --- Offline-First Application Shell ---
  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex relative overflow-x-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Subtle modern ambient background glows */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="fixed top-1/2 right-10 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* 1. Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeVehicle={activeVehicle}
        activeComponents={activeComponents}
        onExport={exportGarageBackupJSON}
        onOpenImport={() => setIsImportOpen(true)}
        onResetData={resetToSampleData}
        onOpenCloudModal={() => setIsCloudModalOpen(true)}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 relative z-10">
        {/* Top Header */}
        <Header
          vehicles={vehicles}
          activeVehicle={activeVehicle}
          onSelectVehicle={setActiveVehicleId}
          onOpenAddModal={() => setIsAddVehicleOpen(true)}
          onOpenQuickOdo={() => setIsQuickOdoOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onOpenCloudModal={() => setIsCloudModalOpen(true)}
        />

        {/* Dynamic Tab Body with Smooth Page Transitions */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] lg:pb-8 pl-[max(0.875rem,env(safe-area-inset-left,0px))] pr-[max(0.875rem,env(safe-area-inset-right,0px))]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${activeVehicle?.id || 'none'}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && (
                <Dashboard
                  activeVehicle={activeVehicle}
                  activeComponents={activeComponents}
                  activeServiceLogs={activeServiceLogs}
                  activeFuelLogs={activeFuelLogs}
                  onOpenQuickOdo={() => setIsQuickOdoOpen(true)}
                  onNavigateTab={setActiveTab}
                  onResetComponent={(compId) => handleResetComponentWithToast(compId)}
                />
              )}

              {/* Component Lifespan & Health Bars Tab */}
              {activeTab === 'health' && (
                <ComponentHealthView
                  vehicle={activeVehicle}
                  components={activeComponents}
                  onResetComponentService={handleResetComponentWithToast}
                  onAddComponent={addComponent}
                  onDeleteComponent={deleteComponent}
                  onAddServiceLog={handleAddServiceLogWithToast}
                  onSyncPresets={syncVehiclePresets}
                />
              )}

              {/* Service Logbook & Rp/km Analytics Tab */}
              {activeTab === 'logbook' && (
                <ServiceLogbookView
                  vehicle={activeVehicle}
                  serviceLogs={activeServiceLogs}
                  components={activeComponents}
                  onAddServiceLog={handleAddServiceLogWithToast}
                  onDeleteServiceLog={deleteServiceLog}
                />
              )}

              {/* Contextual Technical Calculators Tab */}
              {activeTab === 'tools' && (
                <ToolsView
                  vehicle={activeVehicle}
                  fuelLogs={activeFuelLogs}
                  onAddFuelLog={addFuelLog}
                  onDeleteFuelLog={deleteFuelLog}
                  onUpdateVehicle={updateVehicle}
                  onDeleteVehicle={deleteVehicle}
                  onAddServiceLog={handleAddServiceLogWithToast}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* 3. Global Action Modals */}
      <QuickOdoModal
        isOpen={isQuickOdoOpen}
        onClose={() => setIsQuickOdoOpen(false)}
        vehicle={activeVehicle}
        onSaveOdo={updateOdometer}
      />

      <AddVehicleModal
        isOpen={isAddVehicleOpen}
        onClose={() => setIsAddVehicleOpen(false)}
        onAddVehicle={addVehicle}
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportData={importGarageBackupJSON}
      />

      {/* Cloud Backup & Restore Modal */}
      <CloudSyncModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        onBackupToCloud={backupToCloud}
        onRestoreFromCloud={restoreFromCloud}
        onExportJson={exportGarageBackupJSON}
        onOpenImportJson={() => setIsImportOpen(true)}
        lastBackupTime={lastCloudBackup}
      />

      {/* Quick Service modal launched from BottomNavBar FAB */}
      {isAddServiceOpen && activeVehicle && (
        <AddServiceLogModal
          isOpen={isAddServiceOpen}
          onClose={() => setIsAddServiceOpen(false)}
          vehicle={activeVehicle}
          components={activeComponents}
          onAddServiceLog={handleAddServiceLogWithToast}
        />
      )}

      {/* 4. Mobile Bottom Navigation */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        componentAlerts={componentAlerts}
        isMotorized={activeVehicle?.category !== 'BICYCLE'}
        onQuickOdo={() => setIsQuickOdoOpen(true)}
        onQuickService={() => setIsAddServiceOpen(true)}
        onQuickFuel={() => setActiveTab('tools')}
      />

      {/* 5. Interactive Floating Celebration Toast */}
      <CelebrationToast
        toast={celebrationToast}
        onClose={() => setCelebrationToast(null)}
      />
    </div>
  );
}

/**
 * App — root component that wraps everything in AuthProvider.
 */
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
