import { parse as parseCookie, serialize as serializeCookie } from 'cookie';
import { COOKIE_NAME } from '../../shared/constants.js';

export interface NormalizedRequest {
  method: string;
  url: string;
  pathname: string;
  query: Record<string, string>;
  headers: Record<string, string | string[] | undefined>;
  cookies: Record<string, string>;
  body: any;
  rawReq: any;
}

export async function parseJsonBody(req: any): Promise<any> {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
    return req.body;
  }

  // Parse stream if body is not parsed yet
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk: any) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => {
      resolve({});
    });
  });
}

export async function normalizeRequest(req: any): Promise<NormalizedRequest> {
  const method = req.method || 'GET';
  const url = req.url || '/';
  const parsedUrl = new URL(url, 'http://localhost');
  const pathname = parsedUrl.pathname;
  
  const query: Record<string, string> = {};
  parsedUrl.searchParams.forEach((val, key) => {
    query[key] = val;
  });

  const rawCookieHeader = req.headers?.cookie || '';
  const cookies = typeof rawCookieHeader === 'string' ? parseCookie(rawCookieHeader) : {};
  const body = (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE')
    ? await parseJsonBody(req)
    : (req.query || {});

  return {
    method,
    url,
    pathname,
    query: { ...(req.query || {}), ...query },
    headers: req.headers || {},
    cookies: { ...(req.cookies || {}), ...cookies },
    body,
    rawReq: req,
  };
}

export function sendResponse(res: any, statusCode: number, payload: any, customHeaders: Record<string, string> = {}) {
  const body = JSON.stringify(payload);
  
  Object.entries(customHeaders).forEach(([k, v]) => {
    if (res.setHeader) res.setHeader(k, v);
  });

  if (res.setHeader) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Length', Buffer.byteLength(body));
  }

  if (typeof res.status === 'function') {
    res.status(statusCode);
    if (typeof res.json === 'function') {
      res.json(payload);
      return;
    }
  } else {
    res.statusCode = statusCode;
  }

  res.end(body);
}

export function sendSuccess<T>(res: any, data: T, statusCode = 200, headers: Record<string, string> = {}) {
  sendResponse(res, statusCode, { success: true, data }, headers);
}

export function sendError(res: any, statusCode: number, code: string, message: string, details?: any) {
  sendResponse(res, statusCode, {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {})
    }
  });
}

export function setAuthCookieHeader(token: string): string {
  const isProd = process.env.NODE_ENV === 'production';
  return serializeCookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export function clearAuthCookieHeader(): string {
  return serializeCookie(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  });
}
