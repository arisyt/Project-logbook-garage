# Velo & Moto Garage Logbook

A high-utility, structured, multi-vehicle maintenance tracker and technical utility web application supporting **Cars (Mobil), Motorcycles (Motor), and Bicycles (Sepeda)**.

Built with a **Local-First architecture** using `localStorage` and a **Tactical Garage Dark Theme** (Slate-950/900, Zinc-800 borders, Emerald/Amber/Rose telemetry indicators, and monospace typography).

📖 **[Baca Dokumentasi Lengkap Sistem (Indonesian)](./DOCUMENTATION.md)** | **[Technical Architecture Blueprint](./docs/ARCHITECTURE.md)**

---

## 🛠️ Tech Stack & Key Libraries
- **Framework:** React 18 + Vite 6
- **Styling:** Tailwind CSS + Custom Tactical Garage Palette
- **Icons:** Lucide React
- **Typography:** Inter (UI) + JetBrains Mono (Telemetry & Numbers)
- **State & Storage:** Custom `useGarageStore` hook with `localStorage` persistence and JSON Export/Import.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## 📋 Features Overview

### 1. Multi-Vehicle Fleet Management
- **Cars (Mobil) & Motorcycles (Motor):** Brand/Model, Year, License Plate (Plat Nomor), Current Odometer (`km`), 1-Year Annual STNK Tax Expiry Date, and 5-Year Plate Expiry Date.
- **Bicycles (Sepeda):** Brand, Frameset, Groupset, Wheelset, Tire Width (`mm`), Rider Weight (`kg`), Bike Weight (`kg`), and Tubeless setup.
- Instant vehicle switching via the top header selector with category badges (`MOBIL`, `MOTOR`, `SEPEDA`).

### 2. Smart Component Lifespan Tracker (Predictive Health Bars)
- Track wearable parts with an installation baseline (`installedAtKm`) and target service interval (`lifespanKm`).
- Mathematical Health percentage:
  $$\text{Remaining \%} = \max\left(0, \min\left(100, 100 - \frac{\text{currentOdo} - \text{installedAtKm}}{\text{lifespanKm}} \times 100\right)\right)$$
- Color-coded status:
  - **Healthy:** $>30\%$ (Emerald Green)
  - **Warning:** $10\% - 30\%$ (Amber Yellow)
  - **Critical / Overdue:** $<10\%$ (Rose Red)
- **Default Category Presets:**
  - *Mobil:* Oli Mesin (10.000 km), Oli Transmisi (40.000 km), Kampas Rem (30.000 km), Filter Udara (20.000 km), Rotasi Ban (10.000 km).
  - *Motor:* Oli Mesin (2.500 km), Oli Gardan (5.000 km), V-Belt/Rantai (15.000 km), Kampas Rem (10.000 km), Busi (8.000 km).
  - *Sepeda:* Chain Lube/Wax (250 km), Rantai/Chain (3.000 km), Ban Luar (4.000 km), Bar Tape (5.000 km), Brake Pad (3.000 km).
- **"Servis Sekarang" (One-Click Reset):** Automatically resets component installation odometer to current vehicle odometer and logs a corresponding service record.

### 3. Service Logbook & Cost Analytics
- Service records with Date, Odometer, Category (`ROUTINE_SERVICE`, `PART_REPLACEMENT`, `MODIFICATION`, `TAX_DOCUMENT`, `INSPECTION`), Cost in Indonesian Rupiah (`Rp`), Workshop name, and Notes.
- **Smart Metric:** Evaluates **Cost per Kilometer ($\text{Rp} / \text{km}$)** and total maintenance spend.
- Filter, search, and sort by date, odometer, or cost.

### 4. Contextual Technical Calculators
- **Mobil & Motor:**
  - Full-to-Full `km/L` fuel efficiency calculator and persistent fuel logbook.
  - Long-distance trip fuel volume and cost estimator (`Rp`).
  - Indonesian STNK (1-Year) & Plat Nomor (5-Year) countdown alerts with quick renewal action.
- **Sepeda:**
  - **Frank Berto Smart Tire Pressure Calculator:** Computes optimal Front and Rear `PSI` & `Bar` based on Rider + Bike weight, Tire Width (`25c` to `45c`), Road Surface (Dry Tarmac, Wet/Rough, Gravel), and Tubeless casing setup.
  - **Gear Ratio & Cadence Speed Calculator:** Computes Gear Ratio, Development distance per stroke (meters), and estimated Speed (`km/h`) at target Cadence (RPM), with a full 11-speed cassette speed matrix.

### 5. Local-First Backup & Restore
- **Export Backup:** Downloads a clean timestamped JSON file (`velo-moto-garage-backup-[date].json`).
- **Import / Restore:** Upload or paste any JSON backup to restore your garage instantly.
- **Reset to Starter Data:** Easily reset to the default fleet (Honda Civic RS, Yamaha NMAX 155, Polygon Strattos S8 Disc).
