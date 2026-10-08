import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Appointment } from '@shared/types';
import { STATUS_COLORS } from '@shared/constants';
import {
  CalendarCheck2,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  QrCode
} from 'lucide-react';

export const AppointmentsPage: React.FC = () => {
  const { error: toastError, success: toastSuccess } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Cancel confirmation modal
  const [cancellingAppt, setCancellingAppt] = useState<Appointment | null>(null);

  const fetchAppointments = async () => {
    try {
      const res = await api.getAppointments();
      setAppointments(res.appointments || []);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async () => {
    if (!cancellingAppt) return;
    setActionLoading(cancellingAppt.id);
    try {
      await api.updateAppointmentStatus(cancellingAppt.id, 'CANCELLED');
      toastSuccess(`Appointment ${cancellingAppt.booking_reference} has been cancelled.`);
      setCancellingAppt(null);
      await fetchAppointments();
    } catch (err: any) {
      toastError(err?.message || 'Failed to cancel appointment.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckIn = async (appt: Appointment) => {
    setActionLoading(appt.id);
    try {
      const queueRes = await api.joinQueue({
        center_id: appt.center_id,
        service_id: appt.service_id,
        appointment_id: appt.id,
      });
      toastSuccess(`Checked in successfully! Your token is ${queueRes.token.token_number}`);
      await fetchAppointments();
    } catch (err: any) {
      toastError(err?.message || 'Check-in failed. Please verify with counter.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
        <p className="text-xs">Loading appointments roster...</p>
      </div>
    );
  }

  const upcoming = appointments.filter(a => a.status === 'BOOKED' || a.status === 'CHECKED_IN');
  const past = appointments.filter(a => a.status === 'COMPLETED' || a.status === 'CANCELLED' || a.status === 'NO_SHOW');

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 inline-block mb-2">
            Citizen Schedule
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-govnavy-900 tracking-tight">
            My Appointments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track status, check in on arrival, or cancel scheduled appointments.
          </p>
        </div>

        <Link
          to="/services"
          className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all shrink-0"
        >
          <Calendar className="w-4 h-4" />
          <span>Book New Appointment</span>
        </Link>
      </div>

      {/* Upcoming Section */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-govnavy-900 flex items-center gap-2">
          <CalendarCheck2 className="w-4 h-4 text-emerald-600" />
          <span>Upcoming & Active Bookings ({upcoming.length})</span>
        </h2>

        {upcoming.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center">
            <CalendarCheck2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No active bookings</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">You have no upcoming appointment slots reserved.</p>
            <Link
              to="/services"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              <span>Explore services and schedule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcoming.map((appt) => {
              const todayStr = new Date().toISOString().split('T')[0];
              const isToday = appt.appointment_date === todayStr;

              return (
                <div
                  key={appt.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-5 flex flex-col justify-between hover:shadow-card transition-all"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_COLORS[appt.status]}`}>
                        {appt.status}
                      </span>
                      <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {appt.booking_reference}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-govnavy-900 mt-2">{appt.service?.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{appt.center?.name}</span>
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 font-semibold block">Date</span>
                        <span className="font-bold text-slate-800">{appt.appointment_date}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 font-semibold block">Time</span>
                        <span className="font-bold text-slate-800">{appt.start_time} - {appt.end_time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      to={`/appointments/${appt.id}`}
                      className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>View Pass</span>
                    </Link>

                    <div className="flex items-center gap-2">
                      {appt.status === 'BOOKED' && isToday && (
                        <button
                          type="button"
                          disabled={actionLoading === appt.id}
                          onClick={() => handleCheckIn(appt)}
                          className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white transition-all shadow-sm"
                        >
                          {actionLoading === appt.id ? 'Checking In...' : 'Check In Now'}
                        </button>
                      )}

                      {appt.status === 'BOOKED' && (
                        <button
                          type="button"
                          onClick={() => setCancellingAppt(appt)}
                          className="py-1.5 px-2.5 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Past / Completed Section */}
      {past.length > 0 && (
        <div className="space-y-4 pt-6">
          <h2 className="text-base font-bold text-slate-700">
            Past & Completed History ({past.length})
          </h2>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle">
            <div className="divide-y divide-slate-100">
              {past.map((appt) => (
                <div key={appt.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-slate-700">{appt.booking_reference}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[appt.status]}`}>
                        {appt.status}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-900">{appt.service?.name}</p>
                    <p className="text-[11px] text-slate-500">{appt.center?.name}</p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="font-bold text-slate-800">{appt.appointment_date}</p>
                    <p className="text-[11px] text-slate-400">{appt.start_time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancellingAppt && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-modal max-w-md w-full p-6 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-govnavy-900 mb-1">Cancel Appointment?</h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Are you sure you want to cancel booking <strong className="font-mono text-slate-900">{cancellingAppt.booking_reference}</strong> for {cancellingAppt.service?.name}? This slot will be released for other citizens.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancellingAppt(null)}
                className="py-2 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={actionLoading === cancellingAppt.id}
                onClick={handleCancel}
                className="py-2 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {actionLoading === cancellingAppt.id ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
