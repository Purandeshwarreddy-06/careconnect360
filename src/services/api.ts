import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  UserProfile,
  UserRole,
  Medicine,
  MedicineLog,
  MedicineStatus,
  Appointment,
  HealthReading,
  NotificationItem,
  EmergencyContact,
  EmergencyEvent,
  CaregiverRelationship,
  CaregiverActivity,
} from '@/types';
import {
  DEMO_PATIENT,
  DEMO_ELDERLY_USER,
  DEMO_CAREGIVER_USER,
  getInitialMedicines,
  getInitialAppointments,
  getInitialHealthReadings,
  getInitialMedicineLogs,
  getInitialNotifications,
  getInitialEmergencyContacts,
  getInitialEmergencyEvents,
  getInitialCaregiverRelationships,
  getInitialCaregiverActivity,
} from './demoData';

// Local storage keys
const STORAGE_KEYS = {
  CURRENT_USER: 'careconnect_current_user',
  PROFILES: 'careconnect_profiles',
  MEDICINES: 'careconnect_medicines',
  MEDICINE_LOGS: 'careconnect_medicine_logs',
  APPOINTMENTS: 'careconnect_appointments',
  HEALTH_READINGS: 'careconnect_health_readings',
  NOTIFICATIONS: 'careconnect_notifications',
  EMERGENCY_CONTACTS: 'careconnect_emergency_contacts',
  EMERGENCY_EVENTS: 'careconnect_emergency_events',
  CAREGIVER_RELATIONSHIPS: 'careconnect_caregiver_relationships',
  CAREGIVER_ACTIVITIES: 'careconnect_caregiver_activities',
};

// Event name for real-time local sync across tabs/components
export const REALTIME_EVENT_NAME = 'careconnect_realtime_event';

export function broadcastUpdate(type: string, payload?: any) {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent(REALTIME_EVENT_NAME, {
      detail: { type, payload, timestamp: Date.now() },
    });
    window.dispatchEvent(event);
  }
}

// Ensure local store initialized
export function ensureInitializedStore() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.PROFILES)) {
    localStorage.setItem(
      STORAGE_KEYS.PROFILES,
      JSON.stringify([DEMO_PATIENT, DEMO_CAREGIVER_USER])
    );
  } else {
    // If profiles still contain legacy default unedited seed names, upgrade them to DEMO_PATIENT
    try {
      const existingProfiles: UserProfile[] = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]'
      );
      let updated = false;
      const upgraded = existingProfiles.map((p) => {
        if ((p.id === 'usr-elderly-01' || p.id === 'usr-lakshmi-devi-01') && 
            (p.full_name === 'Kamla Devi' || p.full_name === 'Lakshmi Devi')) {
          updated = true;
          return DEMO_PATIENT;
        }
        return p;
      });
      if (updated) {
        localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(upgraded));
      }
    } catch (e) {}
  }

  if (!localStorage.getItem(STORAGE_KEYS.MEDICINES)) {
    localStorage.setItem(
      STORAGE_KEYS.MEDICINES,
      JSON.stringify(getInitialMedicines())
    );
  } else {
    // If existing medicines still contain old unedited seed items, refresh demo medicines
    try {
      const existingMeds: Medicine[] = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.MEDICINES) || '[]'
      );
      const hasOldSeeds = existingMeds.some((m) => m.id === 'med-amlodipine-01' || m.id === 'med-metformin-02');
      const hasNewSeeds = existingMeds.some((m) => m.id === 'med-paracetamol-01');
      if (hasOldSeeds && !hasNewSeeds) {
        const customMeds = existingMeds.filter((m) => !m.id.startsWith('med-amlodipine') && !m.id.startsWith('med-metformin') && !m.id.startsWith('med-atorvastatin'));
        localStorage.setItem(
          STORAGE_KEYS.MEDICINES,
          JSON.stringify([...getInitialMedicines(), ...customMeds])
        );
      }
    } catch (e) {}
  }

  if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
    localStorage.setItem(
      STORAGE_KEYS.APPOINTMENTS,
      JSON.stringify(getInitialAppointments())
    );
  }
  if (!localStorage.getItem(STORAGE_KEYS.HEALTH_READINGS)) {
    localStorage.setItem(
      STORAGE_KEYS.HEALTH_READINGS,
      JSON.stringify(getInitialHealthReadings())
    );
  } else {
    // If stored health readings do not yet have the 3 new parameters (height, bmi, respiratory_rate), populate them
    try {
      const existingReadings: HealthReading[] = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.HEALTH_READINGS) || '[]'
      );
      const hasNewParams = existingReadings.some((r) => r.parameter === 'height' || r.parameter === 'bmi' || r.parameter === 'respiratory_rate');
      if (!hasNewParams) {
        const demoReadings = getInitialHealthReadings();
        localStorage.setItem(
          STORAGE_KEYS.HEALTH_READINGS,
          JSON.stringify([...existingReadings, ...demoReadings.filter(r => ['height', 'bmi', 'respiratory_rate'].includes(r.parameter))])
        );
      }
    } catch (e) {}
  }

  if (!localStorage.getItem(STORAGE_KEYS.MEDICINE_LOGS)) {
    localStorage.setItem(
      STORAGE_KEYS.MEDICINE_LOGS,
      JSON.stringify(getInitialMedicineLogs())
    );
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(
      STORAGE_KEYS.NOTIFICATIONS,
      JSON.stringify(getInitialNotifications())
    );
  }
  if (!localStorage.getItem(STORAGE_KEYS.EMERGENCY_CONTACTS)) {
    localStorage.setItem(
      STORAGE_KEYS.EMERGENCY_CONTACTS,
      JSON.stringify(getInitialEmergencyContacts())
    );
  }
  if (!localStorage.getItem(STORAGE_KEYS.EMERGENCY_EVENTS)) {
    localStorage.setItem(
      STORAGE_KEYS.EMERGENCY_EVENTS,
      JSON.stringify(getInitialEmergencyEvents())
    );
  }
  if (!localStorage.getItem(STORAGE_KEYS.CAREGIVER_RELATIONSHIPS)) {
    localStorage.setItem(
      STORAGE_KEYS.CAREGIVER_RELATIONSHIPS,
      JSON.stringify(getInitialCaregiverRelationships())
    );
  }
  if (!localStorage.getItem(STORAGE_KEYS.CAREGIVER_ACTIVITIES)) {
    localStorage.setItem(
      STORAGE_KEYS.CAREGIVER_ACTIVITIES,
      JSON.stringify(getInitialCaregiverActivity())
    );
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    const profiles: UserProfile[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]'
    );
    const elderly = profiles.find((p) => p.role === 'elderly') || DEMO_PATIENT;
    localStorage.setItem(
      STORAGE_KEYS.CURRENT_USER,
      JSON.stringify(elderly)
    );
  } else {
    // Check if current user is old unedited seed
    try {
      const cur = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || '{}');
      if ((cur.id === 'usr-elderly-01' || cur.id === 'usr-lakshmi-devi-01') && 
          (cur.full_name === 'Kamla Devi' || cur.full_name === 'Lakshmi Devi')) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEMO_PATIENT));
      }
    } catch (e) {}
  }
}

