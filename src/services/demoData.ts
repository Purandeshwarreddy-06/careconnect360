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

export const DEMO_ELDERLY_USER: UserProfile = {
  id: 'usr-lakshmi-devi-01',
  email: 'lakshmi@careconnect360.demo',
  full_name: 'Lakshmi Devi',
  role: 'elderly',
  age: 74,
  phone: '+91 98765 43210',
  preferred_hospital: 'Apollo Heart & Vascular Institute, Greams Road',
  ambulance_contact: '108',
  reminder_sound: true,
  reminder_grace_period: 15,
  created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEMO_CAREGIVER_USER: UserProfile = {
  id: 'usr-rohan-caregiver-02',
  email: 'rohan@careconnect360.demo',
  full_name: 'Rohan Verma',
  role: 'caregiver',
  age: 46,
  phone: '+91 98765 88990',
  preferred_hospital: 'Apollo Heart & Vascular Institute',
  ambulance_contact: '108',
  reminder_sound: true,
  reminder_grace_period: 15,
  created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  updated_at: new Date().toISOString(),
};

export const getInitialMedicines = (): Medicine[] => [
  {
    id: 'med-amlodipine-01',
    user_id: DEMO_ELDERLY_USER.id,
    name: 'Amlodipine 5 mg',
    dosage: '1 Tablet (Morning)',
    scheduled_time: '08:00 AM',
    frequency: 'Once Daily',
    start_date: new Date(Date.now() - 60 * 86400000).toISOString().split('T')[0],
    notes: 'Prescribed for hypertension. Take with water after breakfast.',
    status: 'DUE',
    snoozed_until: null,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'med-metformin-02',
    user_id: DEMO_ELDERLY_USER.id,
    name: 'Metformin 500 mg',
    dosage: '1 Tablet (After Lunch)',
    scheduled_time: '01:30 PM',
    frequency: 'Twice Daily',
    start_date: new Date(Date.now() - 45 * 86400000).toISOString().split('T')[0],
    notes: 'Prescribed for blood glucose control. Do not skip meal.',
    status: 'SCHEDULED',
    snoozed_until: null,
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'med-vitamin-d-03',
    user_id: DEMO_ELDERLY_USER.id,
    name: 'Vitamin D3 60,000 IU',
    dosage: '1 Capsule (Weekly)',
    scheduled_time: '08:00 PM',
    frequency: 'Once Weekly',
    start_date: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
    notes: 'Bone strength supplement. Take after light dinner.',
    status: 'SCHEDULED',
    snoozed_until: null,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'med-atorvastatin-04',
    user_id: DEMO_ELDERLY_USER.id,
    name: 'Atorvastatin 10 mg',
    dosage: '1 Tablet (Bedtime)',
    scheduled_time: '09:30 PM',
    frequency: 'Once Daily',
    start_date: new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0],
    notes: 'Cholesterol regulation. Take before sleep.',
    status: 'SCHEDULED',
    snoozed_until: null,
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const getInitialAppointments = (): Appointment[] => {
  const todayStr = new Date().toISOString().split('T')[0];
  const futureDate = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
  const pastDate = new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0];

  return [
    {
      id: 'apt-dr-ananya-01',
      user_id: DEMO_ELDERLY_USER.id,
      doctor_name: 'Dr. Ananya Rao',
      specialty: 'Senior Cardiologist, MD FACC',
      hospital_clinic: 'Apollo Heart & Vascular Institute',
      doctor_image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80',
      appointment_date: todayStr,
      appointment_time: '04:00 PM',
      reason: 'Hypertension & ECG Follow-up Review',
      notes: 'Review recent blood pressure logs and adjust dosage if required.',
      status: 'TODAY',
      consultation_link: '/consultation/apt-dr-ananya-01',
      created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'apt-dr-vikram-02',
      user_id: DEMO_ELDERLY_USER.id,
      doctor_name: 'Dr. Vikram Mehta',
      specialty: 'Endocrinologist & Diabetologist',
      hospital_clinic: 'Metropolitan Diabetes Clinic',
      doctor_image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80',
      appointment_date: futureDate,
      appointment_time: '11:30 AM',
      reason: 'Quarterly HbA1c & Fasting Glucose Evaluation',
      notes: 'Fasting blood test report from past weekend will be evaluated.',
      status: 'UPCOMING',
      consultation_link: '/consultation/apt-dr-vikram-02',
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'apt-dr-suresh-03',
      user_id: DEMO_ELDERLY_USER.id,
      doctor_name: 'Dr. Suresh Nair',
      specialty: 'Ophthalmologist',
      hospital_clinic: 'Vision Care Eye Institute',
      doctor_image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300&q=80',
      appointment_date: pastDate,
      appointment_time: '10:00 AM',
      reason: 'Annual Glaucoma & Retinal Screening',
      notes: 'Visual acuity normal. Prescribed lubricated eye drops.',
      status: 'COMPLETED',
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    }
  ];
};

export const getInitialHealthReadings = (): HealthReading[] => {
  const readings: HealthReading[] = [];
  const now = Date.now();

  // Helper to add reading
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
      user_id: DEMO_ELDERLY_USER.id,
      parameter,
      value,
      systolic,
      diastolic,
      unit,
      status,
      note,
      timestamp: new Date(now - hoursAgo * 3600000).toISOString(),
      created_at: new Date(now - hoursAgo * 3600000).toISOString(),
    });
  };

  // Heart Rate data points (24H, 7D, 30D)
  add('heart_rate', 72, 'bpm', 'NORMAL', 1, 'Resting pulse after breakfast');
  add('heart_rate', 76, 'bpm', 'NORMAL', 5, 'Midday resting');
  add('heart_rate', 70, 'bpm', 'NORMAL', 12, 'Morning baseline');
  add('heart_rate', 74, 'bpm', 'NORMAL', 24, 'Recorded yesterday');
  add('heart_rate', 78, 'bpm', 'NORMAL', 48, 'Post evening stroll');
  add('heart_rate', 71, 'bpm', 'NORMAL', 96, 'Normal sinus rhythm');
  add('heart_rate', 75, 'bpm', 'NORMAL', 168, 'Weekly check');
  add('heart_rate', 73, 'bpm', 'NORMAL', 360, 'Monthly review');

  // Blood Pressure data points
  add('blood_pressure', 128, 'mmHg', 'ATTENTION', 1.5, 'Morning reading sitting calmly', 128, 82);
  add('blood_pressure', 132, 'mmHg', 'ATTENTION', 14, 'Evening reading', 132, 84);
  add('blood_pressure', 126, 'mmHg', 'NORMAL', 26, 'Post medicine baseline', 126, 80);
  add('blood_pressure', 134, 'mmHg', 'ATTENTION', 50, 'Slightly elevated after walk', 134, 85);
  add('blood_pressure', 124, 'mmHg', 'NORMAL', 98, 'Optimal morning pressure', 124, 78);
  add('blood_pressure', 130, 'mmHg', 'ATTENTION', 170, 'Past week routine', 130, 82);
  add('blood_pressure', 128, 'mmHg', 'ATTENTION', 365, 'Monthly benchmark', 128, 80);

  // SpO2 data points
  add('spo2', 98, '%', 'NORMAL', 2, 'Room air oxygen saturation');
  add('spo2', 97, '%', 'NORMAL', 8, 'Afternoon pulse oximetry');
  add('spo2', 99, '%', 'NORMAL', 24, 'Deep breathing exercise');
  add('spo2', 98, '%', 'NORMAL', 72, 'Normal pulmonary function');
  add('spo2', 98, '%', 'NORMAL', 168, 'Consistent stable reading');
  add('spo2', 97, '%', 'NORMAL', 350, 'Baseline healthy reading');

  // Temperature data points
  add('temperature', 98.4, '°F', 'NORMAL', 2.5, 'Normal body temperature');
  add('temperature', 98.6, '°F', 'NORMAL', 16, 'Normal oral reading');
  add('temperature', 98.2, '°F', 'NORMAL', 40, 'Morning check');
  add('temperature', 98.4, '°F', 'NORMAL', 120, 'Normal temperature');
  add('temperature', 98.5, '°F', 'NORMAL', 200, 'Baseline recorded');

  // Blood Sugar data points
  add('blood_sugar', 132, 'mg/dL', 'ATTENTION', 3, 'Post-breakfast (2 hr postprandial)');
  add('blood_sugar', 104, 'mg/dL', 'NORMAL', 14, 'Fasting blood sugar morning');
  add('blood_sugar', 142, 'mg/dL', 'ATTENTION', 28, 'Post-lunch glucose reading');
  add('blood_sugar', 110, 'mg/dL', 'NORMAL', 60, 'Fasting baseline');
  add('blood_sugar', 138, 'mg/dL', 'ATTENTION', 140, 'Post-meal glucose check');
  add('blood_sugar', 108, 'mg/dL', 'NORMAL', 250, 'Fasting optimal reading');

  // Weight data points
  add('weight', 64.5, 'kg', 'NORMAL', 4, 'Morning weigh-in without footwear');
  add('weight', 64.6, 'kg', 'NORMAL', 48, 'Consistent body mass');
  add('weight', 64.4, 'kg', 'NORMAL', 120, 'Stable weight trend');
  add('weight', 64.8, 'kg', 'NORMAL', 240, 'Weekly maintenance weight');
  add('weight', 65.0, 'kg', 'NORMAL', 450, 'Monthly review weight');

  return readings;
};

