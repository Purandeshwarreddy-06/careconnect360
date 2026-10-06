import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Check, 
  Trash2, 
  Pill, 
  AlertCircle, 
  Calendar, 
  Activity, 
  ShieldAlert, 
  Loader2, 
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { 
  getNotifications, 
  markNotificationRead, 
  markAllNotificationsRead,
  subscribeToLiveUpdates 
} from '@/services/api';
import { NotificationItem, NotificationType } from '@/types';

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchNotifs = async () => {
    if (!user) return;
    try {
      const list = await getNotifications(user.id);
      setNotifications(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const unsubscribe = subscribeToLiveUpdates(() => {
      fetchNotifs();
    });
    return () => unsubscribe();
  }, [user]);

  const handleMarkRead = async (id: string) => {
    setActionInProgress(id);
    try {
      await markNotificationRead(id);
      await fetchNotifs();
    } catch (e) {
      console.error(e);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    setActionInProgress('all');
    try {
      await markAllNotificationsRead(user.id);
      await fetchNotifs();
    } catch (e) {
      console.error(e);
    } finally {
      setActionInProgress(null);
    }
  };

  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case 'EMERGENCY':
        return <ShieldAlert className="w-5 h-5 text-red-400" />;
      case 'MEDICINE_DUE':
        return <Pill className="w-5 h-5 text-cyan-400" />;
      case 'MEDICINE_MISSED':
        return <AlertCircle className="w-5 h-5 text-rose-400" />;
      case 'APPOINTMENT':
        return <Calendar className="w-5 h-5 text-purple-400" />;
      case 'HEALTH_UPDATE':
        return <Activity className="w-5 h-5 text-emerald-400" />;
      default:
        return <Bell className="w-5 h-5 text-blue-400" />;
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'UNREAD') return !n.is_read;
    return n.type === filterType;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      {/* HEADER & TOP BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Bell className="w-3.5 h-3.5 text-cyan-400" />
            <span>Alerts & Notifications Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            System Alerts & Reminders
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Realtime notifications for medications, vital checks, doctor visits and emergency alerts
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            disabled={actionInProgress === 'all'}
            onClick={handleMarkAllRead}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-semibold text-xs sm:text-sm rounded-xl flex items-center gap-2 transition-all"
          >
            <CheckCheck className="w-4 h-4 text-cyan-400" />
            <span>Mark All As Read</span>
          </button>
        )}
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-white/[0.08]">
        {[
          { key: 'ALL', label: `All (${notifications.length})` },
          { key: 'UNREAD', label: `Unread (${unreadCount})` },
          { key: 'MEDICINE_DUE', label: 'Medicine Due' },
          { key: 'MEDICINE_MISSED', label: 'Medicine Missed' },
          { key: 'APPOINTMENT', label: 'Appointments' },
          { key: 'HEALTH_UPDATE', label: 'Health' },
          { key: 'EMERGENCY', label: 'Emergency' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilterType(f.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === f.key
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* NOTIFICATIONS LIST */}
      {loading ? (
        <div className="py-12 flex justify-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
      ) : filteredNotifs.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifs.map((item) => (
            <div
              key={item.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                !item.is_read
                  ? 'bg-[#0B1220] border-cyan-500/40 shadow-lg'
                  : 'bg-slate-950/60 border-white/[0.06] opacity-80'
              }`}
            >
              <div className={`p-3 rounded-xl shrink-0 ${
                item.type === 'EMERGENCY'
                  ? 'bg-red-500/20'
                  : item.type === 'MEDICINE_MISSED'
                  ? 'bg-rose-500/20'
                  : item.type === 'MEDICINE_DUE'
                  ? 'bg-cyan-500/20'
                  : item.type === 'APPOINTMENT'
                  ? 'bg-purple-500/20'
                  : 'bg-emerald-500/20'
              }`}>
                {getIconForType(item.type)}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    {item.title}
                    {!item.is_read && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    )}
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0">
                    {new Date(item.created_at).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                  {item.message}
                </p>
              </div>

              {!item.is_read && (
                <button
                  type="button"
                  disabled={actionInProgress === item.id}
                  onClick={() => handleMarkRead(item.id)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-semibold rounded-lg shrink-0 flex items-center gap-1 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mark Read</span>
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-950/40 border border-white/[0.06] rounded-3xl">
          <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Notifications</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            You are fully up to date! System and reminder alerts will appear here in real time.
          </p>
        </div>
      )}
    </div>
  );
};