export function getElderlyProfileSync(userId?: string): UserProfile {
  try {
    const profiles: UserProfile[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]'
    );
    if (userId) {
      const match = profiles.find((p) => p.id === userId);
      if (match) return match;
    }
    const elderly = profiles.find((p) => p.role === 'elderly');
    if (elderly) return elderly;
  } catch (e) {}
  return DEMO_PATIENT;
}

export function getElderlyNameSync(userId?: string): string {
  return getElderlyProfileSync(userId).full_name || 'Rahul Kumar';
}

export function getCaregiverNameSync(): string {
  try {
    const profiles: UserProfile[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]'
    );
    const caregiver = profiles.find((p) => p.role === 'caregiver');
    if (caregiver?.full_name) return caregiver.full_name;
  } catch (e) {}
  return 'Caregiver';
}


// Reset or Load Demo Data (Section 18)
export async function loadDemoData(): Promise<void> {
  localStorage.setItem(
    STORAGE_KEYS.PROFILES,
    JSON.stringify([DEMO_PATIENT, DEMO_CAREGIVER_USER])
  );
  localStorage.setItem(
    STORAGE_KEYS.MEDICINES,
    JSON.stringify(getInitialMedicines(DEMO_PATIENT.id))
  );
  localStorage.setItem(
    STORAGE_KEYS.APPOINTMENTS,
    JSON.stringify(getInitialAppointments(DEMO_PATIENT.id))
  );
  localStorage.setItem(
    STORAGE_KEYS.HEALTH_READINGS,
    JSON.stringify(getInitialHealthReadings(DEMO_PATIENT.id))
  );
  localStorage.setItem(
    STORAGE_KEYS.MEDICINE_LOGS,
    JSON.stringify(getInitialMedicineLogs(DEMO_PATIENT.id))
  );
  localStorage.setItem(
    STORAGE_KEYS.NOTIFICATIONS,
    JSON.stringify(getInitialNotifications(DEMO_PATIENT.id))
  );
  localStorage.setItem(
    STORAGE_KEYS.EMERGENCY_CONTACTS,
    JSON.stringify(getInitialEmergencyContacts(DEMO_PATIENT.id))
  );
  localStorage.setItem(
    STORAGE_KEYS.EMERGENCY_EVENTS,
    JSON.stringify(getInitialEmergencyEvents(DEMO_PATIENT.id))
  );
  localStorage.setItem(
    STORAGE_KEYS.CAREGIVER_RELATIONSHIPS,
    JSON.stringify(getInitialCaregiverRelationships(DEMO_PATIENT.id))
  );
  localStorage.setItem(
    STORAGE_KEYS.CAREGIVER_ACTIVITIES,
    JSON.stringify(getInitialCaregiverActivity(DEMO_PATIENT.id))
  );
  localStorage.setItem(
    STORAGE_KEYS.CURRENT_USER,
    JSON.stringify(DEMO_PATIENT)
  );

  // If live Supabase is configured, also push seeds to Supabase
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('profiles').upsert([DEMO_PATIENT, DEMO_CAREGIVER_USER]);
      await supabase.from('medicines').upsert(getInitialMedicines(DEMO_PATIENT.id));
      await supabase.from('appointments').upsert(getInitialAppointments(DEMO_PATIENT.id));
      await supabase.from('health_readings').upsert(getInitialHealthReadings(DEMO_PATIENT.id));
      await supabase.from('notifications').upsert(getInitialNotifications(DEMO_PATIENT.id));
      await supabase.from('emergency_contacts').upsert(getInitialEmergencyContacts(DEMO_PATIENT.id));
    } catch (e) {
      console.warn('Supabase remote seed non-critical fallback:', e);
    }
  }

  broadcastUpdate('DEMO_DATA_LOADED');
}

