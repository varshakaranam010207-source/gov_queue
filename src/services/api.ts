import {
  User,
  Service,
  ServiceCenter,
  Appointment,
  AppointmentStatus,
  QueueToken,
  QueueTokenStatus,
  Notification,
  AuditLog,
  StaffProfile,
  AdminAnalyticsSummary,
  ApiResponse,
  UserRole
} from '@shared/types';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      credentials: 'include', // sends HTTP-only session cookie
    };

    const res = await fetch(`/api${endpoint}`, config);
    let payload: ApiResponse<T>;
    try {
      payload = await res.json();
    } catch (e) {
      throw new Error(`Server returned status ${res.status}`);
    }

    if (!payload.success) {
      const err = new Error(payload.error?.message || 'Operation failed');
      (err as any).code = payload.error?.code;
      (err as any).status = res.status;
      (err as any).details = payload.error?.details;
      throw err;
    }

    return payload.data as T;
  }

  // --- Auth ---
  async login(credentials: { email: string; password: string }): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async internalLogin(credentials: { email: string; password: string; portalHint?: 'STAFF' | 'ADMIN' }): Promise<{ user: User; redirectUrl: string }> {
    return this.request<{ user: User; redirectUrl: string }>('/auth/internal-login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(data: { full_name: string; email: string; phone: string; password: string }): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me', {
      method: 'GET',
    });
  }

  async logout(): Promise<void> {
    await this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  }

  // --- Services ---
  async getServices(): Promise<{ services: Service[] }> {
    return this.request<{ services: Service[] }>('/services', { method: 'GET' });
  }

  async getServiceById(id: string): Promise<{ service: Service }> {
    return this.request<{ service: Service }>(`/services?id=${encodeURIComponent(id)}`, { method: 'GET' });
  }

  async createService(data: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<{ service: Service }> {
    return this.request<{ service: Service }>('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateService(id: string, data: Partial<Service>): Promise<{ service: Service }> {
    return this.request<{ service: Service }>(`/services?id=${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ id, ...data }),
    });
  }

  // --- Centers ---
  async getCenters(): Promise<{ centers: ServiceCenter[] }> {
    return this.request<{ centers: ServiceCenter[] }>('/centers', { method: 'GET' });
  }

  async getCenterById(id: string): Promise<{ center: ServiceCenter }> {
    return this.request<{ center: ServiceCenter }>(`/centers?id=${encodeURIComponent(id)}`, { method: 'GET' });
  }

  async createCenter(data: Omit<ServiceCenter, 'id'>): Promise<{ center: ServiceCenter }> {
    return this.request<{ center: ServiceCenter }>('/centers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCenter(id: string, data: Partial<ServiceCenter>): Promise<{ center: ServiceCenter }> {
    return this.request<{ center: ServiceCenter }>(`/centers?id=${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ id, ...data }),
    });
  }

  // --- Appointments ---
  async getAppointments(filters?: { center_id?: string; date?: string }): Promise<{ appointments: Appointment[] }> {
    const params = new URLSearchParams();
    if (filters?.center_id) params.set('center_id', filters.center_id);
    if (filters?.date) params.set('date', filters.date);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ appointments: Appointment[] }>(`/appointments${qs}`, { method: 'GET' });
  }

  async getAppointmentById(id: string): Promise<{ appointment: Appointment }> {
    return this.request<{ appointment: Appointment }>(`/appointments?id=${encodeURIComponent(id)}`, { method: 'GET' });
  }

  async bookAppointment(data: {
    service_id: string;
    center_id: string;
    appointment_date: string;
    start_time: string;
    notes?: string;
  }): Promise<{ appointment: Appointment }> {
    return this.request<{ appointment: Appointment }>('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<{ appointment: Appointment }> {
    return this.request<{ appointment: Appointment }>(`/appointments?id=${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ id, status }),
    });
  }

  // --- Queues ---
  async getQueueData(params?: { center_id?: string; queue_id?: string; status?: string }): Promise<{
    activeToken?: QueueToken | null;
    queues?: any[];
    tokens?: QueueToken[];
    waitingTokens?: QueueToken[];
    calledToken?: QueueToken | null;
  }> {
    const p = new URLSearchParams();
    if (params?.center_id) p.set('center_id', params.center_id);
    if (params?.queue_id) p.set('queue_id', params.queue_id);
    if (params?.status) p.set('status', params.status);
    const qs = p.toString() ? `?${p.toString()}` : '';
    return this.request(`/queues${qs}`, { method: 'GET' });
  }

  async joinQueue(data: { service_id: string; center_id: string; appointment_id?: string | null }): Promise<{ token: QueueToken }> {
    return this.request<{ token: QueueToken }>('/queues', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTokenStatus(tokenId: string, status: QueueTokenStatus): Promise<{ token: QueueToken }> {
    return this.request<{ token: QueueToken }>('/queues', {
      method: 'PATCH',
      body: JSON.stringify({ token_id: tokenId, status }),
    });
  }

  async callNextToken(queueId?: string): Promise<{ token: QueueToken }> {
    return this.request<{ token: QueueToken }>('/queues', {
      method: 'PATCH',
      body: JSON.stringify({ action: 'CALL_NEXT', queue_id: queueId }),
    });
  }

  // --- Notifications ---
  async getNotifications(): Promise<{ notifications: Notification[]; unreadCount: number }> {
    return this.request<{ notifications: Notification[]; unreadCount: number }>('/notifications', { method: 'GET' });
  }

  async markNotificationRead(id: string): Promise<void> {
    await this.request('/notifications', {
      method: 'PATCH',
      body: JSON.stringify({ id }),
    });
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.request('/notifications', {
      method: 'PATCH',
      body: JSON.stringify({ mark_all: true }),
    });
  }

  // --- GovGuide AI ---
  async askGovGuide(query: string, serviceId?: string): Promise<{
    answer: string;
    sources: string[];
    suggestions: string[];
  }> {
    return this.request('/ai/guide', {
      method: 'POST',
      body: JSON.stringify({ query, service_id: serviceId }),
    });
  }

  // --- Admin ---
  async getAnalytics(): Promise<AdminAnalyticsSummary> {
    return this.request<AdminAnalyticsSummary>('/admin/analytics', { method: 'GET' });
  }

  async getUsers(role?: UserRole, search?: string): Promise<{ users: User[] }> {
    const p = new URLSearchParams();
    if (role) p.set('role', role);
    if (search) p.set('q', search);
    const qs = p.toString() ? `?${p.toString()}` : '';
    return this.request<{ users: User[] }>(`/admin/users${qs}`, { method: 'GET' });
  }

  async updateUserRole(userId: string, role: UserRole): Promise<{ user: User }> {
    return this.request<{ user: User }>('/admin/users', {
      method: 'PATCH',
      body: JSON.stringify({ user_id: userId, role }),
    });
  }

  async getStaff(): Promise<{ staff: StaffProfile[] }> {
    return this.request<{ staff: StaffProfile[] }>('/admin/staff', { method: 'GET' });
  }

  async assignStaff(data: { user_id: string; center_id: string; employee_id: string; designation: string }): Promise<{ profile: StaffProfile }> {
    return this.request<{ profile: StaffProfile }>('/admin/staff', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAuditLogs(limit = 100): Promise<{ audit_logs: AuditLog[] }> {
    return this.request<{ audit_logs: AuditLog[] }>(`/admin/audit-logs?limit=${limit}`, { method: 'GET' });
  }
}

export const api = new ApiService();
