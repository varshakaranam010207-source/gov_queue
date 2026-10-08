import { normalizeRequest, sendError, sendSuccess, clearAuthCookieHeader } from '../lib/http.js';
import { getAuthenticatedUser } from '../lib/auth.js';
import { db } from '../lib/db.js';

export default async function handler(req: any, res: any) {
  const normReq = await normalizeRequest(req);

  if (normReq.method !== 'POST') {
    return sendError(res, 405, 'METHOD_NOT_ALLOWED', 'Only POST method is allowed');
  }

  const user = await getAuthenticatedUser(normReq);
  if (user) {
    await db.createAuditLog(user.id, 'LOGOUT', 'user', user.id, { email: user.email });
  }

  const cookieHeader = clearAuthCookieHeader();
  return sendSuccess(res, { message: 'Logged out successfully' }, 200, { 'Set-Cookie': cookieHeader });
}
