import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Pill, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Heart, 
  Activity, 
  Flame, 
  Thermometer, 
  Droplet, 
  Scale, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Video, 
  Bell, 
  ArrowRight, 
  PlusCircle, 
  Sparkles, 
  ShieldAlert,
  Loader2,
  Check,
  Ruler,
  Gauge,
  Wind
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { 
  getMedicines, 
  recordMedicineAction, 
  getHealthReadings, 
  getAppointments, 
  getNotifications,
  subscribeToLiveUpdates,
  isMedicineDueTime,
  getCaregiverNameSync
} from '@/services/api';
import { soundEffects } from '@/utils/audio';
import { Medicine, HealthReading, Appointment, NotificationItem } from '@/types';
import { HEALTHCARE_IMAGES, FALLBACK_IMAGE } from '@/assets/images';
import { EmergencyModal } from '@/components/emergency/EmergencyModal';
import { SnoozeModal } from '@/components/medicines/SnoozeModal';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [healthReadings, setHealthReadings] = useState<HealthReading[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  
  // Action loading states
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Health Chart filter & parameter toggle
  const [chartTimeFilter, setChartTimeFilter] = useState<'24H' | '7D' | '30D'>('7D');
  const [chartParameter, setChartParameter] = useState<HealthReading['parameter']>('heart_rate');

  // Emergency Modal
  const [isEmergencyOpen, setIsEmergencyOpen] = useState<boolean>(false);

  const fetchData = async () => {
    if (!user) return;
    try {
      const [meds, readings, apts, notifs] = await Promise.all([
        getMedicines(user.id),
        getHealthReadings(user.id, chartTimeFilter),
        getAppointments(user.id),
        getNotifications(user.id),
      ]);
      setMedicines(meds);
      setHealthReadings(readings);
      setAppointments(apts);
      setNotifications(notifs);
    } catch (e) {
      console.error('Error fetching home dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [snoozeModalOpen, setSnoozeModalOpen] = useState<boolean>(false);
  const [snoozeTargetMed, setSnoozeTargetMed] = useState<Medicine | null>(null);

  // Automatic real-time clock check every 5 seconds to detect due medicines on time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchData();
    const unsubscribe = subscribeToLiveUpdates(() => {
      fetchData();
    });
    return () => unsubscribe();
  }, [user, chartTimeFilter]);

  // Next medicine calculation:
  // 1. High priority: Any medicine due right now that has not been taken or missed
  const dueMedicine = medicines.find(
    (m) => isMedicineDueTime(m, currentTime) && m.status !== 'TAKEN' && m.status !== 'MISSED'
  );
  // 2. Snoozed medicine
  const snoozedMedicine = medicines.find((m) => m.status === 'SNOOZED');
  // 3. Next upcoming scheduled medicine
  const scheduledMedicine = medicines.find((m) => m.status === 'SCHEDULED');
  // Display target
  const nextMedicine = dueMedicine || snoozedMedicine || scheduledMedicine || (medicines.length > 0 ? medicines[0] : null);

  const allMedsTaken = medicines.length > 0 && medicines.every((m) => m.status === 'TAKEN');
  const isDue = nextMedicine ? isMedicineDueTime(nextMedicine, currentTime) : false;
  const caregiverName = getCaregiverNameSync();

  // Adherence calculation
  const totalMeds = medicines.length;
  const takenCount = medicines.filter((m) => m.status === 'TAKEN').length;
  const adherenceRate = totalMeds > 0 ? Math.round((takenCount / totalMeds) * 100) : 100;

  // Handle TAKEN action (Section 7 Flow 1)
  const handleTakeMedicine = async (medicineId: string) => {
    if (!user) return;
    setActionInProgress(medicineId);
    try {
      await recordMedicineAction(medicineId, user.id, 'TAKEN');
      soundEffects.playMedicineChime();
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#22d3ee', '#3b82f6', '#22c55e']
      });
      setActionSuccessMsg('Medicine logged as TAKEN! Family caregiver updated.');
      setTimeout(() => setActionSuccessMsg(null), 3500);
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionInProgress(null);
    }
  };

  // Open Snooze Duration Modal
  const handleOpenSnooze = (med: Medicine) => {
    setSnoozeTargetMed(med);
    setSnoozeModalOpen(true);
  };

  // Handle SNOOZE confirmation from Modal
  const handleConfirmSnooze = async (medicineId: string, minutes: number) => {
    if (!user) return;
    setActionInProgress(medicineId);
    try {
      await recordMedicineAction(medicineId, user.id, 'SNOOZED', undefined, minutes);
      setActionSuccessMsg(`Reminder snoozed for ${minutes} minutes.`);
      setTimeout(() => setActionSuccessMsg(null), 3000);
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionInProgress(null);
    }
  };


  // Handle NOT TAKEN action
  const handleMissedMedicine = async (medicineId: string) => {
    if (!user) return;
    setActionInProgress(medicineId);
    try {
      await recordMedicineAction(medicineId, user.id, 'MISSED');
      setActionSuccessMsg('Dose marked as missed. Caregiver notification logged.');
      setTimeout(() => setActionSuccessMsg(null), 3000);
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionInProgress(null);
    }
  };

  // Get latest reading for each parameter
  const getLatestReading = (param: HealthReading['parameter']) => {
    const list = healthReadings.filter((r) => r.parameter === param);
    return list.length > 0 ? list[list.length - 1] : null;
  };

  const hrLatest = getLatestReading('heart_rate');
  const bpLatest = getLatestReading('blood_pressure');
  const spo2Latest = getLatestReading('spo2');
  const tempLatest = getLatestReading('temperature');
  const sugarLatest = getLatestReading('blood_sugar');
  const weightLatest = getLatestReading('weight');
  const heightLatest = getLatestReading('height');
  const bmiLatest = getLatestReading('bmi');
  const respLatest = getLatestReading('respiratory_rate');

  // Chart data formatting
  const chartData = healthReadings
    .filter((r) => r.parameter === chartParameter)
    .map((r) => ({
      time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date(r.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      value: r.value,
      systolic: r.systolic,
      diastolic: r.diastolic,
      unit: r.unit,
      status: r.status,
    }));

  // Upcoming appointment (TODAY or UPCOMING)
  const upcomingAppointment = appointments.find(
    (a) => a.status === 'TODAY' || a.status === 'UPCOMING'
  ) || appointments[0];

  // Today's timeline events matching sample demo medications
  const timelineEvents = [
    { time: '08:00 AM', title: 'Paracetamol 500 mg (Fever/Pain)', type: 'med', status: medicines.find(m => m.name.toLowerCase().includes('paracetamol'))?.status || 'DUE' },
    { time: '09:30 AM', title: 'Morning Blood Pressure Check (120/80)', type: 'health', status: 'COMPLETED' },
    { time: '01:00 PM', title: 'Cetirizine 10 mg (Allergy symptoms)', type: 'med', status: medicines.find(m => m.name.toLowerCase().includes('cetirizine'))?.status || 'SCHEDULED' },
    { time: '04:00 PM', title: 'Dr. Ananya Rao Virtual Consultation', type: 'apt', status: 'UPCOMING' },
    { time: '05:00 PM', title: 'ORS 1 sachet (Rehydration)', type: 'med', status: medicines.find(m => m.name.toLowerCase().includes('ors'))?.status || 'SCHEDULED' },
    { time: '08:00 PM', title: 'Vitamin D3 (Supplement record)', type: 'med', status: medicines.find(m => m.name.toLowerCase().includes('vitamin'))?.status || 'SCHEDULED' },
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        <span className="text-sm font-medium">Synchronizing CareConnect 360 Command Center...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Feedback */}
      {actionSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-in slide-in-from-bottom-2 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{actionSuccessMsg}</span>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-r from-slate-950 via-[#08111F] to-[#0B1220] shadow-2xl">
        {/* Background image with dark overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={HEALTHCARE_IMAGES.hero}
            alt="Elderly healthcare monitoring"
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
            }}
            className="w-full h-full object-cover object-right opacity-25 filter brightness-75 contrast-125 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#030712] via-[#050816]/90 to-transparent" />
          <div className="absolute inset-0 bg-radial-at-c from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
        </div>

        <div className="relative z-10 p-6 sm:p-8 lg:p-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>NIGHTCARE Active Platform • Elderly Care H10</span>
            </div>
            {(!user || user.is_demo || user.full_name === 'Rahul Kumar') && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-cyan-300 text-xs font-bold shadow-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>Demo Patient: Rahul Kumar (Age: 45, Male) • Sample Data</span>
              </div>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Your health, <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">connected.</span>
          </h1>

          <p className="mt-3 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
            Continuous medical harmony for seniors. Effortlessly manage your daily medicines, 
            vital readings, doctor appointments, and maintain real-time peace of mind with your loved ones.
          </p>

          {/* Quick Action Buttons that ACTUALLY WORK */}
          <div className="mt-6 flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              to="/medicines"
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-transform active:scale-95"
            >
              <Pill className="w-4 h-4" />
              <span>Manage Medications</span>
            </Link>

            <Link
              to="/health"
              className="px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm flex items-center gap-2 transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-cyan-400" />
              <span>Record New Reading</span>
            </Link>

            <button
              onClick={() => setIsEmergencyOpen(true)}
              className="px-5 py-3 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-200 font-bold text-sm flex items-center gap-2 transition-colors"
            >
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Emergency Protocol</span>
            </button>
          </div>

          {/* Quick Stat Pill */}
          <div className="mt-6 pt-5 border-t border-white/[0.08] flex items-center gap-6 text-xs text-slate-400">
            <div>
              <span className="text-slate-400">Today's Adherence:</span>{' '}
              <span className="text-emerald-400 font-bold text-sm">{adherenceRate}%</span>
            </div>
            <div>
              <span className="text-slate-400">Connected Caregiver:</span>{' '}
              <span className="text-white font-medium">{caregiverName} (Active)</span>
            </div>
            <div>
              <span className="text-slate-400">Next Doctor Review:</span>{' '}
              <span className="text-cyan-400 font-medium">Today 04:00 PM</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2-COLUMN SECTION: NEXT MEDICINE & UPCOMING APPOINTMENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* NEXT MEDICINE (Section 7 & 8) */}
        {allMedsTaken ? (
          <div className="lg:col-span-7 bg-[#0B1220]/90 border border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-xl glass-panel relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Prescriptions Completed</h3>
                    <p className="text-xs text-slate-400">All daily doses successfully taken</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ALL DOSES TAKEN
                </span>
              </div>

              <div className="mt-8 p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-center space-y-2">
                <Check className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-xl font-bold text-white">Great Job! All Daily Medications Complete</h4>
                <p className="text-xs text-emerald-200/90 max-w-md mx-auto">
                  You have logged all prescribed medications for today with 100% adherence. Your caregiver feed is up to date.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] text-xs text-slate-400 flex items-center justify-between">
              <span>Next medication cycle begins tomorrow morning.</span>
              <Link to="/medicines" className="text-cyan-400 hover:underline font-semibold">
                View All Prescriptions →
              </Link>
            </div>
          </div>
        ) : (
          <div className={`lg:col-span-7 rounded-3xl p-6 sm:p-7 shadow-xl glass-panel relative overflow-hidden flex flex-col justify-between transition-all ${
            isDue ? 'medicine-due-card-alert' : 'bg-[#0B1220]/90 border border-white/[0.08]'
          }`}>
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2.5 rounded-xl border ${
                    isDue
                      ? 'bg-red-500/20 text-red-400 border-red-500/40'
                      : 'bg-blue-600/20 text-cyan-400 border-blue-500/30'
                  }`}>
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {isDue ? 'Urgent: Medication Due Now' : 'Next Scheduled Medicine'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {isDue ? 'Scheduled time reached • Immediate dose required' : 'Due medication alert & immediate logger'}
                    </p>
                  </div>
                </div>
                
                {nextMedicine && (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                    isDue
                      ? 'bg-red-500/25 text-red-300 border border-red-500/50 medicine-due-badge-blink'
                      : nextMedicine.status === 'TAKEN'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : nextMedicine.status === 'SNOOZED'
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {isDue && <span className="w-2 h-2 rounded-full bg-red-400 animate-ping shrink-0" />}
                    {isDue ? 'MEDICINE DUE' : nextMedicine.status}
                  </span>
                )}
              </div>

              {nextMedicine ? (
                <div className="mt-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-2xl font-extrabold text-white tracking-tight">
                          {nextMedicine.name}
                        </h4>
                        {nextMedicine.purpose && (
                          <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-semibold">
                            Purpose: {nextMedicine.purpose}
                          </span>
                        )}
                        {(nextMedicine.is_demo || !nextMedicine.created_at) && (
                          <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
                            Demo Medication Data — Not a Prescription
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-cyan-300 font-medium mt-1">
                        Dosage: {nextMedicine.dosage} • {nextMedicine.frequency}
                      </p>
                    </div>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${
                      isDue ? 'bg-red-950/60 border-red-500/50 text-red-200' : 'bg-slate-900 border-slate-800 text-slate-200'
                    }`}>
                      <Clock className={`w-4 h-4 ${isDue ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`} />
                      <span className="font-mono text-base font-bold">{nextMedicine.scheduled_time}</span>
                    </div>
                  </div>

                  {nextMedicine.notes && (
                    <p className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-white/[0.04]">
                      <span className="text-slate-300 font-semibold">Doctor's Instruction:</span> {nextMedicine.notes}
                    </p>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 text-sm">
                  No medicines scheduled at this hour.
                </div>
              )}
            </div>

            {/* ACTION BUTTONS: TAKEN, SNOOZE, NOT TAKEN (Section 7) */}
            {nextMedicine && (
              <div className="mt-6 pt-5 border-t border-white/[0.06] flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={actionInProgress === nextMedicine.id}
                  onClick={() => handleTakeMedicine(nextMedicine.id)}
                  className="flex-1 min-w-[130px] px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
                >
                  {actionInProgress === nextMedicine.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>TAKEN</span>
                </button>

                <button
                  type="button"
                  disabled={actionInProgress === nextMedicine.id}
                  onClick={() => handleOpenSnooze(nextMedicine)}
                  className="flex-1 min-w-[120px] px-4 py-3 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Clock className="w-4 h-4" />
                  <span>SNOOZE</span>
                </button>

                <button
                  type="button"
                  disabled={actionInProgress === nextMedicine.id}
                  onClick={() => handleMissedMedicine(nextMedicine.id)}
                  className="flex-1 min-w-[120px] px-4 py-3 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>NOT TAKEN</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* UPCOMING APPOINTMENT & CONSULTATION (Section 7 & 10) */}
        <div className="lg:col-span-5 bg-[#0B1220]/90 border border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-xl glass-panel flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Upcoming Consultation</h3>
                  <p className="text-xs text-slate-400">Doctor review & tele-care appointment</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {upcomingAppointment?.status || 'SCHEDULED'}
              </span>
            </div>

            {upcomingAppointment ? (
              <div className="mt-5 space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={upcomingAppointment.doctor_image || HEALTHCARE_IMAGES.doctorConsultation}
                    alt={upcomingAppointment.doctor_name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                    }}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-500/40 shadow-lg"
                  />
                  <div>
                    <h4 className="text-lg font-bold text-white">
                      {upcomingAppointment.doctor_name}
                    </h4>
                    <p className="text-xs text-cyan-300 font-medium">
                      {upcomingAppointment.specialty}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {upcomingAppointment.hospital_clinic}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Scheduled:</span>
                    <span className="text-white font-semibold">
                      {upcomingAppointment.appointment_date} at {upcomingAppointment.appointment_time}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Clinical Reason:</span>
                    <span className="text-slate-300">{upcomingAppointment.reason}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-sm">
                No consultations currently scheduled.
              </div>
            )}
          </div>

          {/* JOIN CONSULTATION BUTTON (Section 7 Flow 3) */}
          <div className="mt-6 pt-5 border-t border-white/[0.06]">
            {upcomingAppointment ? (
              <button
                type="button"
                onClick={() => navigate(`/consultation/${upcomingAppointment.id}`)}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2.5 transition-all transform active:scale-95"
              >
                <Video className="w-4 h-4" />
                <span>JOIN CONSULTATION</span>
              </button>
            ) : (
              <Link
                to="/appointments"
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium text-xs flex items-center justify-center gap-2"
              >
                <span>Schedule New Appointment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* LIVE HEALTH STATUS CARDS (Section 7) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xl font-bold text-white tracking-tight">Live Health Status</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 border border-cyan-500/25 text-cyan-300">
                9 Clinical Vitals
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Continuous physiological monitoring • Sample Demo Telemetry (Rahul Kumar)
            </p>
          </div>
          <Link
            to="/health"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>View Full Health Log & History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-9 gap-3">
          {/* 1. Blood Pressure */}
          <div
            onClick={() => setChartParameter('blood_pressure')}
            className={`p-3.5 rounded-2xl bg-[#0B1220] border transition-all cursor-pointer ${
              chartParameter === 'blood_pressure'
                ? 'border-cyan-500/60 ring-2 ring-cyan-500/20 bg-slate-900/90'
                : 'border-white/[0.06] hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="truncate">Blood Press.</span>
              <Activity className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            </div>
            <div className="mt-2 text-xl font-black text-white tracking-tight font-mono">
              {bpLatest?.systolic && bpLatest?.diastolic ? `${bpLatest.systolic}/${bpLatest.diastolic}` : '120/80'}
            </div>
            <div className="text-[10px] text-slate-400 font-sans">mmHg</div>
            <div className="mt-2 flex items-center justify-between text-[10px]">
              <span className="text-emerald-400 font-semibold">{bpLatest?.status || 'NORMAL'}</span>
              <span className="text-slate-500">Resting</span>
            </div>
          </div>

          {/* 2. Heart Rate */}
          <div
            onClick={() => setChartParameter('heart_rate')}
            className={`p-3.5 rounded-2xl bg-[#0B1220] border transition-all cursor-pointer ${
              chartParameter === 'heart_rate'
                ? 'border-cyan-500/60 ring-2 ring-cyan-500/20 bg-slate-900/90'
                : 'border-white/[0.06] hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="truncate">Heart Rate</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            </div>
            <div className="mt-2 text-xl font-black text-white tracking-tight font-mono">
              {hrLatest ? hrLatest.value : 72}
            </div>
            <div className="text-[10px] text-slate-400 font-sans">bpm</div>
            <div className="mt-2 flex items-center justify-between text-[10px]">
              <span className="text-emerald-400 font-semibold">{hrLatest?.status || 'NORMAL'}</span>
              <span className="text-slate-500">Pulse</span>
            </div>
          </div>

          {/* 3. SpO2 */}
          <div
            onClick={() => setChartParameter('spo2')}
            className={`p-3.5 rounded-2xl bg-[#0B1220] border transition-all cursor-pointer ${
              chartParameter === 'spo2'
                ? 'border-cyan-500/60 ring-2 ring-cyan-500/20 bg-slate-900/90'
                : 'border-white/[0.06] hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="truncate">SpO₂</span>
              <Droplet className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            </div>
            <div className="mt-2 text-xl font-black text-white tracking-tight font-mono">
              {spo2Latest ? spo2Latest.value : 98}
            </div>
            <div className="text-[10px] text-slate-400 font-sans">%</div>
            <div className="mt-2 flex items-center justify-between text-[10px]">
              <span className="text-emerald-400 font-semibold">{spo2Latest?.status || 'NORMAL'}</span>
              <span className="text-slate-500">Optimal</span>
            </div>
          </div>

          {/* 4. Temperature */}
          <div
            onClick={() => setChartParameter('temperature')}
            className={`p-3.5 rounded-2xl bg-[#0B1220] border transition-all cursor-pointer ${
              chartParameter === 'temperature'
                ? 'border-cyan-500/60 ring-2 ring-cyan-500/20 bg-slate-900/90'
                : 'border-white/[0.06] hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="truncate">Temp</span>
              <Thermometer className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            </div>
            <div className="mt-2 text-xl font-black text-white tracking-tight font-mono">
              {tempLatest ? tempLatest.value : 36.8}
            </div>
            <div className="text-[10px] text-slate-400 font-sans">{tempLatest?.unit || '°C'}</div>
            <div className="mt-2 flex items-center justify-between text-[10px]">
              <span className="text-emerald-400 font-semibold">{tempLatest?.status || 'NORMAL'}</span>
              <span className="text-slate-500">Normal</span>
            </div>
          </div>

          {/* 5. Blood Glucose */}
          <div
            onClick={() => setChartParameter('blood_sugar')}
            className={`p-3.5 rounded-2xl bg-[#0B1220] border transition-all cursor-pointer ${
              chartParameter === 'blood_sugar'
                ? 'border-cyan-500/60 ring-2 ring-cyan-500/20 bg-slate-900/90'
                : 'border-white/[0.06] hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="truncate">Glucose</span>
              <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            </div>
            <div className="mt-2 text-xl font-black text-white tracking-tight font-mono">
              {sugarLatest ? sugarLatest.value : 95}
            </div>
            <div className="text-[10px] text-slate-400 font-sans">mg/dL</div>
            <div className="mt-2 flex items-center justify-between text-[10px]">
              <span className="text-emerald-400 font-semibold">{sugarLatest?.status || 'NORMAL'}</span>
              <span className="text-slate-500">Fasting</span>
            </div>
          </div>

          {/* 6. Weight */}
          <div
            onClick={() => setChartParameter('weight')}
            className={`p-3.5 rounded-2xl bg-[#0B1220] border transition-all cursor-pointer ${
              chartParameter === 'weight'
                ? 'border-cyan-500/60 ring-2 ring-cyan-500/20 bg-slate-900/90'
                : 'border-white/[0.06] hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="truncate">Weight</span>
              <Scale className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            </div>
            <div className="mt-2 text-xl font-black text-white tracking-tight font-mono">
              {weightLatest ? weightLatest.value : 68}
            </div>
            <div className="text-[10px] text-slate-400 font-sans">kg</div>
            <div className="mt-2 flex items-center justify-between text-[10px]">
              <span className="text-emerald-400 font-semibold">{weightLatest?.status || 'NORMAL'}</span>
              <span className="text-slate-500">Stable</span>
            </div>
          </div>

          {/* 7. Height */}
          <div
            onClick={() => setChartParameter('height')}
            className={`p-3.5 rounded-2xl bg-[#0B1220] border transition-all cursor-pointer ${
              chartParameter === 'height'
                ? 'border-cyan-500/60 ring-2 ring-cyan-500/20 bg-slate-900/90'
                : 'border-white/[0.06] hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="truncate">Height</span>
              <Ruler className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            </div>
            <div className="mt-2 text-xl font-black text-white tracking-tight font-mono">
              {heightLatest ? heightLatest.value : 170}
            </div>
            <div className="text-[10px] text-slate-400 font-sans">cm</div>
            <div className="mt-2 flex items-center justify-between text-[10px]">
              <span className="text-emerald-400 font-semibold">{heightLatest?.status || 'NORMAL'}</span>
              <span className="text-slate-500">Adult</span>
            </div>
          </div>

          {/* 8. BMI */}
          <div
            onClick={() => setChartParameter('bmi')}
            className={`p-3.5 rounded-2xl bg-[#0B1220] border transition-all cursor-pointer ${
              chartParameter === 'bmi'
                ? 'border-cyan-500/60 ring-2 ring-cyan-500/20 bg-slate-900/90'
                : 'border-white/[0.06] hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="truncate">BMI Index</span>
              <Gauge className="w-3.5 h-3.5 text-violet-400 shrink-0" />
            </div>
            <div className="mt-2 text-xl font-black text-white tracking-tight font-mono">
              {bmiLatest ? bmiLatest.value : 23.5}
            </div>
            <div className="text-[10px] text-slate-400 font-sans">kg/m²</div>
            <div className="mt-2 flex items-center justify-between text-[10px]">
              <span className="text-emerald-400 font-semibold">{bmiLatest?.status || 'NORMAL'}</span>
              <span className="text-slate-500">Healthy</span>
            </div>
          </div>

          {/* 9. Respiratory Rate */}
          <div
            onClick={() => setChartParameter('respiratory_rate')}
            className={`p-3.5 rounded-2xl bg-[#0B1220] border transition-all cursor-pointer ${
              chartParameter === 'respiratory_rate'
                ? 'border-cyan-500/60 ring-2 ring-cyan-500/20 bg-slate-900/90'
                : 'border-white/[0.06] hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="truncate">Resp. Rate</span>
              <Wind className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            </div>
            <div className="mt-2 text-xl font-black text-white tracking-tight font-mono">
              {respLatest ? respLatest.value : 16}
            </div>
            <div className="text-[10px] text-slate-400 font-sans">/min</div>
            <div className="mt-2 flex items-center justify-between text-[10px]">
              <span className="text-emerald-400 font-semibold">{respLatest?.status || 'NORMAL'}</span>
              <span className="text-slate-500">Eupnea</span>
            </div>
          </div>
        </div>
      </section>

      {/* HEALTH TREND CHART (Section 7 Flow 2) */}
      <section className="bg-[#0B1220]/90 border border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-xl glass-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-bold text-white tracking-tight capitalize">
                {chartParameter.replace('_', ' ')} Trend Analysis
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Interactive timeline from Supabase telemetry • Tap parameter cards to toggle view
            </p>
          </div>

          {/* Time Filter Buttons (24H, 7D, 30D) */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            {(['24H', '7D', '30D'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setChartTimeFilter(filter)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  chartTimeFilter === filter
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="mt-6 h-72 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748B" 
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#64748B" 
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-950/95 border border-slate-800 p-3 rounded-xl shadow-xl text-xs space-y-1">
                          <p className="text-slate-400">{data.date} at {data.time}</p>
                          <p className="text-cyan-400 font-bold font-mono text-sm">
                            {data.systolic && data.diastolic ? `${data.systolic}/${data.diastolic}` : data.value} {data.unit}
                          </p>
                          <p className="text-[11px]">
                            Status: <span className="font-semibold text-emerald-400">{data.status}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#22D3EE"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorMetric)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
              No recorded entries found for this time range.
            </div>
          )}
        </div>
      </section>

      {/* TODAY'S CARE TIMELINE & RECENT ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* TODAY'S CARE TIMELINE (Section 7) */}
        <div className="lg:col-span-7 bg-[#0B1220]/90 border border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-xl glass-panel">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Today's Care Timeline</h3>
              <p className="text-xs text-slate-400">Sequential care events & medication schedule</p>
            </div>
            <Link
              to="/medicines"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
            >
              Full Schedule
            </Link>
          </div>

          <div className="mt-5 space-y-4">
            {timelineEvents.map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 group">
                <div className="w-20 pt-1 shrink-0 text-right">
                  <span className="text-xs font-mono font-bold text-slate-400">{item.time}</span>
                </div>
                <div className="relative pt-1 flex flex-col items-center">
                  <div className={`w-3.5 h-3.5 rounded-full border-2 ${
                    item.status === 'TAKEN' || item.status === 'COMPLETED'
                      ? 'bg-emerald-500 border-emerald-400'
                      : item.status === 'DUE'
                      ? 'bg-amber-500 border-amber-300 animate-pulse'
                      : 'bg-slate-800 border-slate-600'
                  }`} />
                  {idx < timelineEvents.length - 1 && (
                    <div className="w-0.5 h-10 bg-slate-800 my-1 group-hover:bg-slate-700 transition-colors" />
                  )}
                </div>
                <div className="flex-1 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 group-hover:border-slate-700 transition-all flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-white">{item.title}</span>
                    <span className="block text-[11px] text-slate-400 capitalize">
                      {item.type === 'med' ? 'Medication Dose' : item.type === 'health' ? 'Vital Reading' : 'Doctor Consultation'}
                    </span>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${
                    item.status === 'TAKEN' || item.status === 'COMPLETED'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : item.status === 'DUE'
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT NOTIFICATIONS & LIVE ALERTS (Section 7) */}
        <div className="lg:col-span-5 bg-[#0B1220]/90 border border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-xl glass-panel flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-400" />
                <h3 className="text-lg font-bold text-white tracking-tight">Live Alerts</h3>
              </div>
              <Link
                to="/notifications"
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
              >
                View All
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {notifications.slice(0, 4).map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    !notif.is_read
                      ? 'bg-slate-900/90 border-cyan-500/30'
                      : 'bg-slate-950/60 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-white">{notif.title}</h5>
                    <span className="text-[10px] text-slate-500">
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/[0.06] text-center">
            <span className="text-[11px] text-slate-400">
              Connected to Caregiver: <strong className="text-slate-300">{caregiverName} (Caregiver)</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Emergency Modal */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />

      {/* Snooze Duration Selector Modal */}
      <SnoozeModal
        isOpen={snoozeModalOpen}
        onClose={() => setSnoozeModalOpen(false)}
        medicine={snoozeTargetMed}
        onConfirm={handleConfirmSnooze}
      />
    </div>
  );
};

