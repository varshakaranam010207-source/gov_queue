import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { CitizenLayout } from './layouts/CitizenLayout';
import { StaffLayout } from './layouts/StaffLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public & Citizen Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CitizenDashboardPage } from './pages/CitizenDashboardPage';
import { ServicesPage } from './pages/ServicesPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { BookAppointmentPage } from './pages/BookAppointmentPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { AppointmentDetailPage } from './pages/AppointmentDetailPage';
import { LiveQueuePage } from './pages/LiveQueuePage';
import { NotificationsPage } from './pages/NotificationsPage';
import { GovGuidePage } from './pages/GovGuidePage';
import { ProfilePage } from './pages/ProfilePage';

// Restricted Internal Portal
import { InternalPortalPage } from './pages/InternalPortalPage';

// Staff Portal Pages
import { StaffDashboardPage } from './pages/staff/StaffDashboardPage';
import { StaffQueuePage } from './pages/staff/StaffQueuePage';
import { StaffAppointmentsPage } from './pages/staff/StaffAppointmentsPage';

// Admin Portal Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminServicesPage } from './pages/admin/AdminServicesPage';
import { AdminCentersPage } from './pages/admin/AdminCentersPage';
import { AdminStaffPage } from './pages/admin/AdminStaffPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminAppointmentsPage } from './pages/admin/AdminAppointmentsPage';
import { AdminQueuesPage } from './pages/admin/AdminQueuesPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Entry */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/services/:id" element={<ServiceDetailPage />} />
              <Route path="/guide" element={<GovGuidePage />} />
            </Route>

            {/* Public Authentication */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* RESTRICTED PERSONNEL ENTRY POINT (Hidden from normal navigation) */}
            <Route path="/internal" element={<InternalPortalPage />} />

            {/* Authenticated Citizen Portal */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['CITIZEN', 'STAFF', 'ADMIN']}>
                  <CitizenLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<CitizenDashboardPage />} />
              <Route path="/appointments" element={<AppointmentsPage />} />
              <Route path="/appointments/book" element={<BookAppointmentPage />} />
              <Route path="/appointments/:id" element={<AppointmentDetailPage />} />
              <Route path="/queue" element={<LiveQueuePage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Authenticated Staff Portal */}
            <Route
              path="/staff"
              element={
                <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                  <StaffLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<StaffDashboardPage />} />
              <Route path="queue" element={<StaffQueuePage />} />
              <Route path="appointments" element={<StaffAppointmentsPage />} />
            </Route>

            {/* Authenticated Chief Administrator Portal */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="services" element={<AdminServicesPage />} />
              <Route path="centers" element={<AdminCentersPage />} />
              <Route path="staff" element={<AdminStaffPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="appointments" element={<AdminAppointmentsPage />} />
              <Route path="queues" element={<AdminQueuesPage />} />
              <Route path="audit-logs" element={<AdminAuditLogsPage />} />
            </Route>

            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
