import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Appointment } from '@shared/types';
import { STATUS_COLORS } from '@shared/constants';
import {
  CalendarCheck2,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Loader2,
  RefreshCw,
  QrCode
} from 'lucide-react';

export const StaffAppointmentsPage: React.FC = () => {
  const { error: toastError, success: toastSuccess } = useToast();

  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      const res = await api.getAppointments({ date: selectedDate || undefined });
      setAppointments(res.appointments || []);
    } catch (err) {
      console.error('Failed to load appointments roster:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const handleCheckIn = async (appt: Appointment) => {
    setActionLoading(appt.id);
    try {
      const res = await api.joinQueue({
        center_id: appt.center_id,
        service_id: appt.service_id,
        appointment_id: appt.id,
      });
      toastSuccess(`Checked in! Generated token ${res.token.token_number}`);
      await fetchAppointments();
    } catch (err: any) {
      toastError(err?.message || 'Check in failed');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredAppts = appointments.filter((a) => {
    const q = search.toLowerCase();
    const matchesSearch =
      a.booking_reference.toLowerCase().includes(q) ||
      (a.citizen?.full_name?.toLowerCase().includes(q) ?? false) ||
      (a.service?.name?.toLowerCase().includes(q) ?? false);

    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 inline-block mb-2">
            Counter Desk Roster
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Scheduled Citizen Appointments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review booked citizens, perform counter check-in, and manage desk flow.
          </p>
        </div>

        <button
          onClick={() => fetchAppointments()}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-subtle"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Roster</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search citizen, reference, service..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Date Picker */}
          <div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="BOOKED">Booked</option>
            <option value="CHECKED_IN">Checked In</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="NO_SHOW">No-Show</option>
          </select>
        </div>
      </div>

      {/* Appointments Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
          <p className="text-xs">Loading appointments data...</p>
        </div>
      ) : filteredAppts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
          <CalendarCheck2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No appointments found</p>
          <p className="text-xs text-slate-400 mt-1">Try clearing your filters or selecting another date.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Citizen Details</th>
                  <th className="p-4">Service</th>
                  <th className="p-4">Slot Time</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Desk Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppts.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900">
                      {appt.booking_reference}
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-slate-900">{appt.citizen?.full_name}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{appt.citizen?.phone}</p>
                    </td>

                    <td className="p-4">
                      <p className="font-semibold text-slate-800">{appt.service?.name}</p>
                      <p className="text-[10px] text-slate-400">{appt.service?.category}</p>
                    </td>

                    <td className="p-4 font-medium text-slate-800">
                      <span>{appt.start_time} - {appt.end_time}</span>
                      <span className="block text-[10px] text-slate-400">{appt.appointment_date}</span>
                    </td>

                    <td className="p-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_COLORS[appt.status]}`}>
                        {appt.status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      {appt.status === 'BOOKED' && (
                        <button
                          type="button"
                          disabled={actionLoading === appt.id}
                          onClick={() => handleCheckIn(appt)}
                          className="py-1 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition-all disabled:opacity-50"
                        >
                          {actionLoading === appt.id ? 'Issuing...' : 'Check In at Desk'}
                        </button>
                      )}
                      {appt.status === 'CHECKED_IN' && (
                        <span className="text-[11px] font-bold text-emerald-600">
                          Token Active
                        </span>
                      )}
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
