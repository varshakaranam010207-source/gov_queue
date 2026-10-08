import { normalizeRequest, sendError, sendSuccess } from '../lib/http.js';
import { db } from '../lib/db.js';
import { requireAuth } from '../lib/auth.js';
import { appointmentBookingSchema, updateAppointmentStatusSchema } from '../../shared/schemas.js';

export default async function handler(req: any, res: any) {
  const normReq = await normalizeRequest(req);
  const user = await requireAuth(normReq, res);
  if (!user) return;

  // GET: Retrieve appointments
  if (normReq.method === 'GET') {
    const id = normReq.query.id;
    if (id) {
      const appt = await db.getAppointmentById(id);
      if (!appt) return sendError(res, 404, 'NOT_FOUND', 'Appointment not found');

      // Security check: Citizen can only view their own appointment
      if (user.role === 'CITIZEN' && appt.citizen_id !== user.id) {
        return sendError(res, 403, 'FORBIDDEN', 'Access denied to this appointment');
      }

      return sendSuccess(res, { appointment: appt });
    }

    if (user.role === 'CITIZEN') {
      const appointments = await db.getAppointments({ citizenId: user.id });
      return sendSuccess(res, { appointments });
    }

    // STAFF or ADMIN can view by center or date
    const centerId = normReq.query.center_id;
    const date = normReq.query.date;
    const appointments = await db.getAppointments({ centerId, date });
    return sendSuccess(res, { appointments });
  }

  // POST: Book a new appointment
  if (normReq.method === 'POST') {
    const parseResult = appointmentBookingSchema.safeParse(normReq.body);
    if (!parseResult.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid booking details', parseResult.error.format());
    }

    const { service_id, center_id, appointment_date, start_time, notes } = parseResult.data;

    // Validate date is not in past
    const apptDate = new Date(`${appointment_date}T${start_time}`);
    const now = new Date();
    // Allow today's slots or future
    const todayDateOnly = new Date();
    todayDateOnly.setHours(0, 0, 0, 0);
    const chosenDateOnly = new Date(appointment_date);
    if (chosenDateOnly < todayDateOnly) {
      return sendError(res, 400, 'INVALID_DATE', 'Cannot book an appointment for a past date.');
    }

    // Verify service and center exist and are active
    const service = await db.getServiceById(service_id);
    if (!service || !service.active) {
      return sendError(res, 404, 'SERVICE_NOT_FOUND', 'Selected service is currently unavailable.');
    }

    const center = await db.getCenterById(center_id);
    if (!center || !center.active) {
      return sendError(res, 404, 'CENTER_NOT_FOUND', 'Selected service center is currently inactive.');
    }

    // Server-side Double-Booking Prevention: Never trust client availability!
    const isTaken = await db.isSlotBooked(center_id, service_id, appointment_date, start_time);
    if (isTaken) {
      return sendError(
        res,
        409,
        'SLOT_UNAVAILABLE',
        `The requested slot (${start_time} on ${appointment_date}) has just been taken by another citizen. Please select another time.`
      );
    }

    // Create appointment for this citizen
    const citizen_id = user.role === 'CITIZEN' ? user.id : (normReq.body.citizen_id || user.id);

    const appointment = await db.createAppointment({
      citizen_id,
      service_id,
      center_id,
      appointment_date,
      start_time,
      notes,
    });

    return sendSuccess(res, { appointment }, 201);
  }

  // PATCH / PUT: Update status (Cancel, Check-in, Complete)
  if (normReq.method === 'PATCH' || normReq.method === 'PUT') {
    const id = normReq.query.id || normReq.body.id;
    if (!id) return sendError(res, 400, 'MISSING_ID', 'Appointment ID is required');

    const appt = await db.getAppointmentById(id);
    if (!appt) return sendError(res, 404, 'NOT_FOUND', 'Appointment not found');

    const parseResult = updateAppointmentStatusSchema.safeParse(normReq.body);
    if (!parseResult.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid status update', parseResult.error.format());
    }

    const { status } = parseResult.data;

    // Authorization checks:
    if (user.role === 'CITIZEN') {
      if (appt.citizen_id !== user.id) {
        return sendError(res, 403, 'FORBIDDEN', 'Access denied to this appointment');
      }
      // Citizen can only cancel
      if (status !== 'CANCELLED') {
        return sendError(res, 403, 'UNAUTHORIZED_STATUS', 'Citizens may only cancel their appointments.');
      }
    }

    const updated = await db.updateAppointmentStatus(id, status, user.id);
    return sendSuccess(res, { appointment: updated });
  }

  return sendError(res, 405, 'METHOD_NOT_ALLOWED', 'Method not allowed');
}
