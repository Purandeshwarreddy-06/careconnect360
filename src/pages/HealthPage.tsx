import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Plus, 
  Heart, 
  Flame, 
  Thermometer, 
  Droplet, 
  Scale, 
  Trash2, 
  TrendingUp, 
  Filter, 
  Calendar, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  X,
  AlertTriangle,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { 
  getHealthReadings, 
  addHealthReading, 
  deleteHealthReading,
  subscribeToLiveUpdates
} from '@/services/api';
import { HealthReading, HealthParameter, HealthStatus } from '@/types';

export const HealthPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [readings, setReadings] = useState<HealthReading[]>([]);
  
  // Filter states
  const [timeFilter, setTimeFilter] = useState<'24H' | '7D' | '30D'>('7D');
  const [selectedParameter, setSelectedParameter] = useState<HealthParameter>('blood_pressure');

  // Modal & action state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Reading Form State
  const [formData, setFormData] = useState<{
    parameter: HealthParameter;
    value: number;
    systolic?: number;
    diastolic?: number;
    unit: string;
    status: HealthStatus;
    note: string;
  }>({
    parameter: 'blood_pressure',
    value: 120,
    systolic: 120,
    diastolic: 80,
    unit: 'mmHg',
    status: 'NORMAL',
    note: '',
  });

  const fetchData = async () => {
    if (!user) return;
    try {
      const data = await getHealthReadings(user.id, timeFilter);
      setReadings(data);
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
  }, [user, timeFilter]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper to sync units and reasonable status when parameter changes in modal
  const handleParamSelectInModal = (p: HealthParameter) => {
    let unit = 'bpm';
    let defaultVal = 72;
    if (p === 'blood_pressure') {
      unit = 'mmHg';
      defaultVal = 120;
    } else if (p === 'spo2') {
      unit = '%';
      defaultVal = 98;
    } else if (p === 'temperature') {
      unit = '°F';
      defaultVal = 98.4;
    } else if (p === 'blood_sugar') {
      unit = 'mg/dL';
      defaultVal = 110;
    } else if (p === 'weight') {
      unit = 'kg';
      defaultVal = 65;
    }

    setFormData({
      ...formData,
      parameter: p,
      unit,
      value: defaultVal,
      systolic: p === 'blood_pressure' ? 120 : undefined,
      diastolic: p === 'blood_pressure' ? 80 : undefined,
    });
  };

  const handleSaveReading = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setActionInProgress('saving');
    try {
      await addHealthReading({
        user_id: user.id,
        parameter: formData.parameter,
        value: Number(formData.value),
        systolic: formData.parameter === 'blood_pressure' ? Number(formData.systolic) : undefined,
        diastolic: formData.parameter === 'blood_pressure' ? Number(formData.diastolic) : undefined,
        unit: formData.unit,
        status: formData.status,
        note: formData.note.trim() || undefined,
        timestamp: new Date().toISOString(),
      });
      showToast(`Logged vital reading for ${formData.parameter.replace('_', ' ')}!`);
      setIsAddModalOpen(false);
      setFormData({
        parameter: 'blood_pressure',
        value: 120,
        systolic: 120,
        diastolic: 80,
        unit: 'mmHg',
        status: 'NORMAL',
        note: '',
      });
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeleteReading = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recorded reading?')) return;
    setActionInProgress(id);
    try {
      await deleteHealthReading(id);
      showToast('Reading deleted.');
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionInProgress(null);
    }
  };

  // Filter readings for current chart parameter
  const filteredForChart = readings
    .filter((r) => r.parameter === selectedParameter)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const chartData = filteredForChart.map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date: new Date(r.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    value: r.value,
    systolic: r.systolic,
    diastolic: r.diastolic,
    unit: r.unit,
    status: r.status,
  }));

  const latestReading = filteredForChart.length > 0 ? filteredForChart[filteredForChart.length - 1] : null;

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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Health & Vitals Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Vital Readings & Trends
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Continuous health parameter tracking • Historical trends & caregiver observation
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Record Health Reading</span>
        </button>
      </div>

      {/* PARAMETER SELECTOR CHIPS */}
      <div className="flex flex-wrap gap-2.5">
        {[
          { key: 'blood_pressure', label: 'Blood Pressure', icon: Activity, unit: 'mmHg' },
          { key: 'heart_rate', label: 'Heart Rate', icon: Heart, unit: 'bpm' },
          { key: 'blood_sugar', label: 'Blood Sugar', icon: Flame, unit: 'mg/dL' },
          { key: 'spo2', label: 'SpO₂ Oxygen', icon: Droplet, unit: '%' },
          { key: 'temperature', label: 'Temperature', icon: Thermometer, unit: '°F' },
          { key: 'weight', label: 'Weight', icon: Scale, unit: 'kg' },
        ].map((item) => {
          const Icon = item.icon;
          const isSelected = selectedParameter === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setSelectedParameter(item.key as HealthParameter)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 ring-2 ring-cyan-400/40'
                  : 'bg-[#0B1220] border border-white/[0.08] text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* TREND ANALYSIS CHART PANEL */}
      <section className="bg-[#0B1220]/90 border border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-xl glass-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-2xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white tracking-tight capitalize">
                  {selectedParameter.replace('_', ' ')}
                </h3>
                {latestReading && (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    latestReading.status === 'NORMAL'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : latestReading.status === 'ATTENTION'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {latestReading.status}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Latest: <strong className="font-mono text-white text-sm">
                  {latestReading?.systolic && latestReading?.diastolic
                    ? `${latestReading.systolic}/${latestReading.diastolic} ${latestReading.unit}`
                    : latestReading ? `${latestReading.value} ${latestReading.unit}` : 'No readings yet'}
                </strong>
              </p>
            </div>
          </div>

          {/* Time Filter Buttons (24H, 7D, 30D) */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            {(['24H', '7D', '30D'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setTimeFilter(filter)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timeFilter === filter
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts chart */}
        <div className="mt-6 h-80 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
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
                  stroke="#38BDF8"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#chartGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
              No recorded entries for this time period. Click "Record Health Reading" to log.
            </div>
          )}
        </div>
      </section>

      {/* RECENT READINGS TABLE */}
      <section className="bg-[#0B1220]/90 border border-white/[0.08] rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Recorded Telemetry Log</h3>
            <p className="text-xs text-slate-400">All recent vital recordings across all categories</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {readings.length} total records
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-white/[0.06]">
              <tr>
                <th className="py-3 px-4">Parameter</th>
                <th className="py-3 px-4">Value</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Recorded At</th>
                <th className="py-3 px-4">Clinical Notes</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {readings.slice().reverse().map((reading) => (
                <tr key={reading.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white capitalize">
                    {reading.parameter.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-cyan-300">
                    {reading.parameter === 'blood_pressure' && reading.systolic && reading.diastolic
                      ? `${reading.systolic}/${reading.diastolic} ${reading.unit}`
                      : `${reading.value} ${reading.unit}`}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      reading.status === 'NORMAL'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : reading.status === 'ATTENTION'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {reading.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono">
                    {new Date(reading.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                    {reading.note || '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      disabled={actionInProgress === reading.id}
                      onClick={() => handleDeleteReading(reading.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Delete Reading"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ADD READING MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden glass-panel-elevated">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-600/20 text-cyan-400 rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Record Health Reading</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReading} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Health Parameter *
                </label>
                <select
                  value={formData.parameter}
                  onChange={(e) => handleParamSelectInModal(e.target.value as HealthParameter)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="blood_pressure">Blood Pressure (mmHg)</option>
                  <option value="heart_rate">Heart Rate (bpm)</option>
                  <option value="blood_sugar">Blood Sugar (mg/dL)</option>
                  <option value="spo2">SpO₂ Oxygen Saturation (%)</option>
                  <option value="temperature">Body Temperature (°F)</option>
                  <option value="weight">Body Weight (kg)</option>
                </select>
              </div>

              {formData.parameter === 'blood_pressure' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Systolic (mmHg) *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.systolic || 120}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        systolic: Number(e.target.value),
                        value: Number(e.target.value)
                      })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Diastolic (mmHg) *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.diastolic || 80}
                      onChange={(e) => setFormData({ ...formData, diastolic: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Measured Value *
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Unit
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={formData.unit}
                      className="w-full bg-slate-900/50 border border-slate-800 text-slate-400 rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Observation Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as HealthStatus })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="NORMAL">NORMAL (Within optimal range)</option>
                  <option value="ATTENTION">ATTENTION (Elevated / Borderline)</option>
                  <option value="NEEDS REVIEW">NEEDS REVIEW (Requires medical consultation)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Reading Note (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="e.g. Taken 2 hours after lunch, rested for 5 minutes prior..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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
                      <span>Saving reading...</span>
                    </>
                  ) : (
                    <span>Save to Supabase</span>
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
