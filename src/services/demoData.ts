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

// Default Demo Health Parameters - Exactly 7 days of historical readings (Oct 1 - Oct 7)
export const getInitialHealthReadings = (userId: string = DEMO_PATIENT.id): HealthReading[] => {
  const readings: HealthReading[] = [];
  const now = Date.now();

  // 7 days of timestamps ending at current time (hours ago relative to now):
  // Day 1 (Oct 1): 144h ago (6 days)
  // Day 2 (Oct 2): 120h ago (5 days)
  // Day 3 (Oct 3): 96h ago (4 days)
  // Day 4 (Oct 4): 72h ago (3 days)
  // Day 5 (Oct 5): 48h ago (2 days)
  // Day 6 (Oct 6): 20h ago (~1 day / yesterday - falls inside 24H)
  // Day 7 (Oct 7): 2h ago (~today / latest - falls inside 24H)
  const hoursAgoList = [144, 120, 96, 72, 48, 20, 2];

  const add = (
    parameter: HealthReading['parameter'],
    value: number,
    unit: string,
    status: HealthReading['status'],
    hoursAgo: number,
    note?: string,
    systolic?: number,
    diastolic?: number,
    index?: number
  ) => {
    readings.push({
      id: `hr-${parameter}-${index !== undefined ? index : Math.round(hoursAgo * 10)}`,
      user_id: userId,
      parameter,
      value,
      systolic,
      diastolic,
      unit,
      status,
      note: note || 'DEMO DATA — Not a medical record',
      is_demo: true,
      timestamp: new Date(now - hoursAgo * 3600000).toISOString(),
      created_at: new Date(now - hoursAgo * 3600000).toISOString(),
    });
  };

  // 1. BLOOD PRESSURE:
  // Oct 1: 118/78, Oct 2: 120/80, Oct 3: 119/79, Oct 4: 121/81, Oct 5: 120/80, Oct 6: 122/80, Oct 7: 120/80
  const bpData = [
    { sys: 118, dia: 78 },
    { sys: 120, dia: 80 },
    { sys: 119, dia: 79 },
    { sys: 121, dia: 81 },
    { sys: 120, dia: 80 },
    { sys: 122, dia: 80 },
    { sys: 120, dia: 80 },
  ];
  bpData.forEach((item, idx) => {
    add('blood_pressure', item.sys, 'mmHg', 'NORMAL', hoursAgoList[idx], 'DEMO DATA — Not a medical record', item.sys, item.dia, idx + 1);
  });

  // 2. HEART RATE:
  // Oct 1: 70 bpm, Oct 2: 72 bpm, Oct 3: 71 bpm, Oct 4: 73 bpm, Oct 5: 72 bpm, Oct 6: 74 bpm, Oct 7: 72 bpm
  const hrData = [70, 72, 71, 73, 72, 74, 72];
  hrData.forEach((val, idx) => {
    add('heart_rate', val, 'bpm', 'NORMAL', hoursAgoList[idx], 'DEMO DATA — Not a medical record', undefined, undefined, idx + 1);
  });

  // 3. SPO2:
  // Oct 1: 97%, Oct 2: 98%, Oct 3: 98%, Oct 4: 97%, Oct 5: 98%, Oct 6: 99%, Oct 7: 98%
  const spo2Data = [97, 98, 98, 97, 98, 99, 98];
  spo2Data.forEach((val, idx) => {
    add('spo2', val, '%', 'NORMAL', hoursAgoList[idx], 'DEMO DATA — Not a medical record', undefined, undefined, idx + 1);
  });

  // 4. TEMPERATURE:
  // Oct 1: 36.7 °C, Oct 2: 36.8 °C, Oct 3: 36.6 °C, Oct 4: 36.9 °C, Oct 5: 36.7 °C, Oct 6: 36.8 °C, Oct 7: 36.8 °C
  const tempData = [36.7, 36.8, 36.6, 36.9, 36.7, 36.8, 36.8];
  tempData.forEach((val, idx) => {
    add('temperature', val, '°C', 'NORMAL', hoursAgoList[idx], 'DEMO DATA — Not a medical record', undefined, undefined, idx + 1);
  });

  // 5. BLOOD SUGAR:
  // Oct 1: 92 mg/dL, Oct 2: 95 mg/dL, Oct 3: 94 mg/dL, Oct 4: 97 mg/dL, Oct 5: 93 mg/dL, Oct 6: 96 mg/dL, Oct 7: 95 mg/dL
  const sugarData = [92, 95, 94, 97, 93, 96, 95];
  sugarData.forEach((val, idx) => {
    add('blood_sugar', val, 'mg/dL', 'NORMAL', hoursAgoList[idx], 'DEMO DATA — Not a medical record', undefined, undefined, idx + 1);
  });

  // 6. WEIGHT:
  // Oct 1: 67.5 kg, Oct 2: 67.6 kg, Oct 3: 67.7 kg, Oct 4: 67.8 kg, Oct 5: 67.9 kg, Oct 6: 68.0 kg, Oct 7: 68.0 kg
  const weightData = [67.5, 67.6, 67.7, 67.8, 67.9, 68.0, 68.0];
  weightData.forEach((val, idx) => {
    add('weight', val, 'kg', 'NORMAL', hoursAgoList[idx], 'DEMO DATA — Not a medical record', undefined, undefined, idx + 1);
  });

  // 7. RESPIRATORY RATE:
  // Oct 1: 16/min, Oct 2: 16/min, Oct 3: 17/min, Oct 4: 16/min, Oct 5: 16/min, Oct 6: 15/min, Oct 7: 16/min
  const respData = [16, 16, 17, 16, 16, 15, 16];
  respData.forEach((val, idx) => {
    add('respiratory_rate', val, '/min', 'NORMAL', hoursAgoList[idx], 'DEMO DATA — Not a medical record', undefined, undefined, idx + 1);
  });

  // 8. HEIGHT: 170 cm
  const heightData = [170, 170, 170, 170, 170, 170, 170];
  heightData.forEach((val, idx) => {
    add('height', val, 'cm', 'NORMAL', hoursAgoList[idx], 'DEMO DATA — Not a medical record', undefined, undefined, idx + 1);
  });

  // 9. BMI: 23.5 kg/m²
  const bmiData = [23.5, 23.5, 23.5, 23.5, 23.5, 23.5, 23.5];
  bmiData.forEach((val, idx) => {
    add('bmi', val, 'kg/m²', 'NORMAL', hoursAgoList[idx], 'DEMO DATA — Not a medical record', undefined, undefined, idx + 1);
  });

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

export const getInitialCaregiverRelationships = (_userId?: string): CaregiverRelationship[] => [
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

export const getInitialCaregiverActivity = (_userId?: string): CaregiverActivity[] => [
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
