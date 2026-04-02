/**
 * Tasks API
 * GET /api/tasks - Get all tasks
 * POST /api/tasks - Create new task
 * PATCH /api/tasks/[id] - Update task
 * DELETE /api/tasks/[id] - Delete task
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
      const { assigned_to, status, project_id } = req.query;
      
      const query: any = {};
      
      if (assigned_to) query.assignedTo = assigned_to;
      if (status) query.status = status;
      if (project_id) query.projectId = project_id;
      
      const tasks = await db.collection('tasks')
        .find(query)
        .sort({ dueDate: 1 })
        .toArray();
      
      res.status(200).json(serializeDoc(tasks));
    } catch (error) {
      console.error('Tasks API error:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, description, leadName, projectId, dueDate, type, priority, assignedTo, source } = req.body;

      if (!title || !dueDate) {
        return res.status(400).json({ error: 'Title and due date are required' });
      }

      const db = await getDatabase();
      const tasksCollection = db.collection('tasks');

      const newTask = {
        title,
        description,
        leadName,
        projectId,
        dueDate,
        type,
        priority: priority || 'MEDIUM',
        assignedTo,
        source,
        status: assignedTo ? 'ASSIGNED' : 'UNASSIGNED',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await tasksCollection.insertOne(newTask);

      res.status(201).json(serializeDoc({
        _id: result.insertedId,
        ...newTask
      }));
    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  } else if (req.method === 'PATCH') {
    try {
      const { id } = req.query;
      const updates = req.body;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Task ID is required' });
      }

      const db = await getDatabase();
      const tasksCollection = db.collection('tasks');

      const result = await tasksCollection.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            ...updates,
            updatedAt: new Date()
          } 
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.status(200).json({ message: 'Task updated successfully' });
    } catch (error) {
      console.error('Update task error:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Task ID is required' });
      }

      const db = await getDatabase();
      const tasksCollection = db.collection('tasks');

      const result = await tasksCollection.deleteOne(
        { _id: new ObjectId(id) }
      );

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Delete task error:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
