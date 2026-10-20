/**
 * Velo & Moto Garage Logbook - Technical Calculators & Analytical Utilities
 * Standardized pure calculation functions for vehicle telemetry and component wear.
 */

/**
 * Calculate component health percentage and wear status based on Dual-Threshold Logic:
 * Distance elapsed (KM) vs Time elapsed (Months/Days since last service date).
 * Whichever threshold reaches critical first determines the wear status.
 *
 * Thresholds:
 * - Hijau (Aman): Sisa Umur > 25% dan belum melewati batas KM/waktu
 * - Kuning (Waktunya Servis): Sisa Umur <= 25% dan belum melewati batas
 * - Merah (Overdue / Telat Servis): Sisa KM <= 0 ATAU sisa hari <= 0
 *
 * @param {number} currentOdo - Current vehicle odometer in km
 * @param {number|object} installedAtKmOrComp - Installation odo or component object
 * @param {number} [lifespanKmArg] - Target lifespan interval in km
 * @param {number} [lifespanMonthsArg] - Target lifespan in months (optional)
 * @param {string} [lastServicedDateArg] - Date string YYYY-MM-DD (optional)
 * @returns {object} Health telemetry object with dual-threshold analytics
 */
export function calculateComponentHealth(
  currentOdo,
  installedAtKmOrComp,
  lifespanKmArg,
  lifespanMonthsArg,
  lastServicedDateArg
) {
  // Support passing component object directly as second argument:
  let installedAtKm = 0;
  let lifespanKm = 1;
  let lifespanMonths = null;
  let lastServicedDate = null;

  if (typeof installedAtKmOrComp === 'object' && installedAtKmOrComp !== null) {
    installedAtKm = installedAtKmOrComp.installedAtKm ?? installedAtKmOrComp.lastServicedKm ?? 0;
    lifespanKm = installedAtKmOrComp.lifespanKm ?? 1;
    lifespanMonths = installedAtKmOrComp.lifespanMonths ?? null;
    lastServicedDate = installedAtKmOrComp.lastServicedDate ?? null;
  } else {
    installedAtKm = Number(installedAtKmOrComp) || 0;
    lifespanKm = Number(lifespanKmArg) || 1;
    lifespanMonths = lifespanMonthsArg ? Number(lifespanMonthsArg) : null;
    lastServicedDate = lastServicedDateArg || null;
  }

  const current = Number(currentOdo) || 0;
  const installed = Number(installedAtKm) || 0;
  const lifespan = Math.max(1, Number(lifespanKm) || 1);

  // 1. Distance Metric (KM)
  const kmElapsed = Math.max(0, current - installed);
  const remainingKm = lifespan - kmElapsed;
  const percentageKm = Math.max(0, Math.min(100, Math.round((remainingKm / lifespan) * 100)));
  const isKmOverdue = remainingKm <= 0;

  // 2. Time Metric (Months & Days)
  let timeMetrics = null;
  let isTimeActive = false;
  let percentageTime = 100;
  let isTimeOverdue = false;

  if (lifespanMonths && Number(lifespanMonths) > 0 && lastServicedDate) {
    const servicedDateObj = new Date(lastServicedDate);
    if (!isNaN(servicedDateObj.getTime())) {
      isTimeActive = true;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const past = new Date(servicedDateObj);
      past.setHours(0, 0, 0, 0);

      const daysElapsed = Math.max(0, Math.floor((today.getTime() - past.getTime()) / (1000 * 60 * 60 * 24)));
      const targetDays = Math.max(1, Math.round(Number(lifespanMonths) * 30.4375));
      const remainingDays = targetDays - daysElapsed;
      percentageTime = Math.max(0, Math.min(100, Math.round((remainingDays / targetDays) * 100)));
      isTimeOverdue = remainingDays <= 0;

      timeMetrics = {
        lifespanMonths: Number(lifespanMonths),
        lastServicedDate,
        daysElapsed,
        targetDays,
        remainingDays,
        percentageTime,
        isTimeOverdue,
      };
    }
  }

  // 3. Dual-Threshold Synthesis (Whichever is reached first)
  let percentage = percentageKm;
  let limitingFactor = 'km'; // 'km' | 'time'
  let isOverdue = isKmOverdue;

  if (isTimeActive) {
    if (percentageTime < percentageKm) {
      percentage = percentageTime;
      limitingFactor = 'time';
    } else {
      percentage = percentageKm;
      limitingFactor = 'km';
    }
    isOverdue = isKmOverdue || isTimeOverdue;
  }

  let status = 'healthy';
  let statusColor = 'emerald';
  let label = 'AMAN';
  let urgencyText = 'Kondisi Prima';

  if (isOverdue || percentage <= 0) {
    status = 'critical';
    statusColor = 'rose';
    label = 'OVERDUE';
    if (isKmOverdue && isTimeOverdue) {
      urgencyText = 'Batas KM & Waktu Terlewati';
    } else if (isTimeOverdue) {
      urgencyText = `Batas Waktu Terlewati (${timeMetrics.lifespanMonths} bln)`;
    } else {
      urgencyText = 'Batas Jarak KM Terlewati';
    }
  } else if (percentage <= 25) {
    status = 'warning';
    statusColor = 'amber';
    label = 'WAKTUNYA SERVIS';
    urgencyText =
      limitingFactor === 'time'
        ? `Waktu pemakaian hampir habis (${timeMetrics.remainingDays} hari lagi)`
        : `Jarak tempuh hampir habis (${formatKm(remainingKm)} lagi)`;
  } else {
    status = 'healthy';
    statusColor = 'emerald';
    label = 'AMAN';
    urgencyText = isTimeActive
      ? `${formatKm(remainingKm)} / ${timeMetrics.remainingDays} hari lagi`
      : `${formatKm(remainingKm)} lagi`;
  }

  return {
    kmElapsed,
    remainingKm,
    percentageKm,
    isKmOverdue,
    timeMetrics,
    isTimeActive,
    percentageTime,
    isTimeOverdue,
    percentage,
    limitingFactor,
    status,
    statusColor,
    label,
    urgencyText,
    isOverdue,
  };
}

