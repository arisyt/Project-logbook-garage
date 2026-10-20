# System Blueprint: Velo & Moto Garage Logbook

**Author:** Senior Full-Stack Web Developer & System Architect  
**Version:** 1.0.0 (Phase 1 Blueprint)  
**Target Environment:** Client-side SPA (React + Vite + Tailwind CSS + Lucide Icons)  
**Persistence Pattern:** Local-First (`localStorage`) with JSON Export/Import

---

## 1. System Overview & Architectural Principles

"Velo & Moto Garage Logbook" is a high-utility, local-first technical maintenance tracker and engineering utility web application designed for multi-vehicle owners. It supports three distinct vehicle classes:
1. **Mobil (Cars)**
2. **Motor (Motorcycles)**
3. **Sepeda (Bicycles: Road, Gravel, MTB, Commuter)**

### Core Architectural Principles
- **Zero External Backend / Local-First:** All state is persisted in client-side `localStorage`. Data never leaves the user's browser unless manually exported as a clean JSON backup file.
- **Predictive Component Telemetry:** Wearable parts are modeled with installation baselines (`installedAtKm`) and target lifespans (`lifespanKm`), dynamically evaluating wear against current vehicle odometer readings.
- **Tactical Garage Aesthetic:** High-contrast dark theme (Slate-950/900, Zinc-800 borders, Emerald/Amber/Rose status indicators, and monospace typography for technical figures) inspired by modern endurance racing telemetry and aircraft logbooks.
- **Contextual Modularity:** Technical calculators and data fields adapt dynamically to the selected vehicle type (e.g., fuel tracking for motorized engines vs. tire pressure & gear ratios for human-powered drivetrains).

---

## 2. Complete JSON Data Schema

All persistent state is unified under the root storage key `garage_logbook_v1`:

```json
{
  "version": "1.0.0",
  "exportedAt": "2026-10-19T12:00:00.000Z",
  "activeVehicleId": "veh_civic_001",
  "vehicles": [],
  "components": [],
  "serviceLogs": [],
  "fuelLogs": []
}
```

### A. Vehicle Entity (`Vehicle`)

```typescript
type VehicleCategory = 'CAR' | 'MOTORCYCLE' | 'BICYCLE';

interface BaseVehicle {
  id: string;               // UUID / prefixed identifier (e.g. "veh_car_001")
  name: string;             // Display name (e.g. "Civic RS Turbo", "Strattos S8")
  category: VehicleCategory;// 'CAR' | 'MOTORCYCLE' | 'BICYCLE'
  brand: string;            // Manufacturer (e.g. "Honda", "Yamaha", "Polygon")
  model: string;            // Model designation
  year: number;             // Model / build year (e.g. 2022)
  currentOdo: number;       // Current total distance in kilometers (km)
  initialOdo: number;       // Baseline odometer when added to garage (for cost/km delta)
  createdAt: string;        // ISO 8601 string
  updatedAt: string;        // ISO 8601 string
  notes?: string;           // Optional technical specs or notes
}

// Specialized fields for motorized vehicles (Cars & Motorcycles)
interface MotorizedVehicle extends BaseVehicle {
  category: 'CAR' | 'MOTORCYCLE';
  plateNumber: string;      // Plat Nomor (e.g. "B 1234 GTR")
  stnkExpiryDate: string;   // Annual Pajak Tahunan STNK (YYYY-MM-DD)
  plateExpiryDate: string;  // 5-Year Ganti Plat Nomor (YYYY-MM-DD)
  fuelType?: string;        // e.g. "RON 92 (Pertamax)", "RON 95", "Diesel"
  tankCapacityLiters?: number; // Fuel tank capacity in Liters
}

// Specialized fields for Bicycles
interface BicycleVehicle extends BaseVehicle {
  category: 'BICYCLE';
  frameset: string;         // e.g. "ACX Carbon Disc"
  groupset: string;         // e.g. "Shimano Ultegra R8020 2x11s"
  wheelset: string;         // e.g. "Entity Carbon 45mm Tubeless"
  tireWidthMm: number;      // e.g. 28 (nominal mm)
  riderWeightKg: number;    // Rider body weight in kg (for tire pressure calculations)
  bikeWeightKg: number;     // Bike tare weight in kg
  isTubeless: boolean;      // True if setup is tubeless (affects target PSI)
}

type Vehicle = MotorizedVehicle | BicycleVehicle;
```

### B. Wearable Component Entity (`ComponentHealth`)

```typescript
interface ComponentHealth {
  id: string;               // e.g. "comp_civic_oil_001"
  vehicleId: string;        // Foreign key -> Vehicle.id
  name: string;             // Component name (e.g. "Oli Mesin", "Rantai / Chain")
  category: string;         // e.g. "Lubrication", "Brakes", "Drivetrain", "Tires"
  installedAtKm: number;    // Vehicle odometer when this part was installed/serviced
  lifespanKm: number;       // Manufacturer or recommended service interval in km
  lastServicedDate: string; // YYYY-MM-DD of last replacement
  notes?: string;           // e.g. "Motul 300V 5W-40", "Shimano CN-M8100 116L"
}
```

