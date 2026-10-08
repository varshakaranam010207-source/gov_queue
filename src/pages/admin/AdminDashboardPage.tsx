import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { AdminAnalyticsSummary } from '@shared/types';
import {
  Users2,
  CalendarCheck2,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Loader2,
  TrendingUp,
  FileText,
  Building2,
  ScrollText
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AdminAnalyticsSummary | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await api.getAnalytics();
        setSummary(data);
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
        <p className="text-xs">Aggregating platform administrative metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200 inline-block mb-2">
            Chief System Administrator Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Administrative Control Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time public administration telemetry, queue optimization, and security audit logs.
          </p>
        </div>

        <Link
          to="/admin/analytics"
          className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all self-start sm:self-auto"
        >
          <TrendingUp className="w-4 h-4" />
          <span>View Detailed Analytics</span>
        </Link>
      </div>

      {/* 6 High-Level KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Total Citizens</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{summary.total_users}</p>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-1">+14% this month</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Today's Bookings</span>
          <p className="text-2xl sm:text-3xl font-black text-indigo-600 mt-1">{summary.today_appointments}</p>
          <span className="text-[10px] text-slate-400 block mt-1">Across all centers</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Active Queues</span>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">{summary.active_queues}</p>
          <span className="text-[10px] text-slate-400 block mt-1">Operational desks</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Total Completed</span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{summary.completed_appointments_total}</p>
          <span className="text-[10px] text-slate-400 block mt-1">Citizens served</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Average Wait</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{summary.average_wait_minutes}m</p>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-1">-32% vs target</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">No-Show Rate</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{summary.noshow_rate_percentage}%</p>
          <span className="text-[10px] text-slate-400 block mt-1">Low absence rate</span>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/admin/services"
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-subtle hover:border-indigo-500 hover:shadow-card transition-all group flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
              Services Catalog
            </h3>
            <p className="text-xs text-slate-500 mt-1">Configure services, durations, and mandatory document checklists.</p>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-indigo-600">
            <span>Manage Services &rarr;</span>
          </div>
        </Link>

        <Link
          to="/admin/centers"
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-subtle hover:border-indigo-500 hover:shadow-card transition-all group flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
              Facilitation Centers
            </h3>
            <p className="text-xs text-slate-500 mt-1">Add regional offices, operating hours, and active counters.</p>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-indigo-600">
            <span>Manage Centers &rarr;</span>
          </div>
        </Link>

        <Link
          to="/admin/users"
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-subtle hover:border-indigo-500 hover:shadow-card transition-all group flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Users2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
              User Access Control
            </h3>
            <p className="text-xs text-slate-500 mt-1">Audited role administration (Citizen &harr; Staff &harr; Admin).</p>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-indigo-600">
            <span>Inspect Users &rarr;</span>
          </div>
        </Link>

        <Link
          to="/admin/audit-logs"
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-subtle hover:border-indigo-500 hover:shadow-card transition-all group flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <ScrollText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
              Audit Logs Trail
            </h3>
            <p className="text-xs text-slate-500 mt-1">Cryptographic traceability for every sensitive modification.</p>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-indigo-600">
            <span>View Audit Logs &rarr;</span>
          </div>
        </Link>
      </div>

      {/* Activity Summary Bar Chart Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent 7-Day Appointment Volume</h2>
            <p className="text-xs text-slate-500">Historical trend across all administrative centers</p>
          </div>
          <Link to="/admin/analytics" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
            Full Analytics &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 pt-6 pb-2 border-b border-slate-100">
          {summary.appointments_by_day.map((d, i) => {
            const heightPercent = Math.min(100, Math.max(15, (d.count / 40) * 100));
            return (
              <div key={i} className="flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                  {d.count}
                </span>
                <div
                  className="w-full bg-indigo-500 hover:bg-indigo-600 rounded-t-lg transition-all"
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(d.date).toLocaleDateString([], { weekday: 'narrow' })}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
