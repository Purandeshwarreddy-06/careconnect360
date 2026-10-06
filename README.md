# CARECONNECT 360

> **“Smarter care. Safer living.”**  
> *Theme: NIGHTCARE — Premium Dark Healthcare Command Center*

---

## 📌 Problem Statement: H10 — Elderly Healthcare Reminder Platform
**Domain: Healthcare & Hospitals**

Elderly individuals, particularly those managing chronic conditions such as hypertension, diabetes, and cardiovascular disorders, frequently experience challenges with medication adherence, inconsistent vital monitoring, timely doctor consultations, and rapid emergency escalation. Concurrently, adult family caregivers experience chronic anxiety and lack visibility into whether their loved ones took their prescribed medications or are experiencing health distress.

---

## 💡 Solution
**CARECONNECT 360** is a full-stack elderly healthcare platform and remote family caregiver command center. Designed with an ultra-accessible, high-contrast **NIGHTCARE** dark theme, it bridges seniors and their families through real-time telemetry, automated medication reminders, virtual doctor consultations, and instant emergency protocols.

---

## 🚀 Key Features

### 1. Unified Command Center Dashboard
- **Live Header**: Live clock, greeting customized to time of day, active status indicator, unread notifications badge, and instant role switcher.
- **Next Scheduled Medicine**: Prominent high-contrast card with real-time operational buttons:
  - `TAKEN`: Logs dose in Supabase, calculates adherence, triggers celebratory feedback, and syncs to caregiver.
  - `SNOOZE`: Delays reminder by 15 minutes.
  - `NOT TAKEN`: Flags missed dose, updates adherence, and notifies caregiver.
- **Live Health Status Telemetry**: Real-time cards for Heart Rate, Blood Pressure, SpO₂, Temperature, Blood Sugar, and Weight with non-diagnostic clinical trend indicators (`NORMAL`, `ATTENTION`, `NEEDS REVIEW`).
- **Interactive Recharts Analysis**: Multi-parameter trend chart with time filters (`24H`, `7D`, `30D`).
- **Today's Care Timeline**: Chronological care event stream reflecting real database events.
- **Upcoming Doctor Review**: Immediate preview with direct launcher for video consultation.
- **Prominent Emergency Action**: Emergency SOS workflow available at all times.

### 2. Complete Prescription & Intake Management (`/medicines`)
- Full CRUD: Add, edit, delete, and schedule medicines.
- Multi-parameter filtering: Filter by search keyword and prescription statuses (`SCHEDULED`, `DUE`, `TAKEN`, `SNOOZED`, `MISSED`).
- Detailed Intake History: Auditable log table recording actual dose intake timestamps and clinical notes.

### 3. Vital Tracking & Biometrics (`/health`)
- Track Blood Pressure (systolic & diastolic in mmHg), Blood Sugar (mg/dL), Heart Rate (bpm), Temperature (°F), SpO₂ (%), and Weight (kg).
- Telemetry trend charts and historical observation logs with one-click deletion and status tags.

### 4. Consultations & Telemedicine Demo (`/appointments` & `/consultation/:id`)
- Doctor appointment booking, status filters (`Today`, `Upcoming`, `Completed`), and mark-as-completed action.
- Interactive virtual consultation demo with functional camera toggle, microphone mute/unmute, speaker mute, chat drawer with live interactive messaging, and clean exit.

### 5. Family & Caregiver Oversight Portal (`/caregiver`)
- Dedicated command hub for adult children and clinical guardians.
- Live Realtime Activity Feed: Chronological stream of elderly patient actions.
- Escalation oversight: Instant notification when an elderly user triggers emergency SOS or misses critical medication, with `Acknowledge` and `Mark Resolved` buttons.

### 6. Notifications Center (`/notifications`)
- Real-time notification feed with categories: Medicine Due, Medicine Missed, Doctor Consultation, Health Log, Emergency SOS.
- Unread count badge, mark as read, and mark all as read.

### 7. Patient Profile & Emergency Speed Dial (`/profile`)
- Customizable patient parameters: name, age, primary phone, preferred hospital facility, and designated ambulance hotline.
- Managed emergency contacts directory with direct `tel:` speed dial support.

### 8. Preferences & Settings (`/settings`)
- Functional audio chime toggles, escalation grace period selector (10m, 15m, 20m, 30m), auto-snooze protocol, and one-click demo data re-seeder.

