import React, { useState, useEffect } from 'react';
import { 
  User, 
  Phone, 
  Hospital, 
  ShieldAlert, 
  Save, 
  Plus, 
  Trash2, 
  PhoneCall, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  X,
  UserCheck
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { 
  getEmergencyContacts, 
  addEmergencyContact, 
  deleteEmergencyContact 
} from '@/services/api';
import { EmergencyContact } from '@/types';

export const ProfilePage: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Profile Form state
  const [profileData, setProfileData] = useState({
    full_name: '',
    age: 74,
    phone: '',
    preferred_hospital: '',
    ambulance_contact: '108',
  });

  // Emergency contact modal
  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);
  const [newContact, setNewContact] = useState({
    name: '',
    relationship: 'Family Member',
    phone: '',
    is_primary: false,
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || '',
        age: user.age || 74,
        phone: user.phone || '',
        preferred_hospital: user.preferred_hospital || 'Apollo Heart & Vascular Institute',
        ambulance_contact: user.ambulance_contact || '108',
      });
      getEmergencyContacts(user.id).then((c) => {
        setContacts(c);
        setLoading(false);
      });
    }
  }, [user]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile({
        full_name: profileData.full_name.trim(),
        age: Number(profileData.age),
        phone: profileData.phone.trim(),
        preferred_hospital: profileData.preferred_hospital.trim(),
        ambulance_contact: profileData.ambulance_contact.trim(),
      });
      showToast('Profile information successfully saved to Supabase!');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newContact.name.trim() || !newContact.phone.trim()) return;

    try {
      await addEmergencyContact({
        user_id: user.id,
        name: newContact.name.trim(),
        relationship: newContact.relationship.trim(),
        phone: newContact.phone.trim(),
        is_primary: newContact.is_primary,
      });
      showToast(`Added emergency contact: ${newContact.name}`);
      setIsContactModalOpen(false);
      setNewContact({ name: '', relationship: 'Family Member', phone: '', is_primary: false });
      const updated = await getEmergencyContacts(user.id);
      setContacts(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteContact = async (id: string, name: string) => {
    if (!user || !confirm(`Remove ${name} from emergency contacts?`)) return;
    try {
      await deleteEmergencyContact(id);
      showToast(`Removed emergency contact: ${name}`);
      const updated = await getEmergencyContacts(user.id);
      setContacts(updated);
    } catch (err) {
      console.error(err);
    }
  };

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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
          <User className="w-3.5 h-3.5 text-blue-400" />
          <span>Patient Identity & Contacts</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Profile & Emergency Information
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Manage clinical identity details, preferred care facilities, and trusted emergency contacts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* PROFILE FORM */}
        <div className="lg:col-span-7 bg-[#0B1220]/90 border border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-xl glass-panel">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
            <h3 className="text-lg font-bold text-white tracking-tight">Personal Details</h3>
            <span className="text-xs text-cyan-400 font-medium">Role: {user?.role}</span>
          </div>

          <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={profileData.full_name}
                onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Age (Years) *
                </label>
                <input
                  type="number"
                  required
                  value={profileData.age}
                  onChange={(e) => setProfileData({ ...profileData, age: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Primary Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Preferred Hospital / Clinic
              </label>
              <input
                type="text"
                value={profileData.preferred_hospital}
                onChange={(e) => setProfileData({ ...profileData, preferred_hospital: e.target.value })}
                placeholder="e.g. Apollo Heart & Vascular Institute"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Designated Ambulance Dispatch Number
              </label>
              <input
                type="text"
                value={profileData.ambulance_contact}
                onChange={(e) => setProfileData({ ...profileData, ambulance_contact: e.target.value })}
                placeholder="e.g. 108"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="pt-4 border-t border-white/[0.06]">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving to Supabase...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* EMERGENCY CONTACTS LIST */}
        <div className="lg:col-span-5 bg-[#0B1220]/90 border border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-xl glass-panel flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-bold text-white tracking-tight">Emergency Contacts</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsContactModalOpen(true)}
                className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-cyan-300 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Contact</span>
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between group hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{c.name}</span>
                        {c.is_primary && (
                          <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-bold">
                            PRIMARY
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">{c.relationship}</div>
                      <div className="text-[11px] font-mono text-cyan-400">{c.phone}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${c.phone}`}
                      className="p-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-lg transition-colors"
                      title="Direct Call"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDeleteContact(c.id, c.name)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Delete Contact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-6 text-[11px] text-slate-400 text-center">
            These contacts appear instantly in the SOS workflow when an emergency is confirmed.
          </p>
        </div>
      </div>

      {/* ADD CONTACT MODAL */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl glass-panel-elevated">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-base font-bold text-white">Add Emergency Contact</h4>
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddContact} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Contact Name *</label>
                <input
                  type="text"
                  required
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="e.g. Rohan Verma"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Relationship *</label>
                <input
                  type="text"
                  required
                  value={newContact.relationship}
                  onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                  placeholder="e.g. Son, Daughter, Cardiologist"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  placeholder="e.g. +91 98765 88990"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="primaryContactCheck"
                  checked={newContact.is_primary}
                  onChange={(e) => setNewContact({ ...newContact, is_primary: e.target.checked })}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                <label htmlFor="primaryContactCheck" className="text-slate-300 cursor-pointer">
                  Mark as Primary Emergency Contact
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