### C. Service Logbook Entry (`ServiceLog`)

```typescript
type ServiceCategory = 
  | 'ROUTINE_SERVICE'   // Servis Rutin Berkala
  | 'PART_REPLACEMENT'  // Penggantian Sparepart
  | 'MODIFICATION'      // Upgrade / Modifikasi
  | 'TAX_DOCUMENT'      // Pajak STNK / Administrasi
  | 'INSPECTION';       // Pengecekan / Diagnostic

interface ServiceLog {
  id: string;               // e.g. "log_001"
  vehicleId: string;        // Foreign key -> Vehicle.id
  date: string;             // Date of service (YYYY-MM-DD)
  odometer: number;         // Odometer at service (km)
  category: ServiceCategory;
  title: string;            // Brief summary (e.g. "Ganti Oli + Filter Oli")
  costRp: number;           // Total expense in Indonesian Rupiah
  workshop: string;         // Workshop / Bengkel name or "DIY / Servis Sendiri"
  notes: string;            // Detailed invoice notes or technician comments
  replacedComponentIds?: string[]; // IDs of components reset by this service
}
```

### D. Fuel Log Entry (`FuelLog`)

```typescript
interface FuelLog {
  id: string;               // e.g. "fuel_001"
  vehicleId: string;        // Foreign key -> Vehicle.id (CAR or MOTORCYCLE)
  date: string;             // YYYY-MM-DD
  odometer: number;         // Odometer at fill-up (km)
  liters: number;           // Volume of fuel filled (L)
  totalCostRp: number;      // Total transaction cost (Rp)
  pricePerLiterRp: number;  // Cost per liter (Rp / L)
  isFullTank: boolean;      // True if filled to full (enables full-to-full calculation)
  notes?: string;           // Gas station / fuel brand (e.g. "Pertamina Shell V-Power")
}
```

---

## 3. Mathematical Formulations & Analytical Logic

### A. Component Wear & Remaining Lifespan Percentage
For any component with installation odometer $O_{\text{installed}}$, service target lifespan $L$, and vehicle current odometer $O_{\text{current}}$:

$$\text{Km Elapsed} = \max(0, O_{\text{current}} - O_{\text{installed}})$$

$$\text{Remaining Km} = L - \text{Km Elapsed}$$

$$\text{Remaining \%} = \max\left(0, \min\left(100, 100 - \left( \frac{\text{Km Elapsed}}{L} \times 100 \right) \right)\right)$$

#### Status Classification:
- **Aman (Healthy):** $\text{Remaining \%} > 25\%$ dan $\text{Remaining Km} > 0 \rightarrow$ Indikator: Emerald (`#10b981`), Label: `"AMAN"`
- **Waktunya Servis (Warning):** $\text{Remaining \%} \le 25\%$ dan $\text{Remaining Km} > 0 \rightarrow$ Indikator: Amber (`#f59e0b`), Label: `"WAKTUNYA SERVIS"`
- **Overdue / Telat Servis (Critical):** $\text{Remaining Km} \le 0 \rightarrow$ Indikator: Rose (`#f43f5e`), Label: `"OVERDUE"`

### B. Maintenance Cost per Kilometer & Smart Baseline Algorithm
Untuk menghindari lonjakan anomali (*division by 1 km*) saat kendaraan baru ditambahkan atau saat odometer kepemilikan belum bertambah, algoritma penentu basis jarak ($D_{\text{baseline}}$) menggunakan skala prioritas bertingkat:

1. **Jarak Kepemilikan Terdata ($D_{\text{ownership}}$):**
   $$D_{\text{ownership}} = \max(0, O_{\text{current}} - O_{\text{initial}})$$
   Digunakan jika $D_{\text{ownership}} \ge 50\text{ km}$. Label: *"Jarak kepemilikan: X km"*.
2. **Rentang Riwayat Servis ($D_{\text{log\_span}}$):**
   $$D_{\text{log\_span}} = \max(\{O_{\text{service}}\} \cup \{O_{\text{current}}\}) - \min(\{O_{\text{service}}\})$$
   Digunakan jika $D_{\text{ownership}} < 50\text{ km}$ namun $D_{\text{log\_span}} \ge 50\text{ km}$. Label: *"Rentang riwayat servis: X km"*.
3. **Total Odometer Kendaraan ($O_{\text{current}}$):**
   Digunakan jika $O_{\text{current}} \ge 50\text{ km}$ saat data riwayat kepemilikan masih baru / delta 0. Label: *"Total odometer: X km"*.
4. **Basis Transisi Awal Unit Baru ($< 50\text{ km}$):**
   $$D_{\text{baseline}} = \max(100, O_{\text{current}})$$
   Mencegah pembagian 0 atau pembagian 1 km saat unit baru mencatat biaya.

$$\text{Biaya / Km} = \text{round}\left(\frac{\text{Total Biaya Servis (Rp)}}{D_{\text{baseline}}}\right)$$

---

## 4. Default Preset Component Lifespans

