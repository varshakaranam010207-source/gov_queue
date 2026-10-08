import { normalizeRequest, sendError, sendSuccess } from '../lib/http.js';
import { db } from '../lib/db.js';
import { requireRole } from '../lib/auth.js';
import { userRoleUpdateSchema } from '../../shared/schemas.js';

export default async function handler(req: any, res: any) {
  const normReq = await normalizeRequest(req);
  const admin = await requireRole(normReq, res, ['ADMIN']);
  if (!admin) return;

  // GET: List users
  if (normReq.method === 'GET') {
    const roleFilter = normReq.query.role as any;
    const search = normReq.query.q;
    const users = await db.getUsers(roleFilter, search);
    return sendSuccess(res, { users });
  }

  // PATCH: Update user role
  if (normReq.method === 'PATCH') {
    const userId = normReq.body.user_id || normReq.query.id;
    if (!userId) {
      return sendError(res, 400, 'MISSING_ID', 'User ID is required');
    }

    const parseResult = userRoleUpdateSchema.safeParse(normReq.body);
    if (!parseResult.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid role specified', parseResult.error.format());
    }

    const { role } = parseResult.data;

    // Safety: Prevent admin from demoting themselves by accident
    if (userId === admin.id && role !== 'ADMIN') {
      return sendError(res, 400, 'CANNOT_DEMOTE_SELF', 'You cannot change your own administrator role.');
    }

    const updatedUser = await db.updateUserRole(userId, role, admin.id);
    if (!updatedUser) {
      return sendError(res, 404, 'NOT_FOUND', 'Target user not found');
    }

    return sendSuccess(res, { user: updatedUser });
  }

  return sendError(res, 405, 'METHOD_NOT_ALLOWED', 'Method not allowed');
}
