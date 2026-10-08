import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Service, ServiceCenter } from '@shared/types';
import {
  Clock,
  Building,
  CheckSquare,
  Square,
  MapPin,
  Calendar,
  Sparkles,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Phone
} from 'lucide-react';

export const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [service, setService] = useState<Service | null>(null);
  const [centers, setCenters] = useState<ServiceCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!id) return;
    const loadService = async () => {
      try {
        const [servRes, centRes] = await Promise.all([
          api.getServiceById(id),
          api.getCenters(),
        ]);
        setService(servRes.service);
        setCenters(centRes.centers || []);
      } catch (err) {
        console.error('Failed to load service detail:', err);
      } finally {
        setLoading(false);
      }
    };
    loadService();
  }, [id]);

  const toggleDoc = (doc: string) => {
    setCheckedDocs(prev => ({ ...prev, [doc]: !prev[doc] }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
        <p className="text-xs">Loading service specifications...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 max-w-md mx-auto">
        <p className="text-sm font-semibold text-slate-700">Service Not Found</p>
        <p className="text-xs text-slate-500 mt-1 mb-4">The requested service could not be retrieved from the catalog.</p>
        <Link
          to="/services"
          className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Services Catalog</span>
        </Link>
      </div>
    );
  }

  const allDocsChecked = service.required_documents.length > 0 &&
    service.required_documents.every(d => checkedDocs[d]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        to="/services"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Services Catalog</span>
      </Link>

      {/* Main Service Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {service.category}
          </span>
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Estimated Processing: ~{service.estimated_duration} Minutes
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-govnavy-900 tracking-tight mb-2">
          {service.name}
        </h1>

        <p className="text-sm font-semibold text-slate-600 flex items-center gap-2 mb-4">
          <Building className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{service.department}</span>
        </p>

        <p className="text-sm text-slate-700 leading-relaxed mb-6">
          {service.description}
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-slate-200">
          <Link
            to={`/appointments/book?service_id=${service.id}`}
            className="py-3 px-6 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center gap-2 transition-all hover:shadow"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Appointment for This Service</span>
          </Link>
          <Link
            to={`/guide?q=${encodeURIComponent(`What is the step by step process for ${service.name}?`)}`}
            className="py-3 px-4 rounded-xl font-semibold text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Ask GovGuide AI</span>
          </Link>
        </div>
      </div>

      {/* Mandatory Required Documents Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-govnavy-900">Mandatory Required Documents</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Check off your documents to ensure you have everything required before arriving at the counter.
            </p>
          </div>
          {allDocsChecked && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1 animate-pulse">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> All Ready
            </span>
          )}
        </div>

        <div className="space-y-3 mt-4">
          {service.required_documents?.map((doc, idx) => {
            const isChecked = !!checkedDocs[doc];
            return (
              <div
                key={idx}
                onClick={() => toggleDoc(doc)}
                className={`p-4 rounded-xl border text-xs sm:text-sm font-medium flex items-start gap-3 cursor-pointer transition-all select-none ${
                  isChecked
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="shrink-0 mt-0.5 text-emerald-600">
                  {isChecked ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-slate-400" />}
                </div>
                <div className="flex-1">
                  <span>{doc}</span>
                  <p className="text-[11px] text-slate-400 font-normal mt-0.5">Original copy required for biometric and physical verification.</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Official Requirement Note:</strong> Incomplete documentation may lead to counter rescheduling. Please carry original documents alongside one self-attested photocopy.
          </span>
        </div>
      </div>

      {/* Available Facilitation Centers */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6 sm:p-8">
        <h2 className="text-lg font-bold text-govnavy-900 mb-1">Available Facilitation Centers</h2>
        <p className="text-xs text-slate-500 mb-6">Offices equipped with verified counters and digital queue telemetry for this service</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {centers.map((center) => (
            <div
              key={center.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-emerald-500/50 hover:shadow-subtle transition-all"
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-xs sm:text-sm text-govnavy-900">{center.name}</h4>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{center.address}, {center.district} ({center.pincode})</span>
              </p>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{center.phone}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
