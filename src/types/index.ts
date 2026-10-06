// CareConnect 360 - TypeScript Definitions

export type UserRole = 'elderly' | 'caregiver';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  age?: number;
  phone?: string;
  preferred_hospital?: string;
  ambulance_contact?: string;
  reminder_sound?: boolean;
  reminder_grace_period?: number; // minutes
  created_at: string;
  updated_at: string;
}

export type MedicineStatus = 'SCHEDULED' | 'DUE' | 'TAKEN' | 'SNOOZED' | 'MISSED';

export interface Medicine {
  id: string;
  user_id: string;
  name: string;
  dosage: string;
  scheduled_time: string; // e.g., "08:00 AM"
  frequency: string; // e.g., "Once Daily", "Twice Daily"
  start_date: string;
  end_date?: string;
  notes?: string;
  status: MedicineStatus;
  snoozed_until?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MedicineLog {
  id: string;
  medicine_id: string;
  medicine_name?: string;
  user_id: string;
  scheduled_time: string;
  actual_time: string;
  status: 'TAKEN' | 'SNOOZED' | 'MISSED';
  notes?: string;
  created_at: string;
}

export type AppointmentStatus = 'UPCOMING' | 'TODAY' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: string;
  user_id: string;
  doctor_name: string;
  specialty: string;
  hospital_clinic: string;
  doctor_image?: string;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // HH:mm or "10:30 AM"
  reason: string;
  notes?: string;
  status: AppointmentStatus;
  consultation_link?: string;
  created_at: string;
  updated_at: string;
}

export type HealthParameter = 
  | 'heart_rate' 
  | 'blood_pressure' 
  | 'spo2' 
  | 'temperature' 
  | 'blood_sugar' 
  | 'weight';

export type HealthStatus = 'NORMAL' | 'ATTENTION' | 'NEEDS REVIEW';

export interface HealthReading {
  id: string;
  user_id: string;
  parameter: HealthParameter;
  value: number;
  systolic?: number;
  diastolic?: number;
  unit: string;
  status: HealthStatus;
  note?: string;
  timestamp: string;
  created_at: string;
}

export type NotificationType = 
  | 'MEDICINE_DUE' 
  | 'MEDICINE_MISSED' 
  | 'APPOINTMENT' 
  | 'HEALTH_UPDATE' 
  | 'EMERGENCY';

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  phone: string;
  is_primary?: boolean;
  created_at: string;
  updated_at: string;
}

export type EmergencyStatus = 'TRIGGERED' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface EmergencyEvent {
  id: string;
  user_id: string;
  elderly_name?: string;
  timestamp: string;
  status: EmergencyStatus;
  notes?: string;
  location?: string;
  caregiver_notified: boolean;
  created_at: string;
}

export interface CaregiverRelationship {
  id: string;
  elderly_id: string;
  caregiver_id: string;
  elderly_name?: string;
  relationship_type: string;
  status: 'ACTIVE' | 'PENDING';
  created_at: string;
}

export interface CaregiverActivity {
  id: string;
  user_id: string;
  elderly_name: string;
  message: string;
  type: 'medicine' | 'health' | 'appointment' | 'emergency';
  timestamp: string;
}