// AUTHENTICATION SERVICES
export async function getCurrentUser(): Promise<UserProfile | null> {
  ensureInitializedStore();
  if (isSupabaseConfigured()) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (profile) {
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(profile));
          return profile as UserProfile;
        }
      }
    } catch (err) {
      console.warn('Supabase auth check fallback:', err);
    }
  }
  const profiles: UserProfile[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]'
  );
  const local = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (local) {
    const parsed = JSON.parse(local);
    const match = profiles.find((p) => p.id === parsed.id);
    if (match) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(match));
      return match;
    }
    return parsed;
  }
  const elderly = profiles.find((p) => p.role === 'elderly') || DEMO_ELDERLY_USER;
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(elderly));
  return elderly;
}


export async function loginUser(email: string, pass: string): Promise<UserProfile> {
  ensureInitializedStore();
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (error) throw error;
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        if (profile) {
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(profile));
          broadcastUpdate('AUTH_STATE_CHANGED', profile);
          return profile as UserProfile;
        }
      }
    } catch (err) {
      console.warn('Supabase login fallback:', err);
      // If error from remote, fall back to checking demo profiles or allow demo login
    }
  }

  // Local demo login check
  const profiles: UserProfile[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]'
  );
  const matched = profiles.find(
    (p) => p.email.toLowerCase() === email.trim().toLowerCase()
  );

  if (matched) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(matched));
    broadcastUpdate('AUTH_STATE_CHANGED', matched);
    return matched;
  }

  // Create temporary profile if not matched
  const newProfile: UserProfile = {
    id: `usr-${Date.now()}`,
    email,
    full_name: email.split('@')[0],
    role: email.includes('care') ? 'caregiver' : 'elderly',
    age: 70,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  profiles.push(newProfile);
  localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newProfile));
  broadcastUpdate('AUTH_STATE_CHANGED', newProfile);
  return newProfile;
}

export async function signupUser(
  fullName: string,
  email: string,
  pass: string,
  role: UserRole
): Promise<UserProfile> {
  ensureInitializedStore();
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: { full_name: fullName, role },
        },
      });
      if (error) throw error;
      if (data.user) {
        const newProfile: UserProfile = {
          id: data.user.id,
          email,
          full_name: fullName,
          role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await supabase.from('profiles').insert(newProfile);
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newProfile));
        broadcastUpdate('AUTH_STATE_CHANGED', newProfile);
        return newProfile;
      }
    } catch (err) {
      console.warn('Supabase signup fallback:', err);
    }
  }

  const profiles: UserProfile[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]'
  );
  const newProfile: UserProfile = {
    id: `usr-${Date.now()}`,
    email,
    full_name: fullName,
    role,
    age: role === 'elderly' ? 72 : 45,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  profiles.push(newProfile);
  localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newProfile));
  broadcastUpdate('AUTH_STATE_CHANGED', newProfile);
  return newProfile;
}

export async function logoutUser(): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase logout fallback:', err);
    }
  }
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  broadcastUpdate('AUTH_STATE_CHANGED', null);
}

export async function switchDemoRole(role: UserRole): Promise<UserProfile> {
  ensureInitializedStore();
  let target: UserProfile | null = null;
  const demoId = role === 'elderly' ? DEMO_ELDERLY_USER.id : DEMO_CAREGIVER_USER.id;
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', demoId)
        .single();
      if (!error && data) {
        target = data as UserProfile;
      }
    } catch (err) {
      console.warn('Supabase switchDemoRole fallback:', err);
    }
  }
  if (!target) {
    const profiles: UserProfile[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]'
    );
    target = profiles.find((p) => p.id === demoId || p.role === role) || null;
  }
  if (!target) {
    target = role === 'elderly' ? DEMO_ELDERLY_USER : DEMO_CAREGIVER_USER;
  }
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(target));
  broadcastUpdate('AUTH_STATE_CHANGED', target);
  return target;
}

// PROFILE
export async function getProfile(userId: string): Promise<UserProfile> {
  ensureInitializedStore();
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) return data as UserProfile;
    } catch (err) {
      console.warn('Supabase getProfile fallback:', err);
    }
  }
  const profiles: UserProfile[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]'
  );
  const found = profiles.find((p) => p.id === userId);
  if (found) return found;
  return userId === DEMO_CAREGIVER_USER.id ? DEMO_CAREGIVER_USER : DEMO_ELDERLY_USER;
}

