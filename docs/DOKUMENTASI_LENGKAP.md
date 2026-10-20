# 📖 Dokumentasi Lengkap Sistem: Velo & Moto Garage Logbook

Aplikasi manajemen perawatan multi-kendaraan (**Mobil, Motor, dan Sepeda**) berbasis *Local-First Web Application* dengan antarmuka bertema **Tactical Garage Dark Theme**.

---

## 📑 Daftar Isi
1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Arsitektur & Tech Stack](#2-arsitektur--tech-stack)
3. [Struktur Folder & File Proyek](#3-struktur-folder--file-proyek)
4. [Skema Data & Entitas Utama](#4-skema-data--entitas-utama)
5. [Fitur Utama & Modul Fungsional](#5-fitur-utama--modul-fungsional)
   - [A. Manajemen Armada (Multi-Vehicle Fleet)](#a-manajemen-armada-multi-vehicle-fleet)
   - [B. Telemetri & Pemantauan Kesehatan Part (Component Health)](#b-telemetri--pemantauan-kesehatan-part-component-health)
   - [C. Logbook Servis & Analisis Biaya (Rp / km)](#c-logbook-servis--analisis-biaya-rp--km)
   - [D. Kalkulator Teknis & Utilitas Kontekstual](#d-kalkulator-teknis--utilitas-kontekstual)
   - [E. Cadangan Data & Pemulihan (Local-First Backup & Restore)](#e-cadangan-data--pemulihan-local-first-backup--restore)
6. [Formulasi Matematika & Algoritma](#6-formulasi-matematika--algoritma)
7. [Preset Suku Cadang Standar Pabrikan](#7-preset-suku-cadang-standar-pabrikan)
8. [Panduan Menjalankan & Membangun Aplikasi](#8-panduan-menjalankan--membangun-aplikasi)

---

## 1. Ringkasan Eksekutif

**Velo & Moto Garage Logbook** dirancang untuk pemilik multi-kendaraan yang membutuhkan pencatatan riwayat servis terstruktur, peringatan masa pakai suku cadang (*wearable parts*), serta kalkulator teknis otomotif dan sepeda balap dalam satu tempat tanpa ketergantungan pada server pihak ketiga (*zero external backend*).

### Nilai Utama:
- **Local-First & Privasi 100%:** Seluruh data disimpan langsung di browser pengguna melalui `localStorage`. Tidak ada data pribadi atau pelat nomor yang dikirim ke server luar.
- **Prediksi Keausan Berbasis Odometer:** Setiap suku cadang memiliki *baseline* pemasangan dan interval servis target dalam kilometer.
- **Analisis Biaya Riil (Rp / km):** Menghitung efisiensi biaya kepemilikan kendaraan secara transparan.
- **Antarmuka Taktikal:** Desain gelap kontras tinggi (Slate-950, Zinc-800, aksen Emerald/Amber/Rose) dengan tipografi monospace untuk angka telemetri.

---

## 2. Arsitektur & Tech Stack

| Layer | Teknologi | Deskripsi |
|---|---|---|
| **Runtime & Core** | React 18 | Single Page Application (SPA) berbasis functional components & hooks |
| **Build Tool** | Vite 6 | Tooling modern super cepat dengan Hot Module Replacement (HMR) |
| **Styling** | Tailwind CSS 3 | Utility-first CSS dengan palet kustom Tactical Garage Dark |
| **Icons** | Lucide React | Koleksi ikon SVG modern dan konsisten |
| **Tipografi** | Inter & JetBrains Mono | Inter untuk teks antarmuka, JetBrains Mono untuk angka telemetri |
| **State & Storage** | Custom React Hook (`useGarageStore`) | State terpusat disinkronkan secara otomatis ke `localStorage` |
| **Ekspor/Impor** | File JSON Standar | Backup mandiri tanpa database eksternal |

---

## 3. Struktur Folder & File Proyek

```plaintext
d:\garage-logbook\
├── docs\
│   ├── ARCHITECTURE.md          # Dokumen arsitektur teknis asli
│   └── DOKUMENTASI_LENGKAP.md   # Buku panduan lengkap sistem (dokumen ini)
├── src\
│   ├── components\
│   │   ├── components-health\
│   │   │   ├── AddComponentModal.jsx    # Modal tambah suku cadang kustom
│   │   │   ├── ComponentCard.jsx        # Kartu visual wear-bar komponen
│   │   │   ├── ComponentHealthView.jsx  # Tampilan utama kesehatan part (Grid & Table)
│   │   │   └── ServiceResetModal.jsx    # Modal reset part & catat biaya
│   │   ├── dashboard\
│   │   │   └── Dashboard.jsx            # Beranda ringkasan telemetri, alert, & biaya
│   │   ├── layout\
│   │   │   ├── AddVehicleModal.jsx      # Modal pendaftaran unit kendaraan baru
│   │   │   ├── Header.jsx               # Header atas + selector kendaraan aktif
│   │   │   ├── ImportModal.jsx          # Modal upload / paste backup JSON
│   │   │   ├── QuickOdoModal.jsx        # Pop-up kilat update odometer
│   │   │   ├── Sidebar.jsx              # Navigasi samping dengan counter peringatan
│   │   │   └── VehicleSelector.jsx      # Komponen drop-down ganti unit
│   │   ├── logbook\
│   │   │   ├── AddServiceLogModal.jsx   # Modal catat servis baru + multi-reset part
│   │   │   ├── CostAnalyticsCards.jsx   # Kartu metrik total biaya & Rp/km
│   │   │   └── ServiceLogbookView.jsx   # Riwayat logbook, filter, pencarian, & sortir
│   │   └── tools\
│   │       ├── BikeCalculators.jsx      # Kalkulator tekanan ban (Berto) & gear ratio
│   │       ├── FuelCalculator.jsx       # Kalkulator BBM full-to-full & trip cost
│   │       ├── TaxReminderCard.jsx      # Pengingat pajak STNK 1 tahun & plat 5 tahun
│   │       └── ToolsView.jsx            # Kontainer tab utilitas adaptif
│   ├── data\
│   │   └── presets.js                   # Starter fleet data, preset part, paket servis
│   ├── hooks\
│   │   └── useGarageStore.js            # Custom hook state, CRUD, & sinkronisasi storage
│   ├── utils\
│   │   └── calculators.js               # Fungsi matematika murni (health, tax, fuel, tire)
│   ├── App.jsx                          # Root shell & pengatur rute tab
│   ├── index.css                        # Setup font & dasar tailwind
│   └── main.jsx                         # Entry point React
├── index.html                           # HTML template
├── package.json                         # Dependensi dan script NPM
├── tailwind.config.js                   # Konfigurasi tema dan warna
└── vite.config.js                       # Konfigurasi build Vite
```

---

## 4. Skema Data & Entitas Utama

Penyimpanan lokal menggunakan kunci tunggal `garage_logbook_v1` di dalam `localStorage`.

### Skema Root JSON:
```json
{
  "version": "1.2.0",
  "exportedAt": "2026-10-20T00:00:00.000Z",
  "activeVehicleId": "veh_car_01",
  "vehicles": [],
  "components": [],
  "serviceLogs": [],
  "fuelLogs": []
}
```

### Rincian Entitas:
1. **Vehicle (Kendaraan):**
   - Atribut umum: `id`, `name`, `category` (`CAR` | `MOTORCYCLE` | `BICYCLE`), `brand`, `model`, `year`, `currentOdo`, `initialOdo`, `createdAt`, `updatedAt`, `notes`.
   - Khusus Mobil/Motor: `plateNumber`, `stnkExpiryDate`, `plateExpiryDate`, `fuelType`, `tankCapacityLiters`.
   - Khusus Sepeda: `frameset`, `groupset`, `wheelset`, `tireWidthMm`, `riderWeightKg`, `bikeWeightKg`, `isTubeless`.

2. **ComponentHealth (Suku Cadang / Wearable Part):**
   - `id`, `vehicleId`, `name`, `category`, `installedAtKm`, `lifespanKm`, `lastServicedDate`, `notes`, `key`.

3. **ServiceLog (Catatan Servis):**
   - `id`, `vehicleId`, `date`, `odometer`, `category` (`ROUTINE_SERVICE`, `PART_REPLACEMENT`, `MODIFICATION`, `TAX_DOCUMENT`, `INSPECTION`), `title`, `costRp`, `workshop`, `notes`, `replacedComponentIds`.

4. **FuelLog (Log Pengisian BBM):**
   - `id`, `vehicleId`, `date`, `odometer`, `liters`, `totalCostRp`, `pricePerLiterRp`, `isFullTank`, `notes`.

---

## 5. Fitur Utama & Modul Fungsional

### A. Manajemen Armada (Multi-Vehicle Fleet)
- Pengguna dapat mendaftarkan kendaraan tanpa batas.
- Default starter fleet bawaan:
  1. **Honda Civic RS Turbo (Mobil)** - Odo: 28.450 km.
  2. **Yamaha NMAX 155 Connected (Motor)** - Odo: 14.800 km.
  3. **Polygon Strattos S8 Disc (Sepeda)** - Odo: 2.150 km.
- Switch unit secara instan melalui Header atas dengan visual badge kategori.
- Update odometer cepat (*Quick Odo*) langsung dari Header atau Dashboard.

### B. Telemetri & Pemantauan Kesehatan Part (Component Health)
- Menghitung sisa masa pakai suku cadang secara matematis berdasarkan selisih odometer saat ini dengan odometer pemasangan.
- Indikator Status Warna:
  - 🟢 **AMAN (Emerald):** Sisa umur $> 25\%$ dan sisa jarak $> 0\text{ km}$.
  - 🟡 **WAKTUNYA SERVIS (Amber):** Sisa umur $\le 25\%$ dan sisa jarak $> 0\text{ km}$.
  - 🔴 **OVERDUE (Rose):** Sisa jarak $\le 0\text{ km}$ (melewati batas rekomendasi).
- Tombol **"Servis Sekarang & Reset"**: Memperbarui odometer pemasangan menjadi odometer saat ini dan mencatat log servis otomatis ke Logbook.
- **Paket Servis Motor (Smart Bundles):** Reset kolektif untuk servis umum (contoh: Paket Servis CVT, Paket Ganti Oli, Paket Tune Up & Injeksi).

### C. Logbook Servis & Analisis Biaya (Rp / km)
- Riwayat lengkap perawatan kendaraan dengan tanggal, odometer, jenis servis, biaya (Rp), dan nama bengkel.
- Filter berdasarkan kategori servis (Servis Rutin, Penggantian Part, Modifikasi, Pajak STNK, Inspeksi).
- Pencarian cerdas dan pengurutan (Tanggal terbaru, Odometer tertinggi, Biaya terbesar).
- **Analisis Biaya Kepemilikan:**
  - Total pengeluaran servis akumulatif.
  - Rata-rata biaya per kunjungan bengkel.
  - **Biaya per Kilometer ($\text{Rp} / \text{km}$):** Menghitung efisiensi riil dari jarak tempuh yang telah dijalani sejak terdaftar di garasi.

### D. Kalkulator Teknis & Utilitas Kontekstual
Aplikasi secara cerdas menampilkan kalkulator yang relevan sesuai jenis kendaraan yang dipilih:
- **Untuk Mobil & Motor:**
  1. *Kalkulator BBM Full-to-Full:* Menghitung konsumsi BBM rata-rata ($\text{km/L}$) antar pengisian tangki penuh.
  2. *Estimator Perjalanan (Trip Cost):* Estimasi kebutuhan liter dan biaya bensin berdasarkan jarak tujuan.
  3. *Pengingat Pajak STNK & Plat:* Menghitung hari tersisa untuk jatuh tempo Pajak Tahunan STNK dan Ganti Plat 5 Tahunan dengan penanda warna (Hijau, Kuning $\le 45$ hari, Merah $\le 14$ hari).
- **Untuk Sepeda (Road / Gravel / MTB):**
  1. *Frank Berto Tire Pressure Calculator:* Menghitung tekanan ban ideal Depan dan Belakang (dalam PSI dan Bar) berdasarkan bobot total (rider + sepeda), lebar tapak ban ($25\text{c}$ s.d. $45\text{c}$), tipe permukaan jalan (Aspal Kering, Aspal Basah, Gravel), dan setup tubeless (reduksi 9% PSI).
  2. *Gear Ratio & Cadence Speed Calculator:* Menghitung rasio gir ($T_{\text{depan}} / T_{\text{belakang}}$), jarak tempuh per kayuhan (*development meters*), kecepatan estimasi pada target *cadence* (RPM), dan matriks kecepatan lengkap sprocket 11-speed.

### E. Cadangan Data & Pemulihan (Local-First Backup & Restore)
- **Ekspor Cadangan:** Menghasilkan file JSON bersih dengan timestamp nama file (`velo-moto-garage-backup-[date].json`).
- **Impor Cadangan:** Mendukung unggah file `.json` atau salin-tempel teks JSON secara langsung dengan validasi data.
- **Reset Sample Data:** Mengembalikan data awal percontohan jika ingin mereset garasi.

---

## 6. Formulasi Matematika & Algoritma

### 1. Sisa Masa Pakai Suku Cadang
$$\text{Km Elapsed} = \max(0, O_{\text{current}} - O_{\text{installed}})$$
$$\text{Remaining Km} = L - \text{Km Elapsed}$$
$$\text{Remaining \%} = \max\left(0, \min\left(100, \left( \frac{\text{Remaining Km}}{L} \right) \times 100 \right)\right)$$

### 2. Biaya Servis per Kilometer
$$\text{Cost per Km} = \frac{\text{Total Biaya Servis (Rp)}}{\max(1, O_{\text{current}} - O_{\text{initial}})}$$

### 3. Konsumsi BBM (Full-to-Full)
$$\text{Efisiensi (km/L)} = \frac{O_{\text{terakhir}} - O_{\text{sebelumnya}}}{\text{Liter Diisi}}$$

### 4. Tekanan Ban Sepeda (Frank Berto Approximation)
$$\text{Rear PSI (Base)} = \left(\frac{\text{Weight}_{\text{total}}}{\text{Width}_{\text{tire}} \times 0.038}\right) \times 0.58 \times 0.95$$
$$\text{Front PSI} = \text{Rear PSI} \times \left(\frac{0.42}{0.58}\right)$$
*(Disesuaikan dengan pengali permukaan jalan dan faktor setup tubeless $0.91$)*.

### 5. Gear Ratio & Kecepatan Sepeda
$$\text{Gear Ratio} = \frac{\text{Teeth}_{\text{front}}}{\text{Teeth}_{\text{rear}}}$$
$$\text{Development (m)} = \text{Gear Ratio} \times \left(\frac{\text{Circumference}_{\text{wheel}}}{1000}\right)$$
$$\text{Speed (km/h)} = \frac{\text{Development} \times \text{Cadence (RPM)} \times 60}{1000}$$

---

## 7. Preset Suku Cadang Standar Pabrikan

### Mobil (CAR)
- **Oli Mesin & Filter Oli:** 10.000 km
- **Oli Transmisi (ATF/CVT):** 40.000 km
- **Kampas Rem (Brake Pads):** 30.000 km
- **Filter Udara Mesin:** 20.000 km
- **Rotasi Ban & Spooring:** 10.000 km

### Motor (MOTORCYCLE - 14 Suku Cadang Spesifik + Ban)
- **Oli Mesin:** 3.000 km
- **Oli Gardan (Matic):** 9.000 km
- **Filter Oli Mesin:** 9.000 km
- **Servis Throttle Body & Injektor:** 8.000 km
- **Busi (Spark Plug):** 9.000 km
- **Filter Udara (Air Filter):** 12.000 km
- **Kampas Rem Depan:** 12.000 km
- **Kampas Rem Belakang:** 12.000 km
- **Servis CVT (Clean & Grease):** 8.000 km
- **Roller CVT:** 16.000 km
- **V-Belt Drive:** 20.000 km
- **Rantai & Gir Set (Manual):** 20.000 km
- **Air Radiator / Coolant:** 14.000 km
- **Minyak Rem (Brake Fluid):** 20.000 km
- **Ban Depan Tubeless:** 15.000 km
- **Ban Belakang Tubeless:** 12.000 km

### Sepeda (BICYCLE)
- **Chain Lube / Waxing:** 250 km
- **Rantai Sepeda (Chain Wear 0.5%):** 3.000 km
- **Ban Luar (Tires):** 4.000 km
- **Bar Tape / Handlebar Grip:** 5.000 km
- **Brake Pads (Disc / Rim):** 3.000 km

---

## 8. Panduan Menjalankan & Membangun Aplikasi

### Persyaratan Lingkungan:
- **Node.js:** Versi 18 ke atas
- **NPM:** Versi 9 ke atas

### 1. Pemasangan Dependensi
```bash
npm install
```

### 2. Menjalankan Mode Development
```bash
npm run dev
```
Akses di browser pada: `http://localhost:5173`

### 3. Build untuk Produksi
```bash
npm run build
```
Hasil build bundel statis akan berada pada direktori `dist/` dan siap di-deploy ke static hosting mana pun (Vercel, Netlify, GitHub Pages, Cloudflare Pages, atau server lokal Nginx/Apache).
