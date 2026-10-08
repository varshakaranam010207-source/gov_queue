import { normalizeRequest, sendError, sendSuccess } from '../lib/http.js';
import { db } from '../lib/db.js';
import { requireRole } from '../lib/auth.js';
import { centerSchema } from '../../shared/schemas.js';

export default async function handler(req: any, res: any) {
  const normReq = await normalizeRequest(req);

  // GET: Public list of service centers
  if (normReq.method === 'GET') {
    const id = normReq.query.id;
    if (id) {
      const center = await db.getCenterById(id);
      if (!center) return sendError(res, 404, 'NOT_FOUND', 'Service center not found');
      return sendSuccess(res, { center });
    }

    const centers = await db.getCenters();
    return sendSuccess(res, { centers });
  }

  // POST: Create new center (ADMIN ONLY)
  if (normReq.method === 'POST') {
    const admin = await requireRole(normReq, res, ['ADMIN']);
    if (!admin) return;

    const parseResult = centerSchema.safeParse(normReq.body);
    if (!parseResult.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid center data', parseResult.error.format());
    }

    const center = await db.createCenter(parseResult.data, admin.id);
    return sendSuccess(res, { center }, 201);
  }

  // PUT / PATCH: Update existing center (ADMIN ONLY)
  if (normReq.method === 'PUT' || normReq.method === 'PATCH') {
    const admin = await requireRole(normReq, res, ['ADMIN']);
    if (!admin) return;

    const id = normReq.query.id || normReq.body.id;
    if (!id) {
      return sendError(res, 400, 'MISSING_ID', 'Center ID is required for update');
    }

    const updated = await db.updateCenter(id, normReq.body, admin.id);
    if (!updated) return sendError(res, 404, 'NOT_FOUND', 'Service center not found');

    return sendSuccess(res, { center: updated });
  }

  return sendError(res, 405, 'METHOD_NOT_ALLOWED', 'Method not allowed');
}
