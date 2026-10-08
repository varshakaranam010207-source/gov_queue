import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  LayoutDashboard,
  FileText,
  CalendarCheck2,
  Clock3,
  Bell,
  Sparkles,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Landmark,
} from 'lucide-react';
import { APP_NAME, APP_TAGLINE } from '@shared/constants';

export const CitizenLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    const fetchUnread = async () => {
      try {
        const res = await api.getNotifications();
        if (isMounted) setUnreadCount(res.unreadCount);
      } catch {}
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 15000); // 15s polling for notifications
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Services', path: '/services', icon: FileText },
    { name: 'Appointments', path: '/appointments', icon: CalendarCheck2 },
    { name: 'Live Queue', path: '/queue', icon: Clock3 },
    { 
      name: 'Notifications', 
      path: '/notifications', 
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined 
    },
    { name: 'GovGuide AI', path: '/guide', icon: Sparkles, highlight: true },
    { name: 'Profile', path: '/profile', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-govnavy-900 text-white flex items-center justify-between p-4 sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
            <Landmark className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-white block text-sm">{APP_NAME}</span>
            <span className="text-[10px] text-slate-300 block leading-none">Citizen Portal</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-govnavy-800 focus:outline-none"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Desktop & Mobile Responsive Left Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen z-30 bg-govnavy-900 text-slate-200 w-64 flex flex-col justify-between transition-transform duration-200 ease-in-out border-r border-govnavy-800 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Subtle National Accent Line */}
          <div className="gov-tricolor-bar w-full" />

          {/* Brand header */}
          <div className="p-5 border-b border-govnavy-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-white text-base tracking-tight">{APP_NAME}</h1>
              <p className="text-[11px] text-emerald-400 font-medium">Citizen Public Services</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                        : item.highlight
                        ? 'text-emerald-300 hover:bg-govnavy-800 hover:text-emerald-200 bg-emerald-950/40 border border-emerald-800/40'
                        : 'text-slate-300 hover:bg-govnavy-800 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${item.highlight ? 'text-emerald-400' : ''}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && !item.badge && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-medium">
                      AI
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User profile & logout block */}
        <div className="p-4 border-t border-govnavy-800 bg-govnavy-950/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-700 text-emerald-300 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {user?.full_name?.charAt(0) || 'C'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user?.full_name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-govnavy-800 rounded-lg transition-colors border border-govnavy-700/60"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Minimal Bar */}
        <header className="hidden md:flex bg-white border-b border-slate-200 px-8 py-3.5 items-center justify-between shadow-subtle sticky top-0 z-20">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Republic of India &bull; Unified Administrative Appointment Network
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Live Queue Services Operational
            </span>
            <div className="h-4 w-px bg-slate-200" />
            <span>Helpdesk: 1800-11-2026</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
