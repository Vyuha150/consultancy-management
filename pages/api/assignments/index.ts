/**
 * Assignments API
 * GET /api/assignments - Get all assignments
 * POST /api/assignments - Create a new assignment
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const db = await getDatabase();
    const assignmentsCollection = db.collection('assignments');

    if (req.method === 'GET') {
      const { assignedTo, status } = req.query;

      const query: any = {};
      if (assignedTo) query.assignedTo = assignedTo;
      if (status) query.status = status;

      const assignments = await assignmentsCollection
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();

      const formatted = assignments.map(a => ({
        _id: a._id.toString(),
        id: a._id.toString(),
        leadId: a.leadId,
        leadName: a.leadName,
        assignedTo: a.assignedTo,
        assignedToName: a.assignedToName,
        status: a.status,
        priority: a.priority,
        notes: a.notes,
        createdAt: a.createdAt,
        completedAt: a.completedAt,
        dueDate: a.dueDate
      }));

      return res.status(200).json(formatted);
    }

    if (req.method === 'POST') {
      const { leadId, leadName, assignedTo, assignedToName, priority, notes, dueDate, status } = req.body;

      if (!leadName || !assignedToName) {
        return res.status(400).json({ error: 'Lead name and assigned user name are required' });
      }

      const newAssignment = {
        leadId: leadId || '',
        leadName,
        assignedTo: assignedTo || '',
        assignedToName,
        status: status || 'PENDING',
        priority: priority || 'MEDIUM',
        notes: notes || '',
        createdAt: new Date(),
        completedAt: null,
        dueDate: dueDate ? new Date(dueDate) : null
      };

      const result = await assignmentsCollection.insertOne(newAssignment);

      // Update lead to mark as assigned only if leadId is a valid ObjectId
      if (leadId && ObjectId.isValid(leadId)) {
        try {
          await db.collection('leads').updateOne(
            { _id: new ObjectId(leadId) },
            { $set: { assignedTo, updatedAt: new Date() } }
          );
        } catch (err) {
          console.log('Could not update lead:', err);
          // Continue even if lead update fails
        }
      }

      return res.status(201).json({
        _id: result.insertedId.toString(),
        id: result.insertedId.toString(),
        ...newAssignment
      });
    }

    if (req.method === 'PUT') {
      const { assignmentId } = req.query;
      const { status, completedAt } = req.body;

      if (!assignmentId) {
        return res.status(400).json({ error: 'Assignment ID is required' });
      }

      const updateData: any = { status, updatedAt: new Date() };
      if (completedAt) updateData.completedAt = new Date(completedAt);

      const result = await assignmentsCollection.updateOne(
        { _id: new ObjectId(assignmentId as string) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Assignment not found' });
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Assignments API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
