import { normalizeRequest, sendError, sendSuccess, setAuthCookieHeader } from '../lib/http.js';
import { db } from '../lib/db.js';
import { verifyPassword, createAuthToken } from '../lib/auth.js';
import { loginSchema } from '../../shared/schemas.js';

export default async function handler(req: any, res: any) {
  const normReq = await normalizeRequest(req);

  if (normReq.method !== 'POST') {
    return sendError(res, 405, 'METHOD_NOT_ALLOWED', 'Only POST method is allowed');
  }

  const parseResult = loginSchema.safeParse(normReq.body);
  if (!parseResult.success) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Please provide a valid email and password.', parseResult.error.format());
  }

  const { email, password } = parseResult.data;

  const user = await db.getUserByEmail(email);
  if (!user) {
    return sendError(res, 401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
  }

  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    return sendError(res, 401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
  }

  const safeUser = {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };

  const token = await createAuthToken(safeUser);
  const cookieHeader = setAuthCookieHeader(token);

  await db.createAuditLog(user.id, 'LOGIN', 'user', user.id, { portal: 'citizen', role: user.role });

  return sendSuccess(res, { user: safeUser }, 200, { 'Set-Cookie': cookieHeader });
}
