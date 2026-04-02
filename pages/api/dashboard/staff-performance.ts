/**
 * Staff Performance API
 * GET /api/dashboard/staff-performance
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
    
    const users = await db.collection('users')
      .find({ status: 'ACTIVE' })
      .limit(10)
      .toArray();
    
    const performance = [];
    
    for (const user of users) {
      const userId = user._id;
      
      // Count completed tasks
      const completed = await db.collection('tasks').countDocuments({
        assignedTo: userId,
        status: 'COMPLETED'
      });
      
      // Count potential leads
      const potentials = await db.collection('leads').countDocuments({
        assignedTo: userId,
        interestLevel: 'HOT'
      });
      
      const roleLabel = (user.role || '').replace('_', ' ');
      performance.push({
        name: `${user.name || 'Unknown'} (${roleLabel.substring(0, 4)})`,
        calls: completed,
        potentials
      });
    }
    
    // Sort by completed tasks
    performance.sort((a, b) => b.calls - a.calls);
    
    res.status(200).json(performance.slice(0, 4));
  } catch (error) {
    console.error('Staff performance error:', error);
    res.status(500).json({ error: 'Failed to fetch staff performance' });
  }
}
