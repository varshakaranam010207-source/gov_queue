import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { QueueToken, Service, ServiceCenter } from '@shared/types';
import {
  Clock3,
  Users2,
  Hourglass,
  Volume2,
  Sparkles,
  MapPin,
  Building,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  PlusCircle
} from 'lucide-react';

export const LiveQueuePage: React.FC = () => {
  const { error: toastError, success: toastSuccess } = useToast();

  const [loading, setLoading] = useState<boolean>(true);
  const [activeToken, setActiveToken] = useState<QueueToken | null>(null);
  const [queues, setQueues] = useState<any[]>([]);

  // Join Queue Modal state
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
  const [services, setServices] = useState<Service[]>([]);
  const [centers, setCenters] = useState<ServiceCenter[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedCenterId, setSelectedCenterId] = useState<string>('');
  const [joinLoading, setJoinLoading] = useState<boolean>(false);

  const fetchQueueTelemetry = async () => {
    try {
      const res = await api.getQueueData();
      setActiveToken(res.activeToken || null);
      setQueues(res.queues || []);
    } catch (err) {
      console.error('Failed to load queue telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueTelemetry();
    const interval = setInterval(fetchQueueTelemetry, 6000); // 6s real-time live poll
    return () => clearInterval(interval);
  }, []);

  const openJoinModal = async () => {
    try {
      const [sRes, cRes] = await Promise.all([api.getServices(), api.getCenters()]);
      setServices((sRes.services || []).filter(s => s.active));
      setCenters((cRes.centers || []).filter(c => c.active));
      setShowJoinModal(true);
    } catch (err) {
      toastError('Failed to load available counters');
    }
  };

  const handleJoinQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId || !selectedCenterId) {
      toastError('Please select both service and facilitation center.');
      return;
    }

    setJoinLoading(true);
    try {
      const res = await api.joinQueue({
        service_id: selectedServiceId,
        center_id: selectedCenterId,
      });
      toastSuccess(`Token ${res.token.token_number} generated successfully!`);
      setShowJoinModal(false);
      await fetchQueueTelemetry();
    } catch (err: any) {
      toastError(err?.message || 'Could not join queue.');
    } finally {
      setJoinLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
        <p className="text-xs">Synchronizing with live counter telemetry...</p>
      </div>
    );
  }

  // Derive currently serving number
  const currentServingNum = activeToken?.queue?.current_number
    ? `A-0${activeToken.queue.current_number < 100 ? '0' + activeToken.queue.current_number : activeToken.queue.current_number}`
    : 'A-092';

  const isTokenCalled = activeToken?.status === 'CALLED';

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 inline-block mb-2">
            Real-Time Telemetry
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-govnavy-900 tracking-tight">
            Live Queue & Token Status
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time counter progression. Arrive at the counter only when called.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchQueueTelemetry()}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-subtle"
            title="Refresh telemetry"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {!activeToken && (
            <button
              onClick={openJoinModal}
              className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Join Virtual Queue</span>
            </button>
          )}
        </div>
      </div>

      {/* Called Token Urgent Alert Banner */}
      {isTokenCalled && (
        <div className="bg-amber-500 text-slate-950 p-6 rounded-3xl shadow-xl flex items-center justify-between gap-4 token-calling-alert animate-in zoom-in-95">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0">
              <Volume2 className="w-7 h-7 animate-bounce" />
            </div>
            <div>
              <p className="text-xs font-mono font-bold uppercase tracking-widest text-slate-900">
                ATTENTION &bull; YOUR TOKEN IS CALLED!
              </p>
              <h2 className="text-xl sm:text-2xl font-black mt-0.5">
                Token {activeToken.token_number} &mdash; Please Proceed to Counter Desk
              </h2>
              <p className="text-xs font-medium text-slate-900/80 mt-0.5">
                Counter Desk 04 at {activeToken.center?.name}. Have all required documents ready.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Active Token Display Card */}
      {activeToken ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
          <div className="gov-tricolor-bar w-full" />

          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6 mb-6">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  DIGITAL PASS
                </span>
                <h3 className="text-xl font-extrabold text-govnavy-900 mt-2">{activeToken.service?.name}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activeToken.center?.name} &bull; {activeToken.center?.district}</span>
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className={`text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border ${
                  activeToken.status === 'CALLED'
                    ? 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}>
                  Status: {activeToken.status}
                </span>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">
                  Joined: {new Date(activeToken.joined_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {/* 4 Big Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Metric 1: Your Token */}
              <div className="bg-govnavy-900 text-white rounded-2xl p-5 shadow-sm text-center">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block font-semibold">
                  YOUR TOKEN
                </span>
                <p className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white mt-1">
                  {activeToken.token_number}
                </p>
                <span className="text-[10px] text-slate-400 block mt-1">Assigned Digitally</span>
              </div>

              {/* Metric 2: Now Serving */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                  NOW SERVING
                </span>
                <p className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-900 mt-1">
                  {currentServingNum}
                </p>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-1">Active at Counter</span>
              </div>

              {/* Metric 3: People Ahead */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                  PEOPLE AHEAD
                </span>
                <p className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-900 mt-1">
                  {activeToken.people_ahead ?? 0}
                </p>
                <span className="text-[10px] text-slate-500 block mt-1">In Counter Line</span>
              </div>

              {/* Metric 4: Estimated Wait */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 block font-semibold">
                  ESTIMATED WAIT
                </span>
                <p className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-emerald-800 mt-1">
                  {activeToken.estimated_wait_minutes ?? 15}m
                </p>
                <span className="text-[10px] text-emerald-700 block mt-1">Calculated Dynamically</span>
              </div>
            </div>

            {/* Instruction Footer */}
            <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold text-slate-800 block">Queue Etiquette & Process:</span>
                You do not need to stand in the physical waiting lobby. When your number approaches (less than 2 people ahead), an audible alert and push banner will prompt you to step forward.
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Clock3 className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-bold text-govnavy-900">You are Not Currently in Any Queue</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            If you have an appointment scheduled for today, you can check in to obtain your queue token. Or join a walk-in virtual queue directly.
          </p>

          <div className="pt-2">
            <button
              onClick={openJoinModal}
              className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Join a Virtual Queue Now</span>
            </button>
          </div>
        </div>
      )}

      {/* Join Virtual Queue Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-modal max-w-lg w-full p-6 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-govnavy-900">Join Virtual Queue</h3>
              <button
                type="button"
                onClick={() => setShowJoinModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleJoinQueue} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Select Service
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                >
                  <option value="">-- Choose Government Service --</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Select Facilitation Center
                </label>
                <select
                  value={selectedCenterId}
                  onChange={(e) => setSelectedCenterId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                >
                  <option value="">-- Choose Facilitation Center --</option>
                  {centers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.district}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="py-2 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={joinLoading}
                  className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {joinLoading ? 'Issuing Token...' : 'Generate Live Token'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
