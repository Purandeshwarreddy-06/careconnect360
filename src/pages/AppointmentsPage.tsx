import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Plus, 
  Video, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  FileText, 
  Trash2, 
  Edit3, 
  Loader2, 
  X,
  Stethoscope,
  Building,
  User
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { 
  getAppointments, 
  addAppointment, 
  updateAppointment, 
  deleteAppointment,
  subscribeToLiveUpdates
} from '@/services/api';
import { Appointment, AppointmentStatus } from '@/types';
import { HEALTHCARE_IMAGES, FALLBACK_IMAGE } from '@/assets/images';

export const AppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statusTab, setStatusTab] = useState<'ALL' | 'TODAY' | 'UPCOMING' | 'COMPLETED'>('ALL');

  // Modals & form state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    doctor_name: '',
    specialty: '',
    hospital_clinic: '',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '10:30 AM',
    reason: '',
    notes: '',
    status: 'UPCOMING' as AppointmentStatus,
    doctor_image: '',
  });

  const fetchData = async () => {
    if (!user) return;
    try {
      const data = await getAppointments(user.id);
      setAppointments(data);
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
      doctor_name: '',
      specialty: 'Cardiologist',
      hospital_clinic: 'Apollo Heart & Vascular Institute',
      appointment_date: new Date().toISOString().split('T')[0],
      appointment_time: '10:30 AM',
      reason: '',
      notes: '',
      status: 'UPCOMING',
      doctor_image: '',
    });
    setEditingAppointment(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (apt: Appointment) => {
    setEditingAppointment(apt);
    setFormData({
      doctor_name: apt.doctor_name,
      specialty: apt.specialty,
      hospital_clinic: apt.hospital_clinic,
      appointment_date: apt.appointment_date,
      appointment_time: apt.appointment_time,
      reason: apt.reason,
      notes: apt.notes || '',
      status: apt.status,
      doctor_image: apt.doctor_image || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.doctor_name.trim() || !formData.reason.trim()) return;

    setActionInProgress('saving');
    try {
      if (editingAppointment) {
        await updateAppointment(editingAppointment.id, {
          doctor_name: formData.doctor_name.trim(),
          specialty: formData.specialty.trim(),
          hospital_clinic: formData.hospital_clinic.trim(),
          appointment_date: formData.appointment_date,
          appointment_time: formData.appointment_time,
          reason: formData.reason.trim(),
          notes: formData.notes.trim() || undefined,
          status: formData.status,
        });
        showToast(`Updated appointment with ${formData.doctor_name}`);
      } else {
        await addAppointment({
          user_id: user.id,
          doctor_name: formData.doctor_name.trim(),
          specialty: formData.specialty.trim(),
          hospital_clinic: formData.hospital_clinic.trim(),
          appointment_date: formData.appointment_date,
          appointment_time: formData.appointment_time,
          reason: formData.reason.trim(),
          notes: formData.notes.trim() || undefined,
          status: formData.status,
          doctor_image: formData.doctor_image || HEALTHCARE_IMAGES.doctorConsultation,
        });
        showToast(`Scheduled appointment with ${formData.doctor_name}`);
      }
      setIsModalOpen(false);
      resetForm();
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleMarkCompleted = async (apt: Appointment) => {
    setActionInProgress(apt.id);
    try {
      await updateAppointment(apt.id, { status: 'COMPLETED' });
      showToast(`Marked consultation with ${apt.doctor_name} as Completed.`);
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeleteAppointment = async (id: string, docName: string) => {
    if (!confirm(`Cancel and delete appointment with ${docName}?`)) return;
    setActionInProgress(id);
    try {
      await deleteAppointment(id);
      showToast(`Deleted appointment with ${docName}`);
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionInProgress(null);
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    if (statusTab === 'ALL') return true;
    return a.status === statusTab;
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

      {/* HEADER & TOP BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            <span>Consultation & Appointments</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Doctor Visits & Virtual Reviews
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Coordinate in-clinic appointments and join interactive virtual doctor consultations
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Appointment</span>
        </button>
      </div>

      {/* STATUS FILTER TABS */}
      <div className="flex border-b border-white/[0.08] gap-4 sm:gap-6 overflow-x-auto">
        {(['ALL', 'TODAY', 'UPCOMING', 'COMPLETED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusTab(tab)}
            className={`pb-3 text-xs sm:text-sm font-bold transition-all relative whitespace-nowrap ${
              statusTab === tab
                ? 'text-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="capitalize">{tab === 'ALL' ? 'All Appointments' : tab.toLowerCase()}</span>
            {statusTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* APPOINTMENT CARDS */}
      {loading ? (
        <div className="py-12 flex justify-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
      ) : filteredAppointments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-[#0B1220]/90 border border-white/[0.08] hover:border-white/[0.16] rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all group"
            >
              <div>
                {/* Status & Edit/Delete */}
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    apt.status === 'TODAY'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 animate-pulse'
                      : apt.status === 'UPCOMING'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {apt.status}
                  </span>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(apt)}
                      className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit Appointment"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={actionInProgress === apt.id}
                      onClick={() => handleDeleteAppointment(apt.id, apt.doctor_name)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Cancel Appointment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Doctor Header */}
                <div className="mt-4 flex items-center gap-3.5">
                  <img
                    src={apt.doctor_image || HEALTHCARE_IMAGES.doctorConsultation}
                    alt={apt.doctor_name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                    }}
                    className="w-14 h-14 rounded-2xl object-cover border border-cyan-500/30 shadow-md shrink-0"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{apt.doctor_name}</h3>
                    <p className="text-xs text-cyan-300 font-semibold">{apt.specialty}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Building className="w-3 h-3 text-slate-500" />
                      <span>{apt.hospital_clinic}</span>
                    </p>
                  </div>
                </div>

                {/* Date & Reason Snapshot */}
                <div className="mt-4 bg-slate-900/60 p-3 rounded-xl border border-white/[0.04] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Date & Time:</span>
                    </span>
                    <span className="text-white font-mono font-bold">
                      {apt.appointment_date} • {apt.appointment_time}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Clinical Purpose: </span>
                    <span className="text-slate-200 font-medium">{apt.reason}</span>
                  </div>
                  {apt.notes && (
                    <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                      Note: {apt.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons: Join Consultation & Mark Completed */}
              <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/consultation/${apt.id}`)}
                  className="flex-1 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-1.5 transition-all transform active:scale-95"
                >
                  <Video className="w-4 h-4" />
                  <span>Join Consultation</span>
                </button>

                {apt.status !== 'COMPLETED' && (
                  <button
                    type="button"
                    disabled={actionInProgress === apt.id}
                    onClick={() => handleMarkCompleted(apt)}
                    className="p-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 rounded-xl transition-all"
                    title="Mark Consultation Completed"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-950/40 border border-white/[0.06] rounded-3xl">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Consultations Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            No records matched this filter. Click "Schedule Appointment" to book a visit.
          </p>
        </div>
      )}

      {/* ADD / EDIT APPOINTMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden glass-panel-elevated">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-600/20 text-purple-400 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {editingAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAppointment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Doctor Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.doctor_name}
                  onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                  placeholder="e.g. Dr. Ananya Rao"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Specialty *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    placeholder="e.g. Cardiologist, Neurologist"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Hospital / Clinic *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.hospital_clinic}
                    onChange={(e) => setFormData({ ...formData, hospital_clinic: e.target.value })}
                    placeholder="e.g. Apollo Heart Institute"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.appointment_date}
                    onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.appointment_time}
                    onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                    placeholder="e.g. 04:00 PM"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Reason for Visit *
                </label>
                <input
                  type="text"
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="e.g. Routine blood pressure check, post-treatment follow-up"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Doctor Notes & Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Keep last 7 days of blood pressure readings handy..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-sm font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionInProgress === 'saving'}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
                >
                  {actionInProgress === 'saving' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving appointment...</span>
                    </>
                  ) : (
                    <span>{editingAppointment ? 'Update Appointment' : 'Save to Supabase'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
