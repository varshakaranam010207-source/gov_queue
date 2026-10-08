import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, Mail, Phone, Calendar, ShieldCheck, LogOut, CheckCircle2 } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ totalAppts: 0, completedAppts: 0 });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.getAppointments();
        const total = res.appointments?.length || 0;
        const comp = res.appointments?.filter(a => a.status === 'COMPLETED').length || 0;
        setStats({ totalAppts: total, completedAppts: comp });
      } catch {}
    };
    loadStats();
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 inline-block mb-2">
          Identity Credentials
        </span>
        <h1 className="text-2xl font-black text-govnavy-900 tracking-tight">Citizen Profile</h1>
        <p className="text-xs text-slate-500 mt-0.5">Official administrative account and verified contact record</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-govnavy-900 text-emerald-400 flex items-center justify-center font-bold text-2xl uppercase shadow-md">
            {user?.full_name?.charAt(0) || 'C'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-govnavy-900">{user?.full_name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Verified Citizen
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ID: {user?.id.slice(0, 8)}...
              </span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Registered Email</span>
              <span className="font-bold text-slate-800 truncate">{user?.email}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Mobile Number</span>
              <span className="font-bold text-slate-800">{user?.phone}</span>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-center">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-2xl font-black text-govnavy-900">{stats.totalAppts}</p>
            <p className="text-[11px] font-semibold text-slate-500 uppercase mt-1">Total Appointments</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-2xl font-black text-emerald-600">{stats.completedAppts}</p>
            <p className="text-[11px] font-semibold text-slate-500 uppercase mt-1">Successfully Cleared</p>
          </div>
        </div>

        {/* Log Out */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => logout()}
            className="py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs flex items-center gap-2 transition-colors border border-rose-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
