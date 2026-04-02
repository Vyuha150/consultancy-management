/**
 * Employees API
 * GET /api/employees - Get all employees with their stats
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
    const usersCollection = db.collection('users');
    const tasksCollection = db.collection('tasks');

    // Get all users (employees)
    const users = await usersCollection
      .find({ role: { $ne: 'SUPER_ADMIN' } })
      .toArray();

    // For each user, get their task stats
    const employeesWithStats = await Promise.all(
      users.map(async (user) => {
        const userTasks = await tasksCollection
          .find({ assignedTo: user._id.toString() })
          .toArray();

        const completedCount = userTasks.filter(t => t.status === 'COMPLETED').length;
        const pendingCount = userTasks.filter(t => t.status === 'ASSIGNED').length;
        const inProgressCount = userTasks.filter(t => t.status === 'IN_PROGRESS').length;
        const overdueCount = userTasks.filter(t => t.status === 'OVERDUE').length;

        return {
          ...user,
          _id: user._id.toString(),
          stats: {
            completedTasks: completedCount,
            pendingTasks: pendingCount,
            inProgressTasks: inProgressCount,
            overdueTasks: overdueCount,
            totalTasks: userTasks.length,
            completionRate: userTasks.length > 0 
              ? Math.round((completedCount / userTasks.length) * 100) 
              : 0
          }
        };
      })
    );

    res.status(200).json(serializeDoc(employeesWithStats));
  } catch (error) {
    console.error('Employees API error:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
}
