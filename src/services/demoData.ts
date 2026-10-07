import { 
  UserProfile, 
  Medicine, 
  MedicineLog, 
  Appointment, 
  HealthReading, 
  NotificationItem, 
  EmergencyContact, 
  EmergencyEvent, 
  CaregiverRelationship, 
  CaregiverActivity 
} from '@/types';

// Default Demo Patient (Requested: Rahul Kumar, Age 45, Male)
export const DEMO_PATIENT: UserProfile = {
  id: 'usr-rahul-kumar-demo',
  email: 'rahul.kumar@careconnect360.demo',
  full_name: 'Rahul Kumar',
  role: 'elderly', // Primary patient view
  age: 45,
  gender: 'Male',
  phone: '+91 98765 12340',
  preferred_hospital: 'Apollo Heart & Vascular Institute',
  ambulance_contact: '108',
  reminder_sound: true,
  reminder_grace_period: 15,
  is_demo: true,
  created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  updated_at: new Date().toISOString(),
};

// Backwards compatibility alias for existing code
export const DEMO_ELDERLY_USER: UserProfile = DEMO_PATIENT;

export const DEMO_CAREGIVER_USER: UserProfile = {
  id: 'usr-rohan-caregiver-02',
  email: 'rohan@careconnect360.demo',
  full_name: 'Rohan Verma',
  role: 'caregiver',
  age: 46,
  gender: 'Male',
  phone: '+91 98765 88990',
  preferred_hospital: 'Apollo Heart & Vascular Institute',
  ambulance_contact: '108',
  reminder_sound: true,
  reminder_grace_period: 15,
  is_demo: true,
  created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  updated_at: new Date().toISOString(),
};