export async function updateProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  ensureInitializedStore();
  let updatedRecord: UserProfile | null = null;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
        .select()
        .single();
      if (!error && data) {
        updatedRecord = data as UserProfile;
      }
    } catch (err) {
      console.warn('Supabase updateProfile fallback:', err);
    }
  }

  const profiles: UserProfile[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]'
  );
  const idx = profiles.findIndex((p) => p.id === userId);
  const fallback = userId === DEMO_CAREGIVER_USER.id ? DEMO_CAREGIVER_USER : DEMO_ELDERLY_USER;
  const updated: UserProfile = {
    ...(idx >= 0 ? profiles[idx] : fallback),
    ...(updatedRecord || {}),
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if (idx >= 0) profiles[idx] = updated;
  else profiles.push(updated);

  localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));

  const curr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (curr) {
    const curObj = JSON.parse(curr);
    if (curObj.id === userId || curObj.role === updated.role) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));
    }
  } else {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));
  }

  broadcastUpdate('PROFILE_UPDATED', updated);
  broadcastUpdate('AUTH_STATE_CHANGED', updated);
  return updated;
}


// MEDICINES
export async function getMedicines(userId: string): Promise<Medicine[]> {
  ensureInitializedStore();
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data as Medicine[];
    } catch (err) {
      console.warn('Supabase getMedicines fallback:', err);
    }
  }
  const list: Medicine[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.MEDICINES) || '[]'
  );
  const userList = list.filter((m) => m.user_id === userId || !m.user_id);
  if (userList.length === 0 && (userId === DEMO_PATIENT.id || !userId || userId === 'usr-elderly-01' || userId === 'usr-lakshmi-devi-01')) {
    const demoMeds = getInitialMedicines(userId);
    const otherMeds = list.filter((m) => m.user_id !== userId && !!m.user_id);
    localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify([...demoMeds, ...otherMeds]));
    return demoMeds;
  }
  return userList;
}

