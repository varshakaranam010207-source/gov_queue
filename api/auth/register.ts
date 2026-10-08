import { normalizeRequest, sendError, sendSuccess, setAuthCookieHeader } from '../lib/http.js';
import { db } from '../lib/db.js';
import { hashPassword, createAuthToken } from '../lib/auth.js';
import { registerSchema } from '../../shared/schemas.js';

export default async function handler(req: any, res: any) {
  const normReq = await normalizeRequest(req);

  if (normReq.method !== 'POST') {
    return sendError(res, 405, 'METHOD_NOT_ALLOWED', 'Only POST method is allowed');
  }

  const parseResult = registerSchema.safeParse(normReq.body);
  if (!parseResult.success) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid registration parameters', parseResult.error.format());
  }

  const { full_name, email, phone, password } = parseResult.data;

  // Check if email already registered
  const existing = await db.getUserByEmail(email);
  if (existing) {
    return sendError(res, 409, 'EMAIL_EXISTS', 'An account with this email address already exists.');
  }

  // Hash password
  const password_hash = await hashPassword(password);

  // Create citizen user
  const user = await db.createUser({
    full_name,
    email,
    phone,
    password_hash,
    role: 'CITIZEN',
  });

  // Create JWT & auth cookie
  const token = await createAuthToken(user);
  const cookieHeader = setAuthCookieHeader(token);

  await db.createAuditLog(user.id, 'REGISTER', 'user', user.id, { email: user.email });

  return sendSuccess(res, { user }, 201, { 'Set-Cookie': cookieHeader });
}
