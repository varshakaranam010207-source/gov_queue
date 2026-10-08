import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Appointment, ServiceCenter } from '@shared/types';
import { STATUS_COLORS } from '@shared/constants';
import {
  CalendarCheck2,
  Search,
  Filter,
  Building2,
  MapPin,
  Loader2,
  RefreshCw,
  QrCode
} from 'lucide-react';

export const AdminAppointmentsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [centers, setCenters] = useState<ServiceCenter[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      const [apptsRes, centRes] = await Promise.all([
        api.getAppointments(),
        api.getCenters(),
      ]);
      setAppointments(apptsRes.appointments || []);
      setCenters(centRes.centers || []);
    } catch (err) {
      console.error('Failed to load global appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = appointments.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      a.booking_reference.toLowerCase().includes(q) ||
      (a.citizen?.full_name?.toLowerCase().includes(q) ?? false) ||
      (a.service?.name?.toLowerCase().includes(q) ?? false);

    const matchCenter = selectedCenter === 'ALL' || a.center_id === selectedCenter;
    return matchSearch && matchCenter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200 inline-block mb-2">
            Central Registry
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Global Appointments Roster
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            System-wide appointment bookings across all administrative centers.
          </p>
        </div>

        <button
          onClick={() => fetchData()}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-subtle"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference, citizen, service..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500">Center:</span>
          <select
            value={selectedCenter}
            onChange={(e) => setSelectedCenter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Centers</option>
            {centers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Appointments Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
          <p className="text-xs">Loading appointments database...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
          <CalendarCheck2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No appointments found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Citizen</th>
                  <th className="p-4">Service</th>
                  <th className="p-4">Center</th>
                  <th className="p-4">Date & Slot</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-indigo-700">
                      {appt.booking_reference}
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-slate-900">{appt.citizen?.full_name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{appt.citizen?.phone}</p>
                    </td>

                    <td className="p-4 font-semibold text-slate-800">
                      {appt.service?.name}
                    </td>

                    <td className="p-4 text-slate-600">
                      {appt.center?.name}
                    </td>

                    <td className="p-4 font-medium text-slate-800">
                      <span>{appt.appointment_date}</span>
                      <span className="block text-[10px] text-slate-400">{appt.start_time} - {appt.end_time}</span>
                    </td>

                    <td className="p-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_COLORS[appt.status]}`}>
                        {appt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
