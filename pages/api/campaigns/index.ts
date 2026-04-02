/**
 * Campaigns API
 * GET /api/campaigns - Get campaigns with optional filters (platform, status)
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase, serializeDoc } from '../../../lib/mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await getDatabase();
    const { platform, status } = req.query;

    const query: Record<string, any> = {};
    if (platform) query.platform = platform;
    if (status) query.status = status;

    const campaigns = await db.collection('campaigns').find(query).sort({ createdAt: -1 }).toArray();
    return res.status(200).json(serializeDoc(campaigns));
  } catch (error) {
    console.error('Campaigns API error:', error);
    return res.status(200).json([]); // graceful fallback to avoid frontend breakage
  }
}
