/**
 * Authentication API
 * Handles user login and authentication with bcrypt password verification
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { getDatabase } from '../../../lib/mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt:', { email, passwordProvided: !!password });

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = await getDatabase();
    const usersCollection = db.collection('users');

    // Find user by email (case-insensitive search)
    console.log('🔍 Searching for user:', email);
    const user = await usersCollection.findOne({ 
      email: { $regex: `^${email}$`, $options: 'i' } 
    });

    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('✓ User found:', { name: user.name, email: user.email, role: user.role });

    // Debug password field
    console.log('📝 Raw password from DB:', {
      exists: user.password !== undefined && user.password !== null,
      type: typeof user.password,
      length: user.password?.length,
      value: user.password
    });

    // Ensure password is a string
    const storedPassword = typeof user.password === 'string' ? user.password : String(user.password);
    console.log('🔑 After string conversion:', {
      type: typeof storedPassword,
      length: storedPassword.length,
      first20: storedPassword.substring(0, 20)
    });

    // Compare password with bcrypt (using sync version)
    let isPasswordValid = false;
    try {
      isPasswordValid = bcrypt.compareSync(password, storedPassword);
    } catch (compareError) {
      console.error('⚠️  Compare error:', compareError);
      isPasswordValid = false;
    }
    console.log('🔐 Password validation:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Password mismatch');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('✓ Login successful');

    // Return user data (without password)
    res.status(200).json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status || 'ACTIVE',
      avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
      dataScope: user.dataScope || 'ALL_LEADS',
      team: user.team
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
