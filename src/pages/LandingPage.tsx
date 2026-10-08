import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Landmark,
  ArrowRight,
  Sparkles,
  CalendarCheck2,
  Clock3,
  Search,
  CheckCircle2,
  ShieldCheck,
  FileText,
  MapPin,
  Users2,
  Zap
} from 'lucide-react';
import { APP_NAME, APP_TAGLINE, APP_SUBTITLE } from '@shared/constants';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/services');
    }
  };

  const popularServices = [
    { title: 'Aadhaar Enrolment & Updates', desc: 'UIDAI biometric & demographic update counters', category: 'Identity' },
    { title: 'Fresh Passport & Renewal', desc: 'Document verification at Passport Seva Kendras', category: 'Travel' },
    { title: 'Driving Licence & Tests', desc: 'RTO screening & automated licensing tracks', category: 'Transport' },
    { title: 'Income & Caste Certificates', desc: 'Tehsil revenue document verification', category: 'Certificates' },
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>National Citizen Appointment & Real-Time Queue Infrastructure</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-black text-govnavy-900 tracking-tight leading-tight max-w-4xl mx-auto mb-6">
            Skip the Government Queue.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 block sm:inline">
              Book Before You Go.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Eliminate hours of physical counter waiting. Secure guaranteed time slots, track real-time desk tokens on your phone, and get document checklists powered by AI.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-10">
            <form onSubmit={handleSearchSubmit} className="flex items-center bg-white rounded-2xl shadow-card border border-slate-200 p-2 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent transition-all">
              <div className="pl-3.5 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services (e.g. Passport, Driving Licence, Aadhaar, Income)..."
                className="w-full px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-3 rounded-xl transition-all shadow-sm shrink-0 flex items-center gap-1.5"
              >
                <span>Find Service</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* 4 Primary Action CTAs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Link
              to="/services"
              className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500/50 hover:shadow-card transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <span className="font-bold text-sm text-govnavy-900">Find a Service</span>
              <span className="text-xs text-slate-500 mt-0.5">Explore 8+ departments</span>
            </Link>

            <Link
              to="/login"
              className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500/50 hover:shadow-card transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <CalendarCheck2 className="w-6 h-6" />
              </div>
              <span className="font-bold text-sm text-govnavy-900">Book Appointment</span>
              <span className="text-xs text-slate-500 mt-0.5">Reserve instant slot</span>
            </Link>

            <Link
              to="/queue"
              className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500/50 hover:shadow-card transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Clock3 className="w-6 h-6" />
              </div>
              <span className="font-bold text-sm text-govnavy-900">Join a Queue</span>
              <span className="text-xs text-slate-500 mt-0.5">Live token tracking</span>
            </Link>

            <Link
              to="/guide"
              className="flex flex-col items-center justify-center p-5 rounded-2xl bg-emerald-950/90 border border-emerald-700/50 hover:border-emerald-500 hover:shadow-card transition-all text-white group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="font-bold text-sm text-emerald-100">Ask GovGuide AI</span>
              <span className="text-xs text-emerald-300 mt-0.5">Instant requirements</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Real Impact Telemetry Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-govnavy-900 rounded-3xl p-8 md:p-12 text-white shadow-xl grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-govnavy-800">
          <div className="text-center pt-4 lg:pt-0">
            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400 mb-1">92%</p>
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Queue Time Reduced</p>
            <p className="text-[11px] text-slate-400 mt-1">Average wait down to ~18 mins</p>
          </div>
          <div className="text-center pt-4 lg:pt-0 lg:pl-8">
            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400 mb-1">45,000+</p>
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Appointments Served</p>
            <p className="text-[11px] text-slate-400 mt-1">Across regional facilitating centers</p>
          </div>
          <div className="text-center pt-4 lg:pt-0 lg:pl-8">
            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400 mb-1">0 Crowds</p>
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Physical Congestion</p>
            <p className="text-[11px] text-slate-400 mt-1">Direct token call pacing</p>
          </div>
          <div className="text-center pt-4 lg:pt-0 lg:pl-8">
            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400 mb-1">100%</p>
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Audit Traceability</p>
            <p className="text-[11px] text-slate-400 mt-1">Immutable administrative logging</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-govnavy-900 tracking-tight">
            How GovQueue AI Transforms Public Service
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            A transparent 4-step digital journey from service discovery to counter clearance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle relative">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center mb-4">
              01
            </div>
            <h3 className="font-bold text-base text-govnavy-900 mb-2">Select Service & AI Check</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Find your exact administrative requirement. GovGuide AI provides verified checklists for POI, POA, and certificates.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle relative">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center mb-4">
              02
            </div>
            <h3 className="font-bold text-base text-govnavy-900 mb-2">Book Guaranteed Slot</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Choose your nearby service center and available 30-minute window. Server-side validation eliminates double booking.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle relative">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center mb-4">
              03
            </div>
            <h3 className="font-bold text-base text-govnavy-900 mb-2">Live Token Progression</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Check in virtually upon arrival. Receive token like A-104 and monitor current serving number and waiting time on your phone.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle relative">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center mb-4">
              04
            </div>
            <h3 className="font-bold text-base text-govnavy-900 mb-2">Instant Service Clearance</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Step directly to the designated desk when your token is chimed. Verification takes minutes instead of hours.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Services Catalog Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-govnavy-900 tracking-tight">Popular Public Services</h2>
            <p className="text-xs text-slate-500 mt-1">Directly schedule appointments across central & state authorities</p>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {popularServices.map((service, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle hover:border-emerald-500/50 hover:shadow-card transition-all flex items-start justify-between gap-4"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mb-2 inline-block">
                  {service.category}
                </span>
                <h3 className="text-base font-bold text-govnavy-900">{service.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{service.desc}</p>
              </div>
              <Link
                to="/services"
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-600 hover:text-white text-slate-600 transition-colors shrink-0"
                aria-label={`View ${service.title}`}
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