export async function addMedicine(
  data: Omit<Medicine, 'id' | 'created_at' | 'updated_at'>
): Promise<Medicine> {
  ensureInitializedStore();
  const newMed: Medicine = {
    ...data,
    id: `med-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  if (isSupabaseConfigured()) {
    try {
      const { data: remote, error } = await supabase
        .from('medicines')
        .insert(newMed)
        .select()
        .single();
      if (!error && remote) {
        broadcastUpdate('MEDICINE_CHANGED', remote);
        return remote as Medicine;
      }
    } catch (err) {
      console.warn('Supabase addMedicine fallback:', err);
    }
  }
  const list: Medicine[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.MEDICINES) || '[]'
  );
  list.unshift(newMed);
  localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(list));

  // Add activity log
  addCaregiverActivity({
    user_id: newMed.user_id,
    elderly_name: getElderlyNameSync(newMed.user_id),
    message: `Added new scheduled medicine: ${newMed.name} (${newMed.dosage}).`,
    type: 'medicine',
  });

  broadcastUpdate('MEDICINE_CHANGED', newMed);
  return newMed;
}

export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return -1;
  const cleaned = timeStr.trim().toUpperCase();
  const isPM = cleaned.includes('PM');
  const isAM = cleaned.includes('AM');
  const match = cleaned.match(/(\d{1,2})[:.](\d{2})/);
  if (!match) return -1;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

export function isMedicineDueTime(med: Medicine, now: Date = new Date()): boolean {
  if (med.status === 'TAKEN' || med.status === 'MISSED') {
    return false;
  }
  if (med.status === 'SNOOZED') {
    if (med.snoozed_until) {
      const snoozeExpiry = new Date(med.snoozed_until).getTime();
      return snoozeExpiry <= now.getTime();
    }
    return false;
  }
  if (med.status === 'DUE') {
    return true;
  }
  const scheduledMinutes = parseTimeToMinutes(med.scheduled_time);
  if (scheduledMinutes === -1) return false;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return currentMinutes >= scheduledMinutes;
}


export async function updateMedicine(
  id: string,
  updates: Partial<Medicine>
): Promise<Medicine> {
  ensureInitializedStore();
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        broadcastUpdate('MEDICINE_CHANGED', data);
        return data as Medicine;
      }
    } catch (err) {
      console.warn('Supabase updateMedicine fallback:', err);
    }
  }
  const list: Medicine[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.MEDICINES) || '[]'
  );
  const idx = list.findIndex((m) => m.id === id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(list));
    broadcastUpdate('MEDICINE_CHANGED', list[idx]);
    return list[idx];
  }
  throw new Error('Medicine not found');
}

export async function deleteMedicine(id: string): Promise<void> {
  ensureInitializedStore();
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('medicines').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase deleteMedicine fallback:', err);
    }
  }
  const list: Medicine[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.MEDICINES) || '[]'
  );
  const updated = list.filter((m) => m.id !== id);
  localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(updated));
  broadcastUpdate('MEDICINE_CHANGED', { id, deleted: true });
}

// CORE MEDICINE ACTIONS: TAKEN, SNOOZE, NOT TAKEN (Section 7 & 8)
export async function recordMedicineAction(
  medicineId: string,
  userId: string,
  action: 'TAKEN' | 'SNOOZED' | 'MISSED',
  notes?: string,
  snoozeMinutes: number = 15
): Promise<{ medicine: Medicine; log: MedicineLog }> {
  ensureInitializedStore();
  const medicines: Medicine[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.MEDICINES) || '[]'
  );
  const med = medicines.find((m) => m.id === medicineId);
  if (!med) throw new Error('Medicine not found');

  const now = new Date();
  const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let newStatus: MedicineStatus = 'TAKEN';
  let snoozedUntil: string | null = null;

  if (action === 'TAKEN') {
    newStatus = 'TAKEN';
    snoozedUntil = null;
  } else if (action === 'SNOOZED') {
    newStatus = 'SNOOZED';
    snoozedUntil = new Date(now.getTime() + snoozeMinutes * 60000).toISOString();
  } else if (action === 'MISSED') {
    newStatus = 'MISSED';
    snoozedUntil = null;
  }

  // Update Medicine
  med.status = newStatus;
  med.snoozed_until = snoozedUntil;
  med.updated_at = now.toISOString();

  // Create Log
  const newLog: MedicineLog = {
    id: `log-${Date.now()}`,
    medicine_id: med.id,
    medicine_name: med.name,
    user_id: userId,
    scheduled_time: med.scheduled_time,
    actual_time: now.toISOString(),
    status: action,
    notes: notes || (action === 'TAKEN' ? `Taken at ${timeFormatted}` : action === 'SNOOZED' ? `Snoozed for ${snoozeMinutes}m` : 'Marked as not taken'),
    created_at: now.toISOString(),
  };

  const logs: MedicineLog[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.MEDICINE_LOGS) || '[]'
  );
  logs.unshift(newLog);
  localStorage.setItem(STORAGE_KEYS.MEDICINE_LOGS, JSON.stringify(logs));
  localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(medicines));

  // If live Supabase is configured
  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('medicines')
        .update({ status: newStatus, snoozed_until: snoozedUntil, updated_at: now.toISOString() })
        .eq('id', med.id);
      await supabase.from('medicine_logs').insert(newLog);
    } catch (err) {
      console.warn('Supabase remote medicine action fallback:', err);
    }
  }

  // Generate Activity & Notification
  const elderlyName = getElderlyNameSync(userId);

  // Generate Activity & Notification
  if (action === 'TAKEN') {
    addCaregiverActivity({
      user_id: userId,
      elderly_name: elderlyName,
      message: `${elderlyName} took ${med.name} at ${timeFormatted}.`,
      type: 'medicine',
    });
    addNotification({
      user_id: userId,
      title: 'Medicine Taken',
      message: `${med.name} logged as taken at ${timeFormatted}. Adherence updated!`,
      type: 'MEDICINE_DUE',
    });
  } else if (action === 'SNOOZED') {
    const nextTime = new Date(snoozedUntil!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    addCaregiverActivity({
      user_id: userId,
      elderly_name: elderlyName,
      message: `Snoozed ${med.name} reminder by ${snoozeMinutes} minutes (next reminder at ${nextTime}).`,
      type: 'medicine',
    });
    addNotification({
      user_id: userId,
      title: 'Reminder Snoozed',
      message: `${med.name} reminder moved forward by ${snoozeMinutes} minutes. Next reminder at ${nextTime}.`,
      type: 'MEDICINE_DUE',
    });
  } else if (action === 'MISSED') {
    addCaregiverActivity({
      user_id: userId,
      elderly_name: elderlyName,
      message: `ALERT: ${med.name} scheduled for ${med.scheduled_time} was marked as missed by ${elderlyName}!`,
      type: 'medicine',
    });
    addNotification({
      user_id: userId,
      title: 'Medicine Missed',
      message: `Scheduled dose of ${med.name} was marked as not taken. Family caregiver has been notified.`,
      type: 'MEDICINE_MISSED',
    });
    // Explicit notification for the linked caregiver
    addNotification({
      user_id: DEMO_CAREGIVER_USER.id,
      title: 'ALERT: Medicine Missed',
      message: `${elderlyName} missed scheduled dose of ${med.name} (${med.dosage}) scheduled for ${med.scheduled_time}.`,
      type: 'MEDICINE_MISSED',
    });
  }


  broadcastUpdate('MEDICINE_LOGGED', { medicine: med, log: newLog });
  return { medicine: med, log: newLog };
}

export async function getMedicineLogs(userId: string): Promise<MedicineLog[]> {
  ensureInitializedStore();
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('medicine_logs')
        .select('*')
        .eq('user_id', userId)
        .order('actual_time', { ascending: false });
      if (!error && data) return data as MedicineLog[];
    } catch (err) {
      console.warn('Supabase getMedicineLogs fallback:', err);
    }
  }
  const list: MedicineLog[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.MEDICINE_LOGS) || '[]'
  );
  return list.filter((l) => l.user_id === userId || !l.user_id);
}

// HEALTH READINGS (Section 9)
export async function getHealthReadings(
  userId: string,
  filter?: '24H' | '7D' | '30D'
): Promise<HealthReading[]> {
  ensureInitializedStore();
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('health_readings')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: true });
      if (!error && data && data.length > 0) {
        return filterReadingsByTime(data as HealthReading[], filter);
      }
    } catch (err) {
      console.warn('Supabase getHealthReadings fallback:', err);
    }
  }
  const list: HealthReading[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.HEALTH_READINGS) || '[]'
  );
  let userList = list.filter((r) => r.user_id === userId || !r.user_id);
  if (userList.length === 0 && (userId === DEMO_PATIENT.id || !userId || userId === 'usr-elderly-01' || userId === 'usr-lakshmi-devi-01')) {
    const demoReadings = getInitialHealthReadings(userId);
    const otherReadings = list.filter((r) => r.user_id !== userId && !!r.user_id);
    localStorage.setItem(STORAGE_KEYS.HEALTH_READINGS, JSON.stringify([...demoReadings, ...otherReadings]));
    userList = demoReadings;
  }
  return filterReadingsByTime(userList, filter);
}

function filterReadingsByTime(
  readings: HealthReading[],
  filter?: '24H' | '7D' | '30D'
): HealthReading[] {
  if (!filter) return readings;
  const now = Date.now();
  const maxHours = filter === '24H' ? 24 : filter === '7D' ? 168 : 720;
  return readings.filter(
    (r) => (now - new Date(r.timestamp).getTime()) <= maxHours * 3600000
  );
}

export async function addHealthReading(
  data: Omit<HealthReading, 'id' | 'created_at'>
): Promise<HealthReading> {
  ensureInitializedStore();
  const newReading: HealthReading = {
    ...data,
    id: `hr-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const { data: remote, error } = await supabase
        .from('health_readings')
        .insert(newReading)
        .select()
        .single();
      if (!error && remote) {
        broadcastUpdate('HEALTH_READING_CHANGED', remote);
        return remote as HealthReading;
      }
    } catch (err) {
      console.warn('Supabase addHealthReading fallback:', err);
    }
  }

  const list: HealthReading[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.HEALTH_READINGS) || '[]'
  );
  list.push(newReading);
  localStorage.setItem(STORAGE_KEYS.HEALTH_READINGS, JSON.stringify(list));

  const paramLabel = data.parameter.replace('_', ' ').toUpperCase();
  const displayVal = data.parameter === 'blood_pressure' && data.systolic && data.diastolic
    ? `${data.systolic}/${data.diastolic} ${data.unit}`
    : `${data.value} ${data.unit}`;

  addCaregiverActivity({
    user_id: data.user_id,
    elderly_name: getElderlyNameSync(data.user_id),
    message: `New health reading recorded: ${paramLabel} at ${displayVal} (${data.status}).`,
    type: 'health',
  });

  addNotification({
    user_id: data.user_id,
    title: `Health Reading Added: ${paramLabel}`,
    message: `${paramLabel} recorded at ${displayVal}. Status: ${data.status}.`,
    type: 'HEALTH_UPDATE',
  });

  broadcastUpdate('HEALTH_READING_CHANGED', newReading);
  return newReading;
}

