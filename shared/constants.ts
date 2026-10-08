export const APP_NAME = 'GovQueue AI';
export const APP_TAGLINE = 'Smart Government Appointments. Faster Queues. Better Public Service.';
export const APP_SUBTITLE = 'Built for Build to Ship — AI Engineering Program';

export const COOKIE_NAME = 'govqueue_session';
export const TOKEN_EXPIRY_SECONDS = 60 * 60 * 24 * 7; // 7 days

export const DEMO_USERS = {
  CITIZEN: {
    email: 'citizen@govqueue.demo',
    password: 'Demo@123',
    role: 'CITIZEN' as const,
    full_name: 'Demo Citizen',
    phone: '9876543210',
  },
  STAFF: {
    email: 'staff@govqueue.demo',
    password: 'Demo@123',
    role: 'STAFF' as const,
    full_name: 'Demo Staff Officer',
    phone: '9876543211',
  },
  ADMIN: {
    email: 'admin@govqueue.demo',
    password: 'Demo@123',
    role: 'ADMIN' as const,
    full_name: 'Demo Chief Administrator',
    phone: '9876543212',
  },
};

export const SERVICE_CATEGORIES = [
  'Identity & Civil Status',
  'Passport & Travel Documents',
  'Transport & Driving Licensing',
  'Revenue & Land Records',
  'Certificates & Verification',
  'Civic & Municipal Services',
  'Social Welfare & Pensions',
] as const;

export const INDIAN_DEPARTMENTS = [
  'Unique Identification Authority (UIDAI)',
  'Ministry of External Affairs (Consular & Passport)',
  'Regional Transport Authority (RTO / MoRTH)',
  'Department of Revenue & Land Administration',
  'Municipal Corporation Public Works & Health',
  'Department of Social Justice and Empowerment',
] as const;

export const AVAILABLE_SLOTS = [
  '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30',
  '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30'
];

export const STATUS_COLORS = {
  BOOKED: 'bg-blue-50 text-blue-700 border-blue-200',
  CHECKED_IN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  COMPLETED: 'bg-slate-100 text-slate-700 border-slate-200',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
  NO_SHOW: 'bg-amber-50 text-amber-700 border-amber-200',
  WAITING: 'bg-blue-50 text-blue-700 border-blue-200',
  CALLED: 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse',
  SERVING: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};
