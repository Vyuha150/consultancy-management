/**
 * Referral Payouts API
 * GET /api/dashboard/referral-payouts
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
    
    const agents = await db.collection('agents')
      .find({ status: 'ACTIVE' })
      .limit(5)
      .toArray();
    
    const referralData = [];
    
    for (const agent of agents) {
      const agentId = agent._id;
      
      // Count conversions this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const conversions = await db.collection('leads').countDocuments({
        source: 'REFERRAL',
        referralAgentId: agentId,
        stage: 'CONVERTED',
        createdAt: { $gte: startOfMonth }
      });
      
      // Get pending payout amount
      const pendingPayouts = await db.collection('payouts').aggregate([
        {
          $match: {
            agentId: agentId,
            status: 'PENDING'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]).toArray();
      
      const pending = pendingPayouts.length > 0 ? pendingPayouts[0].total : 0;
      
      referralData.push({
        agent: agent.name || 'Unknown Agent',
        leads: conversions,
        pending: `$${pending.toLocaleString()}`
      });
    }
    
    res.status(200).json(referralData);
  } catch (error) {
    console.error('Referral payouts error:', error);
    res.status(500).json({ error: 'Failed to fetch referral payouts' });
  }
}
