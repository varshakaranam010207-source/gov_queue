import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Appointment, QueueToken, Notification, Service } from '@shared/types';
import {
  CalendarCheck2,
  Clock3,
  Sparkles,
  ArrowRight,
  Bell,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
  QrCode
} from 'lucide-react';
import { STATUS_COLORS } from '@shared/constants';

export const CitizenDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [upcomingAppt, setUpcomingAppt] = useState<Appointment | null>(null);
  const [activeToken, setActiveToken] = useState<QueueToken | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recommendedServices, setRecommendedServices] = useState<Service[]>([]);

  useEffect(() => {
    let isMounted = true;
    const loadDashboardData = async () => {
      try {
        const [apptsRes, queueRes, notifsRes, servicesRes] = await Promise.all([
          api.getAppointments(),
          api.getQueueData(),
          api.getNotifications(),
          api.getServices(),
        ]);

        if (!isMounted) return;

        // Find next upcoming booked/checked-in appointment
        const validAppts = (apptsRes.appointments || []).filter(
          a => a.status === 'BOOKED' || a.status === 'CHECKED_IN'
        );
        setUpcomingAppt(validAppts[0] || null);

        setActiveToken(queueRes.activeToken || null);
        setNotifications((notifsRes.notifications || []).slice(0, 3));
        setRecommendedServices((servicesRes.services || []).slice(0, 4));
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboardData();
    const interval = setInterval(loadDashboardData, 10000); // 10s live queue poll
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
        <p className="text-sm font-medium">Loading citizen dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 inline-block mb-2">
            Verified Citizen Profile
          </span>
          <h1 className="text-2xl font-black text-govnavy-900 tracking-tight">
            Namaste, {user?.full_name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your government bookings, track queue tokens, and verify required documents.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/guide"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Consult GovGuide AI</span>
          </Link>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <span>Book Appointment</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Grid: Active Live Queue Card & Upcoming Appointment Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Queue Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock3 className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-govnavy-900">Live Queue Telemetry</h2>
              </div>
              {activeToken ? (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
                  Active in Queue
                </span>
              ) : (
                <span className="text-xs font-medium text-slate-400">No active queue token</span>
              )}
            </div>

            {activeToken ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-govnavy-900 to-slate-800 rounded-2xl p-5 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-emerald-400 font-mono font-medium">YOUR TOKEN NUMBER</p>
                      <p className="text-4xl font-black tracking-tight text-white mt-1">
                        {activeToken.token_number}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        activeToken.status === 'CALLED'
                          ? 'bg-amber-400 text-slate-950 animate-bounce'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      }`}>
                        {activeToken.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-700 text-xs">
                    <div>
                      <p className="text-slate-400">People Ahead</p>
                      <p className="text-lg font-bold text-white mt-0.5">
                        {activeToken.people_ahead ?? 0} citizens
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Estimated Wait</p>
                      <p className="text-lg font-bold text-emerald-400 mt-0.5">
                        ~{activeToken.estimated_wait_minutes ?? 15} minutes
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-900">{activeToken.service?.name}</p>
                  <p className="text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{activeToken.center?.name}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Clock3 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No active queue right now</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  When you check in for your appointment or join a walk-in queue, your live position will appear here.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
            <Link
              to="/queue"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
            >
              <span>View Full Queue Tracker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Upcoming Appointment Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarCheck2 className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-govnavy-900">Upcoming Appointment</h2>
              </div>
              {upcomingAppt && (
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${STATUS_COLORS[upcomingAppt.status]}`}>
                  {upcomingAppt.status}
                </span>
              )}
            </div>

            {upcomingAppt ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-900 text-sm">{upcomingAppt.service?.name}</h3>
                    <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                      {upcomingAppt.booking_reference}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 flex items-center gap-1.5 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{upcomingAppt.center?.name}</span>
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-200 font-medium">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Scheduled Date</span>
                      <span className="text-slate-900 font-bold">{upcomingAppt.appointment_date}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Allocated Slot</span>
                      <span className="text-slate-900 font-bold">{upcomingAppt.start_time} - {upcomingAppt.end_time}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Required Verification Ready?</span>
                    <span className="text-[11px] text-emerald-800">
                      Ensure you carry original ID and documents matching the service requirements checklist.
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <CalendarCheck2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No scheduled appointments</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Book an official appointment to skip the physical lines and guarantee fast counter processing.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center">
            {upcomingAppt ? (
              <Link
                to={`/appointments/${upcomingAppt.id}`}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>View Appointment Pass</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                to="/services"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Browse Services to Book</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
            <Link
              to="/appointments"
              className="text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              All Appointments
            </Link>
          </div>
        </div>
      </div>

      {/* Notifications and AI Shortcut Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Notifications */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-subtle p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-govnavy-900">Recent Service Alerts</h2>
            </div>
            <Link to="/notifications" className="text-xs font-bold text-emerald-700 hover:text-emerald-800">
              View All
            </Link>
          </div>

          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-xl border text-xs transition-colors flex items-start gap-3 ${
                    n.read ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-emerald-50/50 border-emerald-200 text-slate-900 font-medium'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                  <div className="flex-1">
                    <p className="font-bold text-govnavy-900">{n.title}</p>
                    <p className="text-slate-600 mt-0.5 text-[11px] leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">No recent alerts</p>
          )}
        </div>

        {/* GovGuide AI Banner */}
        <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-govnavy-900 text-white rounded-2xl p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">GovGuide AI Assistant</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Confused about Aadhaar documents, passport eligibility, or RTO procedures? Ask our verified AI assistant anytime.
            </p>
          </div>

          <Link
            to="/guide"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
          >
            <span>Ask a Question</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Recommended Services Carousel/Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-govnavy-900">Recommended Public Services</h2>
          <Link to="/services" className="text-xs font-bold text-emerald-700 hover:text-emerald-800">
            View All Services
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendedServices.map((service) => (
            <Link
              key={service.id}
              to={`/services/${service.id}`}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-emerald-500/50 hover:shadow-subtle transition-all flex flex-col justify-between group"
            >
              <div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full inline-block mb-2">
                  {service.category}
                </span>
                <h4 className="font-bold text-xs text-govnavy-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                  {service.name}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {service.description}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/60 flex justify-between items-center text-[10px] text-slate-400 font-medium">
                <span>~{service.estimated_duration} mins</span>
                <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                  Book <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
