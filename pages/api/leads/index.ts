/**
 * Leads API
 * GET /api/leads - Get all leads with filters
 * POST /api/leads - Create a new lead
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { getDatabase, serializeDoc } from '../../../lib/mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const db = await getDatabase();

    if (req.method === 'GET') {
      const { limit, pipeline, source, status, assignedTo } = req.query;
      
      const query: any = {};
      
      if (pipeline) query.pipeline = pipeline;
      if (source) query.source = source;
      if (status) query.status = status;
      if (assignedTo) query.assignedTo = assignedTo;
      
      const limitNum = limit ? parseInt(limit as string) : 100;
      
      const leads = await db.collection('leads')
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .toArray();
      
      return res.status(200).json(serializeDoc(leads));
    }

    if (req.method === 'POST') {
      const { name, email, phone, source, pipeline, interestedCountries, interestedPrograms, notes } = req.body;

      if (!name || !email || !phone) {
        return res.status(400).json({ error: 'Name, email, and phone are required' });
      }

      const newLead = {
        name,
        email,
        phone,
        source: source || 'MANUAL_ENTRY',
        pipeline: pipeline || 'NEW',
        qualificationScore: 50,
        interestedCountries: interestedCountries || [],
        interestedPrograms: interestedPrograms || [],
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        notes: notes || '',
        followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        assignedTo: null
      };

      const result = await db.collection('leads').insertOne(newLead);

      return res.status(201).json({
        id: result.insertedId.toString(),
        ...newLead
      });
    }

    if (req.method === 'PATCH') {
      const { id, ids, assignedTo } = req.body;

      if (!assignedTo || (!id && !ids)) {
        return res.status(400).json({ error: 'assignedTo and id(s) are required' });
      }

      const leadIds = Array.isArray(ids) ? ids : (id ? [id] : []);

      const objectIds = leadIds
        .filter(Boolean)
        .map((leadId: string) => new ObjectId(leadId));

      if (objectIds.length === 0) {
        return res.status(400).json({ error: 'Valid lead id(s) required' });
      }

      await db.collection('leads').updateMany(
        { _id: { $in: objectIds } },
        { $set: { assignedTo, updatedAt: new Date() } }
      );

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Leads API error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
}