export async function deleteHealthReading(id: string): Promise<void> {
  ensureInitializedStore();
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('health_readings').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase deleteHealthReading fallback:', err);
    }
  }
  const list: HealthReading[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.HEALTH_READINGS) || '[]'
  );
  const updated = list.filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEYS.HEALTH_READINGS, JSON.stringify(updated));
  broadcastUpdate('HEALTH_READING_CHANGED', { id, deleted: true });
}

// APPOINTMENTS (Section 10)
export async function getAppointments(userId: string): Promise<Appointment[]> {
  ensureInitializedStore();
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', userId)
        .order('appointment_date', { ascending: true });
      if (!error && data) return data as Appointment[];
    } catch (err) {
      console.warn('Supabase getAppointments fallback:', err);
    }
  }
  const list: Appointment[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]'
  );
  return list.filter((a) => a.user_id === userId || !a.user_id);
}

export async function getAppointmentById(id: string): Promise<Appointment | null> {
  const all = await getAppointments(DEMO_ELDERLY_USER.id);
  return all.find((a) => a.id === id) || null;
}

export async function addAppointment(
  data: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>
): Promise<Appointment> {
  ensureInitializedStore();
  const newApt: Appointment = {
    ...data,
    id: `apt-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  if (isSupabaseConfigured()) {
    try {
      const { data: remote, error } = await supabase
        .from('appointments')
        .insert(newApt)
        .select()
        .single();
      if (!error && remote) {
        broadcastUpdate('APPOINTMENT_CHANGED', remote);
        return remote as Appointment;
      }
    } catch (err) {
      console.warn('Supabase addAppointment fallback:', err);
    }
  }
  const list: Appointment[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]'
  );
  list.unshift(newApt);
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(list));

  addCaregiverActivity({
    user_id: newApt.user_id,
    elderly_name: getElderlyNameSync(newApt.user_id),
    message: `Doctor appointment scheduled with ${newApt.doctor_name} on ${newApt.appointment_date} at ${newApt.appointment_time}.`,
    type: 'appointment',
  });

  addNotification({
    user_id: newApt.user_id,
    title: 'Appointment Scheduled',
    message: `Confirmed with ${newApt.doctor_name} for ${newApt.appointment_date} at ${newApt.appointment_time}.`,
    type: 'APPOINTMENT',
  });

  broadcastUpdate('APPOINTMENT_CHANGED', newApt);
  return newApt;
}

export async function updateAppointment(
  id: string,
  updates: Partial<Appointment>
): Promise<Appointment> {
  ensureInitializedStore();
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        broadcastUpdate('APPOINTMENT_CHANGED', data);
        return data as Appointment;
      }
    } catch (err) {
      console.warn('Supabase updateAppointment fallback:', err);
    }
  }
  const list: Appointment[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]'
  );
  const idx = list.findIndex((a) => a.id === id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(list));
    broadcastUpdate('APPOINTMENT_CHANGED', list[idx]);
    return list[idx];
  }
  throw new Error('Appointment not found');
}

export async function deleteAppointment(id: string): Promise<void> {
  ensureInitializedStore();
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('appointments').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase deleteAppointment fallback:', err);
    }
  }
  const list: Appointment[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]'
  );
  const updated = list.filter((a) => a.id !== id);
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(updated));
  broadcastUpdate('APPOINTMENT_CHANGED', { id, deleted: true });
}

// NOTIFICATIONS (Section 13)
export async function getNotifications(userId: string): Promise<NotificationItem[]> {
  ensureInitializedStore();
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!error && data) return data as NotificationItem[];
    } catch (err) {
      console.warn('Supabase getNotifications fallback:', err);
    }
  }
  const list: NotificationItem[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]'
  );
  return list.filter((n) => n.user_id === userId || !n.user_id);
}

export async function addNotification(
  data: Omit<NotificationItem, 'id' | 'is_read' | 'created_at'>
): Promise<NotificationItem> {
  ensureInitializedStore();
  const notif: NotificationItem = {
    ...data,
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    is_read: false,
    created_at: new Date().toISOString(),
  };
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('notifications').insert(notif);
    } catch (err) {
      console.warn('Supabase addNotification fallback:', err);
    }
  }
  const list: NotificationItem[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]'
  );
  list.unshift(notif);
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
  broadcastUpdate('NOTIFICATION_CHANGED', notif);
  return notif;
}

export async function markNotificationRead(id: string): Promise<void> {
  ensureInitializedStore();
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    } catch (err) {
      console.warn('Supabase markNotificationRead fallback:', err);
    }
  }
  const list: NotificationItem[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]'
  );
  const found = list.find((n) => n.id === id);
  if (found) found.is_read = true;
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
  broadcastUpdate('NOTIFICATION_CHANGED', { id, is_read: true });
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  ensureInitializedStore();
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
    } catch (err) {
      console.warn('Supabase markAllNotificationsRead fallback:', err);
    }
  }
  const list: NotificationItem[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]'
  );
  list.forEach((n) => {
    if (n.user_id === userId || !n.user_id) n.is_read = true;
  });
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
  broadcastUpdate('NOTIFICATION_CHANGED', { allRead: true });
}

// EMERGENCY WORKFLOW (Section 7, 15)
export async function getEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
  ensureInitializedStore();
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', userId);
      if (!error && data) return data as EmergencyContact[];
    } catch (err) {
      console.warn('Supabase getEmergencyContacts fallback:', err);
    }
  }
  const list: EmergencyContact[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.EMERGENCY_CONTACTS) || '[]'
  );
  return list.filter((c) => c.user_id === userId || !c.user_id);
}

export async function addEmergencyContact(
  data: Omit<EmergencyContact, 'id' | 'created_at' | 'updated_at'>
): Promise<EmergencyContact> {
  ensureInitializedStore();
  const item: EmergencyContact = {
    ...data,
    id: `emc-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('emergency_contacts').insert(item);
    } catch (err) {
      console.warn('Supabase addEmergencyContact fallback:', err);
    }
  }
  const list: EmergencyContact[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.EMERGENCY_CONTACTS) || '[]'
  );
  list.push(item);
  localStorage.setItem(STORAGE_KEYS.EMERGENCY_CONTACTS, JSON.stringify(list));
  broadcastUpdate('EMERGENCY_CONTACTS_CHANGED', item);
  return item;
}

