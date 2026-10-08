import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { QueueToken } from '@shared/types';
import {
  Clock,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Users2,
  Phone,
  Loader2,
  ShieldAlert,
  MapPin,
  RefreshCw
} from 'lucide-react';

export const StaffQueuePage: React.FC = () => {
  const { error: toastError, success: toastSuccess } = useToast();

  const [loading, setLoading] = useState<boolean>(true);
  const [tokens, setTokens] = useState<QueueToken[]>([]);
  const [calledToken, setCalledToken] = useState<QueueToken | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Destructive Action Confirmation Dialog state
  const [confirmModal, setConfirmModal] = useState<{
    type: 'COMPLETE' | 'NO_SHOW';
    token: QueueToken;
  } | null>(null);

  const fetchQueueState = async () => {
    try {
      const res = await api.getQueueData();
      setTokens(res.tokens || []);
      setCalledToken(res.calledToken || null);
    } catch (err) {
      console.error('Failed to load queue tokens:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueState();
    const interval = setInterval(fetchQueueState, 5000); // 5s live queue update
    return () => clearInterval(interval);
  }, []);

  const handleCallNext = async () => {
    setActionLoading(true);
    try {
      const res = await api.callNextToken();
      toastSuccess(`Called next token: ${res.token.token_number}!`);
      await fetchQueueState();
    } catch (err: any) {
      toastError(err?.message || 'No waiting citizens in queue.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecall = () => {
    if (!calledToken) return;
    toastSuccess(`Re-announcing Token ${calledToken.token_number} at Counter 04!`);
  };

  const handleExecuteStatusUpdate = async () => {
    if (!confirmModal) return;
    const { type, token } = confirmModal;

    setActionLoading(true);
    try {
      const statusToSet = type === 'COMPLETE' ? 'COMPLETED' : 'NO_SHOW';
      await api.updateTokenStatus(token.id, statusToSet);
      toastSuccess(`Token ${token.token_number} marked as ${statusToSet}.`);
      setConfirmModal(null);
      await fetchQueueState();
    } catch (err: any) {
      toastError(err?.message || 'Failed to update token status.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
        <p className="text-xs">Connecting to counter queue telemetry...</p>
      </div>
    );
  }

  const waitingTokens = tokens.filter(t => t.status === 'WAITING');
  const nextToken = waitingTokens[0] || null;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 inline-block mb-2">
            Active Counter Desk 04
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Queue Control Panel
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Call citizens, re-announce tokens, and advance desk verification workflows.
          </p>
        </div>

        <button
          onClick={() => fetchQueueState()}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-subtle"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Line</span>
        </button>
      </div>

      {/* Main Counter Console */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Current Serving Counter Box */}
          <div className="text-center md:text-left">
            <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
              CURRENT SERVING TOKEN AT COUNTER
            </span>
            <p className="text-6xl sm:text-7xl font-black font-mono tracking-tight text-white mt-1">
              {calledToken?.token_number || 'A-092'}
            </p>
            <div className="mt-3 text-xs text-slate-300">
              <span className="font-semibold text-white">
                {calledToken?.citizen?.full_name || 'Aarav Sharma'}
              </span>
              <span className="text-slate-400 block text-[11px] mt-0.5">
                Service: {calledToken?.service?.name || 'Aadhaar Enrolment & Biometric Update'}
              </span>
            </div>
          </div>

          {/* Next in Waiting Line */}
          <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 text-center md:text-left flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                NEXT TOKEN IN WAITING LINE
              </span>
              <p className="text-3xl sm:text-4xl font-black font-mono text-emerald-400 mt-1">
                {nextToken ? nextToken.token_number : 'Line Empty'}
              </p>
              {nextToken ? (
                <p className="text-xs text-slate-300 mt-1">
                  {nextToken.citizen?.full_name} &bull; {nextToken.service?.name}
                </p>
              ) : (
                <p className="text-xs text-slate-400 mt-1">No citizens currently waiting</p>
              )}
            </div>

            <p className="text-[11px] text-slate-400 font-mono mt-4 pt-4 border-t border-slate-700">
              Total Waiting: <strong className="text-white">{waitingTokens.length} citizens</strong>
            </p>
          </div>
        </div>

        {/* Console Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-slate-800">
          {/* Action 1: Call Next */}
          <button
            type="button"
            disabled={actionLoading || waitingTokens.length === 0}
            onClick={handleCallNext}
            className="py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-40"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Call Next</span>
          </button>

          {/* Action 2: Recall */}
          <button
            type="button"
            disabled={!calledToken || actionLoading}
            onClick={handleRecall}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors disabled:opacity-40"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Recall Token</span>
          </button>

          {/* Action 3: Complete Service */}
          <button
            type="button"
            disabled={!calledToken || actionLoading}
            onClick={() => setConfirmModal({ type: 'COMPLETE', token: calledToken! })}
            className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-40"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Complete</span>
          </button>

          {/* Action 4: Mark No-Show */}
          <button
            type="button"
            disabled={!calledToken || actionLoading}
            onClick={() => setConfirmModal({ type: 'NO_SHOW', token: calledToken! })}
            className="py-3 px-4 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 border border-rose-500/40 transition-all disabled:opacity-40"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Mark No-Show</span>
          </button>
        </div>
      </div>

      {/* Waiting Citizens Queue Roster */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users2 className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900">
              Citizens in Waiting Line ({waitingTokens.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            FIFO Order Strictly Maintained
          </span>
        </div>

        {waitingTokens.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Users2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600">The queue is currently clear</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Citizens joining online or walking in will appear here immediately.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="p-3">Position</th>
                  <th className="p-3">Token #</th>
                  <th className="p-3">Citizen Name</th>
                  <th className="p-3">Service Requested</th>
                  <th className="p-3">Joined Time</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {waitingTokens.map((token, idx) => (
                  <tr key={token.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-400">#{idx + 1}</td>
                    <td className="p-3 font-mono font-bold text-emerald-700 text-sm">{token.token_number}</td>
                    <td className="p-3 font-semibold text-slate-900">{token.citizen?.full_name || 'Walk-in Citizen'}</td>
                    <td className="p-3 text-slate-600">{token.service?.name}</td>
                    <td className="p-3 text-slate-400 font-mono">
                      {new Date(token.joined_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3 text-right">
                      {idx === 0 && (
                        <button
                          type="button"
                          onClick={handleCallNext}
                          disabled={actionLoading}
                          className="py-1 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] shadow-sm transition-all"
                        >
                          Call This Citizen
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Dialog Modal for Complete or No-Show */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-modal max-w-md w-full p-6 animate-in zoom-in-95">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
              confirmModal.type === 'COMPLETE'
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-rose-50 text-rose-600'
            }`}>
              {confirmModal.type === 'COMPLETE' ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              {confirmModal.type === 'COMPLETE' ? 'Complete Appointment Verification?' : 'Mark Citizen as Absent / No-Show?'}
            </h3>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Confirming action for Token <strong className="font-mono text-slate-900">{confirmModal.token.token_number}</strong> ({confirmModal.token.citizen?.full_name || 'Citizen'}).
              {confirmModal.type === 'COMPLETE'
                ? ' This will log service completion, send confirmation, and advance the desk queue.'
                : ' This will release the counter and record a no-show in the citizen record.'}
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="py-2 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleExecuteStatusUpdate}
                className={`py-2 px-4 rounded-xl text-xs font-bold text-white shadow-sm disabled:opacity-50 ${
                  confirmModal.type === 'COMPLETE'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {actionLoading ? 'Updating...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
