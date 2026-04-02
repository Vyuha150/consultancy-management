/**
 * Field Marketing Leads API
 * GET /api/field-marketing/leads - Get all field marketing leads
 * POST /api/field-marketing/leads - Create new field marketing lead
 * PATCH /api/field-marketing/leads/[id] - Update lead
 * DELETE /api/field-marketing/leads/[id] - Delete lead
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { getDatabase, serializeDoc } from '../../../lib/mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const db = await getDatabase();
      const leadsCollection = db.collection('fieldMarketingLeads');

      const leads = await leadsCollection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();

      res.status(200).json(serializeDoc(leads));
    } catch (error) {
      console.error('Get field marketing leads error:', error);
      res.status(500).json({ error: 'Failed to fetch leads' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, phone, location, eventTag, interest, followUpDate, notes } = req.body;

      if (!name || !phone) {
        return res.status(400).json({ error: 'Name and phone are required' });
      }

      const db = await getDatabase();
      const leadsCollection = db.collection('fieldMarketingLeads');

      const newLead = {
        name,
        phone,
        location,
        eventTag,
        interest,
        followUpDate,
        notes,
        status: 'NEW',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await leadsCollection.insertOne(newLead);

      res.status(201).json(serializeDoc({
        _id: result.insertedId,
        ...newLead
      }));
    } catch (error) {
      console.error('Create field marketing lead error:', error);
      res.status(500).json({ error: 'Failed to create lead' });
    }
  } else if (req.method === 'PATCH') {
    try {
      const { id } = req.query;
      const updates = req.body;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Lead ID is required' });
      }

      const db = await getDatabase();
      const leadsCollection = db.collection('fieldMarketingLeads');

      const result = await leadsCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...updates,
            updatedAt: new Date()
          }
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Lead not found' });
      }

      res.status(200).json({ message: 'Lead updated successfully' });
    } catch (error) {
      console.error('Update field marketing lead error:', error);
      res.status(500).json({ error: 'Failed to update lead' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Lead ID is required' });
      }

      const db = await getDatabase();
      const leadsCollection = db.collection('fieldMarketingLeads');

      const result = await leadsCollection.deleteOne(
        { _id: new ObjectId(id) }
      );

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Lead not found' });
      }

      res.status(200).json({ message: 'Lead deleted successfully' });
    } catch (error) {
      console.error('Delete field marketing lead error:', error);
      res.status(500).json({ error: 'Failed to delete lead' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
