import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  Building2,
  Users2,
  UserCheck,
  CalendarCheck2,
  Clock3,
  ScrollText,
  Shield,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { APP_NAME } from '@shared/constants';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/internal');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', end: true, icon: LayoutDashboard },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Services', path: '/admin/services', icon: FileText },
    { name: 'Centers', path: '/admin/centers', icon: Building2 },
    { name: 'Staff', path: '/admin/staff', icon: Users2 },
    { name: 'Users', path: '/admin/users', icon: UserCheck },
    { name: 'Appointments', path: '/admin/appointments', icon: CalendarCheck2 },
    { name: 'Queues', path: '/admin/queues', icon: Clock3 },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: ScrollText },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-950 text-white flex items-center justify-between p-4 sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-white block text-sm">{APP_NAME}</span>
            <span className="text-[10px] text-indigo-400 block font-mono">CHIEF ADMIN</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-slate-900"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Admin Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen z-30 bg-slate-950 text-slate-200 w-64 flex flex-col justify-between transition-transform duration-200 ease-in-out border-r border-slate-900 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Subtle Admin Indigo Line */}
          <div className="bg-indigo-600 h-1 w-full" />

          {/* Brand header */}
          <div className="p-5 border-b border-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-white text-base tracking-tight">{APP_NAME}</h1>
              <p className="text-[11px] text-indigo-400 font-mono tracking-wider font-semibold">ADMIN PORTAL</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 mt-2 overflow-y-auto max-h-[calc(100vh-170px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Admin ID & Sign Out */}
        <div className="p-4 border-t border-slate-900 bg-black/40">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{user?.full_name}</p>
              <p className="text-[10px] text-indigo-400 font-mono">CHIEF SYSADMIN</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors border border-slate-800"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>End Admin Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Minimal Bar */}
        <header className="hidden md:flex bg-white border-b border-slate-200 px-8 py-3.5 items-center justify-between shadow-subtle sticky top-0 z-20">
          <div className="text-xs font-medium text-slate-500">
            System Security Level: <span className="text-emerald-600 font-semibold">ENFORCED (Role-Based Access + Audit Logging Active)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              Root Administration Mode
            </span>
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
