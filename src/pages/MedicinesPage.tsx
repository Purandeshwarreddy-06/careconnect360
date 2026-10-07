import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Plus, 
  Search, 
  Filter, 
  Check, 
  Clock, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  Calendar, 
  FileText, 
  Loader2, 
  Sparkles,
  X,
  History,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/AuthContext';
import { 
  getMedicines, 
  addMedicine, 
  updateMedicine, 
  deleteMedicine, 
  recordMedicineAction, 
  getMedicineLogs,
  subscribeToLiveUpdates,
  isMedicineDueTime
} from '@/services/api';
import { soundEffects } from '@/utils/audio';
import { Medicine, MedicineLog, MedicineStatus } from '@/types';
import { SnoozeModal } from '@/components/medicines/SnoozeModal';

export const MedicinesPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [logs, setLogs] = useState<MedicineLog[]>([]);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Filtering & Search
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals & Action states
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [snoozeModalOpen, setSnoozeModalOpen] = useState<boolean>(false);
  const [snoozeTargetMed, setSnoozeTargetMed] = useState<Medicine | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'prescriptions' | 'logs'>('prescriptions');

  // Real-time time interval to detect due medicines without manual reload
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 5000);
    return () => clearInterval(timer);
  }, []);


  // Form State
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    scheduled_time: '08:00 AM',
    frequency: 'Once Daily',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    notes: '',
    status: 'SCHEDULED' as MedicineStatus,
  });

  const fetchData = async () => {
    if (!user) return;
    try {
      const [meds, medLogs] = await Promise.all([
        getMedicines(user.id),
        getMedicineLogs(user.id),
      ]);
      setMedicines(meds);
      setLogs(medLogs);
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

  const resetForm = () => {
    setFormData({
      name: '',
      dosage: '',
      scheduled_time: '08:00 AM',
      frequency: 'Once Daily',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      notes: '',
      status: 'SCHEDULED',
    });
    setEditingMedicine(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (med: Medicine) => {
    setEditingMedicine(med);
    setFormData({
      name: med.name,
      dosage: med.dosage,
      scheduled_time: med.scheduled_time,
      frequency: med.frequency,
      start_date: med.start_date,
      end_date: med.end_date || '',
      notes: med.notes || '',
      status: med.status,
    });
    setIsAddModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.name.trim() || !formData.dosage.trim()) return;

    setActionInProgress('saving');
    try {
      if (editingMedicine) {
        await updateMedicine(editingMedicine.id, {
          name: formData.name.trim(),
          dosage: formData.dosage.trim(),
          scheduled_time: formData.scheduled_time,
          frequency: formData.frequency,
          start_date: formData.start_date,
          end_date: formData.end_date || undefined,
          notes: formData.notes.trim() || undefined,
          status: formData.status,
        });
        showToast(`Updated prescription: ${formData.name}`);
      } else {
        await addMedicine({
          user_id: user.id,
          name: formData.name.trim(),
          dosage: formData.dosage.trim(),
          scheduled_time: formData.scheduled_time,
          frequency: formData.frequency,
          start_date: formData.start_date,
          end_date: formData.end_date || undefined,
          notes: formData.notes.trim() || undefined,
          status: formData.status,
        });
        showToast(`Added new medication: ${formData.name}`);
      }
      setIsAddModalOpen(false);
      resetForm();
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name}?`)) return;
    setActionInProgress(id);
    try {
      await deleteMedicine(id);
      showToast(`Removed medication: ${name}`);
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleOpenSnooze = (med: Medicine) => {
    setSnoozeTargetMed(med);
    setSnoozeModalOpen(true);
  };

  const handleConfirmSnooze = async (medicineId: string, minutes: number) => {
    if (!user) return;
    setActionInProgress(medicineId);
    try {
      await recordMedicineAction(medicineId, user.id, 'SNOOZED', undefined, minutes);
      showToast(`Reminder snoozed for ${minutes} minutes.`);
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleAction = async (medicineId: string, action: 'TAKEN' | 'SNOOZED' | 'MISSED') => {
    if (!user) return;
    if (action === 'SNOOZED') {
      const med = medicines.find(m => m.id === medicineId);
      if (med) {
        handleOpenSnooze(med);
        return;
      }
    }
    setActionInProgress(medicineId);
    try {
      await recordMedicineAction(medicineId, user.id, action);
      if (action === 'TAKEN') {
        soundEffects.playMedicineChime();
        confetti({
          particleCount: 50,
          spread: 60,
          colors: ['#22d3ee', '#3b82f6', '#22c55e']
        });
        showToast('Logged as TAKEN. Adherence score updated!');
      } else {
        showToast('Marked as MISSED. Escalation sent to caregiver.');
      }
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionInProgress(null);
    }
  };


  // Filtered medicines
  const filteredMedicines = medicines.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.dosage.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.notes && m.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500/40 text-cyan-200 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* HEADER & TOP CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Pill className="w-3.5 h-3.5 text-cyan-400" />
            <span>Medication Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Prescriptions & Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time adherence tracking, dosage schedules and automatic caregiver sync
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* TABS: PRESCRIPTIONS VS LOGS */}
      <div className="flex border-b border-white/[0.08] gap-6">
        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            activeTab === 'prescriptions'
              ? 'text-cyan-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Active Prescriptions ({medicines.length})</span>
          {activeTab === 'prescriptions' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'text-cyan-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Intake Logs ({logs.length})</span>
          {activeTab === 'logs' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
          )}
        </button>
      </div>

      {activeTab === 'prescriptions' ? (
        <>
          {/* SEARCH & STATUS FILTER TOOLBAR */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by medicine name, dosage, or instructions..."
                className="w-full bg-[#0B1220] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="sm:col-span-4 flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[#0B1220] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="DUE">Due Now</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="TAKEN">Taken</option>
                <option value="SNOOZED">Snoozed</option>
                <option value="MISSED">Missed</option>
              </select>
            </div>
          </div>

          {/* MEDICINE CARDS LIST */}
          {loading ? (
            <div className="py-12 flex justify-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
          ) : filteredMedicines.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMedicines.map((med) => {
                const isDue = isMedicineDueTime(med, currentTime);
                return (
                  <div
                    key={med.id}
                    className={`rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all group ${
                      isDue
                        ? 'medicine-due-card-alert'
                        : 'bg-[#0B1220]/90 border border-white/[0.08] hover:border-white/[0.16]'
                    }`}
                  >
                    <div>
                      {/* Top Status & Edit/Delete */}
                      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                          isDue
                            ? 'bg-red-500/25 text-red-300 border border-red-500/50 medicine-due-badge-blink'
                            : med.status === 'TAKEN'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : med.status === 'SNOOZED'
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : med.status === 'MISSED'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {isDue && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping shrink-0" />}
                          {isDue ? 'MEDICINE DUE' : med.status}
                        </span>

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(med)}
                            className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Edit Prescription"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={actionInProgress === med.id}
                            onClick={() => handleDelete(med.id, med.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Delete Medicine"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Main Med Info */}
                      <div className="mt-4">
                        <h3 className="text-xl font-bold text-white tracking-tight">{med.name}</h3>
                        <p className="text-xs text-cyan-300 font-semibold mt-0.5">
                          {med.dosage} • {med.frequency}
                        </p>

                        <div className={`mt-3 inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs ${
                          isDue ? 'bg-red-950/60 text-red-200 border border-red-500/40' : 'bg-slate-900/60 text-slate-300'
                        }`}>
                          <Clock className={`w-3.5 h-3.5 ${isDue ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`} />
                          <span>Scheduled: <strong className="font-mono text-white">{med.scheduled_time}</strong></span>
                        </div>

                        {med.snoozed_until && med.status === 'SNOOZED' && (
                          <div className="mt-1.5 text-[11px] text-amber-300 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>Snoozed until {new Date(med.snoozed_until).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        )}

                        {med.notes && (
                          <p className="mt-2 text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-white/[0.04] leading-relaxed">
                            {med.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Operational Action Buttons */}
                    <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center gap-2">
                      <button
                        type="button"
                        disabled={actionInProgress === med.id}
                        onClick={() => handleAction(med.id, 'TAKEN')}
                        className="flex-1 py-2 bg-emerald-600/30 hover:bg-emerald-600 border border-emerald-500/40 hover:border-transparent text-emerald-200 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Taken</span>
                      </button>

                      <button
                        type="button"
                        disabled={actionInProgress === med.id}
                        onClick={() => handleOpenSnooze(med)}
                        className="px-3 py-2 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50"
                        title="Snooze Reminder"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Snooze</span>
                      </button>

                      <button
                        type="button"
                        disabled={actionInProgress === med.id}
                        onClick={() => handleAction(med.id, 'MISSED')}
                        className="px-3 py-2 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50"
                        title="Mark Missed"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Missed</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-950/40 border border-white/[0.06] rounded-3xl">
              <Pill className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No Prescriptions Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No medications matched your filter. Click "Add Medicine" above to record a new prescription.
              </p>
            </div>
          )}
        </>
      ) : (
        /* MEDICINE LOGS TAB */
        <div className="bg-[#0B1220]/90 border border-white/[0.08] rounded-3xl p-6 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
            <div>
              <h3 className="text-lg font-bold text-white">Medication Intake History</h3>
              <p className="text-xs text-slate-400">Auditable log of medicine actions stored in Supabase</p>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-white/[0.06]">
                <tr>
                  <th className="py-3 px-4">Medication</th>
                  <th className="py-3 px-4">Scheduled</th>
                  <th className="py-3 px-4">Actual Time</th>
                  <th className="py-3 px-4">Recorded Status</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">
                      {log.medicine_name || 'Prescription Dose'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {log.scheduled_time}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(log.actual_time).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        log.status === 'TAKEN'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : log.status === 'SNOOZED'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                      {log.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT MEDICINE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden glass-panel-elevated">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-600/20 text-cyan-400 rounded-xl">
                  <Pill className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {editingMedicine ? 'Edit Prescription' : 'Add New Prescription'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Amlodipine, Metformin, Atorvastatin"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    placeholder="e.g. 5 mg, 1 Tablet"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Scheduled Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                    placeholder="e.g. 08:00 AM, 01:30 PM"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Frequency
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Once Daily">Once Daily</option>
                    <option value="Twice Daily">Twice Daily</option>
                    <option value="Three Times Daily">Three Times Daily</option>
                    <option value="Once Weekly">Once Weekly</option>
                    <option value="As Needed (SOS)">As Needed (SOS)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Initial Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as MedicineStatus })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="DUE">Due</option>
                    <option value="TAKEN">Taken</option>
                    <option value="SNOOZED">Snoozed</option>
                    <option value="MISSED">Missed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Instructions & Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Take with warm water after breakfast. Do not take on an empty stomach."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-sm font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionInProgress === 'saving'}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {actionInProgress === 'saving' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving to Supabase...</span>
                    </>
                  ) : (
                    <span>{editingMedicine ? 'Update Prescription' : 'Save Prescription'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

