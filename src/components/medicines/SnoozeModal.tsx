import React, { useState } from 'react';
import { Clock, X, BellRing, Check, Loader2 } from 'lucide-react';
import { Medicine } from '@/types';

interface SnoozeModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: Medicine | null;
  onConfirm: (medicineId: string, minutes: number) => Promise<void>;
}

const SNOOZE_PRESETS = [
  { label: '5 Minutes', minutes: 5 },
  { label: '10 Minutes', minutes: 10 },
  { label: '15 Minutes', minutes: 15 },
  { label: '30 Minutes', minutes: 30 },
  { label: '1 Hour', minutes: 60 },
];

export const SnoozeModal: React.FC<SnoozeModalProps> = ({
  isOpen,
  onClose,
  medicine,
  onConfirm,
}) => {
  const [selectedMinutes, setSelectedMinutes] = useState<number>(15);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen || !medicine) return null;

  const now = new Date();
  const nextAlertTime = new Date(now.getTime() + selectedMinutes * 60000);
  const formattedNextTime = nextAlertTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(medicine.id, selectedMinutes);
      onClose();
    } catch (err) {
      console.error('Failed to snooze reminder:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-950 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden glass-panel-elevated">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Snooze Dose Reminder</h3>
              <p className="text-[11px] text-amber-300/80">Select snooze interval</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Target Medicine Info */}
          <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl">
            <div className="text-xs text-slate-400">Current Medication</div>
            <div className="text-base font-bold text-white mt-0.5">{medicine.name}</div>
            <div className="text-xs text-cyan-300 mt-0.5">
              {medicine.dosage} • Scheduled: {medicine.scheduled_time}
            </div>
          </div>

          {/* Preset Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Snooze Duration
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {SNOOZE_PRESETS.map((preset) => {
                const isSelected = selectedMinutes === preset.minutes;
                return (
                  <button
                    key={preset.minutes}
                    type="button"
                    onClick={() => setSelectedMinutes(preset.minutes)}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 border border-amber-400/50'
                        : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
                    }`}
                  >
                    <span>{preset.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* New Scheduled Preview */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
            <BellRing className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
            <div className="text-xs text-amber-200">
              Next alert will trigger at{' '}
              <strong className="font-mono text-white text-sm underline">
                {formattedNextTime}
              </strong>{' '}
              ({selectedMinutes} min from now).
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Confirm Snooze</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
