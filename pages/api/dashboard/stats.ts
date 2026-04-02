/**
 * Dashboard Stats API
 * GET /api/dashboard/stats
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
    
    // Get today's leads count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const leadsToday = await db.collection('leads').countDocuments({
      createdAt: { $gte: today }
    });
    
    // Get total leads
    const leadsTotal = await db.collection('leads').countDocuments({});
    
    // Get active tasks
    const activeTasks = await db.collection('tasks').countDocuments({
      status: { $in: ['ASSIGNED', 'IN_PROGRESS'] }
    });
    
    // Get overdue tasks
    const overdueTasks = await db.collection('tasks').countDocuments({
      status: 'OVERDUE'
    });
    
    // Get conversion rate
    const convertedLeads = await db.collection('leads').countDocuments({
      stage: 'CONVERTED'
    });
    const conversionRate = leadsTotal > 0 ? (convertedLeads / leadsTotal * 100) : 0;
    
    // Get AI bot response rate
    const activeWhatsapp = await db.collection('whatsapp_conversations').countDocuments({
      status: 'ACTIVE'
    });
    const totalWhatsapp = await db.collection('whatsapp_conversations').countDocuments({});
    const aiResponseRate = totalWhatsapp > 0 ? (activeWhatsapp / totalWhatsapp * 100) : 92;
    
    const stats = {
      leadsToday,
      leadsTotal,
      activeTasks,
      overdueTasks,
      conversionRate: Math.round(conversionRate * 10) / 10,
      aiResponseRate: Math.round(aiResponseRate * 10) / 10
    };
    
    res.status(200).json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
}