export const getInitialMedicineLogs = (): MedicineLog[] => [
  {
    id: 'log-01',
    medicine_id: 'med-atorvastatin-04',
    medicine_name: 'Atorvastatin 10 mg',
    user_id: DEMO_ELDERLY_USER.id,
    scheduled_time: '09:30 PM',
    actual_time: new Date(Date.now() - 25 * 3600000).toISOString(),
    status: 'TAKEN',
    notes: 'Taken on schedule with water.',
    created_at: new Date(Date.now() - 25 * 3600000).toISOString(),
  },
  {
    id: 'log-02',
    medicine_id: 'med-metformin-02',
    medicine_name: 'Metformin 500 mg',
    user_id: DEMO_ELDERLY_USER.id,
    scheduled_time: '01:30 PM',
    actual_time: new Date(Date.now() - 33 * 3600000).toISOString(),
    status: 'TAKEN',
    notes: 'Taken right after lunch.',
    created_at: new Date(Date.now() - 33 * 3600000).toISOString(),
  },
  {
    id: 'log-03',
    medicine_id: 'med-amlodipine-01',
    medicine_name: 'Amlodipine 5 mg',
    user_id: DEMO_ELDERLY_USER.id,
    scheduled_time: '08:00 AM',
    actual_time: new Date(Date.now() - 38 * 3600000).toISOString(),
    status: 'TAKEN',
    notes: 'Morning dose completed.',
    created_at: new Date(Date.now() - 38 * 3600000).toISOString(),
  }
];

