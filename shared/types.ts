export type UserRole = 'CITIZEN' | 'STAFF' | 'ADMIN';

export type AppointmentStatus = 'BOOKED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export type QueueTokenStatus = 'WAITING' | 'CALLED' | 'SERVING' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';

export type QueueStatus = 'ACTIVE' | 'PAUSED' | 'CLOSED';

export type NotificationType = 
  | 'APPOINTMENT_BOOKED'
  | 'APPOINTMENT_REMINDER'
  | 'APPOINTMENT_CANCELLED'
  | 'QUEUE_JOINED'
  | 'QUEUE_POSITION_CHANGED'
  | 'TOKEN_CALLED'
  | 'APPOINTMENT_COMPLETED'
  | 'SYSTEM';

export type AuditLogAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'REGISTER'
  | 'INTERNAL_LOGIN'
  | 'ROLE_CHANGED'
  | 'SERVICE_CREATED'
  | 'SERVICE_UPDATED'
  | 'SERVICE_DELETED'
  | 'CENTER_CREATED'
  | 'CENTER_UPDATED'
  | 'STAFF_ASSIGNED'
  | 'APPOINTMENT_CREATED'
  | 'APPOINTMENT_CANCELLED'
  | 'QUEUE_TOKEN_CALLED'
  | 'QUEUE_TOKEN_COMPLETED'
  | 'QUEUE_TOKEN_NO_SHOW';

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface UserWithAuth extends User {
  password_hash?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  department: string;
  estimated_duration: number; // in minutes
  required_documents: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OperatingHours {
  id: string;
  center_id: string;
  day_of_week: number; // 0=Sunday, 1=Monday...
  open_time: string; // "09:00"
  close_time: string; // "17:00"
}

export interface ServiceCenter {
  id: string;
  name: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  phone: string;
  active: boolean;
  operating_hours?: OperatingHours[];
  services?: string[]; // array of service_ids offered
}

export interface StaffProfile {
  id: string;
  user_id: string;
  center_id: string;
  employee_id: string;
  designation: string;
  active: boolean;
  user?: User;
  center?: ServiceCenter;
}

export interface Appointment {
  id: string;
  booking_reference: string;
  citizen_id: string;
  service_id: string;
  center_id: string;
  appointment_date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  status: AppointmentStatus;
  queue_token_id?: string | null;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined fields for display
  citizen?: User;
  service?: Service;
  center?: ServiceCenter;
  queue_token?: QueueToken;
}

export interface Queue {
  id: string;
  center_id: string;
  service_id: string;
  queue_date: string;
  current_number: number;
  status: QueueStatus;
  // Joined fields
  center?: ServiceCenter;
  service?: Service;
}

export interface QueueToken {
  id: string;
  queue_id: string;
  appointment_id?: string | null;
  citizen_id: string;
  token_number: string; // e.g. "A-104"
  status: QueueTokenStatus;
  joined_at: string;
  called_at?: string | null;
  completed_at?: string | null;
  // Computed / Joined
  people_ahead?: number;
  estimated_wait_minutes?: number;
  citizen?: User;
  appointment?: Appointment;
  queue?: Queue;
  service?: Service;
  center?: ServiceCenter;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: AuditLogAction;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, any>;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

export interface AIConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface CitizenDashboardSummary {
  upcoming_appointment: Appointment | null;
  active_token: QueueToken | null;
  unread_notifications_count: number;
  recent_notifications: Notification[];
  recommended_services: Service[];
}

export interface StaffDashboardSummary {
  today_appointments_count: number;
  waiting_citizens_count: number;
  current_token: QueueToken | null;
  average_wait_minutes: number;
  completed_today_count: number;
  noshow_count: number;
  today_appointments: Appointment[];
  active_tokens: QueueToken[];
}

export interface AdminAnalyticsSummary {
  total_users: number;
  citizens_count: number;
  staff_count: number;
  today_appointments: number;
  active_queues: number;
  completed_appointments_total: number;
  average_wait_minutes: number;
  noshow_rate_percentage: number;
  appointments_by_day: { date: string; count: number }[];
  queue_volume_by_hour: { hour: string; count: number }[];
  service_popularity: { name: string; count: number; category: string }[];
  center_performance: { name: string; appointments: number; avg_wait: number }[];
}
