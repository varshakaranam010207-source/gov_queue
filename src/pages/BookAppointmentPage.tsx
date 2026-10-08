import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Service, ServiceCenter, Appointment } from '@shared/types';
import { AVAILABLE_SLOTS } from '@shared/constants';
import {
  Calendar,
  Building,
  Clock,
  FileCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  QrCode,
  ShieldCheck
} from 'lucide-react';

export const BookAppointmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { error: toastError, success: toastSuccess } = useToast();

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [services, setServices] = useState<Service[]>([]);
  const [centers, setCenters] = useState<ServiceCenter[]>([]);

  // Form Selections
  const [selectedServiceId, setSelectedServiceId] = useState<string>(searchParams.get('service_id') || '');
  const [selectedCenterId, setSelectedCenterId] = useState<string>('');
  
  // Date selection: default to tomorrow
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 1);
  const [selectedDate, setSelectedDate] = useState<string>(defaultDate.toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Result after booking
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servRes, centRes] = await Promise.all([
          api.getServices(),
          api.getCenters(),
        ]);
        setServices((servRes.services || []).filter(s => s.active));
        setCenters((centRes.centers || []).filter(c => c.active));

        // If preselected service was passed
        if (searchParams.get('service_id')) {
          setSelectedServiceId(searchParams.get('service_id')!);
          setStep(2); // Jump to center selection
        }
      } catch (err) {
        console.error('Failed to load booking catalog:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchParams]);

  const selectedService = services.find(s => s.id === selectedServiceId);
  const selectedCenter = centers.find(c => c.id === selectedCenterId);

  const handleConfirmBooking = async () => {
    if (!selectedServiceId || !selectedCenterId || !selectedDate || !selectedTime) {
      toastError('Please complete all booking selections.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.bookAppointment({
        service_id: selectedServiceId,
        center_id: selectedCenterId,
        appointment_date: selectedDate,
        start_time: selectedTime,
        notes: notes.trim() || undefined,
      });

      setConfirmedAppointment(res.appointment);
      toastSuccess(`Appointment confirmed! Ref: ${res.appointment.booking_reference}`);
      setStep(6); // Step 6: Confirmation
    } catch (err: any) {
      const msg = err?.message || 'Failed to book slot. It might be taken.';
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
        <p className="text-xs">Preparing appointment scheduling engine...</p>
      </div>
    );
  }

  // Step 6: Success Confirmation View
  if (step === 6 && confirmedAppointment) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 duration-200">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mb-2 inline-block">
            Appointment Confirmed
          </span>

          <h1 className="text-2xl font-black text-govnavy-900 tracking-tight mt-2">
            Your Booking is Reserved
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Please show this booking reference or pass at the facilitation desk counter.
          </p>

          {/* Reference Card */}
          <div className="my-6 p-6 rounded-2xl bg-slate-50 border border-slate-200 text-left">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4 mb-4">
              <div>
                <p className="text-[10px] font-mono text-slate-400 uppercase">OFFICIAL BOOKING REFERENCE</p>
                <p className="text-2xl font-black text-emerald-700 font-mono tracking-tight mt-0.5">
                  {confirmedAppointment.booking_reference}
                </p>
              </div>
              <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-800">
                <QrCode className="w-7 h-7" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Service</span>
                <span className="font-bold text-slate-900">{confirmedAppointment.service?.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Center</span>
                <span className="font-bold text-slate-900">{confirmedAppointment.center?.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Scheduled Date</span>
                <span className="font-bold text-slate-900">{confirmedAppointment.appointment_date}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Time Slot</span>
                <span className="font-bold text-slate-900">
                  {confirmedAppointment.start_time} - {confirmedAppointment.end_time}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={`/appointments/${confirmedAppointment.id}`}
              className="py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span>View Appointment Pass</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/dashboard"
              className="py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center transition-colors"
            >
              <span>Return to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Wizard Progress Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          <span className={step >= 1 ? 'text-emerald-700' : ''}>1. Service</span>
          <span className={step >= 2 ? 'text-emerald-700' : ''}>2. Center</span>
          <span className={step >= 3 ? 'text-emerald-700' : ''}>3. Date</span>
          <span className={step >= 4 ? 'text-emerald-700' : ''}>4. Slot</span>
          <span className={step >= 5 ? 'text-emerald-700' : ''}>5. Review</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Select Service */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-govnavy-900">Step 1: Choose Government Service</h2>
            <p className="text-xs text-slate-500">Select the administrative department and procedure you wish to schedule.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
            {services.map((service) => (
              <div
                key={service.id}
                onClick={() => setSelectedServiceId(service.id)}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                  selectedServiceId === service.id
                    ? 'border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                }`}
              >
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full inline-block mb-1.5">
                  {service.category}
                </span>
                <h4 className="font-bold text-xs sm:text-sm text-govnavy-900">{service.name}</h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{service.description}</p>
                <div className="mt-2 text-[10px] text-slate-400 font-medium">
                  ~{service.estimated_duration} mins processing &bull; {service.required_documents.length} documents
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              disabled={!selectedServiceId}
              onClick={() => setStep(2)}
              className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40"
            >
              <span>Continue to Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Select Center */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-bold text-govnavy-900">Step 2: Choose Service Center</h2>
              <p className="text-xs text-slate-500">Pick a registered facilitation center convenient to your location.</p>
            </div>
            {selectedService && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {selectedService.name}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3">
            {centers.map((center) => (
              <div
                key={center.id}
                onClick={() => setSelectedCenterId(center.id)}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                  selectedCenterId === center.id
                    ? 'border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-xs sm:text-sm text-govnavy-900">{center.name}</h4>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                    {center.district}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{center.address}, {center.state} - {center.pincode}</p>
                <p className="text-[11px] text-slate-400 mt-1">Phone: {center.phone}</p>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              disabled={!selectedCenterId}
              onClick={() => setStep(3)}
              className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40"
            >
              <span>Continue to Date</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Select Date */}
      {step === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-govnavy-900">Step 3: Select Appointment Date</h2>
            <p className="text-xs text-slate-500">Choose the date for your in-person biometric and document verification.</p>
          </div>

          <div className="max-w-md mx-auto py-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Appointment Date
            </label>
            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <p className="text-[11px] text-slate-400 mt-2">
              Operating hours: Monday to Saturday (09:00 AM – 05:00 PM). Public holidays excluded.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              disabled={!selectedDate}
              onClick={() => setStep(4)}
              className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40"
            >
              <span>Continue to Time Slots</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Select Time Slot */}
      {step === 4 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-govnavy-900">Step 4: Select Available Time Slot</h2>
            <p className="text-xs text-slate-500">Pick an allocated processing slot for {selectedDate}.</p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 pt-2">
            {AVAILABLE_SLOTS.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedTime(slot)}
                className={`py-3 px-2 rounded-xl text-xs font-bold font-mono transition-all border ${
                  selectedTime === slot
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white hover:border-emerald-300'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              disabled={!selectedTime}
              onClick={() => setStep(5)}
              className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40"
            >
              <span>Review Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Review & Confirm */}
      {step === 5 && selectedService && selectedCenter && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-govnavy-900">Step 5: Review and Confirm Booking</h2>
            <p className="text-xs text-slate-500">Please inspect your scheduled appointment details before final confirmation.</p>
          </div>

          {/* Summary Box */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Government Service</span>
                <span className="font-bold text-slate-900 text-sm">{selectedService.name}</span>
                <span className="text-slate-500 block text-[11px]">{selectedService.department}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Service Center</span>
                <span className="font-bold text-slate-900 text-sm">{selectedCenter.name}</span>
                <span className="text-slate-500 block text-[11px]">{selectedCenter.address}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Date & Time</span>
                <span className="font-bold text-emerald-700 text-sm">{selectedDate} at {selectedTime}</span>
                <span className="text-slate-500 block text-[11px]">~{selectedService.estimated_duration} mins counter window</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Official Queue Policy</span>
                <span className="font-medium text-slate-800 text-xs">Priority Token Allotment on Check-in</span>
              </div>
            </div>

            {/* Required Docs Summary */}
            <div className="pt-4 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-800 block mb-2">
                Mandatory Documents to Carry ({selectedService.required_documents.length}):
              </span>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                {selectedService.required_documents.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>

            {/* Citizen Notes (Optional) */}
            <div className="pt-4 border-t border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Additional Notes or Special Assistance (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Senior citizen assistance, Tatkaal verification, etc."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-between">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setStep(4)}
              className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={handleConfirmBooking}
              className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validating Availability & Booking...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm Official Appointment</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
