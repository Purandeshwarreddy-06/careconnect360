import React, { useState } from 'react';
import { 
  Settings, 
  Volume2, 
  VolumeX, 
  Clock, 
  Database, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Palette, 
  BellRing,
  Radio,
  FileCheck
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase';

export const SettingsPage: React.FC = () => {
  const { user, updateUserProfile, loadDemoData } = useAuth();

  const [soundEnabled, setSoundEnabled] = useState<boolean>(user?.reminder_sound ?? true);
  const [gracePeriod, setGracePeriod] = useState<number>(user?.reminder_grace_period ?? 15);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [autoSnooze, setAutoSnooze] = useState<boolean>(true);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleSound = async () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    await updateUserProfile({ reminder_sound: next });
    showToast(`Reminder Audio Chime turned ${next ? 'ON' : 'OFF'}.`);
  };

  const handleChangeGracePeriod = async (mins: number) => {
    setGracePeriod(mins);
    await updateUserProfile({ reminder_grace_period: mins });
    showToast(`Caregiver escalation grace period set to ${mins} minutes.`);
  };

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      await loadDemoData();
      showToast('All demo records successfully re-seeded into Supabase and local cache.');
    } finally {
      setIsResetting(false);
    }
  };

  const supabaseConnected = isSupabaseConfigured();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500/40 text-cyan-200 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* HEADER */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Settings className="w-3.5 h-3.5 text-cyan-400" />
          <span>Application Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          System & Reminder Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Configure notification alerts, accessibility enhancements, and database configurations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* REMINDER & SOUND SETTINGS */}
        <div className="bg-[#0B1220]/90 border border-white/[0.08] rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/[0.06]">
            <BellRing className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">Reminder Protocols</h3>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 text-cyan-400 rounded-xl">
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Audio Reminder Chimes</h4>
                <p className="text-xs text-slate-400">Play pleasant audible cues when medicine is due</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleSound}
              className={`w-14 h-7 rounded-full p-1 transition-colors ${
                soundEnabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  soundEnabled ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Grace Period Dropdown */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Caregiver Escalation Grace Window</span>
            </div>
            <p className="text-xs text-slate-400">
              Minutes allowed before notifying family if a due medication is not acknowledged
            </p>
            <select
              value={gracePeriod}
              onChange={(e) => handleChangeGracePeriod(Number(e.target.value))}
              className="mt-2 w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-semibold"
            >
              <option value={10}>10 Minutes (Strict reminder)</option>
              <option value={15}>15 Minutes (Recommended standard)</option>
              <option value={20}>20 Minutes (Relaxed buffer)</option>
              <option value={30}>30 Minutes (Extended buffer)</option>
            </select>
          </div>

          {/* Auto Snooze Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
            <div>
              <h4 className="text-sm font-bold text-white">Smart Auto-Snooze</h4>
              <p className="text-xs text-slate-400">Repeats reminder every 15m until logged as taken</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const next = !autoSnooze;
                setAutoSnooze(next);
                showToast(`Auto-snooze turned ${next ? 'ON' : 'OFF'}.`);
              }}
              className={`w-14 h-7 rounded-full p-1 transition-colors ${
                autoSnooze ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  autoSnooze ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* NIGHTCARE THEME & DATABASE CONFIG */}
        <div className="bg-[#0B1220]/90 border border-white/[0.08] rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/[0.06]">
            <Palette className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">Theme & Architecture</h3>
          </div>

          {/* Theme details */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Active Design System:</span>
              <span className="font-bold text-cyan-400">NIGHTCARE 360</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Contrast Palette:</span>
              <span className="text-slate-200">Deep Space Obsidian (#030712)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Elderly Readability:</span>
              <span className="text-emerald-400 font-semibold">High Contrast Accessible</span>
            </div>
          </div>

          {/* Supabase Status */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>Supabase Database Status</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                supabaseConnected
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-blue-500/20 text-cyan-300'
              }`}>
                {supabaseConnected ? 'CONNECTED' : 'LOCAL HYBRID STORE'}
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              CareConnect 360 includes PostgreSQL schemas with RLS policies and WebSocket realtime channels.
            </p>
          </div>

          {/* LOAD / RESET DEMO DATA (Section 18) */}
          <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-cyan-300">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Hackathon Demonstration Seeder</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Reset or reload clean fictional demo data for Rahul Kumar (Demo Patient, 45 yrs) and Rohan Verma (Caregiver) 
              including 9 vital parameters, sample prescriptions, and doctor consultations.
            </p>
            <button
              type="button"
              disabled={isResetting}
              onClick={handleResetData}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50"
            >
              {isResetting ? 'Populating Records...' : 'RELOAD / SEED DEMO DATA'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