---

## 🛠 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite |
| **Styling** | Tailwind CSS v4, Lucide React, Glassmorphism UI |
| **Data Viz** | Recharts (Responsive Area & Line Charts) |
| **Routing** | React Router 7 (Protected & Public guards) |
| **Backend & DB** | Supabase (PostgreSQL, Row Level Security, Realtime WebSockets) |
| **Persistence** | Supabase DB with synchronized local fallback cache |

---

## 🏛 System Architecture

```
                    CARECONNECT 360
                          │
         ┌────────────────┴────────────────┐
         ▼                                 ▼
   Elderly User                     Family Caregiver
   (Lakshmi Devi, 74)              (Rohan Verma, Son)
         │                                 │
         └────────────────┬────────────────┘
                          ▼
             React + TypeScript Frontend
     (Vite • Tailwind CSS • Lucide • Recharts)
                          │
             ┌────────────┴────────────┐
             ▼                         ▼
     Supabase Auth             Supabase Database
   (Email/Password)           (PostgreSQL + RLS)
                                       │
                      ┌────────────────┼────────────────┐
                      ▼                ▼                ▼
                  Medicines        Health Logs     Appointments
                      ▼                ▼                ▼
                 Realtime        Notifications      Emergency
                     └─────────────────┬────────────────┘
                                       ▼
                       Supabase Realtime WebSockets
                                       │
                      ┌────────────────┴────────────────┐
                      ▼                                 ▼
              Elderly Dashboard                Caregiver Live Feed
```

---

## 🗄 Database Schema & RLS Policies

The complete SQL migration script is located at [`supabase/schema.sql`](file:///C:/Users/hp/.gemini/antigravity/scratch/careconnect360/supabase/schema.sql).

### Tables Created:
1. `profiles`: User accounts, clinical demographics, roles (`elderly` | `caregiver`), emergency facility contacts.
2. `medicines`: Prescribed medications, dosages, scheduled times, frequencies, statuses.
3. `medicine_logs`: Auditable logs of taken/snoozed/missed events.
4. `appointments`: Doctor visits, specialties, timings, and tele-consultation links.
5. `health_readings`: Vital biometrics telemetry with timestamps and observation statuses.
6. `notifications`: Real-time alerts and reminder items.
7. `emergency_contacts`: Trusted contacts with relationship and telephone.
8. `emergency_events`: Incident logs with status (`TRIGGERED`, `ACKNOWLEDGED`, `RESOLVED`).
9. `caregiver_relationships`: Mapping between elderly users and authorized caregivers.

### Row Level Security (RLS)
- Strict policies ensuring patients access their own records.
- Caregivers access records exclusively for seniors linked via active `caregiver_relationships`.

---

## 🔐 Environment Variables

Create a `.env` file in the root directory (refer to `.env.example`):

```bash
# Supabase Project Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> **Security Note:** Never commit `.env` or service role keys to Git. Only the public anonymous key is exposed in the frontend.

---

## 💻 How to Run Locally

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation
```bash
# 1. Clone repository
git clone <repository-url>
cd careconnect360

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# (Optional: fill in your Supabase credentials or use the built-in offline demo store)

# 4. Start local development server
npm run dev

# 5. Build for production
npm run build
```

---

## 👤 Demo Accounts (One-Click Judge Access)

For evaluation, you can use the built-in **One-Click Judge Access** buttons on the login screen or sign in with:

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Elderly User** | Lakshmi Devi (74 yrs) | `lakshmi@careconnect360.demo` | `demo1234` |
| **Family Caregiver** | Rohan Verma (Son) | `rohan@careconnect360.demo` | `demo1234` |

---

## ⚕️ Healthcare Prototype Disclaimer

> **Important Notice:** CareConnect 360 is a healthcare management prototype created for demonstration purposes. It does not provide medical diagnosis or replace professional medical advice or emergency services. The telemedicine consultation and emergency SOS workflows simulate real-time clinical procedures for demonstration.

---

## 🔮 Future Improvements
1. Integration with wearable IoT devices (Bluetooth Low Energy pulse oximeters, blood pressure cuffs).
2. WhatsApp / SMS automated notification gateway for urgent caregiver escalation.
3. Native mobile app wrapper via Capacitor / React Native.
4. Multilingual voice synthesis (audio reminders in regional languages for seniors).
