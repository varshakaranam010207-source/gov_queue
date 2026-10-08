import { normalizeRequest, sendError, sendSuccess } from '../lib/http.js';
import { db } from '../lib/db.js';
import { requireRole } from '../lib/auth.js';
import { serviceSchema } from '../../shared/schemas.js';

export default async function handler(req: any, res: any) {
  const normReq = await normalizeRequest(req);

  // GET: Public list of services
  if (normReq.method === 'GET') {
    const id = normReq.query.id;
    if (id) {
      const service = await db.getServiceById(id);
      if (!service) return sendError(res, 404, 'NOT_FOUND', 'Service not found');
      return sendSuccess(res, { service });
    }

    const services = await db.getServices();
    return sendSuccess(res, { services });
  }

  // POST: Create new service (ADMIN ONLY)
  if (normReq.method === 'POST') {
    const admin = await requireRole(normReq, res, ['ADMIN']);
    if (!admin) return;

    const parseResult = serviceSchema.safeParse(normReq.body);
    if (!parseResult.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid service data', parseResult.error.format());
    }

    const service = await db.createService(parseResult.data, admin.id);
    return sendSuccess(res, { service }, 201);
  }

  // PUT / PATCH: Update existing service (ADMIN ONLY)
  if (normReq.method === 'PUT' || normReq.method === 'PATCH') {
    const admin = await requireRole(normReq, res, ['ADMIN']);
    if (!admin) return;

    const id = normReq.query.id || normReq.body.id;
    if (!id) {
      return sendError(res, 400, 'MISSING_ID', 'Service ID is required for update');
    }

    const updated = await db.updateService(id, normReq.body, admin.id);
    if (!updated) return sendError(res, 404, 'NOT_FOUND', 'Service not found');

    return sendSuccess(res, { service: updated });
  }

  return sendError(res, 405, 'METHOD_NOT_ALLOWED', 'Method not allowed');
}
