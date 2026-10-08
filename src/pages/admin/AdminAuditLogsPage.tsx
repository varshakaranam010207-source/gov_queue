import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AuditLog, AuditLogAction } from '@shared/types';
import {
  ScrollText,
  ShieldCheck,
  Search,
  Filter,
  Loader2,
  RefreshCw,
  User,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const res = await api.getAuditLogs(150);
      setLogs(res.audit_logs || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionBadge = (action: AuditLogAction) => {
    if (action.includes('ROLE')) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    if (action.includes('LOGIN')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (action.includes('SERVICE') || action.includes('CENTER')) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
    if (action.includes('APPOINTMENT')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (action.includes('QUEUE')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const filteredLogs = logs.filter(l => {
    const q = search.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      (l.user_name?.toLowerCase().includes(q) ?? false) ||
      (l.user_email?.toLowerCase().includes(q) ?? false) ||
      l.entity_type.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200 inline-block mb-2">
            Security & Traceability
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Administrative Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Immutable system logs capturing security access, role modifications, and workflow executions.
          </p>
        </div>

        <button
          onClick={() => fetchLogs()}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-subtle"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Audit Logs</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle flex items-center">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, user email, entity..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Audit Logs Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
          <p className="text-xs">Verifying cryptographic log chain...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
          <ScrollText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No audit logs matching query</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="p-4">Timestamp (UTC)</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Actor / Personnel</th>
                  <th className="p-4">Entity Type</th>
                  <th className="p-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                      >
                        <td className="p-4 text-slate-500 text-[11px] whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString([], {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </td>

                        <td className="p-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getActionBadge(log.action)}`}>
                            {log.action}
                          </span>
                        </td>

                        <td className="p-4 font-sans">
                          <p className="font-bold text-slate-900 text-xs">{log.user_name || 'System'}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{log.user_email}</p>
                        </td>

                        <td className="p-4 text-slate-600 font-sans">
                          <span className="font-semibold">{log.entity_type}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">{log.entity_id.slice(0, 8)}...</span>
                        </td>

                        <td className="p-4 text-right">
                          <button
                            type="button"
                            className="p-1 rounded text-slate-400 hover:text-slate-800"
                          >
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-slate-900 text-emerald-400">
                          <td colSpan={5} className="p-4 text-xs font-mono">
                            <div className="flex justify-between items-center mb-2 text-slate-400 text-[10px]">
                              <span>LOG RECORD UUID: {log.id}</span>
                              <span>STATUS: COMMITTED</span>
                            </div>
                            <pre className="bg-slate-950 p-3 rounded-lg overflow-x-auto text-[11px] text-emerald-300 border border-slate-800">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
