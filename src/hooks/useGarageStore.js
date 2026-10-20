import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { STARTER_GARAGE_DATA, COMPONENT_PRESETS } from '../data/presets';
import { parseCurrencyInput } from '../utils/calculators';
import { supabase } from '../utils/supabaseClient';

const STORAGE_KEY = 'garage_logbook_v1';

// ── Supabase snake_case → camelCase mappers ──────────────────────────────────

const mapVehicle = (row) => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  category: row.category,
  brand: row.brand || '',
  model: row.model || '',
  year: row.year,
  currentOdo: row.current_odo,
  initialOdo: row.initial_odo,
  notes: row.notes || '',
  plateNumber: row.plate_number || '',
  stnkExpiryDate: row.stnk_expiry_date || '',
  plateExpiryDate: row.plate_expiry_date || '',
  fuelType: row.fuel_type || '',
  tankCapacityLiters: row.tank_capacity_liters ? Number(row.tank_capacity_liters) : null,
  isMatic: row.is_matic || false,
  isLiquidCooled: row.is_liquid_cooled || false,
  frameset: row.frameset || '',
  groupset: row.groupset || '',
  wheelset: row.wheelset || '',
  tireWidthMm: row.tire_width_mm || 28,
  riderWeightKg: row.rider_weight_kg ? Number(row.rider_weight_kg) : 70,
  bikeWeightKg: row.bike_weight_kg ? Number(row.bike_weight_kg) : 9,
  isTubeless: row.is_tubeless ?? true,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapComponent = (row) => ({
  id: row.id,
  vehicleId: row.vehicle_id,
  userId: row.user_id,
  key: row.key || undefined,
  name: row.name,
  category: row.category || 'General',
  installedAtKm: row.installed_at_km,
  lastServicedKm: row.last_serviced_km,
  lifespanKm: row.lifespan_km,
  lifespanMonths: row.lifespan_months || null,
  lastServicedDate: row.last_serviced_date || '',
  notes: row.notes || '',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapServiceLog = (row) => ({
  id: row.id,
  vehicleId: row.vehicle_id,
  userId: row.user_id,
  date: row.date,
  odometer: row.odometer,
  category: row.category,
  title: row.title,
  costRp: row.cost_rp,
  workshop: row.workshop || '',
  notes: row.notes || '',
  replacedComponentIds: [], // junction table not loaded here for simplicity
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapFuelLog = (row) => ({
  id: row.id,
  vehicleId: row.vehicle_id,
  userId: row.user_id,
  date: row.date,
  odometer: row.odometer,
  liters: Number(row.liters),
  totalCostRp: row.total_cost_rp,
  pricePerLiterRp: Number(row.price_per_liter_rp),
  isFullTank: row.is_full_tank ?? true,
  notes: row.notes || '',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// ── Supabase camelCase → snake_case converters ───────────────────────────────

const vehicleToRow = (v, userId) => ({
  id: v.id,
  user_id: userId,
  name: v.name,
  category: v.category,
  brand: v.brand || '',
  model: v.model || '',
  year: v.year,
  current_odo: v.currentOdo,
  initial_odo: v.initialOdo,
  notes: v.notes || '',
  plate_number: v.plateNumber || null,
  stnk_expiry_date: v.stnkExpiryDate || null,
  plate_expiry_date: v.plateExpiryDate || null,
  fuel_type: v.fuelType || null,
  tank_capacity_liters: v.tankCapacityLiters || null,
  is_matic: v.isMatic || false,
  is_liquid_cooled: v.isLiquidCooled || false,
  frameset: v.frameset || null,
  groupset: v.groupset || null,
  wheelset: v.wheelset || null,
  tire_width_mm: v.tireWidthMm || null,
  rider_weight_kg: v.riderWeightKg || null,
  bike_weight_kg: v.bikeWeightKg || null,
  is_tubeless: v.isTubeless ?? null,
});

const componentToRow = (c, userId) => ({
  id: c.id,
  vehicle_id: c.vehicleId,
  user_id: userId,
  key: c.key || null,
  name: c.name,
  category: c.category || 'General',
  installed_at_km: c.installedAtKm,
  last_serviced_km: c.lastServicedKm,
  lifespan_km: c.lifespanKm,
  lifespan_months: c.lifespanMonths || null,
  last_serviced_date: c.lastServicedDate || null,
  notes: c.notes || '',
});

const serviceLogToRow = (l, userId) => ({
  id: l.id,
  vehicle_id: l.vehicleId,
  user_id: userId,
  date: l.date,
  odometer: l.odometer,
  category: l.category,
  title: l.title,
  cost_rp: l.costRp,
  workshop: l.workshop || '',
  notes: l.notes || '',
});

const fuelLogToRow = (f, userId) => ({
  id: f.id,
  vehicle_id: f.vehicleId,
  user_id: userId,
  date: f.date,
  odometer: f.odometer,
  liters: f.liters,
  total_cost_rp: f.totalCostRp,
  price_per_liter_rp: f.pricePerLiterRp,
  is_full_tank: f.isFullTank,
  notes: f.notes || '',
});

// ── Store ────────────────────────────────────────────────────────────────────

/**
 * Custom hook managing local-first persistent garage state, vehicle selection,
 * telemetry updates, component wear, service logs, and JSON backup/restore.
 * Supabase sync is layered on top of every mutation without blocking the UI.
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

  // Track current userId for Supabase mutations
  const userIdRef = useRef(null);

  // Persist to localStorage whenever garageData changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(garageData));
    } catch (err) {
      console.error('Failed to persist to localStorage:', err);
    }
  }, [garageData]);

  // ── Supabase helpers ────────────────────────────────────────────────────────

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

  /**
   * Load all user data from Supabase and overwrite local state.
   * Called once after login via initStore(userId).
   */
  const loadFromSupabase = useCallback(async (userId) => {
    try {
      const [
        { data: vehicles, error: vErr },
        { data: components, error: cErr },
        { data: serviceLogs, error: slErr },
        { data: fuelLogs, error: flErr },
        { data: slComponents, error: slcErr },
      ] = await Promise.all([
        supabase.from('vehicles').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
        supabase.from('components').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
        supabase.from('service_logs').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('fuel_logs').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('service_log_components').select('*').eq('user_id', userId),
      ]);

      if (vErr) { console.warn('[Supabase] vehicles fetch error:', vErr.message); return; }
      if (cErr) { console.warn('[Supabase] components fetch error:', cErr.message); return; }
      if (slErr) { console.warn('[Supabase] service_logs fetch error:', slErr.message); return; }
      if (flErr) { console.warn('[Supabase] fuel_logs fetch error:', flErr.message); return; }
      if (slcErr) { console.warn('[Supabase] service_log_components fetch error:', slcErr.message); }

      if (!vehicles || vehicles.length === 0) {
        // User has no cloud data yet — don't overwrite local starter data
        return;
      }

      // Group junction records by service_log_id
      const junctionByLogId = (slComponents || []).reduce((acc, row) => {
        if (!acc[row.service_log_id]) acc[row.service_log_id] = [];
        if (row.component_id) acc[row.service_log_id].push(row.component_id);
        return acc;
      }, {});

      setGarageData((prev) => {
        // Avoid stale/ghost activeVehicleId after loading from cloud
        const nextActiveId = vehicles.some((v) => v.id === prev.activeVehicleId)
          ? prev.activeVehicleId
          : vehicles[0]?.id || '';

        return {
          ...prev,
          activeVehicleId: nextActiveId,
          vehicles: vehicles.map(mapVehicle),
          components: (components || []).map(mapComponent),
          serviceLogs: (serviceLogs || []).map((row) => ({
            ...mapServiceLog(row),
            replacedComponentIds: junctionByLogId[row.id] || [],
          })),
          fuelLogs: (fuelLogs || []).map(mapFuelLog),
        };
      });
    } catch (err) {
      console.warn('[Supabase] loadFromSupabase unexpected error:', err);
    }
  }, []);

  /**
   * initStore — call this when the user's auth session becomes available.
   */
  const initStore = useCallback(
    (userId) => {
      userIdRef.current = userId;
      if (userId) {
        loadFromSupabase(userId);
      }
    },
    [loadFromSupabase]
  );

  // ── Supabase fire-and-forget wrappers ────────────────────────────────────────

  const sbUpsertVehicle = (vehicle) => {
    const uid = userIdRef.current;
    if (!uid) return;
    supabase.from('vehicles').upsert(vehicleToRow(vehicle, uid)).then(({ error }) => {
      if (error) console.warn('[Supabase] upsert vehicle error:', error.message);
    });
  };

  const sbDeleteVehicle = (vehicleId) => {
    const uid = userIdRef.current;
    if (!uid) return;
    supabase.from('vehicles').delete().eq('id', vehicleId).then(({ error }) => {
      if (error) console.warn('[Supabase] delete vehicle error:', error.message);
    });
  };

  const sbUpsertComponents = (components) => {
    const uid = userIdRef.current;
    if (!uid || !components.length) return;
    supabase.from('components').upsert(components.map((c) => componentToRow(c, uid))).then(({ error }) => {
      if (error) console.warn('[Supabase] upsert components error:', error.message);
    });
  };

  const sbDeleteComponent = (componentId) => {
    const uid = userIdRef.current;
    if (!uid) return;
    supabase.from('components').delete().eq('id', componentId).then(({ error }) => {
      if (error) console.warn('[Supabase] delete component error:', error.message);
    });
  };

  const sbInsertServiceLog = async (log) => {
    const uid = userIdRef.current;
    if (!uid) return;
    try {
      const { error } = await supabase.from('service_logs').insert(serviceLogToRow(log, uid));
      if (error) {
        console.warn('[Supabase] insert service_log error:', error.message);
        return;
      }
      if (log.replacedComponentIds && log.replacedComponentIds.length > 0) {
        const junctionRows = log.replacedComponentIds.map((compId) => {
          const comp = garageData.components.find((c) => c.id === compId);
          return {
            service_log_id: log.id,
            component_id: compId,
            user_id: uid,
            component_name: comp?.name || 'Komponen',
          };
        });
        const { error: jErr } = await supabase.from('service_log_components').insert(junctionRows);
        if (jErr) console.warn('[Supabase] insert service_log_components error:', jErr.message);
      }
    } catch (err) {
      console.warn('[Supabase] sbInsertServiceLog error:', err);
    }
  };

  const sbDeleteServiceLog = (logId) => {
    const uid = userIdRef.current;
    if (!uid) return;
    supabase.from('service_logs').delete().eq('id', logId).then(({ error }) => {
      if (error) console.warn('[Supabase] delete service_log error:', error.message);
    });
  };

  const sbInsertFuelLog = (log) => {
    const uid = userIdRef.current;
    if (!uid) return;
    supabase.from('fuel_logs').insert(fuelLogToRow(log, uid)).then(({ error }) => {
      if (error) console.warn('[Supabase] insert fuel_log error:', error.message);
    });
  };

  const sbDeleteFuelLog = (logId) => {
    const uid = userIdRef.current;
    if (!uid) return;
    supabase.from('fuel_logs').delete().eq('id', logId).then(({ error }) => {
      if (error) console.warn('[Supabase] delete fuel_log error:', error.message);
    });
  };

  // ── Derived state ────────────────────────────────────────────────────────────

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
    setGarageData((prev) => {
      const updated = prev.vehicles.map((v) =>
        v.id === vehicleId
          ? { ...v, currentOdo: odoValue, updatedAt: new Date().toISOString() }
          : v
      );
      const vehicle = updated.find((v) => v.id === vehicleId);
      if (vehicle) sbUpsertVehicle(vehicle);
      return { ...prev, vehicles: updated };
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Add a new vehicle with automatic preset components initialization */
  const addVehicle = useCallback((vehiclePayload) => {
    const id = generateUUID();
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
    const defaultComponents = presets.map((preset) => ({
      id: generateUUID(),
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

    // Supabase sync
    sbUpsertVehicle(newVehicle);
    sbUpsertComponents(defaultComponents);

    return id;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Update vehicle metadata */
  const updateVehicle = useCallback((vehicleId, partialData) => {
    setGarageData((prev) => {
      const updated = prev.vehicles.map((v) =>
        v.id === vehicleId
          ? { ...v, ...partialData, updatedAt: new Date().toISOString() }
          : v
      );
      const vehicle = updated.find((v) => v.id === vehicleId);
      if (vehicle) sbUpsertVehicle(vehicle);
      return { ...prev, vehicles: updated };
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Delete vehicle and cascade delete related components, service logs, and fuel logs */
  const deleteVehicle = useCallback((vehicleId) => {
    setGarageData((prev) => {
      const remainingVehicles = prev.vehicles.filter((v) => v.id !== vehicleId);
      const nextActiveId =
        prev.activeVehicleId === vehicleId
          ? remainingVehicles[0]?.id || ''
          : prev.activeVehicleId;

      sbDeleteVehicle(vehicleId); // Supabase cascade handles children

      return {
        ...prev,
        activeVehicleId: nextActiveId,
        vehicles: remainingVehicles,
        components: prev.components.filter((c) => c.vehicleId !== vehicleId),
        serviceLogs: prev.serviceLogs.filter((l) => l.vehicleId !== vehicleId),
        fuelLogs: (prev.fuelLogs || []).filter((f) => f.vehicleId !== vehicleId),
      };
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Add single component */
  const addComponent = useCallback((componentPayload) => {
    const id = generateUUID();
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
    sbUpsertComponents([newComponent]);
    return id;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Update component */
  const updateComponent = useCallback((componentId, partialData) => {
    setGarageData((prev) => {
      const updated = prev.components.map((c) =>
        c.id === componentId ? { ...c, ...partialData } : c
      );
      const comp = updated.find((c) => c.id === componentId);
      if (comp) sbUpsertComponents([comp]);
      return { ...prev, components: updated };
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Delete component */
  const deleteComponent = useCallback((componentId) => {
    sbDeleteComponent(componentId);
    setGarageData((prev) => ({
      ...prev,
      components: prev.components.filter((c) => c.id !== componentId),
    }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        const logId = generateUUID();
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

        // Supabase sync
        const updComp = updatedComponents.find((c) => c.id === componentId);
        if (updComp) sbUpsertComponents([updComp]);
        sbInsertServiceLog(newLog);

        return {
          ...prev,
          components: updatedComponents,
          serviceLogs: [newLog, ...prev.serviceLogs],
        };
      });
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  /**
   * Add a new service log with multi-component auto-reset execution
   */
  const addServiceLog = useCallback((logPayload) => {
    const id = generateUUID();
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

      // Supabase sync
      sbInsertServiceLog(newLog);
      const resetComps = components.filter((c) => newLog.replacedComponentIds.includes(c.id));
      if (resetComps.length > 0) sbUpsertComponents(resetComps);
      const updVehicle = updatedVehicles.find((v) => v.id === newLog.vehicleId);
      if (updVehicle && newLog.odometer > (prev.vehicles.find((v) => v.id === newLog.vehicleId)?.currentOdo || 0)) {
        sbUpsertVehicle(updVehicle);
      }

      return {
        ...prev,
        vehicles: updatedVehicles,
        components,
        serviceLogs: [newLog, ...prev.serviceLogs],
      };
    });

    return id;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

      presets.forEach((preset) => {
        const exists = existing.some(
          (c) => (c.key && c.key === preset.key) || c.name.toLowerCase() === preset.name.toLowerCase()
        );
        if (!exists) {
          newItems.push({
            id: generateUUID(),
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

      sbUpsertComponents(newItems);

      return {
        ...prev,
        components: [...prev.components, ...newItems],
      };
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Delete a service log */
  const deleteServiceLog = useCallback((logId) => {
    sbDeleteServiceLog(logId);
    setGarageData((prev) => ({
      ...prev,
      serviceLogs: prev.serviceLogs.filter((l) => l.id !== logId),
    }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Add fuel log */
  const addFuelLog = useCallback((fuelPayload) => {
    const id = generateUUID();
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

      sbInsertFuelLog(newFuel);

      return {
        ...prev,
        vehicles: updatedVehicles,
        fuelLogs: [newFuel, ...(prev.fuelLogs || [])],
      };
    });

    return id;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Delete fuel log */
  const deleteFuelLog = useCallback((fuelId) => {
    sbDeleteFuelLog(fuelId);
    setGarageData((prev) => ({
      ...prev,
      fuelLogs: (prev.fuelLogs || []).filter((f) => f.id !== fuelId),
    }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    initStore,
  };
}
