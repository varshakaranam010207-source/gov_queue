import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Queue, QueueToken } from '@shared/types';
import {
  Clock3,
  Building2,
  Users2,
  Loader2,
  RefreshCw,
  MapPin
} from 'lucide-react';

export const AdminQueuesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [queues, setQueues] = useState<any[]>([]);
  const [tokens, setTokens] = useState<QueueToken[]>([]);

  const fetchQueues = async () => {
    try {
      const res = await api.getQueueData();
      setQueues(res.queues || []);
      setTokens(res.tokens || []);
    } catch (err) {
      console.error('Failed to load global queues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
        <p className="text-xs">Loading real-time queue monitors...</p>
      </div>
    );
  }

  const waitingCount = tokens.filter(t => t.status === 'WAITING').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200 inline-block mb-2">
            Live Telemetry Network
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Global Queue Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time counter desk performance, queue depth, and serving token telemetry.
          </p>
        </div>

        <button
          onClick={() => fetchQueues()}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-subtle"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Monitors</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Operational Centers</span>
          <p className="text-2xl font-black text-slate-900 mt-1">5 Facilities</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Citizens in Line</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{waitingCount} Citizens</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Active Telemetry Status</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">Optimal (~18m)</p>
        </div>
      </div>

      {/* Queues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {queues.map((q) => (
          <div key={q.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {q.status}
                </span>
                <span className="text-xs font-mono text-slate-400 font-bold">
                  Date: {q.queue_date}
                </span>
              </div>

              <h3 className="font-bold text-base text-slate-900">{q.service?.name}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{q.center?.name} &bull; {q.center?.district}</span>
              </p>

              <div className="mt-6 p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block font-semibold">
                    CURRENT SERVING NUMBER
                  </span>
                  <p className="text-3xl font-black font-mono mt-0.5">
                    A-0{q.current_number < 100 ? '0' + q.current_number : q.current_number}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Status</span>
                  <span className="text-xs font-bold text-emerald-400">Desk Active</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