export async function deleteEmergencyContact(id: string): Promise<void> {
  ensureInitializedStore();
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('emergency_contacts').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase deleteEmergencyContact fallback:', err);
    }
  }
  const list: EmergencyContact[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.EMERGENCY_CONTACTS) || '[]'
  );
  const updated = list.filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.EMERGENCY_CONTACTS, JSON.stringify(updated));
  broadcastUpdate('EMERGENCY_CONTACTS_CHANGED', { id, deleted: true });
}

export async function getEmergencyEvents(userId?: string): Promise<EmergencyEvent[]> {
  ensureInitializedStore();
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('emergency_events').select('*').order('created_at', { ascending: false });
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (!error && data) return data as EmergencyEvent[];
    } catch (err) {
      console.warn('Supabase getEmergencyEvents fallback:', err);
    }
  }
  const list: EmergencyEvent[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.EMERGENCY_EVENTS) || '[]'
  );
  if (userId) return list.filter((e) => e.user_id === userId || !e.user_id);
  return list;
}

export async function triggerEmergency(
  userId: string,
  location: string = 'Home - 42 Heritage Gardens',
  notes: string = 'Emergency SOS triggered from Home Command Center'
): Promise<EmergencyEvent> {
  ensureInitializedStore();
  const elderlyName = getElderlyNameSync(userId);
  const newEvent: EmergencyEvent = {
    id: `eme-${Date.now()}`,
    user_id: userId,
    elderly_name: elderlyName,
    timestamp: new Date().toISOString(),
    status: 'ACTIVATED',
    notes,
    location,
    caregiver_notified: true,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('emergency_events').insert(newEvent);
    } catch (err) {
      console.warn('Supabase triggerEmergency fallback:', err);
    }
  }

  const list: EmergencyEvent[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.EMERGENCY_EVENTS) || '[]'
  );
  list.unshift(newEvent);
  localStorage.setItem(STORAGE_KEYS.EMERGENCY_EVENTS, JSON.stringify(list));

  // Add high-priority notification for elderly user
  addNotification({
    user_id: userId,
    title: '🚨 EMERGENCY SOS INITIATED',
    message: `Emergency workflow triggered. Caregiver alert broadcasted. Protocol active.`,
    type: 'EMERGENCY',
  });

  // Explicit notification for linked caregiver
  addNotification({
    user_id: DEMO_CAREGIVER_USER.id,
    title: '🚨 CRITICAL: SOS ALERT FROM ELDERLY USER',
    message: `${elderlyName} triggered an emergency SOS from ${location}! Immediate attention required.`,
    type: 'EMERGENCY',
  });

  // Add Caregiver Activity
  addCaregiverActivity({
    user_id: userId,
    elderly_name: elderlyName,
    message: `🚨 EMERGENCY ALERT: ${elderlyName} triggered SOS from ${location}!`,
    type: 'emergency',
  });

  broadcastUpdate('EMERGENCY_TRIGGERED', newEvent);
  return newEvent;
}