/**
 * Odometer Input Guard & Anomaly Detection.
 * Validates odometer update inputs, warning if user attempts to rewind odometer
 * or enters an unrealistically large leap (e.g. accidental extra zeroes).
 *
 * @param {number} currentOdo - Vehicle's current odometer in km
 * @param {number} newOdo - Proposed new odometer in km
 * @returns {object} Validation result { isValid, isBackward, isExcessiveJump, delta, message, warningLevel }
 */
export function validateOdometerInput(currentOdo, newOdo) {
  const current = Math.max(0, Number(currentOdo) || 0);
  const next = Number(newOdo);

  if (isNaN(next) || next < 0) {
    return {
      isValid: false,
      isBackward: false,
      isExcessiveJump: false,
      delta: 0,
      warningLevel: 'danger',
      message: 'Odometer harus berupa angka positif.',
    };
  }

  const delta = next - current;

  // 1. Backward Odometer
  if (delta < 0) {
    return {
      isValid: true,
      isBackward: true,
      isExcessiveJump: false,
      delta,
      warningLevel: 'danger',
      message: `Odometer baru (${formatKm(next)}) lebih rendah dari odometer tercatat (${formatKm(current)}). Terdeteksi pengurangan ${formatKm(Math.abs(delta))}.`,
    };
  }

  // 2. Excessive Jump (> 15.000 km in one single update)
  if (delta > 15000) {
    return {
      isValid: true,
      isBackward: false,
      isExcessiveJump: true,
      delta,
      warningLevel: 'warning',
      message: `Lonjakan jarak sangat tinggi (+${formatKm(delta)}). Periksa kembali apakah terdapat kelebihan pengetikan angka 0.`,
    };
  }

  return {
    isValid: true,
    isBackward: false,
    isExcessiveJump: false,
    delta,
    warningLevel: 'none',
    message: delta === 0 ? 'Odometer sama dengan catatan saat ini.' : `Penambahan jarak tempuh: +${formatKm(delta)}`,
  };
}

