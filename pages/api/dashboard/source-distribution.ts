/**
 * Source Distribution API
 * GET /api/dashboard/source-distribution
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
    
    const results = await db.collection('leads').aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          name: '$_id',
          value: '$count',
          _id: 0
        }
      }
    ]).toArray();
    
    res.status(200).json(serializeDoc(results));
  } catch (error) {
    console.error('Source distribution error:', error);
    res.status(500).json({ error: 'Failed to fetch source distribution' });
  }
}
