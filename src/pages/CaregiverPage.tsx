import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Activity, 
  Pill, 
  Calendar, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Bell, 
  ArrowUpRight, 
  Radio, 
  Heart, 
  Check, 
  Loader2, 
  PhoneCall, 
  Sparkles,
  RefreshCw,
  Eye
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { 
  getMedicines, 
  getHealthReadings, 
  getAppointments, 
  getEmergencyEvents, 
  getCaregiverActivities, 
  acknowledgeEmergency, 
  resolveEmergency,
  subscribeToLiveUpdates,
  getElderlyProfileSync
} from '@/services/api';
import { 
  Medicine, 
  HealthReading, 
  Appointment, 
  EmergencyEvent, 
  CaregiverActivity 
} from '@/types';
import { HEALTHCARE_IMAGES, FALLBACK_IMAGE } from '@/assets/images';

export const CaregiverPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [readings, setReadings] = useState<HealthReading[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [emergencyEvents, setEmergencyEvents] = useState<EmergencyEvent[]>([]);
  const [activities, setActivities] = useState<CaregiverActivity[]>([]);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const elderlyProfile = getElderlyProfileSync();
  const elderlyId = elderlyProfile.id;
  const elderlyName = elderlyProfile.full_name;
  const elderlyAge = elderlyProfile.age || 45;

  const fetchData = async () => {
    try {
      const [meds, health, apts, emEvents, acts] = await Promise.all([
        getMedicines(elderlyId),
        getHealthReadings(elderlyId, '7D'),
        getAppointments(elderlyId),
        getEmergencyEvents(elderlyId),
        getCaregiverActivities(),
      ]);
      setMedicines(meds);
      setReadings(health);
      setAppointments(apts);
      setEmergencyEvents(emEvents);
      setActivities(acts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const unsubscribe = subscribeToLiveUpdates(() => {
      fetchData();
    });
    return () => unsubscribe();
  }, [user]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAcknowledge = async (eventId: string) => {
    setActionInProgress(eventId);
    try {
      await acknowledgeEmergency(eventId);
      showToast('Emergency incident acknowledged.');
      await fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleResolve = async (eventId: string) => {
    setActionInProgress(eventId);
    try {
      await resolveEmergency(eventId);
      showToast('Emergency marked resolved.');
      await fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionInProgress(null);
    }
  };

  // Calculations
  const totalMeds = medicines.length;
  const takenMeds = medicines.filter((m) => m.status === 'TAKEN').length;
  const adherenceRate = totalMeds > 0 ? Math.round((takenMeds / totalMeds) * 100) : 100;

  // Active emergencies
  const activeEmergencies = emergencyEvents.filter(
    (e) => e.status === 'TRIGGERED' || e.status === 'ACKNOWLEDGED'
  );

  // Latest vitals
  const getLatestReading = (param: HealthReading['parameter']) => {
    const list = readings.filter((r) => r.parameter === param);
    return list.length > 0 ? list[list.length - 1] : null;
  };
  const hr = getLatestReading('heart_rate');
  const bp = getLatestReading('blood_pressure');
  const sugar = getLatestReading('blood_sugar');
  const spo2 = getLatestReading('spo2');

  const nextApt = appointments.find((a) => a.status === 'TODAY' || a.status === 'UPCOMING') || appointments[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-purple-500/40 text-purple-200 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md">
          <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER & LIVE CAREGIVER STATUS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>Family & Caregiver Command Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Family Care Portal • {elderlyName} ({elderlyAge} yrs)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time remote caregiver supervision, adherence metrics, and immediate escalation alerts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>Realtime Link Active</span>
          </div>
          <button
            onClick={() => fetchData()}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors"
            title="Refresh Feed"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ACTIVE EMERGENCY BANNER (If any triggered) */}
      {activeEmergencies.length > 0 && (
        <div className="bg-red-950/80 border-2 border-red-500/80 rounded-3xl p-6 shadow-2xl glass-glow-emergency space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-600 rounded-2xl text-white shadow-lg shadow-red-600/40 animate-pulse">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  CRITICAL INCIDENT: EMERGENCY SOS ACTIVE
                </h3>
                <p className="text-xs text-red-200">
                  Triggered from Home command center at {new Date(activeEmergencies[0].timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeEmergencies[0].status === 'TRIGGERED' && (
                <button
                  type="button"
                  disabled={actionInProgress === activeEmergencies[0].id}
                  onClick={() => handleAcknowledge(activeEmergencies[0].id)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  Acknowledge Incident
                </button>
              )}
              <button
                type="button"
                disabled={actionInProgress === activeEmergencies[0].id}
                onClick={() => handleResolve(activeEmergencies[0].id)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                Mark Resolved
              </button>
              <a
                href={`tel:${elderlyProfile.phone || '+919876512340'}`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call {elderlyName.split(' ')[0]}</span>
              </a>
            </div>
          </div>
          <div className="text-xs text-red-200/90 bg-red-900/40 p-3 rounded-xl border border-red-500/30">
            <strong>Notes:</strong> {activeEmergencies[0].notes} • <strong>Location:</strong> {activeEmergencies[0].location}
          </div>
        </div>
      )}

      {/* OVERVIEW STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Adherence Rate */}
        <div className="bg-[#0B1220] border border-white/[0.08] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Medication Adherence</span>
            <Pill className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">{adherenceRate}%</span>
            <span className="text-xs text-emerald-400 font-semibold">Today's target</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {takenMeds} of {totalMeds} prescribed doses taken
          </p>
        </div>

        {/* Latest BP */}
        <div className="bg-[#0B1220] border border-white/[0.08] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Blood Pressure</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {bp?.systolic && bp?.diastolic ? `${bp.systolic}/${bp.diastolic}` : '128/82'}
            </span>
            <span className="text-xs text-amber-400 font-semibold">{bp?.status || 'ATTENTION'}</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Optimal resting target: &lt;130/85 mmHg
          </p>
        </div>

        {/* Heart Rate */}
        <div className="bg-[#0B1220] border border-white/[0.08] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Resting Pulse</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">{hr ? hr.value : '72'} bpm</span>
            <span className="text-xs text-emerald-400 font-semibold">NORMAL</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Within healthy resting heart rate band
          </p>
        </div>

        {/* Next Doctor Visit */}
        <div className="bg-[#0B1220] border border-white/[0.08] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Upcoming Doctor Review</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-3">
            <h4 className="text-base font-bold text-white truncate">
              {nextApt?.doctor_name || 'Dr. Ananya Rao'}
            </h4>
            <p className="text-xs text-cyan-300 font-medium">
              {nextApt ? `${nextApt.appointment_date} at ${nextApt.appointment_time}` : 'Scheduled'}
            </p>
          </div>
          <p className="mt-2 text-xs text-slate-400 truncate">
            {nextApt?.reason || 'Hypertension review'}
          </p>
        </div>
      </div>

      {/* 2-COLUMN SECTION: LIVE CAREGIVER ACTIVITY FEED & MEDICATION OVERSIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LIVE ACTIVITY FEED (Section 12) */}
        <div className="lg:col-span-7 bg-[#0B1220]/90 border border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-xl glass-panel">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Live Activity Feed</h3>
                <p className="text-xs text-slate-400">Instant chronological telemetry from {elderlyName}</p>
              </div>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full">
              Realtime WebSocket
            </span>
          </div>

          <div className="mt-5 space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
            {activities.length > 0 ? (
              activities.map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors flex items-start gap-3.5"
                >
                  <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    act.type === 'emergency'
                      ? 'bg-red-500/20 text-red-400'
                      : act.type === 'medicine'
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : act.type === 'health'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {act.type === 'emergency' ? (
                      <ShieldAlert className="w-4 h-4 animate-bounce" />
                    ) : act.type === 'medicine' ? (
                      <Pill className="w-4 h-4" />
                    ) : act.type === 'health' ? (
                      <Activity className="w-4 h-4" />
                    ) : (
                      <Calendar className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white capitalize">{act.type} Update</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-300 leading-relaxed font-medium">
                      {act.message}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                No recent activity recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* MEDICINE OVERSIGHT PANEL */}
        <div className="lg:col-span-5 bg-[#0B1220]/90 border border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-xl glass-panel flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-cyan-400" />
                <h3 className="text-lg font-bold text-white tracking-tight">Prescription Status</h3>
              </div>
              <span className="text-xs text-slate-400">Daily checklist</span>
            </div>

            <div className="mt-4 space-y-3">
              {medicines.map((med) => (
                <div
                  key={med.id}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between"
                >
                  <div>
                    <h5 className="text-xs font-bold text-white">{med.name}</h5>
                    <p className="text-[11px] text-slate-400">
                      {med.dosage} • {med.scheduled_time}
                    </p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    med.status === 'TAKEN'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : med.status === 'DUE'
                      ? 'bg-amber-500/20 text-amber-400'
                      : med.status === 'SNOOZED'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {med.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/[0.06] text-xs text-slate-400 space-y-2">
            <div className="flex items-center justify-between">
              <span>Elderly Contact:</span>
              <a href="tel:+919876543210" className="text-cyan-400 hover:underline font-mono">
                +91 98765 43210
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span>Primary Hospital:</span>
              <span className="text-slate-300">Apollo Heart Institute</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
