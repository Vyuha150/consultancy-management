/**
 * Assignment by ID API
 * PATCH /api/assignments/[id] - Update an assignment
 * DELETE /api/assignments/[id] - Delete an assignment
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid assignment ID' });
    }

    const db = await getDatabase();
    const assignmentsCollection = db.collection('assignments');

    // PATCH - Update assignment
    if (req.method === 'PATCH') {
      const { status, priority, notes, dueDate, assignedTo, assignedToName } = req.body;

      const updateData: any = {};
      if (status) updateData.status = status;
      if (priority) updateData.priority = priority;
      if (notes !== undefined) updateData.notes = notes;
      if (dueDate !== undefined) updateData.dueDate = dueDate;
      if (assignedTo) updateData.assignedTo = assignedTo;
      if (assignedToName) updateData.assignedToName = assignedToName;
      updateData.updatedAt = new Date();

      const result = await assignmentsCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      );

      if (!result.value) {
        return res.status(404).json({ error: 'Assignment not found' });
      }

      const assignment = result.value;
      return res.status(200).json({
        _id: assignment._id.toString(),
        id: assignment._id.toString(),
        leadId: assignment.leadId,
        leadName: assignment.leadName,
        assignedTo: assignment.assignedTo,
        assignedToName: assignment.assignedToName,
        status: assignment.status,
        priority: assignment.priority,
        notes: assignment.notes,
        dueDate: assignment.dueDate,
        createdAt: assignment.createdAt,
        completedAt: assignment.completedAt
      });
    }

    // DELETE - Delete assignment
    if (req.method === 'DELETE') {
      const result = await assignmentsCollection.deleteOne(
        { _id: new ObjectId(id) }
      );

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Assignment not found' });
      }

      return res.status(200).json({ message: 'Assignment deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
