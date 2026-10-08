import { normalizeRequest, sendError, sendSuccess } from '../lib/http.js';
import { db } from '../lib/db.js';
import { requireAuth, requireRole } from '../lib/auth.js';
import { joinQueueSchema, updateTokenStatusSchema } from '../../shared/schemas.js';

export default async function handler(req: any, res: any) {
  const normReq = await normalizeRequest(req);
  const user = await requireAuth(normReq, res);
  if (!user) return;

  // GET: Queue status and tokens
  if (normReq.method === 'GET') {
    const todayStr = new Date().toISOString().split('T')[0];
    const centerId = normReq.query.center_id;
    const serviceId = normReq.query.service_id;

    if (user.role === 'CITIZEN') {
      const activeToken = await db.getCitizenActiveToken(user.id);
      const queues = await db.getQueues(undefined, todayStr);
      return sendSuccess(res, { activeToken, queues });
    }

    // STAFF or ADMIN
    const queues = await db.getQueues(centerId, todayStr);
    const tokens = await db.getQueueTokens({
      queueId: normReq.query.queue_id,
      status: normReq.query.status as any,
    });

    const waitingTokens = tokens.filter(t => t.status === 'WAITING');
    const calledToken = tokens.find(t => t.status === 'CALLED' || t.status === 'SERVING') || null;

    return sendSuccess(res, {
      queues,
      tokens,
      waitingTokens,
      calledToken,
    });
  }

  // POST: Join Queue / Generate Token
  if (normReq.method === 'POST') {
    const parseResult = joinQueueSchema.safeParse(normReq.body);
    if (!parseResult.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid queue parameters', parseResult.error.format());
    }

    const { center_id, service_id, appointment_id } = parseResult.data;

    // Check if citizen already has an active waiting/called token
    const existingActive = await db.getCitizenActiveToken(user.id);
    if (existingActive) {
      return sendError(
        res,
        400,
        'ACTIVE_TOKEN_EXISTS',
        `You already hold an active token (${existingActive.token_number}). Please wait until your turn is completed.`
      );
    }

    const token = await db.joinQueue({
      citizen_id: user.id,
      center_id,
      service_id,
      appointment_id: appointment_id || undefined,
    });

    return sendSuccess(res, { token }, 201);
  }

  // PATCH: Staff Queue Controls (Call Next, Recall, Complete, No-Show)
  if (normReq.method === 'PATCH') {
    // Only STAFF or ADMIN can advance queue
    if (user.role !== 'STAFF' && user.role !== 'ADMIN') {
      return sendError(res, 403, 'FORBIDDEN', 'Only staff and administrators can manage queue tokens.');
    }

    const action = normReq.body.action; // 'CALL_NEXT' or direct status update
    
    if (action === 'CALL_NEXT') {
      const queueId = normReq.body.queue_id;
      const tokens = await db.getQueueTokens({ queueId, status: 'WAITING' });
      if (tokens.length === 0) {
        return sendError(res, 404, 'NO_WAITING_TOKENS', 'No citizens are currently waiting in this queue.');
      }

      // First waiting token in sequence
      const nextToken = tokens[0];
      const updated = await db.updateTokenStatus(nextToken.id, 'CALLED', user.id);
      return sendSuccess(res, { token: updated });
    }

    const parseResult = updateTokenStatusSchema.safeParse(normReq.body);
    if (!parseResult.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid token update payload', parseResult.error.format());
    }

    const { token_id, status } = parseResult.data;
    const updated = await db.updateTokenStatus(token_id, status, user.id);
    if (!updated) return sendError(res, 404, 'NOT_FOUND', 'Queue token not found');

    return sendSuccess(res, { token: updated });
  }

  return sendError(res, 405, 'METHOD_NOT_ALLOWED', 'Method not allowed');
}
