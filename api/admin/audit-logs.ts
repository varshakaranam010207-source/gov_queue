import { normalizeRequest, sendError, sendSuccess } from '../lib/http.js';
import { db } from '../lib/db.js';
import { requireRole } from '../lib/auth.js';

export default async function handler(req: any, res: any) {
  const normReq = await normalizeRequest(req);
  const admin = await requireRole(normReq, res, ['ADMIN']);
  if (!admin) return;

  if (normReq.method !== 'GET') {
    return sendError(res, 405, 'METHOD_NOT_ALLOWED', 'Only GET method is allowed');
  }

  const limit = parseInt(normReq.query.limit || '100', 10);
  const logs = await db.getAuditLogs(limit);
  return sendSuccess(res, { audit_logs: logs });
}
