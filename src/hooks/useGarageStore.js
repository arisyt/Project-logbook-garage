import { useState, useEffect, useCallback, useMemo } from 'react';
import { STARTER_GARAGE_DATA, COMPONENT_PRESETS } from '../data/presets';
import { parseCurrencyInput } from '../utils/calculators';

const STORAGE_KEY = 'garage_logbook_v1';

/**
 * Custom hook managing local-first persistent garage state, vehicle selection,
 * telemetry updates, component wear, service logs, and JSON backup/restore.
 */
export function useGarageStore() {
  // 1. Initial State Hydration from LocalStorage with fallback and automatic migration
  const [garageData, setGarageData] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.vehicles) && parsed.vehicles.length > 0) {
          // Migration check for granular motorcycle & tire components (v1.2.0)
          const moto = parsed.vehicles.find((v) => v.id === 'veh_moto_01' || v.category === 'MOTORCYCLE');
          if (moto) {
            const motoComponents = (parsed.components || []).filter((c) => c.vehicleId === moto.id);
            if (motoComponents.length < 16) {
              // Merge granular motorcycle components (including tires) from STARTER_GARAGE_DATA
              const missingStarter = STARTER_GARAGE_DATA.components.filter(
                (sc) =>
                  sc.vehicleId === 'veh_moto_01' &&
                  !motoComponents.some((mc) => mc.name.toLowerCase() === sc.name.toLowerCase() || (mc.key && mc.key === sc.key))
              ).map((sc) => ({ ...sc, vehicleId: moto.id }));

              parsed.components = [...(parsed.components || []), ...missingStarter];
              parsed.version = '1.2.0';
            }
          }

          // Backfill lifespanMonths for components that have none
          if (Array.isArray(parsed.components)) {
            parsed.components = parsed.components.map((comp) => {
              if (comp.lifespanMonths !== undefined && comp.lifespanMonths !== null) return comp;
              const vehicle = parsed.vehicles.find((v) => v.id === comp.vehicleId);
              const catPresets = COMPONENT_PRESETS[vehicle?.category || 'MOTORCYCLE'] || [];
              const preset = catPresets.find(
                (p) => (comp.key && p.key === comp.key) || p.name.toLowerCase() === comp.name.toLowerCase()
              );
              return {
                ...comp,
                lifespanMonths: preset?.lifespanMonths || null,
              };
            });
          }

          return parsed;
        }
      }
    } catch (err) {
      console.error('Failed to read from localStorage:', err);
    }
    return STARTER_GARAGE_DATA;
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'health' | 'logbook' | 'tools'

  // Persist to localStorage whenever garageData changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(garageData));
    } catch (err) {
      console.error('Failed to persist to localStorage:', err);
    }
  }, [garageData]);

  // Derived: Current Active Vehicle
  const activeVehicle = useMemo(() => {
    const found = garageData.vehicles.find((v) => v.id === garageData.activeVehicleId);
    return found || garageData.vehicles[0] || null;
  }, [garageData.vehicles, garageData.activeVehicleId]);

  // Derived: Components for Active Vehicle
  const activeComponents = useMemo(() => {
    if (!activeVehicle) return [];
    return garageData.components.filter((c) => c.vehicleId === activeVehicle.id);
  }, [garageData.components, activeVehicle]);

  // Derived: Service Logs for Active Vehicle (sorted newest date/odo first)
  const activeServiceLogs = useMemo(() => {
    if (!activeVehicle) return [];
    return garageData.serviceLogs
      .filter((l) => l.vehicleId === activeVehicle.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date) || b.odometer - a.odometer);
  }, [garageData.serviceLogs, activeVehicle]);

  // Derived: Fuel Logs for Active Vehicle (sorted newest date/odo first)
  const activeFuelLogs = useMemo(() => {
    if (!activeVehicle) return [];
    return (garageData.fuelLogs || [])
      .filter((f) => f.vehicleId === activeVehicle.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date) || b.odometer - a.odometer);
  }, [garageData.fuelLogs, activeVehicle]);

  // --- ACTIONS ---

  /** Switch active vehicle */
  const setActiveVehicleId = useCallback((vehicleId) => {
    setGarageData((prev) => ({
      ...prev,
      activeVehicleId: vehicleId,
    }));
  }, []);

  /** Quick update vehicle odometer */
  const updateOdometer = useCallback((vehicleId, newOdoKm) => {
    const odoValue = Math.max(0, Math.round(Number(newOdoKm) || 0));
    setGarageData((prev) => ({
      ...prev,
      vehicles: prev.vehicles.map((v) =>
        v.id === vehicleId
          ? { ...v, currentOdo: odoValue, updatedAt: new Date().toISOString() }
          : v
      ),
    }));
  }, []);

  /** Add a new vehicle with automatic preset components initialization */
  const addVehicle = useCallback((vehiclePayload) => {
    const id = `veh_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const category = vehiclePayload.category || 'CAR';
    const currentOdo = Math.max(0, Number(vehiclePayload.currentOdo) || 0);

    const newVehicle = {
      id,
      name: vehiclePayload.name || 'Kendaraan Baru',
      category,
      brand: vehiclePayload.brand || '',
      model: vehiclePayload.model || '',
      year: Number(vehiclePayload.year) || new Date().getFullYear(),
      currentOdo,
      initialOdo: currentOdo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: vehiclePayload.notes || '',
      // Category specific fields
      ...(category === 'BICYCLE'
        ? {
            frameset: vehiclePayload.frameset || '',
            groupset: vehiclePayload.groupset || '',
            wheelset: vehiclePayload.wheelset || '',
            tireWidthMm: Number(vehiclePayload.tireWidthMm) || 28,
            riderWeightKg: Number(vehiclePayload.riderWeightKg) || 70,
            bikeWeightKg: Number(vehiclePayload.bikeWeightKg) || 9,
            isTubeless: Boolean(vehiclePayload.isTubeless),
          }
        : {
            plateNumber: vehiclePayload.plateNumber || '',
            stnkExpiryDate: vehiclePayload.stnkExpiryDate || '',
            plateExpiryDate: vehiclePayload.plateExpiryDate || '',
            fuelType: vehiclePayload.fuelType || (category === 'CAR' ? 'RON 92' : 'RON 90'),
            tankCapacityLiters: Number(vehiclePayload.tankCapacityLiters) || (category === 'CAR' ? 45 : 7),
            isMatic: vehiclePayload.isMatic ?? (category === 'MOTORCYCLE'),
            isLiquidCooled: vehiclePayload.isLiquidCooled ?? false,
          }),
    };

    // Auto-populate default components for this category
    const presets = COMPONENT_PRESETS[category] || [];
    const defaultComponents = presets.map((preset, idx) => ({
      id: `comp_${Date.now()}_${idx}`,
      vehicleId: id,
      key: preset.key,
      name: preset.name,
      category: preset.category,
      installedAtKm: currentOdo,
      lastServicedKm: currentOdo,
      lifespanKm: preset.lifespanKm,
      lifespanMonths: preset.lifespanMonths || null,
      lastServicedDate: new Date().toISOString().split('T')[0],
      notes: preset.description || '',
    }));

    setGarageData((prev) => ({
      ...prev,
      activeVehicleId: id,
      vehicles: [...prev.vehicles, newVehicle],
      components: [...prev.components, ...defaultComponents],
    }));

    return id;
  }, []);

  /** Update vehicle metadata */
  const updateVehicle = useCallback((vehicleId, partialData) => {
    setGarageData((prev) => ({
      ...prev,
      vehicles: prev.vehicles.map((v) =>
        v.id === vehicleId
          ? { ...v, ...partialData, updatedAt: new Date().toISOString() }
          : v
      ),
    }));
  }, []);

  /** Delete vehicle and cascade delete related components, service logs, and fuel logs */
  const deleteVehicle = useCallback((vehicleId) => {
    setGarageData((prev) => {
      const remainingVehicles = prev.vehicles.filter((v) => v.id !== vehicleId);
      const nextActiveId =
        prev.activeVehicleId === vehicleId
          ? remainingVehicles[0]?.id || ''
          : prev.activeVehicleId;

      return {
        ...prev,
        activeVehicleId: nextActiveId,
        vehicles: remainingVehicles,
        components: prev.components.filter((c) => c.vehicleId !== vehicleId),
        serviceLogs: prev.serviceLogs.filter((l) => l.vehicleId !== vehicleId),
        fuelLogs: (prev.fuelLogs || []).filter((f) => f.vehicleId !== vehicleId),
      };
    });
  }, []);

  /** Add single component */
  const addComponent = useCallback((componentPayload) => {
    const id = `comp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newComponent = {
      id,
      vehicleId: componentPayload.vehicleId,
      key: componentPayload.key || undefined,
      name: componentPayload.name,
      category: componentPayload.category || 'General',
      installedAtKm: Number(componentPayload.installedAtKm) || 0,
      lastServicedKm: Number(componentPayload.installedAtKm) || 0,
      lifespanKm: Math.max(10, Number(componentPayload.lifespanKm) || 5000),
      lifespanMonths: componentPayload.lifespanMonths ? Number(componentPayload.lifespanMonths) : null,
      lastServicedDate: componentPayload.lastServicedDate || new Date().toISOString().split('T')[0],
      notes: componentPayload.notes || '',
    };

    setGarageData((prev) => ({
      ...prev,
      components: [...prev.components, newComponent],
    }));
    return id;
  }, []);

  /** Update component */
  const updateComponent = useCallback((componentId, partialData) => {
    setGarageData((prev) => ({
      ...prev,
      components: prev.components.map((c) =>
        c.id === componentId ? { ...c, ...partialData } : c
      ),
    }));
  }, []);

  /** Delete component */
  const deleteComponent = useCallback((componentId) => {
    setGarageData((prev) => ({
      ...prev,
      components: prev.components.filter((c) => c.id !== componentId),
    }));
  }, []);

  /**
   * Reset / Servis Sekarang on a single component:
   * Sets component.installedAtKm and lastServicedKm to vehicle's currentOdo,
   * updates lastServicedDate to today, and automatically appends a service log entry!
   */
  const resetComponentService = useCallback(
    (componentId, serviceLogDetails = {}) => {
      setGarageData((prev) => {
        const component = prev.components.find((c) => c.id === componentId);
        if (!component) return prev;

        const vehicle = prev.vehicles.find((v) => v.id === component.vehicleId);
        const currentOdo = vehicle ? vehicle.currentOdo : component.installedAtKm;
        const todayStr = new Date().toISOString().split('T')[0];

        // 1. Update component installation baseline
        const updatedComponents = prev.components.map((c) =>
          c.id === componentId
            ? {
                ...c,
                installedAtKm: currentOdo,
                lastServicedKm: currentOdo,
                lastServicedDate: todayStr,
              }
            : c
        );

        // 2. Automatically generate a Service Log entry
        const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
        const newLog = {
          id: logId,
          vehicleId: component.vehicleId,
          date: serviceLogDetails.date || todayStr,
          odometer: currentOdo,
          category: serviceLogDetails.category || 'PART_REPLACEMENT',
          title: serviceLogDetails.title || `Servis / Reset ${component.name}`,
          costRp: parseCurrencyInput(serviceLogDetails.costRp),
          workshop: serviceLogDetails.workshop || 'Bengkel / DIY',
          notes: serviceLogDetails.notes || `Komponen ${component.name} di-reset pada ${currentOdo} km.`,
          replacedComponentIds: [componentId],
        };

        return {
          ...prev,
          components: updatedComponents,
          serviceLogs: [newLog, ...prev.serviceLogs],
        };
      });
    },
    []
  );

  /**
   * Add a new service log with multi-component auto-reset execution
   */
  const addServiceLog = useCallback((logPayload) => {
    const id = `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newLog = {
      id,
      vehicleId: logPayload.vehicleId,
      date: logPayload.date || new Date().toISOString().split('T')[0],
      odometer: Number(logPayload.odometer) || 0,
      category: logPayload.category || 'ROUTINE_SERVICE',
      title: logPayload.title || 'Servis Kendaraan',
      costRp: parseCurrencyInput(logPayload.costRp),
      workshop: logPayload.workshop || '',
      notes: logPayload.notes || '',
      replacedComponentIds: logPayload.replacedComponentIds || [],
    };

    setGarageData((prev) => {
      let components = prev.components;
      const replacedNames = [];

      // If replacedComponentIds were specified, reset those components
      if (newLog.replacedComponentIds && newLog.replacedComponentIds.length > 0) {
        components = components.map((c) => {
          if (newLog.replacedComponentIds.includes(c.id)) {
            replacedNames.push(c.name);
            return {
              ...c,
              installedAtKm: newLog.odometer,
              lastServicedKm: newLog.odometer,
              lastServicedDate: newLog.date,
            };
          }
          return c;
        });

        // Auto-generate clean summary of reset components in log notes
        if (replacedNames.length > 0 && !newLog.notes.includes('Komponen di-reset:')) {
          const resetSummary = `[Komponen di-reset: ${replacedNames.join(', ')}]`;
          newLog.notes = newLog.notes ? `${newLog.notes} • ${resetSummary}` : resetSummary;
        }
      }

      // Also auto-advance vehicle odometer if service odo is higher
      const updatedVehicles = prev.vehicles.map((v) =>
        v.id === newLog.vehicleId && newLog.odometer > v.currentOdo
          ? { ...v, currentOdo: newLog.odometer, updatedAt: new Date().toISOString() }
          : v
      );

      return {
        ...prev,
        vehicles: updatedVehicles,
        components,
        serviceLogs: [newLog, ...prev.serviceLogs],
      };
    });

    return id;
  }, []);

  /**
   * Populate missing standard presets for a vehicle (e.g. 14 granular motor components)
   */
  const syncVehiclePresets = useCallback((vehicleId) => {
    setGarageData((prev) => {
      const vehicle = prev.vehicles.find((v) => v.id === vehicleId);
      if (!vehicle) return prev;

      const presets = COMPONENT_PRESETS[vehicle.category] || [];
      const existing = prev.components.filter((c) => c.vehicleId === vehicleId);
      const newItems = [];

      presets.forEach((preset, idx) => {
        const exists = existing.some(
          (c) => (c.key && c.key === preset.key) || c.name.toLowerCase() === preset.name.toLowerCase()
        );
        if (!exists) {
          newItems.push({
            id: `comp_${Date.now()}_${idx}`,
            vehicleId,
            key: preset.key,
            name: preset.name,
            category: preset.category,
            installedAtKm: vehicle.currentOdo,
            lastServicedKm: vehicle.currentOdo,
            lifespanKm: preset.lifespanKm,
            lifespanMonths: preset.lifespanMonths || null,
            lastServicedDate: new Date().toISOString().split('T')[0],
            notes: preset.description || '',
          });
        }
      });

      if (newItems.length === 0) return prev;

      return {
        ...prev,
        components: [...prev.components, ...newItems],
      };
    });
  }, []);

  /** Delete a service log */
  const deleteServiceLog = useCallback((logId) => {
    setGarageData((prev) => ({
      ...prev,
      serviceLogs: prev.serviceLogs.filter((l) => l.id !== logId),
    }));
  }, []);

  /** Add fuel log */
  const addFuelLog = useCallback((fuelPayload) => {
    const id = `fuel_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newFuel = {
      id,
      vehicleId: fuelPayload.vehicleId,
      date: fuelPayload.date || new Date().toISOString().split('T')[0],
      odometer: Number(fuelPayload.odometer) || 0,
      liters: Number(fuelPayload.liters) || 0,
      totalCostRp: Math.max(0, Number(fuelPayload.totalCostRp) || 0),
      pricePerLiterRp: Number(fuelPayload.pricePerLiterRp) || 0,
      isFullTank: Boolean(fuelPayload.isFullTank),
      notes: fuelPayload.notes || '',
    };

    setGarageData((prev) => {
      const updatedVehicles = prev.vehicles.map((v) =>
        v.id === newFuel.vehicleId && newFuel.odometer > v.currentOdo
          ? { ...v, currentOdo: newFuel.odometer, updatedAt: new Date().toISOString() }
          : v
      );

      return {
        ...prev,
        vehicles: updatedVehicles,
        fuelLogs: [newFuel, ...(prev.fuelLogs || [])],
      };
    });

    return id;
  }, []);

  /** Delete fuel log */
  const deleteFuelLog = useCallback((fuelId) => {
    setGarageData((prev) => ({
      ...prev,
      fuelLogs: (prev.fuelLogs || []).filter((f) => f.id !== fuelId),
    }));
  }, []);

  /** Export all garage data to downloadable JSON file */
  const exportGarageBackupJSON = useCallback(() => {
    const payload = {
      ...garageData,
      version: '1.1.0',
      exportedAt: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `velo-moto-garage-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [garageData]);

  /** Import garage data from a parsed JSON object or text string */
  const importGarageBackupJSON = useCallback((jsonData) => {
    try {
      const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

      if (!parsed || !Array.isArray(parsed.vehicles) || parsed.vehicles.length === 0) {
        throw new Error('Format backup tidak valid: Daftar kendaraan tidak ditemukan.');
      }

      setGarageData({
        version: parsed.version || '1.1.0',
        exportedAt: parsed.exportedAt || new Date().toISOString(),
        activeVehicleId: parsed.activeVehicleId || parsed.vehicles[0].id,
        vehicles: parsed.vehicles,
        components: Array.isArray(parsed.components) ? parsed.components : [],
        serviceLogs: Array.isArray(parsed.serviceLogs) ? parsed.serviceLogs : [],
        fuelLogs: Array.isArray(parsed.fuelLogs) ? parsed.fuelLogs : [],
      });

      return { success: true };
    } catch (err) {
      console.error('Import error:', err);
      return { success: false, error: err.message };
    }
  }, []);

  /** Reset garage to the starter sample data */
  const resetToSampleData = useCallback(() => {
    setGarageData(STARTER_GARAGE_DATA);
  }, []);

  return {
    // State
    garageData,
    vehicles: garageData.vehicles,
    activeVehicle,
    activeVehicleId: garageData.activeVehicleId,
    activeComponents,
    activeServiceLogs,
    activeFuelLogs,
    activeTab,
    setActiveTab,

    // Actions
    setActiveVehicleId,
    updateOdometer,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    addComponent,
    updateComponent,
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
  };
}
