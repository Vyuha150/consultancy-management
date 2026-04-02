/**
 * Single Lead API
 * GET /api/leads/[id] - Get a single lead
 * PATCH /api/leads/[id] - Update a single lead
 * DELETE /api/leads/[id] - Delete a single lead
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { getDatabase, serializeDoc } from '../../../lib/mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Lead ID is required' });
  }

  try {
    const db = await getDatabase();

    if (req.method === 'GET') {
      const lead = await db.collection('leads').findOne({ _id: new ObjectId(id) });
      
      if (!lead) {
        return res.status(404).json({ error: 'Lead not found' });
      }

      return res.status(200).json(serializeDoc(lead));
    }

    if (req.method === 'PATCH') {
      const updates = req.body;
      
      const result = await db.collection('leads').updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...updates, updatedAt: new Date() } }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Lead not found' });
      }

      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const result = await db.collection('leads').deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Lead not found' });
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Lead API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
