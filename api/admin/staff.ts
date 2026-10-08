import { normalizeRequest, sendError, sendSuccess } from '../lib/http.js';
import { db } from '../lib/db.js';
import { requireRole } from '../lib/auth.js';
import { staffAssignSchema } from '../../shared/schemas.js';

export default async function handler(req: any, res: any) {
  const normReq = await normalizeRequest(req);
  const admin = await requireRole(normReq, res, ['ADMIN']);
  if (!admin) return;

  // GET: List staff profiles
  if (normReq.method === 'GET') {
    const staff = await db.getStaffProfiles();
    return sendSuccess(res, { staff });
  }

  // POST: Assign staff profile
  if (normReq.method === 'POST') {
    const parseResult = staffAssignSchema.safeParse(normReq.body);
    if (!parseResult.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid staff profile data', parseResult.error.format());
    }

    const profile = await db.assignStaffProfile(parseResult.data, admin.id);
    return sendSuccess(res, { profile }, 201);
  }

  return sendError(res, 405, 'METHOD_NOT_ALLOWED', 'Method not allowed');
}
