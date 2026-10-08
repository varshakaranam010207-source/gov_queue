import bcrypt from 'bcryptjs';
import * as jose from 'jose';
import { User, UserRole } from '../../shared/types.js';
import { COOKIE_NAME } from '../../shared/constants.js';
import { NormalizedRequest, sendError } from './http.js';
import { db } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'govqueue-secret-key-salt-change-in-prod-minimum-32-chars';
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

export async function createAuthToken(user: Pick<User, 'id' | 'email' | 'role' | 'full_name'>): Promise<string> {
  return new jose.SignJWT({
    id: user.id,
    email: user.email,
    role: user.role,
    full_name: user.full_name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
}

export async function verifyAuthToken(token: string): Promise<{ id: string; email: string; role: UserRole; full_name: string } | null> {
  try {
    const { payload } = await jose.jwtVerify(token, secretKey);
    return payload as unknown as { id: string; email: string; role: UserRole; full_name: string };
  } catch {
    return null;
  }
}

export async function getAuthenticatedUser(req: NormalizedRequest): Promise<User | null> {
  let token: string | undefined = req.cookies[COOKIE_NAME];

  if (!token) {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }
  }

  if (!token) {
    return null;
  }

  const payload = await verifyAuthToken(token);
  if (!payload || !payload.id) {
    return null;
  }

  const user = await db.getUserById(payload.id);
  return user || null;
}

export async function requireAuth(req: NormalizedRequest, res: any): Promise<User | null> {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    sendError(res, 401, 'UNAUTHENTICATED', 'You must be logged in to perform this operation.');
    return null;
  }
  return user;
}

export async function requireRole(req: NormalizedRequest, res: any, allowedRoles: UserRole[]): Promise<User | null> {
  const user = await requireAuth(req, res);
  if (!user) return null;

  if (!allowedRoles.includes(user.role)) {
    sendError(
      res,
      403,
      'UNAUTHORIZED',
      `Access denied. Requires one of the following roles: [${allowedRoles.join(', ')}]. Your role is: ${user.role}`
    );
    return null;
  }

  return user;
}
