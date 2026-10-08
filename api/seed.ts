import { normalizeRequest, sendSuccess } from './lib/http.js';
import { db } from './lib/db.js';

export default async function handler(req: any, res: any) {
  const normReq = await normalizeRequest(req);
  await db.seedDemoUsers();
  return sendSuccess(res, {
    message: 'Demo users seeded successfully.',
    environment: process.env.NODE_ENV || 'development',
    accounts: [
      { email: 'staff@govqueue.demo', role: 'STAFF', full_name: 'Demo Staff Officer' },
      { email: 'admin@govqueue.demo', role: 'ADMIN', full_name: 'Demo Chief Administrator' },
      { email: 'citizen@govqueue.demo', role: 'CITIZEN', full_name: 'Demo Citizen' }
    ]
  });
}
