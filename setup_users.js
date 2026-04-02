/**
 * Database Setup Script
 * Creates initial users in MongoDB
 * Run: node setup_users.js
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edulead_crm';

async function setupUsers() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const usersCollection = db.collection('users');

    // Delete existing users (for clean setup)
    await usersCollection.deleteMany({});
    console.log('Cleared existing users');

    // Create 2 users
    const users = [
      {
        name: 'Admin User',
        email: 'admin@edulead.com',
        password: 'admin123', // In production, this should be hashed with bcrypt
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin@edulead.com',
        dataScope: 'ALL_LEADS',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'John Smith',
        email: 'user@edulead.com',
        password: 'user123', // In production, this should be hashed with bcrypt
        role: 'COUNSELOR',
        status: 'ACTIVE',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user@edulead.com',
        dataScope: 'ASSIGNED_LEADS',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const result = await usersCollection.insertMany(users);
    console.log(`Successfully created ${result.insertedCount} users`);
    
    console.log('\n=== Login Credentials ===');
    console.log('Admin:');
    console.log('  Email: admin@edulead.com');
    console.log('  Password: admin123');
    console.log('\nUser:');
    console.log('  Email: user@edulead.com');
    console.log('  Password: user123');
    console.log('========================\n');

  } catch (error) {
    console.error('Error setting up users:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

setupUsers();
