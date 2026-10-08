import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Appointment } from '@shared/types';
import { STATUS_COLORS } from '@shared/constants';
import {
  CalendarCheck2,
  MapPin,
  Clock,
  Printer,
  ArrowLeft,
  CheckCircle2,
  FileCheck,
  Building,
  QrCode,
  ShieldCheck,
  Loader2,
  AlertTriangle
} from 'lucide-react';

export const AppointmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { error: toastError, success: toastSuccess } = useToast();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchAppt = async () => {
      try {
        const res = await api.getAppointmentById(id);
        setAppointment(res.appointment);
      } catch (err) {
        console.error('Failed to load appointment details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppt();
  }, [id]);

  const handleCheckIn = async () => {
    if (!appointment) return;
    setActionLoading(true);
    try {
      const res = await api.joinQueue({
        center_id: appointment.center_id,
        service_id: appointment.service_id,
        appointment_id: appointment.id,
      });
      toastSuccess(`Checked in! Generated Token: ${res.token.token_number}`);
      navigate('/queue');
    } catch (err: any) {
      toastError(err?.message || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
        <p className="text-xs">Loading official appointment pass...</p>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 max-w-md mx-auto">
        <p className="text-sm font-semibold text-slate-700">Appointment Not Found</p>
        <p className="text-xs text-slate-400 mt-1 mb-4">Could not locate appointment with identifier {id}.</p>
        <Link
          to="/appointments"
          className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
        >
          Return to Appointments
        </Link>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = appointment.appointment_date === todayStr;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Top Bar Actions */}
      <div className="flex items-center justify-between no-print">
        <Link
          to="/appointments"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Appointments</span>
        </Link>
        <button
          onClick={handlePrint}
          className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Pass</span>
        </button>
      </div>

      {/* Official Citizen Verification Pass */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
        {/* Tricolor Bar */}
        <div className="gov-tricolor-bar w-full" />

        {/* Pass Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                OFFICIAL APPOINTMENT PASS
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-govnavy-900 tracking-tight mt-2">
                {appointment.service?.name}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">{appointment.service?.department}</p>
            </div>

            <div className="text-right shrink-0">
              <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${STATUS_COLORS[appointment.status]}`}>
                {appointment.status}
              </span>
            </div>
          </div>
        </div>

        {/* Pass Core Details */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-50 border border-slate-200 rounded-2xl p-5 gap-4">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                BOOKING IDENTIFIER
              </span>
              <p className="text-2xl font-black font-mono text-emerald-700 tracking-tight">
                {appointment.booking_reference}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Citizen: {appointment.citizen?.full_name} ({appointment.citizen?.phone})
              </p>
            </div>
            <div className="w-16 h-16 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-800 shadow-sm shrink-0">
              <QrCode className="w-10 h-10" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">
                Facilitation Center
              </span>
              <p className="font-bold text-slate-900 text-sm">{appointment.center?.name}</p>
              <p className="text-slate-500 text-[11px] mt-1">{appointment.center?.address}, {appointment.center?.district}</p>
              <p className="text-slate-400 text-[11px] mt-0.5">Phone: {appointment.center?.phone}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">
                Scheduled Slot
              </span>
              <p className="font-bold text-emerald-700 text-sm">{appointment.appointment_date}</p>
              <p className="text-slate-700 font-bold text-xs mt-1">
                {appointment.start_time} - {appointment.end_time}
              </p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Counter window duration: ~{appointment.service?.estimated_duration || 20} mins
              </p>
            </div>
          </div>

          {/* Required Documents List */}
          {appointment.service?.required_documents && (
            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Mandatory Documents Required at Desk ({appointment.service.required_documents.length})</span>
              </h3>
              <div className="space-y-1.5">
                {appointment.service.required_documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200/60 text-xs font-medium text-emerald-950 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Check-in CTA (if booked) */}
          {appointment.status === 'BOOKED' && (
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between no-print">
              <div className="text-xs text-slate-500">
                {isToday ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Ready for counter check-in today
                  </span>
                ) : (
                  <span>Check-in becomes active on the appointment date ({appointment.appointment_date}).</span>
                )}
              </div>

              {isToday && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleCheckIn}
                  className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{actionLoading ? 'Generating Token...' : 'Check In at Counter Desk'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
