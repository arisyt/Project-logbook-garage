import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateComponentHealth,
  validateOdometerInput,
  calculateCostPerKm,
  calculateTotalMaintenanceCost,
  calculateBikeTirePressure,
  calculateFuelEfficiency,
  calculateTripCost,
  calculateGearRatioAndSpeed,
  calculateTaxStatus,
  formatRupiah,
  formatKm,
  formatDate,
  parseCurrencyInput,
} from '../src/utils/calculators.js';
import { COMPONENT_PRESETS, STARTER_GARAGE_DATA } from '../src/data/presets.js';

test('1. Dual-Threshold Wear Logic - KM limit triggers critical status', () => {
  // Motor engine oil: 3,000 km / 6 months
  // Installed at 10,000 km, today is 2 days later, but currentOdo is 13,000 km (100% km used)
  const comp = {
    id: 'test-oli',
    name: 'Oli Mesin',
    installedAtKm: 10000,
    lifespanKm: 3000,
    lifespanMonths: 6,
    lastServicedDate: new Date().toISOString().split('T')[0] // today
  };

  const health = calculateComponentHealth(13000, comp);
  assert.equal(health.percentage, 0, 'Should have 0% remaining health');
  assert.equal(health.status, 'critical', 'Should be critical status');
  assert.equal(health.limitingFactor, 'km', 'Limiting factor should be km');
  assert.equal(health.isKmOverdue, true, 'KM should be overdue');
});

test('2. Dual-Threshold Wear Logic - Time limit triggers critical status even with low KM', () => {
  // Motor engine oil: 3,000 km / 6 months
  // Installed 7 months ago, but only drove 200 km
  const sevenMonthsAgo = new Date();
  sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 7);

  const comp = {
    id: 'test-oli-time',
    name: 'Oli Mesin',
    installedAtKm: 10000,
    lifespanKm: 3000,
    lifespanMonths: 6,
    lastServicedDate: sevenMonthsAgo.toISOString().split('T')[0]
  };

  const health = calculateComponentHealth(10200, comp);
  assert.equal(health.status, 'critical', 'Should be critical because 7 months > 6 months');
  assert.equal(health.limitingFactor, 'time', 'Limiting factor should be time');
  assert.equal(health.isTimeOverdue, true, 'Time should be overdue');
});

test('3. Dual-Threshold Wear Logic - Healthy part within both thresholds', () => {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const comp = {
    id: 'test-healthy',
    name: 'Oli Mesin',
    installedAtKm: 10000,
    lifespanKm: 3000,
    lifespanMonths: 6,
    lastServicedDate: oneMonthAgo.toISOString().split('T')[0]
  };

  const health = calculateComponentHealth(10500, comp); // 500 km elapsed out of 3000 (83% km left), 1 mo elapsed out of 6 (83% time left)
  assert.equal(health.status, 'healthy');
  assert.ok(health.percentage >= 80, 'Health percentage should be around 83%');
});

test('4. Odometer Input Guard - Backward odometer detection', () => {
  const validation = validateOdometerInput(25400, 24000);
  assert.equal(validation.isBackward, true, 'Should detect backward odometer');
  assert.equal(validation.warningLevel, 'danger');
  assert.ok(validation.message.includes('lebih rendah'));
});

test('5. Odometer Input Guard - Excessive jump detection (>15,000 km)', () => {
  const validation = validateOdometerInput(25400, 42000); // jump 16,600 km
  assert.equal(validation.isExcessiveJump, true, 'Should detect excessive leap');
  assert.equal(validation.warningLevel, 'warning');
  assert.ok(validation.message.includes('Lonjakan'));
});

test('6. Odometer Input Guard - Normal increment is valid without warning', () => {
  const validation = validateOdometerInput(25400, 25800);
  assert.equal(validation.isBackward, false);
  assert.equal(validation.isExcessiveJump, false);
  assert.equal(validation.warningLevel, 'none');
});

test('7. Cost per KM Calculation Accuracy', () => {
  const logs = [
    { vehicleId: 'v-1', costRp: 500000, odometer: 21000 },
    { vehicleId: 'v-1', costRp: 250000, odometer: 25000 },
  ];
  const totalSpendRp = calculateTotalMaintenanceCost(logs);
  const costPerKm = calculateCostPerKm(totalSpendRp, 25000, 20000, logs);
  assert.equal(totalSpendRp, 750000);
  assert.equal(costPerKm, 150); // 750,000 / 5,000 = 150 Rp/km
});

test('8. Bicycle Tire Pressure & Fuel Calculator Tools', () => {
  const tireResult = calculateBikeTirePressure({
    riderWeightKg: 65,
    bikeWeightKg: 8.5,
    tireWidthMm: 28,
    surface: 'dry_tarmac',
    isTubeless: false
  });
  assert.ok(tireResult.frontPsi > 20 && tireResult.frontPsi < 95);
  assert.ok(tireResult.rearPsi > tireResult.frontPsi, 'Rear tire should carry more weight');

  const fuelEconomy = calculateFuelEfficiency(10350, 10000, 8.5);
  assert.ok(fuelEconomy > 40);

  const trip = calculateTripCost(100, fuelEconomy, 13500);
  assert.ok(trip.totalTripCostRp > 0);
});

test('9. Preset Data Integrity - All presets have valid lifespanMonths and lifespanKm', () => {
  for (const [category, presets] of Object.entries(COMPONENT_PRESETS)) {
    for (const preset of presets) {
      assert.ok(preset.lifespanKm > 0, `${preset.name} in ${category} must have positive lifespanKm`);
      assert.ok(preset.lifespanMonths > 0, `${preset.name} in ${category} must have positive lifespanMonths`);
    }
  }
});

test('10. Currency Input Parsing - Indonesian Rupiah formats and sanitization', () => {
  assert.equal(parseCurrencyInput('1250000'), 1250000);
  assert.equal(parseCurrencyInput('1.250.000'), 1250000);
  assert.equal(parseCurrencyInput('Rp 1.250.000'), 1250000);
  assert.equal(parseCurrencyInput('Rp. 350.000,00'), 350000); // properly strips Indonesian cents ,00
  assert.equal(parseCurrencyInput('Rp 500.000,-'), 500000);   // properly strips Indonesian cents dash ,-
  assert.equal(parseCurrencyInput(' 45000 '), 45000);
  assert.equal(parseCurrencyInput(75000), 75000);
  assert.equal(parseCurrencyInput(''), 0);
  assert.equal(parseCurrencyInput(null), 0);
  assert.equal(parseCurrencyInput(undefined), 0);
});