export async function acknowledgeEmergency(eventId: string): Promise<EmergencyEvent> {
  ensureInitializedStore();
  const list: EmergencyEvent[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.EMERGENCY_EVENTS) || '[]'
  );
  const found = list.find((e) => e.id === eventId);
  if (found) {
    found.status = 'ACKNOWLEDGED';
    localStorage.setItem(STORAGE_KEYS.EMERGENCY_EVENTS, JSON.stringify(list));
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('emergency_events')
          .update({ status: 'ACKNOWLEDGED' })
          .eq('id', eventId);
      } catch (e) {
        console.warn(e);
      }
    }
    broadcastUpdate('EMERGENCY_UPDATED', found);
    return found;
  }
  throw new Error('Event not found');
}

export async function resolveEmergency(eventId: string): Promise<EmergencyEvent> {
  ensureInitializedStore();
  const list: EmergencyEvent[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.EMERGENCY_EVENTS) || '[]'
  );
  const found = list.find((e) => e.id === eventId);
  if (found) {
    found.status = 'RESOLVED';
    localStorage.setItem(STORAGE_KEYS.EMERGENCY_EVENTS, JSON.stringify(list));
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('emergency_events')
          .update({ status: 'RESOLVED' })
          .eq('id', eventId);
      } catch (e) {
        console.warn(e);
      }
    }
    broadcastUpdate('EMERGENCY_UPDATED', found);
    return found;
  }
  throw new Error('Event not found');
}

// CAREGIVER DASHBOARD & ACTIVITY FEED (Section 12)
export function getCaregiverActivities(): CaregiverActivity[] {
  ensureInitializedStore();
  const list: CaregiverActivity[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.CAREGIVER_ACTIVITIES) || '[]'
  );
  return list;
}

export function addCaregiverActivity(data: Omit<CaregiverActivity, 'id' | 'timestamp'>) {
  ensureInitializedStore();
  const item: CaregiverActivity = {
    ...data,
    id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
  };
  const list: CaregiverActivity[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.CAREGIVER_ACTIVITIES) || '[]'
  );
  list.unshift(item);
  // Keep last 40 activities
  localStorage.setItem(
    STORAGE_KEYS.CAREGIVER_ACTIVITIES,
    JSON.stringify(list.slice(0, 40))
  );
  broadcastUpdate('CAREGIVER_ACTIVITY_ADDED', item);
  return item;
}

// REALTIME SUBSCRIPTION HOOK HELPER (Section 17)
export function subscribeToLiveUpdates(callback: (event: any) => void) {
  const handler = (e: Event) => {
    const custom = e as CustomEvent;
    callback(custom.detail);
  };
  if (typeof window !== 'undefined') {
    window.addEventListener(REALTIME_EVENT_NAME, handler);
  }

  // Also hook into Supabase Realtime channel if configured
  let channel: any = null;
  if (isSupabaseConfigured()) {
    try {
      channel = supabase
        .channel('careconnect-live-stream')
        .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
          callback({ type: 'SUPABASE_REALTIME', payload });
        })
        .subscribe();
    } catch (err) {
      console.warn('Realtime channel subscription error:', err);
    }
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener(REALTIME_EVENT_NAME, handler);
    }
    if (channel && isSupabaseConfigured()) {
      try {
        supabase.removeChannel(channel);
      } catch (e) {
        // ignore cleanup error
      }
    }
  };
}