| Category | Component Name | Key | Default Lifespan | Unit | Description |
|---|---|---|---|---|---|
| **Mobil** | Oli Mesin & Filter Oli | `car_oli_mesin` | 10,000 | km | Fully synthetic motor oil interval |
| **Mobil** | Oli Transmisi (ATF/CVT) | `car_oli_transmisi` | 40,000 | km | ATF / Manual / CVT transmission fluid |
| **Mobil** | Kampas Rem Depan & Belakang | `car_kampas_rem` | 30,000 | km | Brake pads thickness inspection / swap |
| **Mobil** | Filter Udara Mesin | `car_filter_udara` | 20,000 | km | Intake engine air filter replacement |
| **Mobil** | Rotasi Ban | `car_rotasi_ban` | 10,000 | km | Cross-rotation for even tread wear |
| **Motor** | Oli Mesin | `oli_mesin` | 3,000 | km | Oli mesin 4-tak / matic |
| **Motor** | Oli Gardan / Gear Oil | `oli_gardan` | 9,000 | km | Khusus Matic - pelumas gardan rasio |
| **Motor** | Filter Oli Mesin | `filter_oli` | 9,000 | km | Saringan oli karter / filter elemen |
| **Motor** | Servis Throttle Body & Injektor | `servis_tb` | 8,000 | km | Pembersihan TB, injector cleaner, reset TPS |
| **Motor** | Busi (Spark Plug) | `busi` | 9,000 | km | Busi pengapian standar / iridium |
| **Motor** | Filter Udara (Air Filter) | `filter_udara` | 12,000 | km | Filter udara viscous intake |
| **Motor** | Kampas Rem Depan | `kampas_rem_depan` | 12,000 | km | Kampas rem cakram depan |
| **Motor** | Kampas Rem Belakang | `kampas_rem_belakang` | 12,000 | km | Kampas rem cakram / tromol belakang |
| **Motor** | Servis CVT (Clean & Grease) | `servis_cvt` | 8,000 | km | Khusus Matic - pembersihan mangkok & gemuk CVT |
| **Motor** | Roller CVT | `roller_cvt` | 16,000 | km | Khusus Matic - roller pemberat pulley primer |
| **Motor** | V-Belt Drive | `v_belt` | 20,000 | km | Khusus Matic - sabuk penggerak CVT |
| **Motor** | Rantai & Gir Set | `rantai_gir_set` | 20,000 | km | Khusus Manual / Bebek / Sport |
| **Motor** | Air Radiator / Coolant | `air_radiator` | 14,000 | km | Khusus motor Liquid Cooled |
| **Motor** | Minyak Rem (Brake Fluid) | `minyak_rem` | 20,000 | km | Kuras minyak rem DOT 3 / DOT 4 |
| **Sepeda** | Chain Lube / Wax | `bike_chain_lube` | 250 | km | Degrease & re-lube/hot wax interval |
| **Sepeda** | Rantai (Chain Wear 0.5%) | `bike_chain` | 3,000 | km | Wear indicator check to protect cassette |
| **Sepeda** | Ban Luar (Tires) | `bike_tires` | 4,000 | km | Front/Rear tire casing & tread wear |
| **Sepeda** | Bar Tape / Grip | `bike_bartape` | 5,000 | km | Handlebar tape hygiene and comfort |
| **Sepeda** | Brake Pads (Disc / Rim) | `bike_brakes` | 3,000 | km | Brake compound thickness & bleed check |

### Motor Service Packages (Smart Bundles)
1. **Paket Ganti Oli Rutin:** `[oli_mesin, oli_gardan]`
2. **Paket Tune Up & Injeksi:** `[oli_mesin, busi, filter_udara, servis_tb]`
3. **Paket Servis CVT Lengkap:** `[servis_cvt, roller_cvt, v_belt, oli_gardan]`
4. **Paket Drivetrain Manual:** `[rantai_gir_set]`
5. **Paket Servis Pengereman:** `[kampas_rem_depan, kampas_rem_belakang, minyak_rem]`
6. **Kustom / Pilih Manual:** Bebas centang komponen mana saja.

---

## 5. Storage & State Management Interface (`useGarageStore`)

The custom hook `useGarageStore` encapsulates:
1. `vehicles`: list of active vehicles.
2. `activeVehicle`: currently selected vehicle object.
3. `components`: component list filtered for `activeVehicleId`.
4. `serviceLogs`: logs filtered for `activeVehicleId`.
5. `fuelLogs`: fuel records for `activeVehicleId`.
6. Actions:
   - `setActiveVehicleId(id)`
   - `addVehicle(vehicleData)`
   - `updateVehicle(id, partialData)`
   - `deleteVehicle(id)`
   - `updateOdometer(vehicleId, newOdoKm)`
   - `resetComponentService(componentId, serviceLogDetails)`
   - `addComponent(componentData)`
   - `deleteComponent(componentId)`
   - `addServiceLog(logData)`
   - `deleteServiceLog(logId)`
   - `addFuelLog(fuelData)`
   - `deleteFuelLog(fuelId)`
   - `exportGarageBackupJSON()`
   - `importGarageBackupJSON(jsonString)`
   - `resetToSampleData()`
