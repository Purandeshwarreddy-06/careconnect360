import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Pill, 
  Activity, 
  Calendar, 
  Users, 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  ShieldAlert, 
  Radio, 
  Database, 
  Check, 
  Menu, 
  X,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/common/Logo';
import { EmergencyModal } from '@/components/emergency/EmergencyModal';
import { getNotifications, subscribeToLiveUpdates } from '@/services/api';
import { NotificationItem } from '@/types';

export const AppLayout: React.FC = () => {
  const { user, logout, switchRole, loadDemoData } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState<boolean>(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [demoActionToast, setDemoActionToast] = useState<string | null>(null);

  // Live Clock updater
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch unread notifications
  const updateNotifications = async () => {
    if (!user) return;
    try {
      const notifs: NotificationItem[] = await getNotifications(user.id);
      const unread = notifs.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    updateNotifications();
    const unsubscribe = subscribeToLiveUpdates(() => {
      updateNotifications();
    });
    return () => unsubscribe();
  }, [user]);

  // Greeting according to local time
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleRoleSwitch = async (role: 'elderly' | 'caregiver') => {
    await switchRole(role);
    setIsProfileDropdownOpen(false);
    setDemoActionToast(`Switched active view to ${role === 'elderly' ? 'Lakshmi Devi (Elderly)' : 'Rohan Verma (Caregiver)'}`);
    setTimeout(() => setDemoActionToast(null), 3000);
    if (role === 'caregiver') {
      navigate('/caregiver');
    } else {
      navigate('/');
    }
  };

  const handleLoadDemoData = async () => {
    await loadDemoData();
    setIsProfileDropdownOpen(false);
    setDemoActionToast('Fictional Demo Data successfully loaded into Supabase store!');
    setTimeout(() => setDemoActionToast(null), 3500);
  };

  const handleLogout = async () => {
    setIsProfileDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: Home, exact: true },
    { to: '/medicines', label: 'Medicines', icon: Pill },
    { to: '/health', label: 'Health Track', icon: Activity },
    { to: '/appointments', label: 'Appointments', icon: Calendar },
    { to: '/caregiver', label: 'Family Care', icon: Users, badge: user?.role === 'caregiver' ? 'Active' : undefined },
    { to: '/notifications', label: 'Notifications', icon: Bell, badge: unreadCount > 0 ? String(unreadCount) : undefined },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Toast Notification for quick actions */}
      {demoActionToast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 border border-cyan-500/40 text-cyan-200 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-top-2 duration-300">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-sm font-medium">{demoActionToast}</span>
        </div>
      )}

      {/* TOP COMMAND HEADER */}
      <header className="sticky top-0 z-40 w-full bg-[#08111F]/90 backdrop-blur-md border-b border-white/[0.08] px-4 lg:px-8 py-3.5 flex items-center justify-between transition-colors">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
            title="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <Logo size="md" showTagline />
        </div>

        {/* Center: Greeting & Live Indicator */}
        <div className="hidden md:flex flex-col items-center">
          <div className="flex items-center gap-2.5">
            <span className="text-base lg:text-lg font-bold text-white tracking-tight">
              {getGreeting()}, <span className="text-cyan-400 font-extrabold">{user?.full_name || 'Lakshmi Devi'}</span>
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
              <span>LIVE</span>
            </div>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5 font-medium">
            <span>
              {currentTime.toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span>•</span>
            <span className="font-mono text-cyan-300">
              {currentTime.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* Right: Emergency Button, Notifications, Profile Menu */}
        <div className="flex items-center gap-3 lg:gap-4">
          {/* Prominent Emergency Button */}
          <button
            type="button"
            onClick={() => setIsEmergencyOpen(true)}
            className="px-3.5 sm:px-4 py-2 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all transform active:scale-95 border border-red-400/30 animate-pulse"
            title="Trigger Emergency Protocol"
          >
            <ShieldAlert className="w-4 h-4 text-white" />
            <span className="tracking-wide">EMERGENCY</span>
          </button>

          {/* Notifications Icon Button */}
          <NavLink
            to="/notifications"
            className="relative p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-bold text-[11px] flex items-center justify-center shadow-md animate-bounce">
                {unreadCount}
              </span>
            )}
          </NavLink>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs uppercase shadow-inner">
                {user?.full_name ? user.full_name.charAt(0) : 'L'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-white leading-tight">
                  {user?.full_name || 'Lakshmi Devi'}
                </span>
                <span className="text-[10px] text-cyan-400 font-medium capitalize">
                  {user?.role || 'elderly'}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* Profile Dropdown */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-sm glass-panel-elevated animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-3 border-b border-slate-800/80">
                  <p className="font-semibold text-white">{user?.full_name}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-medium">
                    <span>Role:</span>
                    <span className="capitalize font-bold text-cyan-400">{user?.role}</span>
                  </div>
                </div>

                {/* Role Switcher for Hackathon Testing */}
                <div className="px-3 py-2 border-b border-slate-800/80">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1">
                    Demo Role Switcher
                  </div>
                  <button
                    onClick={() => handleRoleSwitch('elderly')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      user?.role === 'elderly'
                        ? 'bg-blue-600/20 text-cyan-300 border border-blue-500/30'
                        : 'text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <span>Lakshmi Devi (Elderly User)</span>
                    {user?.role === 'elderly' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('caregiver')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors mt-1 ${
                      user?.role === 'caregiver'
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                        : 'text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <span>Rohan Verma (Caregiver)</span>
                    {user?.role === 'caregiver' && <Check className="w-3.5 h-3.5 text-purple-400" />}
                  </button>
                </div>

                {/* Demo Data Seeder */}
                <div className="px-3 py-2 border-b border-slate-800/80">
                  <button
                    onClick={handleLoadDemoData}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-cyan-300 hover:bg-cyan-500/10 transition-colors"
                  >
                    <Database className="w-4 h-4 text-cyan-400" />
                    <span>LOAD DEMO DATA</span>
                  </button>
                </div>

                {/* Navigation links */}
                <div className="py-1">
                  <NavLink
                    to="/profile"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-900 text-xs font-medium transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>My Profile</span>
                  </NavLink>
                  <NavLink
                    to="/settings"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-900 text-xs font-medium transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Settings</span>
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN BODY AREA WITH SIDEBAR */}
      <div className="flex-1 flex max-w-[1700px] w-full mx-auto">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:flex flex-col w-64 bg-[#08111F]/50 border-r border-white/[0.08] p-4 shrink-0 justify-between">
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-2">
              Navigation
            </div>
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-600/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500 text-slate-950">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Sidebar Footer Info */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>NIGHTCARE Command Center</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Real-time synchronization enabled. Connected to caregiver mesh.
            </p>
          </div>
        </aside>

        {/* MOBILE SLIDE-OUT MENU */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden bg-black/70 backdrop-blur-sm">
            <div className="w-72 h-full bg-slate-950 border-r border-slate-800 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <Logo size="sm" />
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-4 space-y-1">
                  {navLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.exact}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-blue-600 text-white font-semibold'
                              : 'text-slate-300 hover:bg-slate-900'
                          }`
                        }
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500 text-slate-950">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-2">
                <button
                  onClick={handleLoadDemoData}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded-xl text-xs font-bold"
                >
                  <Database className="w-4 h-4" />
                  <span>LOAD DEMO DATA</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-950/40 text-rose-300 rounded-xl text-xs font-bold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONTENT VIEWPORT */}
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8 pb-24 lg:pb-12 max-w-full">
          <Outlet />
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR (Elderly Accessible large touch targets) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#08111F]/95 backdrop-blur-xl border-t border-white/[0.08] px-2 py-1.5 flex items-center justify-around">
        {[
          { to: '/', label: 'Home', icon: Home, exact: true },
          { to: '/medicines', label: 'Meds', icon: Pill },
          { to: '/health', label: 'Health', icon: Activity },
          { to: '/appointments', label: 'Doctor', icon: Calendar },
          { to: '/caregiver', label: 'Family', icon: Users },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-cyan-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[11px] font-medium tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* EMERGENCY WORKFLOW MODAL */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />
    </div>
  );
};
