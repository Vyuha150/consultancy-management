/**
 * Users API
 * GET /api/users - Get all users (excluding password)
 * POST /api/users - Create a new user
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase, serializeDoc } from '../../../lib/mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const db = await getDatabase();
      const { role, status } = req.query;
      
      const query: any = {};
      
      if (role) query.role = role;
      if (status) query.status = status;
      
      const users = await db.collection('users')
        .find(query)
        .project({ password: 0 })
        .toArray();
      
      res.status(200).json(serializeDoc(users));
    } catch (error) {
      console.error('Users API error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  } else if (req.method === 'POST') {
    try {
      const db = await getDatabase();
      const { name, email, password, role, teamId, dataScope, status } = req.body;

      // Validation
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
      }

      // Check if user already exists
      const existingUser = await db.collection('users').findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      // Create new user
      const newUser = {
        name,
        email,
        password, // In production, hash this password!
        role: role || 'TELECALLER',
        teamId: teamId || null,
        dataScope: dataScope || 'ONLY_ASSIGNED',
        status: status || 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.collection('users').insertOne(newUser);
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = newUser;
      
      res.status(201).json({ 
        success: true, 
        user: serializeDoc({ ...userWithoutPassword, _id: result.insertedId }) 
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ message: 'Failed to create user' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