/**
 * Match a component key (e.g. 'oli_mesin', 'servis_cvt') to a vehicle's component.
 * Supports exact key matching and robust normalized name heuristics.
 *
 * @param {string} key - Suku cadang key
 * @param {object} component - Component object
 * @returns {boolean} True if matches
 */
export function matchComponentByKey(key, component) {
  if (!component || !key) return false;
  if (component.key && component.key === key) return true;

  const name = (component.name || '').toLowerCase();
  switch (key) {
    case 'oli_mesin':
      return name.includes('oli mesin') && !name.includes('gardan') && !name.includes('gear');
    case 'oli_gardan':
      return name.includes('gardan') || name.includes('gear oil');
    case 'filter_oli':
      return name.includes('filter oli');
    case 'servis_tb':
      return (
        name.includes('throttle') ||
        name.includes('tb') ||
        name.includes('injektor') ||
        name.includes('injector')
      );
    case 'busi':
      return name.includes('busi') || name.includes('spark plug');
    case 'filter_udara':
      return name.includes('filter udara') || name.includes('air filter');
    case 'kampas_rem_depan':
      return name.includes('rem depan') || (name.includes('kampas rem') && name.includes('depan'));
    case 'kampas_rem_belakang':
      return name.includes('rem belakang') || (name.includes('kampas rem') && name.includes('belakang'));
    case 'servis_cvt':
      return name.includes('servis cvt') || name.includes('clean & grease');
    case 'roller_cvt':
      return name.includes('roller');
    case 'v_belt':
      return name.includes('v-belt') || (name.includes('belt') && !name.includes('roller'));
    case 'rantai_gir_set':
      return name.includes('rantai') && (name.includes('gir') || name.includes('set') || name.includes('sprocket'));
    case 'air_radiator':
      return name.includes('radiator') || name.includes('coolant');
    case 'minyak_rem':
      return name.includes('minyak rem') || name.includes('brake fluid');
    // Ban Tubeless, Ban Luar & Ban Dalam
    case 'ban_depan_tubeless':
      return (
        (name.includes('ban') && name.includes('depan') && name.includes('tubeless')) ||
        (name.includes('ban') && name.includes('depan') && !name.includes('dalam') && !name.includes('luar'))
      );
    case 'ban_belakang_tubeless':
      return (
        (name.includes('ban') && name.includes('belakang') && name.includes('tubeless')) ||
        (name.includes('ban') && name.includes('belakang') && !name.includes('dalam') && !name.includes('luar'))
      );
    case 'pentil_cairan_tubeless':
      return (
        name.includes('cairan') ||
        name.includes('sealant') ||
        name.includes('pentil')
      );
    case 'ban_luar_depan':
      return name.includes('ban luar') && name.includes('depan');
    case 'ban_luar_belakang':
      return name.includes('ban luar') && name.includes('belakang');
    case 'ban_dalam_depan':
      return name.includes('ban dalam') && name.includes('depan');
    case 'ban_dalam_belakang':
      return name.includes('ban dalam') && name.includes('belakang');
    default:
      return false;
  }
}

/**
 * Safely parse any currency input (number or string with dots/commas/Rp) to an integer IDR amount.
 * Prevents standard Number("150.000") which evaluates to 150.
 *
 * @param {string|number} val - Raw input value
 * @returns {number} Integer Rupiah amount (>= 0)
 */
