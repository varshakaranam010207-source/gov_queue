import { z } from 'zod';

export const registerSchema = z.object({
  full_name: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
  phone: z.string().trim().min(10, 'Phone number must be at least 10 digits').max(15),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const internalLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  // frontend may pass portalMode ("STAFF" | "ADMIN") for UI hint, but backend MUST verify user's actual database role!
  portalHint: z.enum(['STAFF', 'ADMIN']).optional(),
});

export const appointmentBookingSchema = z.object({
  service_id: z.string().min(1, 'Invalid service selected'),
  center_id: z.string().min(1, 'Invalid service center selected'),
  appointment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be HH:mm'),
  notes: z.string().max(500).optional(),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(['BOOKED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
});

export const joinQueueSchema = z.object({
  service_id: z.string().min(1, 'Invalid service selected'),
  center_id: z.string().min(1, 'Invalid service center selected'),
  appointment_id: z.string().optional().nullable(),
});

export const updateTokenStatusSchema = z.object({
  token_id: z.string().min(1, 'Invalid token ID'),
  status: z.enum(['WAITING', 'CALLED', 'SERVING', 'COMPLETED', 'NO_SHOW', 'CANCELLED']),
});

export const aiGuideSchema = z.object({
  query: z.string().min(2, 'Query must be at least 2 characters').max(1000),
  conversation_id: z.string().optional().nullable(),
  service_id: z.string().optional().nullable(),
});

export const serviceSchema = z.object({
  name: z.string().min(3).max(150),
  description: z.string().min(10).max(1000),
  category: z.string().min(2).max(100),
  department: z.string().min(2).max(100),
  estimated_duration: z.number().int().positive().max(480),
  required_documents: z.array(z.string()).min(1, 'At least one required document must be listed'),
  active: z.boolean().default(true),
});

export const centerSchema = z.object({
  name: z.string().min(3).max(150),
  address: z.string().min(5).max(250),
  district: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  pincode: z.string().length(6, 'Pincode must be 6 digits'),
  latitude: z.number().optional().default(28.6139),
  longitude: z.number().optional().default(77.2090),
  phone: z.string().min(10).max(15),
  active: z.boolean().default(true),
  services: z.array(z.string().min(1)).optional().default([]),
});

export const staffAssignSchema = z.object({
  user_id: z.string().min(1),
  center_id: z.string().min(1),
  employee_id: z.string().min(2).max(50),
  designation: z.string().min(2).max(100),
  active: z.boolean().default(true),
});

export const userRoleUpdateSchema = z.object({
  role: z.enum(['CITIZEN', 'STAFF', 'ADMIN']),
});
