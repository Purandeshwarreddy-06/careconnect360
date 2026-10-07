-- ============================================================================
-- CARECONNECT 360 - Database Schema & Row Level Security (RLS)
-- "Smarter care. Safer living."
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('elderly', 'caregiver')),
    age INTEGER,
    phone TEXT,
    preferred_hospital TEXT DEFAULT 'Apollo Healthcare Centre',
    ambulance_contact TEXT DEFAULT '108',
    reminder_sound BOOLEAN DEFAULT true,
    reminder_grace_period INTEGER DEFAULT 15, -- minutes
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MEDICINES TABLE
CREATE TABLE IF NOT EXISTS public.medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    scheduled_time TEXT NOT NULL, -- e.g. "08:00 AM"
    frequency TEXT NOT NULL DEFAULT 'Once Daily',
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'DUE', 'TAKEN', 'SNOOZED', 'MISSED')),
    snoozed_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MEDICINE LOGS TABLE
CREATE TABLE IF NOT EXISTS public.medicine_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medicine_id UUID NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    scheduled_time TEXT NOT NULL,
    actual_time TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL CHECK (status IN ('TAKEN', 'SNOOZED', 'MISSED')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    doctor_name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    hospital_clinic TEXT NOT NULL,
    doctor_image TEXT,
    appointment_date DATE NOT NULL,
    appointment_time TEXT NOT NULL,
    reason TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'TODAY', 'COMPLETED', 'CANCELLED')),
    consultation_link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. HEALTH READINGS TABLE
CREATE TABLE IF NOT EXISTS public.health_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    parameter TEXT NOT NULL CHECK (parameter IN ('heart_rate', 'blood_pressure', 'spo2', 'temperature', 'blood_sugar', 'weight')),
    value NUMERIC NOT NULL,
    systolic NUMERIC, -- for BP
    diastolic NUMERIC, -- for BP
    unit TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'NORMAL' CHECK (status IN ('NORMAL', 'ATTENTION', 'NEEDS REVIEW')),
    note TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('MEDICINE_DUE', 'MEDICINE_MISSED', 'APPOINTMENT', 'HEALTH_UPDATE', 'EMERGENCY')),
    is_read BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. EMERGENCY CONTACTS TABLE
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    phone TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. EMERGENCY EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.emergency_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'ACTIVATED' CHECK (status IN ('ACTIVATED', 'TRIGGERED', 'ACKNOWLEDGED', 'RESOLVED')),
    notes TEXT,
    location TEXT DEFAULT 'Home - 42 Heritage Gardens',
    caregiver_notified BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CAREGIVER RELATIONSHIPS TABLE
CREATE TABLE IF NOT EXISTS public.caregiver_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    elderly_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    caregiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL DEFAULT 'Caregiver',
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(elderly_id, caregiver_id)
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicine_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregiver_relationships ENABLE ROW LEVEL SECURITY;

-- Helper function: Is Caregiver linked to elderly user?
CREATE OR REPLACE FUNCTION public.is_linked_caregiver(elderly_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.caregiver_relationships
    WHERE elderly_id = elderly_user_id
      AND caregiver_id = auth.uid()
      AND status = 'ACTIVE'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users can view own profile or linked profiles
CREATE POLICY "Profiles view policy" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_linked_caregiver(id));

CREATE POLICY "Profiles update policy" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Profiles insert policy" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Medicines: Owners and linked caregivers can view, owners can modify
CREATE POLICY "Medicines select policy" ON public.medicines
    FOR SELECT USING (auth.uid() = user_id OR public.is_linked_caregiver(user_id));

CREATE POLICY "Medicines insert policy" ON public.medicines
    FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_linked_caregiver(user_id));

CREATE POLICY "Medicines update policy" ON public.medicines
    FOR UPDATE USING (auth.uid() = user_id OR public.is_linked_caregiver(user_id));

CREATE POLICY "Medicines delete policy" ON public.medicines
    FOR DELETE USING (auth.uid() = user_id);

-- Medicine Logs
CREATE POLICY "Medicine logs select policy" ON public.medicine_logs
    FOR SELECT USING (auth.uid() = user_id OR public.is_linked_caregiver(user_id));

CREATE POLICY "Medicine logs insert policy" ON public.medicine_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_linked_caregiver(user_id));

-- Appointments
CREATE POLICY "Appointments select policy" ON public.appointments
    FOR SELECT USING (auth.uid() = user_id OR public.is_linked_caregiver(user_id));

CREATE POLICY "Appointments modify policy" ON public.appointments
    FOR ALL USING (auth.uid() = user_id OR public.is_linked_caregiver(user_id));

-- Health Readings
CREATE POLICY "Health readings select policy" ON public.health_readings
    FOR SELECT USING (auth.uid() = user_id OR public.is_linked_caregiver(user_id));

CREATE POLICY "Health readings insert policy" ON public.health_readings
    FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_linked_caregiver(user_id));

CREATE POLICY "Health readings update policy" ON public.health_readings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Health readings delete policy" ON public.health_readings
    FOR DELETE USING (auth.uid() = user_id);

-- Notifications
CREATE POLICY "Notifications select policy" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id OR public.is_linked_caregiver(user_id));

CREATE POLICY "Notifications insert policy" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_linked_caregiver(user_id));

CREATE POLICY "Notifications update policy" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id OR public.is_linked_caregiver(user_id));

-- Emergency Contacts
CREATE POLICY "Emergency contacts policy" ON public.emergency_contacts
    FOR ALL USING (auth.uid() = user_id OR public.is_linked_caregiver(user_id));

-- Emergency Events
CREATE POLICY "Emergency events select policy" ON public.emergency_events
    FOR SELECT USING (auth.uid() = user_id OR public.is_linked_caregiver(user_id));

CREATE POLICY "Emergency events insert policy" ON public.emergency_events
    FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_linked_caregiver(user_id));

CREATE POLICY "Emergency events update policy" ON public.emergency_events
    FOR UPDATE USING (auth.uid() = user_id OR public.is_linked_caregiver(user_id));

-- Caregiver Relationships
CREATE POLICY "Caregiver relationships policy" ON public.caregiver_relationships
    FOR ALL USING (auth.uid() = elderly_id OR auth.uid() = caregiver_id);

-- Enable Realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.medicine_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.health_readings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.medicines;