export function parseCurrencyInput(val) {
  if (typeof val === 'number') {
    return isNaN(val) ? 0 : Math.max(0, Math.round(val));
  }
  if (!val) return 0;
  const str = String(val).trim();
  if (!str) return 0;

  // Handle standard Indonesian cents suffix like ",00", ",-", or ",0"
  // so that "350.000,00" doesn't become 35000000.
  const withoutCents = str.replace(/,\d{1,2}$/, '').replace(/,-$/, '');

  // Extract all digit characters
  const digitsOnly = withoutCents.replace(/[^0-9]/g, '');
  if (!digitsOnly) return 0;

  return parseInt(digitsOnly, 10);
}

/**
 * Intelligent Maintenance Cost per Kilometer Analysis.
 * Resolves the issue where initialOdo == currentOdo causes division by 1 km (huge spike),
 * or where zero distance yields misleading numbers.
 *
 * Priority order for distance baseline:
 * 1. Ownership distance (currentOdo - initialOdo) if >= 50 km
 * 2. Service log historical span (maxLogOdo - minLogOdo) if >= 50 km
 * 3. Lifetime vehicle odometer (currentOdo) if >= 50 km
 * 4. Safe floor baseline (min. 100 km) if vehicle is brand new
 *
 * @param {number} totalCostRp - Cumulative maintenance cost in IDR
 * @param {number} currentOdo - Vehicle current odometer (km)
 * @param {number} initialOdo - Vehicle initial odometer (km)
 * @param {Array<object>} [serviceLogs=[]] - Vehicle service logs
 * @returns {object} Analysis result
 */
export function getCostPerKmAnalysis(totalCostRp, currentOdo, initialOdo, serviceLogs = []) {
  const cost = Math.max(0, Number(totalCostRp) || 0);
  const current = Math.max(0, Number(currentOdo) || 0);
  const initial = Math.max(0, Number(initialOdo) || 0);

  // 1. Ownership delta (distance traveled while tracked in the app)
  const ownershipDelta = current > initial ? current - initial : 0;

  // 2. Service logs odometer span
  let logSpanDelta = 0;
  if (Array.isArray(serviceLogs) && serviceLogs.length > 0) {
    const validOdos = serviceLogs
      .map((log) => Number(log.odometer))
      .filter((odo) => !isNaN(odo) && odo > 0);

    if (validOdos.length > 0) {
      const minOdo = Math.min(...validOdos);
      const maxOdo = Math.max(...validOdos, current);
      logSpanDelta = Math.max(0, maxOdo - minOdo);
    }
  }

  let distanceBaseline = 0;
  let basisType = 'ownership'; // 'ownership' | 'log_span' | 'lifetime' | 'provisional'
  let detailText = '';

  if (ownershipDelta >= 50) {
    distanceBaseline = ownershipDelta;
    basisType = 'ownership';
    detailText = `Jarak kepemilikan: ${formatKm(ownershipDelta)}`;
  } else if (logSpanDelta >= 50) {
    distanceBaseline = logSpanDelta;
    basisType = 'log_span';
    detailText = `Rentang riwayat servis: ${formatKm(logSpanDelta)}`;
  } else if (current >= 50) {
    distanceBaseline = current;
    basisType = 'lifetime';
    detailText = `Total odometer: ${formatKm(current)}`;
  } else {
    // Brand new vehicle with < 50 km
    distanceBaseline = Math.max(100, current);
    basisType = 'provisional';
    detailText = current > 0 ? `Jarak tempuh awal: ${formatKm(current)}` : 'Menunggu data jarak';
  }

  // Cost per KM calculation
  const costPerKm = distanceBaseline > 0 ? Math.round(cost / distanceBaseline) : 0;

  return {
    costPerKm,
    distanceBaseline,
    basisType,
    detailText,
    totalCost: cost,
    ownershipDelta,
    logSpanDelta,
  };
}

/**
 * Calculate Maintenance Cost per Kilometer (Rp / km).
 * Backward-compatible helper that delegates to getCostPerKmAnalysis.
 *
 * @param {number} totalCostRp - Cumulative maintenance expenses in Rupiah
 * @param {number} currentOdo - Current odometer reading (km)
 * @param {number} initialOdo - Initial odometer baseline (km)
 * @param {Array<object>} [serviceLogs=[]] - Optional service logs array
 * @returns {number} Cost per kilometer in Rp (rounded)
 */
