import { normalizeRequest, sendError, sendSuccess } from '../lib/http.js';
import { getAuthenticatedUser } from '../lib/auth.js';

export default async function handler(req: any, res: any) {
  const normReq = await normalizeRequest(req);

  if (normReq.method !== 'GET') {
    return sendError(res, 405, 'METHOD_NOT_ALLOWED', 'Only GET method is allowed');
  }

  const user = await getAuthenticatedUser(normReq);
  if (!user) {
    return sendError(res, 401, 'UNAUTHENTICATED', 'No active authenticated session.');
  }

  return sendSuccess(res, { user });
}
