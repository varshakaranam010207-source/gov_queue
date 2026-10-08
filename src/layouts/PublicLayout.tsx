import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Landmark, Sparkles, LogIn, ArrowRight } from 'lucide-react';
import { APP_NAME, APP_TAGLINE, APP_SUBTITLE } from '@shared/constants';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Tricolor Accent Line */}
      <div className="gov-tricolor-bar w-full" />

      {/* Official Government Header Banner */}
      <div className="bg-slate-100 border-b border-slate-200 px-4 md:px-8 py-1.5 text-[11px] text-slate-600 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span>GOVERNMENT OF INDIA &bull; DIGITAL CITIZEN APPOINTMENT NETWORK</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-slate-500">
          <span>English | हिंदी</span>
          <span>Toll-Free: 1800-11-2026</span>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-govnavy-900 to-govnavy-800 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Landmark className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-govnavy-900 tracking-tight">{APP_NAME}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  National Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block font-medium">Smart Appointments &bull; Zero Physical Queues</p>
            </div>
          </Link>

          {/* Nav Links: STRICTLY CITIZEN ONLY - NO STAFF OR ADMIN LINKS! */}
          <nav className="flex items-center gap-3 sm:gap-6">
            <Link
              to="/services"
              className="text-sm font-semibold text-slate-700 hover:text-emerald-700 transition-colors"
            >
              Services
            </Link>
            <Link
              to="/guide"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>GovGuide AI</span>
            </Link>
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-govnavy-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl shadow-sm transition-all hover:shadow"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-govnavy-900 text-slate-400 text-xs border-t border-govnavy-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <Landmark className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-base text-white">{APP_NAME}</span>
              </div>
              <p className="text-slate-300 text-sm mb-2">{APP_TAGLINE}</p>
              <p className="text-emerald-400 text-xs font-mono mb-4">{APP_SUBTITLE}</p>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                An advanced public administration system eliminating counter congestion across district administration, transport offices, passport seva kendras, and civil registries.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Public Services</h4>
              <ul className="space-y-2">
                <li><Link to="/services" className="hover:text-white transition-colors">Aadhaar Enrolment & Updates</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">Passport Seva Appointments</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">Driving Licence Tests</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">Income & Caste Certificates</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">Conveyance Deed Registration</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Citizen Facilitation</h4>
              <ul className="space-y-2">
                <li><Link to="/guide" className="hover:text-white transition-colors">GovGuide AI Consultation</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Citizen Login</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Create Citizen Account</Link></li>
                <li className="pt-2 text-[11px] text-slate-500">
                  <span>Authorized Personnel: Contact administrative nodal officer for secure credentials.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-govnavy-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px]">
            <p>&copy; 2026 GovQueue AI. Designed and built for Build to Ship — AI Engineering Program.</p>
            <p className="text-slate-500">Strictly follows Indian e-Governance standards and data privacy guidelines.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
