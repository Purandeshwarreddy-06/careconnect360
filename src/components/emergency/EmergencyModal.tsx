import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  PhoneCall, 
  ShieldAlert, 
  CheckCircle, 
  X, 
  Hospital, 
  UserCheck, 
  MapPin, 
  Clock, 
  Loader2 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { 
  triggerEmergency, 
  getEmergencyContacts, 
  acknowledgeEmergency, 
  resolveEmergency 
} from '@/services/api';
import { EmergencyContact, EmergencyEvent } from '@/types';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [stage, setStage] = useState<'confirm' | 'active'>('confirm');
  const [loading, setLoading] = useState<boolean>(false);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [currentEvent, setCurrentEvent] = useState<EmergencyEvent | null>(null);
  const [customNote, setCustomNote] = useState<string>('');

  useEffect(() => {
    if (isOpen && user) {
      getEmergencyContacts(user.id).then(setContacts);
      setStage('confirm');
      setCurrentEvent(null);
      setCustomNote('');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleConfirmEmergency = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const event = await triggerEmergency(
        user.id,
        'Home - 42 Heritage Gardens',
        customNote.trim() || 'Urgent assistance requested from emergency SOS trigger.'
      );
      setCurrentEvent(event);
      setStage('active');
    } catch (err) {
      console.error('Failed to trigger emergency:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStandDown = async () => {
    if (currentEvent) {
      setLoading(true);
      try {
        await resolveEmergency(currentEvent.id);
        onClose();
      } catch (err) {
        console.error('Failed to resolve emergency:', err);
      } finally {
        setLoading(false);
      }
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-950 border border-red-500/40 rounded-2xl shadow-2xl overflow-hidden glass-glow-emergency">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-red-700 via-rose-600 to-red-800 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-950/60 rounded-xl border border-red-300/30">
              <ShieldAlert className="w-6 h-6 text-red-100 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">EMERGENCY ASSISTANCE PROTOCOL</h2>
              <p className="text-xs text-red-100/80 font-medium">CareConnect 360 Incident Response</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-red-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {stage === 'confirm' ? (
            <div className="space-y-6">
              {/* Prototype Disclaimer Alert */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-amber-200 text-sm">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-300">Hackathon Prototype Notice</h4>
                    <p className="mt-1 text-xs text-amber-200/90 leading-relaxed">
                      This activates the CareConnect 360 incident workflow, logs an emergency record in Supabase, and broadcasts instant real-time alerts to linked family caregivers. 
                      <span className="font-bold underline ml-1">
                        This prototype does not automatically dispatch municipal ambulances or dial emergency services directly without your confirmation.
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Patient Details Snapshot */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">User / Patient:</span>
                  <span className="text-white font-medium">{user?.full_name || 'Lakshmi Devi'} (Age {user?.age || 74})</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Designated Hospital:</span>
                  <span className="text-white font-medium">{user?.preferred_hospital || 'Apollo Heart & Vascular Institute'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Emergency Phone:</span>
                  <span className="text-cyan-400 font-mono font-medium">{user?.ambulance_contact || '108'}</span>
                </div>
              </div>

              {/* Optional Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Emergency Note / Symptoms (Optional)
                </label>
                <textarea
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="e.g. Sudden dizziness, chest tightness, or fall in living room..."
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-5 py-3 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium text-sm transition-all text-center"
                >
                  Cancel / Return
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleConfirmEmergency}
                  className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Broadcasting Alert...</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-5 h-5" />
                      <span>Confirm Emergency Alert</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Active Protocol Status Banner */}
              <div className="bg-red-950/40 border border-red-500/50 rounded-xl p-4 text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  Active Incident Logged in Supabase
                </div>
                <h3 className="text-lg font-bold text-white">Emergency Broadcast Active</h3>
                <p className="text-xs text-slate-300">
                  Incident ID: <span className="font-mono text-cyan-400">{currentEvent?.id}</span> • Status: <span className="text-red-400 font-semibold">{currentEvent?.status}</span>
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    {currentEvent?.location || 'Home'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    {new Date(currentEvent?.timestamp || Date.now()).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Direct Speed Dial Actions */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Direct Contact & Speed Dial
                </h4>
                <div className="space-y-2.5">
                  {/* Ambulance Direct Tel */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-900 border border-red-500/30 rounded-xl hover:border-red-500/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-red-500/10 rounded-lg text-red-400">
                        <Hospital className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm">Emergency Medical Ambulance</div>
                        <div className="text-xs text-slate-400">National Medical Hotline</div>
                      </div>
                    </div>
                    <a
                      href="tel:108"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shadow-md transition-transform active:scale-95"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call 108</span>
                    </a>
                  </div>

                  {/* Configured Emergency Contacts */}
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-3.5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-400">
                          <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">
                            {contact.name} {contact.is_primary && <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded ml-1 font-bold">PRIMARY</span>}
                          </div>
                          <div className="text-xs text-slate-400">{contact.relationship}</div>
                        </div>
                      </div>
                      <a
                        href={`tel:${contact.phone}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-md transition-transform active:scale-95"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resolution / Stand Down */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  When assistance is confirmed, close this incident.
                </span>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleStandDown}
                  className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Acknowledge & Stand Down</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
