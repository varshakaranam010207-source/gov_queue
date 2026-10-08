import { normalizeRequest, sendError, sendSuccess } from '../lib/http.js';
import { askGovGuideAI } from '../lib/gemini.js';
import { aiGuideSchema } from '../../shared/schemas.js';

export default async function handler(req: any, res: any) {
  const normReq = await normalizeRequest(req);

  if (normReq.method !== 'POST') {
    return sendError(res, 405, 'METHOD_NOT_ALLOWED', 'Only POST method is allowed');
  }

  const parseResult = aiGuideSchema.safeParse(normReq.body);
  if (!parseResult.success) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Please provide a valid query (2-1000 characters).', parseResult.error.format());
  }

  const { query, service_id } = parseResult.data;

  try {
    const aiResult = await askGovGuideAI(query, service_id);
    return sendSuccess(res, aiResult);
  } catch (error: any) {
    // Graceful error handling: NEVER leak stack traces or internal secrets!
    console.error('GovGuide AI encountered an unhandled error:', error?.message);
    return sendError(
      res,
      503,
      'AI_UNAVAILABLE',
      'GovGuide AI is temporarily unavailable. Please try again shortly or consult the official service catalog.'
    );
  }
}
