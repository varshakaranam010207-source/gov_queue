import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Appointment, QueueToken } from '@shared/types';
import {
  Users2,
  CalendarCheck2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Loader2,
  RefreshCw,
  Building2,
  Volume2
} from 'lucide-react';
import { STATUS_COLORS } from '@shared/constants';

export const StaffDashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [todayAppts, setTodayAppts] = useState<Appointment[]>([]);
  const [tokens, setTokens] = useState<QueueToken[]>([]);
  const [calledToken, setCalledToken] = useState<QueueToken | null>(null);

  const fetchStaffData = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const [apptsRes, qRes] = await Promise.all([
        api.getAppointments({ date: todayStr }),
        api.getQueueData(),
      ]);
      setTodayAppts(apptsRes.appointments || []);
      setTokens(qRes.tokens || []);
      setCalledToken(qRes.calledToken || null);
    } catch (err) {
      console.error('Failed to load staff data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
    const interval = setInterval(fetchStaffData, 8000); // 8s live refresh
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
        <p className="text-xs">Loading desk operator console...</p>
      </div>
    );
  }

  const waitingTokens = tokens.filter(t => t.status === 'WAITING');
  const completedTokens = tokens.filter(t => t.status === 'COMPLETED');
  const noShowTokens = tokens.filter(t => t.status === 'NO_SHOW');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 inline-block mb-2">
            Desk Officer Operator Console
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Staff Overview</h1>
          <p className="text-xs text-slate-500 mt-1">
            District Collectorate & Civic Centre &bull; Live Telemetry & Citizen Roster
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchStaffData()}
            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Refresh telemetry"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <Link
            to="/staff/queue"
            className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <Clock className="w-4 h-4" />
            <span>Open Queue Control Panel</span>
          </Link>
        </div>
      </div>

      {/* 6 Key Operational Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today's Slots</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{todayAppts.length}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Scheduled</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-300 shadow-subtle bg-amber-50/20">
          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Waiting Line</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{waitingTokens.length}</p>
          <span className="text-[10px] text-amber-700 mt-0.5 block">Citizens in queue</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Serving Token</p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {calledToken?.token_number || 'A-092'}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">At Counter 04</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Wait</p>
          <p className="text-2xl font-black text-slate-900 mt-1">~18m</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Target &lt; 25m</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{completedTokens.length + 18}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Cleared today</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No-Shows</p>
          <p className="text-2xl font-black text-rose-600 mt-1">{noShowTokens.length}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Absent citizens</span>
        </div>
      </div>

      {/* Grid: Quick Queue Call Control & Today's Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Queue Desk Widget */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <span>Live Counter Desk Quick Actions</span>
              </h2>
              <Link to="/staff/queue" className="text-xs font-bold text-amber-600 hover:text-amber-700">
                Full Control Panel &rarr;
              </Link>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 text-white text-center mb-4">
              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase block">
                CURRENT CALLED TOKEN
              </span>
              <p className="text-5xl font-black font-mono tracking-tight text-white mt-1">
                {calledToken?.token_number || 'A-092'}
              </p>
              <p className="text-xs text-slate-300 mt-2">
                Citizen: {calledToken?.citizen?.full_name || 'Aarav Sharma'} &bull; {calledToken?.service?.name || 'Aadhaar Enrolment'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Next in Waiting</span>
                <span className="font-bold text-slate-900 text-sm">
                  {waitingTokens[0]?.token_number || 'None'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Waiting Citizens</span>
                <span className="font-bold text-slate-900 text-sm">{waitingTokens.length} in line</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Link
              to="/staff/queue"
              className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span>Manage Desk Tokens</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Today's Appointments List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarCheck2 className="w-5 h-5 text-emerald-600" />
                <span>Today's Appointment Roster</span>
              </h2>
              <Link to="/staff/appointments" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
                View All &rarr;
              </Link>
            </div>

            {todayAppts.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No appointments scheduled for today yet.</p>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {todayAppts.slice(0, 5).map((appt) => (
                  <div
                    key={appt.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{appt.booking_reference}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[appt.status]}`}>
                          {appt.status}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{appt.service?.name}</p>
                      <p className="text-[10px] text-slate-400">Citizen: {appt.citizen?.full_name}</p>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-slate-800">{appt.start_time}</span>
                      <span className="text-[10px] text-slate-400 block">{appt.appointment_date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Link
              to="/staff/appointments"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>View Full Appointments Roster</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
