import React, { useState } from 'react';
import { useGarageStore } from './hooks/useGarageStore';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import ComponentHealthView from './components/components-health/ComponentHealthView';
import ServiceLogbookView from './components/logbook/ServiceLogbookView';
import ToolsView from './components/tools/ToolsView';
import QuickOdoModal from './components/layout/QuickOdoModal';
import AddVehicleModal from './components/layout/AddVehicleModal';
import ImportModal from './components/layout/ImportModal';

export default function App() {
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
  } = useGarageStore();

  // Modal states
  const [isQuickOdoOpen, setIsQuickOdoOpen] = useState(false);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* 1. Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeVehicle={activeVehicle}
        activeComponents={activeComponents}
        onExport={exportGarageBackupJSON}
        onOpenImport={() => setIsImportOpen(true)}
        onResetData={resetToSampleData}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          vehicles={vehicles}
          activeVehicle={activeVehicle}
          onSelectVehicle={setActiveVehicleId}
          onOpenAddModal={() => setIsAddVehicleOpen(true)}
          onOpenQuickOdo={() => setIsQuickOdoOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Dynamic Tab Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <Dashboard
              activeVehicle={activeVehicle}
              activeComponents={activeComponents}
              activeServiceLogs={activeServiceLogs}
              activeFuelLogs={activeFuelLogs}
              onOpenQuickOdo={() => setIsQuickOdoOpen(true)}
              onNavigateTab={setActiveTab}
              onResetComponent={(compId) => resetComponentService(compId)}
            />
          )}

          {/* Component Lifespan & Health Bars Tab */}
          {activeTab === 'health' && (
            <ComponentHealthView
              vehicle={activeVehicle}
              components={activeComponents}
              onResetComponentService={(compId, details) => resetComponentService(compId, details)}
              onAddComponent={addComponent}
              onDeleteComponent={deleteComponent}
              onAddServiceLog={addServiceLog}
              onSyncPresets={syncVehiclePresets}
            />
          )}

          {/* Service Logbook & Rp/km Analytics Tab */}
          {activeTab === 'logbook' && (
            <ServiceLogbookView
              vehicle={activeVehicle}
              serviceLogs={activeServiceLogs}
              components={activeComponents}
              onAddServiceLog={addServiceLog}
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
              onAddServiceLog={addServiceLog}
            />
          )}
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
    </div>
  );
}
