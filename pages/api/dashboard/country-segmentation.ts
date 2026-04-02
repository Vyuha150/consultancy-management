/**
 * Country Segmentation API
 * GET /api/dashboard/country-segmentation
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
        $match: {
          desiredCountry: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$desiredCountry',
          leads: { $sum: 1 }
        }
      },
      {
        $project: {
          name: '$_id',
          leads: '$leads',
          _id: 0
        }
      },
      { $sort: { leads: -1 } },
      { $limit: 5 }
    ]).toArray();
    
    res.status(200).json(serializeDoc(results));
  } catch (error) {
    console.error('Country segmentation error:', error);
    res.status(500).json({ error: 'Failed to fetch country segmentation' });
  }
}