export function calculateCostPerKm(totalCostRp, currentOdo, initialOdo, serviceLogs = []) {
  const analysis = getCostPerKmAnalysis(totalCostRp, currentOdo, initialOdo, serviceLogs);
  return analysis.costPerKm;
}

/**
 * Calculate total maintenance expenses across a collection of service logs.
 *
 * @param {Array<{costRp: number}>} serviceLogs - Array of service log records
 * @returns {number} Sum of costs in Rupiah
 */
export function calculateTotalMaintenanceCost(serviceLogs = []) {
  if (!Array.isArray(serviceLogs)) return 0;
  return serviceLogs.reduce((acc, log) => acc + (Number(log.costRp) || 0), 0);
}

/**
 * Calculate Fuel Efficiency using full-to-full delta.
 *
 * @param {number} currentOdo - Odometer at latest fill-up
 * @param {number} previousOdo - Odometer at previous fill-up
 * @param {number} litersFilled - Liters filled in latest transaction
 * @returns {number} km / Liter (1 decimal place)
 */
export function calculateFuelEfficiency(currentOdo, previousOdo, litersFilled) {
  const distance = (Number(currentOdo) || 0) - (Number(previousOdo) || 0);
  const liters = Number(litersFilled) || 0;

  if (distance <= 0 || liters <= 0) return 0;
  return Number((distance / liters).toFixed(1));
}

/**
 * Estimate Fuel Cost for a trip.
 *
 * @param {number} distanceKm - Estimated distance in km
 * @param {number} kmPerLiter - Fuel economy
 * @param {number} pricePerLiterRp - Fuel price per liter
 * @returns {object} { litersNeeded, totalTripCostRp }
 */
export function calculateTripCost(distanceKm, kmPerLiter, pricePerLiterRp) {
  const distance = Math.max(0, Number(distanceKm) || 0);
  const efficiency = Math.max(0.1, Number(kmPerLiter) || 12);
  const price = Math.max(0, Number(pricePerLiterRp) || 10000);

  const litersNeeded = Number((distance / efficiency).toFixed(2));
  const totalTripCostRp = Math.round(litersNeeded * price);

  return { litersNeeded, totalTripCostRp };
}

/**
 * Frank Berto-inspired Bicycle Tire Pressure Calculator.
 *
 * @param {object} params
 * @param {number} params.riderWeightKg - Rider weight in kg
 * @param {number} params.bikeWeightKg - Bike weight in kg
 * @param {number} params.tireWidthMm - Tire width in mm
 * @param {string} [params.surface='dry_tarmac'] - 'dry_tarmac' | 'wet_tarmac' | 'gravel'
 * @param {boolean} [params.isTubeless=false] - True if tubeless setup
 * @returns {object} { frontPsi, rearPsi, frontBar, rearBar, distributionRatio }
 */
export function calculateBikeTirePressure({
  riderWeightKg = 70,
  bikeWeightKg = 9,
  tireWidthMm = 28,
  surface = 'dry_tarmac',
  isTubeless = false,
} = {}) {
  const totalWeightKg = Math.max(30, (Number(riderWeightKg) || 70) + (Number(bikeWeightKg) || 9));
  const width = Math.max(20, Math.min(60, Number(tireWidthMm) || 28));

  const baseRearDryPsi = (totalWeightKg / (width * 0.038)) * 0.58 * 0.95;

  const surfaceMultipliers = {
    dry_tarmac: 1.0,
    wet_tarmac: 0.92,
    gravel: 0.82,
  };
  const surfaceFactor = surfaceMultipliers[surface] || 1.0;
  const tubelessFactor = isTubeless ? 0.91 : 1.0;
  const frontRatio = 0.42 / 0.58;

  let rearPsi = Math.round(baseRearDryPsi * surfaceFactor * tubelessFactor);
  let frontPsi = Math.round(rearPsi * frontRatio);

  rearPsi = Math.max(25, Math.min(115, rearPsi));
  frontPsi = Math.max(22, Math.min(110, frontPsi));

  const rearBar = Number((rearPsi / 14.5038).toFixed(2));
  const frontBar = Number((frontPsi / 14.5038).toFixed(2));

  return {
    frontPsi,
    rearPsi,
    frontBar,
    rearBar,
    totalWeightKg,
    surfaceFactor,
    isTubeless,
  };
}

