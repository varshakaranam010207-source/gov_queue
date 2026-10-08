import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AdminAnalyticsSummary } from '@shared/types';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Building2,
  FileText,
  Loader2,
  RefreshCw,
  Users2
} from 'lucide-react';

export const AdminAnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AdminAnalyticsSummary | null>(null);

  const fetchAnalytics = async () => {
    try {
      const data = await api.getAnalytics();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading || !summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
        <p className="text-xs">Generating analytics visual models...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200 inline-block mb-2">
            Performance Telemetry
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            System Analytics & Queue Volume
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Service distribution, center wait times, and traffic density metrics.
          </p>
        </div>

        <button
          onClick={() => fetchAnalytics()}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-subtle"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Grid: 7-Day Trend & Hourly Queue Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments by Day */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Appointments by Day</h2>
              <p className="text-xs text-slate-500">Booking frequency over the past 7 days</p>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-48 pt-6 pb-2 border-b border-slate-100">
            {summary.appointments_by_day.map((d, i) => {
              const max = Math.max(...summary.appointments_by_day.map(x => x.count), 25);
              const heightPercent = Math.min(100, Math.max(15, (d.count / max) * 100));
              return (
                <div key={i} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-indigo-600 font-mono">
                    {d.count}
                  </span>
                  <div
                    className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(d.date).toLocaleDateString([], { month: 'numeric', day: 'numeric' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hourly Traffic Density */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Peak Queue Volume by Hour</h2>
              <p className="text-xs text-slate-500">Citizen check-in distribution throughout operating hours</p>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end h-48 pt-6 pb-2 border-b border-slate-100">
            {summary.queue_volume_by_hour.map((h, i) => {
              const max = Math.max(...summary.queue_volume_by_hour.map(x => x.count), 40);
              const heightPercent = Math.min(100, Math.max(15, (h.count / max) * 100));
              return (
                <div key={i} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-amber-600 font-mono">
                    {h.count}
                  </span>
                  <div
                    className="w-full bg-gradient-to-t from-amber-500 to-amber-300 rounded-t-lg transition-all"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[10px] text-slate-500 font-mono">
                    {h.hour}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid: Service Popularity & Center Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Popularity Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Service Demand Popularity</h2>
              <p className="text-xs text-slate-500">Most requested citizen services across platform</p>
            </div>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {summary.service_popularity.map((s, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">{s.name}</span>
                  <span className="text-[10px] text-slate-400 block">{s.category}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {s.count} bookings
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Performance & Average Wait */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Center Wait Times & Processing</h2>
              <p className="text-xs text-slate-500">Regional facilitation center operational efficiency</p>
            </div>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {summary.center_performance.map((c, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">{c.name}</span>
                  <span className="text-[10px] text-slate-400 block">{c.appointments} appointments processed</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    ~{c.avg_wait}m avg wait
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
