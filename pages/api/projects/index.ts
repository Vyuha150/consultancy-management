/**
 * Projects API
 * GET /api/projects - Get all projects (placeholder if none)
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
    const projects = await db.collection('projects').find({}).sort({ createdAt: -1 }).toArray();
    return res.status(200).json(serializeDoc(projects));
  } catch (error) {
    console.error('Projects API error:', error);
    return res.status(200).json([]); // graceful fallback to avoid frontend breakage
  }
}