/**
 * Bicycle Gear Ratio & Cadence Speed Calculator.
 *
 * @param {object} params
 * @param {number} params.chainringTeeth - Teeth on active front chainring
 * @param {number} params.cassetteTeeth - Teeth on active rear cog
 * @param {number} [params.cadenceRpm=85] - Pedaling cadence in RPM
 * @param {number} [params.wheelCircumferenceMm=2136] - Circumference in mm
 * @returns {object} { gearRatio, developmentMeters, speedKmh }
 */
export function calculateGearRatioAndSpeed({
  chainringTeeth = 50,
  cassetteTeeth = 17,
  cadenceRpm = 85,
  wheelCircumferenceMm = 2136,
} = {}) {
  const front = Math.max(20, Number(chainringTeeth) || 50);
  const rear = Math.max(9, Number(cassetteTeeth) || 17);
  const cadence = Math.max(20, Number(cadenceRpm) || 85);
  const circumferenceM = Math.max(1000, Number(wheelCircumferenceMm) || 2136) / 1000;

  const gearRatio = Number((front / rear).toFixed(2));
  const developmentMeters = Number((gearRatio * circumferenceM).toFixed(2));
  const speedKmh = Number(((developmentMeters * cadence * 60) / 1000).toFixed(1));

  return {
    gearRatio,
    developmentMeters,
    speedKmh,
    front,
    rear,
    cadence,
  };
}

/**
 * Indonesian Vehicle Tax (STNK / Plat Nomor) Expiry Calculator.
 *
 * @param {string} expiryDateString - Expiry date in YYYY-MM-DD
 * @returns {object} { daysRemaining, status, label, isExpired }
 */
export function calculateTaxStatus(expiryDateString) {
  if (!expiryDateString) {
    return { daysRemaining: null, status: 'unknown', label: 'TIDAK DIATUR', isExpired: false };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDateString);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return {
      daysRemaining,
      status: 'expired',
      statusColor: 'rose',
      label: `TERLEWAT (${Math.abs(daysRemaining)} HARI)`,
      isExpired: true,
    };
  }

  if (daysRemaining <= 14) {
    return {
      daysRemaining,
      status: 'critical',
      statusColor: 'rose',
      label: `${daysRemaining} HARI LAGI`,
      isExpired: false,
    };
  }

  if (daysRemaining <= 45) {
    return {
      daysRemaining,
      status: 'warning',
      statusColor: 'amber',
      label: `${daysRemaining} HARI LAGI`,
      isExpired: false,
    };
  }

  return {
    daysRemaining,
    status: 'ok',
    statusColor: 'emerald',
    label: `${daysRemaining} HARI LAGI`,
    isExpired: false,
  };
}

/**
 * Format currency to Indonesian Rupiah representation.
 * @param {number} amount
 * @returns {string} e.g. "Rp 1.250.000"
 */
export function formatRupiah(amount) {
  const value = Math.round(Number(amount) || 0);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format distance in kilometers with thousands separator.
 * @param {number} distance
 * @returns {string} e.g. "28.450 km"
 */
export function formatKm(distance) {
  const value = Math.round(Number(distance) || 0);
  return `${new Intl.NumberFormat('id-ID').format(value)} km`;
}

/**
 * Format date string into human-friendly Indonesian date.
 * @param {string} dateString - YYYY-MM-DD
 * @returns {string} e.g. "15 Okt 2026"
 */
export function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}