export const getInitialNotifications = (): NotificationItem[] => [
  {
    id: 'notif-01',
    user_id: DEMO_ELDERLY_USER.id,
    title: 'Medicine Due: Amlodipine 5 mg',
    message: 'Your morning blood pressure medicine (Amlodipine 5 mg) is scheduled for 08:00 AM.',
    type: 'MEDICINE_DUE',
    is_read: false,
    created_at: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: 'notif-02',
    user_id: DEMO_ELDERLY_USER.id,
    title: 'Consultation Today: Dr. Ananya Rao',
    message: 'Virtual follow-up appointment is scheduled for 04:00 PM today.',
    type: 'APPOINTMENT',
    is_read: false,
    created_at: new Date(Date.now() - 120 * 60000).toISOString(),
  },
  {
    id: 'notif-03',
    user_id: DEMO_ELDERLY_USER.id,
    title: 'Health Log Synced',
    message: 'Blood Pressure (128/82 mmHg) recorded and updated on family care feed.',
    type: 'HEALTH_UPDATE',
    is_read: true,
    created_at: new Date(Date.now() - 240 * 60000).toISOString(),
  }
];

export const getInitialEmergencyContacts = (): EmergencyContact[] => [
  {
    id: 'emc-01',
    user_id: DEMO_ELDERLY_USER.id,
    name: 'Rohan Verma',
    relationship: 'Son (Primary Caregiver)',
    phone: '+919876588990',
    is_primary: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'emc-02',
    user_id: DEMO_ELDERLY_USER.id,
    name: 'Dr. Ananya Rao',
    relationship: 'Family Cardiologist',
    phone: '+919876511223',
    is_primary: false,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'emc-03',
    user_id: DEMO_ELDERLY_USER.id,
    name: 'Apollo Hospital Emergency Desk',
    relationship: 'Preferred Emergency Care',
    phone: '108',
    is_primary: false,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const getInitialEmergencyEvents = (): EmergencyEvent[] => [
  {
    id: 'eme-01',
    user_id: DEMO_ELDERLY_USER.id,
    elderly_name: 'Lakshmi Devi',
    timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
    status: 'RESOLVED',
    notes: 'Routine test drill initiated from home command center. Contacted Rohan Verma. Confirmed safe.',
    location: 'Living Room - 42 Heritage Gardens',
    caregiver_notified: true,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  }
];

export const getInitialCaregiverRelationships = (): CaregiverRelationship[] => [
  {
    id: 'cgr-01',
    elderly_id: DEMO_ELDERLY_USER.id,
    caregiver_id: DEMO_CAREGIVER_USER.id,
    elderly_name: 'Lakshmi Devi',
    relationship_type: 'Son & Primary Caregiver',
    status: 'ACTIVE',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  }
];

export const getInitialCaregiverActivity = (): CaregiverActivity[] => [
  {
    id: 'act-01',
    user_id: DEMO_ELDERLY_USER.id,
    elderly_name: 'Lakshmi Devi',
    message: 'Blood Pressure 128/82 mmHg recorded this morning.',
    type: 'health',
    timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
  },
  {
    id: 'act-02',
    user_id: DEMO_ELDERLY_USER.id,
    elderly_name: 'Lakshmi Devi',
    message: 'Scheduled consultation with Dr. Ananya Rao for 04:00 PM today.',
    type: 'appointment',
    timestamp: new Date(Date.now() - 150 * 60000).toISOString(),
  },
  {
    id: 'act-03',
    user_id: DEMO_ELDERLY_USER.id,
    elderly_name: 'Lakshmi Devi',
    message: 'Took Atorvastatin 10 mg yesterday night.',
    type: 'medicine',
    timestamp: new Date(Date.now() - 25 * 3600000).toISOString(),
  }
];
