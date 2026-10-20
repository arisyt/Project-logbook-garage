-- ============================================================
-- EXTENSIONS & ENUM TYPES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE vehicle_category_enum AS ENUM ('CAR', 'MOTORCYCLE', 'BICYCLE');
CREATE TYPE service_category_enum AS ENUM (
  'ROUTINE_SERVICE',
  'PART_REPLACEMENT',
  'MODIFICATION',
  'TAX_DOCUMENT',
  'INSPECTION'
);

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name VARCHAR(100),
  avatar_url TEXT,
  currency VARCHAR(10) DEFAULT 'IDR' NOT NULL,
  distance_unit VARCHAR(10) DEFAULT 'km' NOT NULL,
  active_vehicle_id TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ============================================================
-- VEHICLES
-- ============================================================
CREATE TABLE public.vehicles (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  category vehicle_category_enum NOT NULL,
  brand VARCHAR(100) NOT NULL DEFAULT '',
  model VARCHAR(100) NOT NULL DEFAULT '',
  year INT NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  current_odo INT NOT NULL DEFAULT 0 CHECK (current_odo >= 0),
  initial_odo INT NOT NULL DEFAULT 0 CHECK (initial_odo >= 0),
  notes TEXT DEFAULT '',
  -- Mobil & Motor
  plate_number VARCHAR(30),
  stnk_expiry_date DATE,
  plate_expiry_date DATE,
  fuel_type VARCHAR(50),
  tank_capacity_liters NUMERIC(6,2),
  is_matic BOOLEAN DEFAULT FALSE,
  is_liquid_cooled BOOLEAN DEFAULT FALSE,
  -- Sepeda
  frameset VARCHAR(100),
  groupset VARCHAR(100),
  wheelset VARCHAR(100),
  tire_width_mm INT DEFAULT 28,
  rider_weight_kg NUMERIC(5,2) DEFAULT 70,
  bike_weight_kg NUMERIC(5,2) DEFAULT 9,
  is_tubeless BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.profiles
  ADD CONSTRAINT fk_profiles_active_vehicle
  FOREIGN KEY (active_vehicle_id)
  REFERENCES public.vehicles(id)
  ON DELETE SET NULL;

-- ============================================================
-- COMPONENTS
-- ============================================================
CREATE TABLE public.components (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  vehicle_id TEXT NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key VARCHAR(60),
  name VARCHAR(120) NOT NULL,
  category VARCHAR(60) NOT NULL DEFAULT 'General',
  installed_at_km INT NOT NULL DEFAULT 0 CHECK (installed_at_km >= 0),
  last_serviced_km INT NOT NULL DEFAULT 0 CHECK (last_serviced_km >= 0),
  lifespan_km INT NOT NULL CHECK (lifespan_km > 0),
  lifespan_months INT CHECK (lifespan_months > 0),
  last_serviced_date DATE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ============================================================
-- SERVICE LOGS
-- ============================================================
CREATE TABLE public.service_logs (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  vehicle_id TEXT NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  odometer INT NOT NULL CHECK (odometer >= 0),
  category service_category_enum NOT NULL,
  title VARCHAR(200) NOT NULL,
  cost_rp BIGINT NOT NULL DEFAULT 0 CHECK (cost_rp >= 0),
  workshop VARCHAR(150) DEFAULT '',
  notes TEXT DEFAULT '',
  receipt_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ============================================================
-- SERVICE LOG COMPONENTS (junction)
-- ============================================================
CREATE TABLE public.service_log_components (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  service_log_id TEXT NOT NULL REFERENCES public.service_logs(id) ON DELETE CASCADE,
  component_id TEXT REFERENCES public.components(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  component_name VARCHAR(120) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ============================================================
-- FUEL LOGS
-- ============================================================
CREATE TABLE public.fuel_logs (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  vehicle_id TEXT NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  odometer INT NOT NULL CHECK (odometer >= 0),
  liters NUMERIC(6,2) NOT NULL CHECK (liters > 0),
  total_cost_rp BIGINT NOT NULL DEFAULT 0 CHECK (total_cost_rp >= 0),
  price_per_liter_rp NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_full_tank BOOLEAN DEFAULT TRUE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_vehicles_user ON public.vehicles(user_id);
CREATE INDEX idx_components_vehicle ON public.components(vehicle_id);
CREATE INDEX idx_components_user ON public.components(user_id);
CREATE INDEX idx_service_logs_vehicle_date ON public.service_logs(vehicle_id, date DESC);
CREATE INDEX idx_service_logs_user ON public.service_logs(user_id);
CREATE INDEX idx_service_log_components_user ON public.service_log_components(user_id);
CREATE INDEX idx_fuel_logs_vehicle_date ON public.fuel_logs(vehicle_id, date DESC);
CREATE INDEX idx_fuel_logs_user ON public.fuel_logs(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_log_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users manage own vehicles" ON public.vehicles
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own components" ON public.components
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own service_logs" ON public.service_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own service_log_components" ON public.service_log_components
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own fuel_logs" ON public.fuel_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(COALESCE(NEW.email, 'user'), '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      ''
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = COALESCE(NULLIF(EXCLUDED.avatar_url, ''), public.profiles.avatar_url),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
