import { normalizeRequest, sendError, sendSuccess } from '../lib/http.js';
import { db } from '../lib/db.js';
import { requireAuth } from '../lib/auth.js';

export default async function handler(req: any, res: any) {
  const normReq = await normalizeRequest(req);
  const user = await requireAuth(normReq, res);
  if (!user) return;

  // GET: Fetch notifications
  if (normReq.method === 'GET') {
    const notifications = await db.getNotifications(user.id);
    const unreadCount = notifications.filter(n => !n.read).length;
    return sendSuccess(res, { notifications, unreadCount });
  }

  // PATCH: Mark read
  if (normReq.method === 'PATCH') {
    const markAll = normReq.body.mark_all;
    if (markAll) {
      await db.markAllNotificationsRead(user.id);
      return sendSuccess(res, { message: 'All notifications marked as read' });
    }

    const id = normReq.body.id || normReq.query.id;
    if (!id) return sendError(res, 400, 'MISSING_ID', 'Notification ID is required');

    const success = await db.markNotificationRead(id, user.id);
    if (!success) return sendError(res, 404, 'NOT_FOUND', 'Notification not found');

    return sendSuccess(res, { message: 'Notification marked as read' });
  }

  return sendError(res, 405, 'METHOD_NOT_ALLOWED', 'Method not allowed');
}