// Default Demo Medication Records
// 1. Paracetamol — 500 mg — "As prescribed" — Purpose: Fever/Pain
// 2. Cetirizine — 10 mg — "As prescribed" — Purpose: Allergy symptoms
// 3. ORS — 1 sachet — "As directed" — Purpose: Rehydration
// 4. Vitamin D3 — "As prescribed" — Purpose: Supplement record
export const getInitialMedicines = (userId: string = DEMO_PATIENT.id): Medicine[] => [
  {
    id: 'med-paracetamol-01',
    user_id: userId,
    name: 'Paracetamol',
    dosage: '500 mg',
    scheduled_time: '08:00 AM',
    frequency: 'As prescribed',
    start_date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
    notes: 'Demo Medication Data — Not a Prescription. Take after light food if needed for fever or pain.',
    purpose: 'Fever/Pain',
    is_demo: true,
    status: 'SCHEDULED',
    snoozed_until: null,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'med-cetirizine-02',
    user_id: userId,
    name: 'Cetirizine',
    dosage: '10 mg',
    scheduled_time: '01:30 PM',
    frequency: 'As prescribed',
    start_date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
    notes: 'Demo Medication Data — Not a Prescription. Take with water for seasonal allergy symptoms.',
    purpose: 'Allergy symptoms',
    is_demo: true,
    status: 'SCHEDULED',
    snoozed_until: null,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'med-ors-03',
    user_id: userId,
    name: 'ORS',
    dosage: '1 sachet',
    scheduled_time: '05:00 PM',
    frequency: 'As directed',
    start_date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    notes: 'Demo Medication Data — Not a Prescription. Dissolve 1 sachet in 1 liter clean drinking water for electrolyte rehydration.',
    purpose: 'Rehydration',
    is_demo: true,
    status: 'SCHEDULED',
    snoozed_until: null,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'med-vitamind3-04',
    user_id: userId,
    name: 'Vitamin D3',
    dosage: '60,000 IU',
    scheduled_time: '08:00 PM',
    frequency: 'As prescribed',
    start_date: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
    notes: 'Demo Medication Data — Not a Prescription. Weekly bone strength and immunity supplement record.',
    purpose: 'Supplement record',
    is_demo: true,
    status: 'SCHEDULED',
    snoozed_until: null,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Default Demo Health Parameters
// Blood Pressure: 120/80 mmHg | Heart Rate: 72 bpm | SpO2: 98% | Temperature: 36.8 °C
// Blood Glucose: 95 mg/dL | Weight: 68 kg | Height: 170 cm | BMI: 23.5 | Resp Rate: 16/min
export const getInitialHealthReadings = (userId: string = DEMO_PATIENT.id): HealthReading[] => {
  const readings: HealthReading[] = [];
  const now = Date.now();

  const add = (
    parameter: HealthReading['parameter'],
    value: number,
    unit: string,
    status: HealthReading['status'],
    hoursAgo: number,
    note?: string,
    systolic?: number,
    diastolic?: number
  ) => {
    readings.push({
      id: `hr-${parameter}-${Math.round(hoursAgo * 100)}`,
      user_id: userId,
      parameter,
      value,
      systolic,
      diastolic,
      unit,
      status,
      note: note || 'Demo Data — Sample health reading',
      is_demo: true,
      timestamp: new Date(now - hoursAgo * 3600000).toISOString(),
      created_at: new Date(now - hoursAgo * 3600000).toISOString(),
    });
  };

  // 1. Blood Pressure: 120/80 mmHg
  add('blood_pressure', 120, 'mmHg', 'NORMAL', 1, 'Demo Data — Resting baseline reading', 120, 80);
  add('blood_pressure', 118, 'mmHg', 'NORMAL', 14, 'Demo Data — Evening resting check', 118, 78);
  add('blood_pressure', 122, 'mmHg', 'NORMAL', 26, 'Demo Data — Midday check', 122, 82);
  add('blood_pressure', 120, 'mmHg', 'NORMAL', 50, 'Demo Data — Normal baseline measurement', 120, 80);
  add('blood_pressure', 119, 'mmHg', 'NORMAL', 98, 'Demo Data — Optimal blood pressure', 119, 79);
  add('blood_pressure', 121, 'mmHg', 'NORMAL', 170, 'Demo Data — Weekly routine check', 121, 80);
  add('blood_pressure', 120, 'mmHg', 'NORMAL', 360, 'Demo Data — Monthly benchmark reading', 120, 80);

  // 2. Heart Rate: 72 bpm
  add('heart_rate', 72, 'bpm', 'NORMAL', 1, 'Demo Data — Resting pulse normal');
  add('heart_rate', 74, 'bpm', 'NORMAL', 6, 'Demo Data — Midday observation');
  add('heart_rate', 70, 'bpm', 'NORMAL', 14, 'Demo Data — Resting morning pulse');
  add('heart_rate', 72, 'bpm', 'NORMAL', 24, 'Demo Data — Recorded baseline');
  add('heart_rate', 75, 'bpm', 'NORMAL', 48, 'Demo Data — Mild activity check');
  add('heart_rate', 72, 'bpm', 'NORMAL', 168, 'Demo Data — Weekly check');
  add('heart_rate', 71, 'bpm', 'NORMAL', 350, 'Demo Data — Monthly average');

  // 3. SpO2: 98%
  add('spo2', 98, '%', 'NORMAL', 1.5, 'Demo Data — Room air oxygen saturation');
  add('spo2', 97, '%', 'NORMAL', 8, 'Demo Data — Afternoon pulse oximetry');
  add('spo2', 99, '%', 'NORMAL', 24, 'Demo Data — Deep breathing exercise');
  add('spo2', 98, '%', 'NORMAL', 72, 'Demo Data — Normal oxygenation');
  add('spo2', 98, '%', 'NORMAL', 168, 'Demo Data — Consistent stable oxygen level');

  // 4. Temperature: 36.8 °C
  add('temperature', 36.8, '°C', 'NORMAL', 2, 'Demo Data — Normal body temperature');
  add('temperature', 36.7, '°C', 'NORMAL', 12, 'Demo Data — Morning oral check');
  add('temperature', 36.8, '°C', 'NORMAL', 36, 'Demo Data — Routine check');
  add('temperature', 36.9, '°C', 'NORMAL', 90, 'Demo Data — Midday baseline');
  add('temperature', 36.8, '°C', 'NORMAL', 168, 'Demo Data — Weekly recorded reading');

  // 5. Blood Glucose: 95 mg/dL
  add('blood_sugar', 95, 'mg/dL', 'NORMAL', 2.5, 'Demo Data — Fasting blood glucose optimal');
  add('blood_sugar', 92, 'mg/dL', 'NORMAL', 14, 'Demo Data — Pre-meal check');
  add('blood_sugar', 98, 'mg/dL', 'NORMAL', 28, 'Demo Data — Post-meal glucose observation');
  add('blood_sugar', 94, 'mg/dL', 'NORMAL', 72, 'Demo Data — Morning fasting check');
  add('blood_sugar', 95, 'mg/dL', 'NORMAL', 168, 'Demo Data — Stable glycemic control');

  // 6. Weight: 68 kg
  add('weight', 68, 'kg', 'NORMAL', 3, 'Demo Data — Morning weigh-in');
  add('weight', 68.1, 'kg', 'NORMAL', 48, 'Demo Data — Consistent body mass');
  add('weight', 68.0, 'kg', 'NORMAL', 120, 'Demo Data — Stable weight trend');
  add('weight', 68.2, 'kg', 'NORMAL', 240, 'Demo Data — Weekly maintenance weight');

  // 7. Height: 170 cm
  add('height', 170, 'cm', 'NORMAL', 4, 'Demo Data — Measured adult height');
  add('height', 170, 'cm', 'NORMAL', 720, 'Demo Data — Standing stadiometer record');

  // 8. BMI: 23.5 kg/m²
  add('bmi', 23.5, 'kg/m²', 'NORMAL', 4, 'Demo Data — Healthy adult BMI range (18.5 - 24.9)');
  add('bmi', 23.5, 'kg/m²', 'NORMAL', 720, 'Demo Data — Stable healthy body mass index');

  // 9. Respiratory Rate: 16/min
  add('respiratory_rate', 16, '/min', 'NORMAL', 2, 'Demo Data — Normal resting respiration');
  add('respiratory_rate', 15, '/min', 'NORMAL', 14, 'Demo Data — Calm resting breathing');
  add('respiratory_rate', 16, '/min', 'NORMAL', 36, 'Demo Data — Normal eupnea rate');
  add('respiratory_rate', 17, '/min', 'NORMAL', 96, 'Demo Data — Baseline respiratory check');
  add('respiratory_rate', 16, '/min', 'NORMAL', 168, 'Demo Data — Consistent respiratory rhythm');

  return readings;
};

export const getInitialAppointments = (userId: string = DEMO_PATIENT.id): Appointment[] => {
  const todayStr = new Date().toISOString().split('T')[0];
  const futureDate = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
  const pastDate = new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0];

  return [
    {
      id: 'apt-dr-ananya-01',
      user_id: userId,
      doctor_name: 'Dr. Ananya Rao',
      specialty: 'Senior Physician & Cardiologist, MD',
      hospital_clinic: 'City Multispeciality Hospital',
      doctor_image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80',
      appointment_date: todayStr,
      appointment_time: '04:00 PM',
      reason: 'Routine Health Review & Vitals Check',
      notes: 'Sample Consultation • Annual wellness assessment and baseline check.',
      status: 'TODAY',
      consultation_link: '/consultation/apt-dr-ananya-01',
      created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'apt-dr-vikram-02',
      user_id: userId,
      doctor_name: 'Dr. Vikram Mehta',
      specialty: 'Consultant Diabetologist & Endocrinologist',
      hospital_clinic: 'Metropolitan Health Clinic',
      doctor_image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80',
      appointment_date: futureDate,
      appointment_time: '11:30 AM',
      reason: 'Metabolic & Glycemic Profile Evaluation',
      notes: 'Sample Appointment • Review blood glucose telemetry.',
      status: 'UPCOMING',
      consultation_link: '/consultation/apt-dr-vikram-02',
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'apt-dr-suresh-03',
      user_id: userId,
      doctor_name: 'Dr. Suresh Nair',
      specialty: 'Ophthalmologist',
      hospital_clinic: 'Vision Care Eye Institute',
      doctor_image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300&q=80',
      appointment_date: pastDate,
      appointment_time: '10:00 AM',
      reason: 'Annual Eye Screening',
      notes: 'Sample completed checkup.',
      status: 'COMPLETED',
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    }
  ];
};

export const getInitialMedicineLogs = (userId: string = DEMO_PATIENT.id): MedicineLog[] => [
  {
    id: 'log-01',
    medicine_id: 'med-paracetamol-01',
    medicine_name: 'Paracetamol 500 mg',
    user_id: userId,
    scheduled_time: '08:00 AM',
    actual_time: new Date(Date.now() - 25 * 3600000).toISOString(),
    status: 'TAKEN',
    notes: 'Demo log • Dose recorded as prescribed.',
    created_at: new Date(Date.now() - 25 * 3600000).toISOString(),
  },
  {
    id: 'log-02',
    medicine_id: 'med-ors-03',
    medicine_name: 'ORS (1 sachet)',
    user_id: userId,
    scheduled_time: '05:00 PM',
    actual_time: new Date(Date.now() - 33 * 3600000).toISOString(),
    status: 'TAKEN',
    notes: 'Demo log • Hydration sachet mixed with water.',
    created_at: new Date(Date.now() - 33 * 3600000).toISOString(),
  }
];

export const getInitialNotifications = (userId: string = DEMO_PATIENT.id): NotificationItem[] => [
  {
    id: 'notif-01',
    user_id: userId,
    title: 'Demo Reminder: Paracetamol 500 mg',
    message: 'Sample demo medication record scheduled for 08:00 AM (Not a real prescription).',
    type: 'MEDICINE_DUE',
    is_read: false,
    created_at: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: 'notif-02',
    user_id: userId,
    title: 'Consultation Today: Dr. Ananya Rao',
    message: 'Routine health review appointment is scheduled for 04:00 PM today.',
    type: 'APPOINTMENT',
    is_read: false,
    created_at: new Date(Date.now() - 120 * 60000).toISOString(),
  },
  {
    id: 'notif-03',
    user_id: userId,
    title: 'Health Log Synced: Vitals Normal',
    message: 'Blood Pressure 120/80 mmHg and Heart Rate 72 bpm recorded on telemetry.',
    type: 'HEALTH_UPDATE',
    is_read: true,
    created_at: new Date(Date.now() - 240 * 60000).toISOString(),
  }
];

export const getInitialEmergencyContacts = (userId: string = DEMO_PATIENT.id): EmergencyContact[] => [
  {
    id: 'emc-01',
    user_id: userId,
    name: 'Rohan Verma',
    relationship: 'Family Member & Caregiver',
    phone: '+919876588990',
    is_primary: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'emc-02',
    user_id: userId,
    name: 'Dr. Ananya Rao',
    relationship: 'Consulting Physician',
    phone: '+919876511223',
    is_primary: false,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'emc-03',
    user_id: userId,
    name: 'Apollo Hospital Emergency Line',
    relationship: 'Designated Medical Emergency Desk',
    phone: '108',
    is_primary: false,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const getInitialEmergencyEvents = (userId: string = DEMO_PATIENT.id): EmergencyEvent[] => [
  {
    id: 'eme-01',
    user_id: userId,
    elderly_name: DEMO_PATIENT.full_name,
    timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
    status: 'RESOLVED',
    notes: 'Demo test drill initiated from command center. Contacted caregiver. Confirmed safe.',
    location: 'Home - 42 Heritage Gardens',
    caregiver_notified: true,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  }
];

export const getInitialCaregiverRelationships = (): CaregiverRelationship[] => [
  {
    id: 'cgr-01',
    elderly_id: DEMO_PATIENT.id,
    caregiver_id: DEMO_CAREGIVER_USER.id,
    elderly_name: DEMO_PATIENT.full_name,
    relationship_type: 'Family Caregiver',
    status: 'ACTIVE',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  }
];

export const getInitialCaregiverActivity = (): CaregiverActivity[] => [
  {
    id: 'act-01',
    user_id: DEMO_PATIENT.id,
    elderly_name: DEMO_PATIENT.full_name,
    message: 'Blood Pressure 120/80 mmHg recorded (Normal baseline).',
    type: 'health',
    timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
  },
  {
    id: 'act-02',
    user_id: DEMO_PATIENT.id,
    elderly_name: DEMO_PATIENT.full_name,
    message: 'Consultation scheduled with Dr. Ananya Rao for 04:00 PM today.',
    type: 'appointment',
    timestamp: new Date(Date.now() - 150 * 60000).toISOString(),
  },
  {
    id: 'act-03',
    user_id: DEMO_PATIENT.id,
    elderly_name: DEMO_PATIENT.full_name,
    message: 'Logged sample dose of Paracetamol 500 mg.',
    type: 'medicine',
    timestamp: new Date(Date.now() - 25 * 3600000).toISOString(),
  }
];
