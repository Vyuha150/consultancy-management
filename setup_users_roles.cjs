#!/usr/bin/env node

/**
 * Setup Script for Dummy Users - All Roles
 * Populates MongoDB with test users for each role
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/';
const DB_NAME = process.env.DB_NAME || 'edulead_crm';

const dummyUsers = [
  {
    id: 'u1',
    name: 'Alex Super',
    email: 'super@edulead.com',
    password: 'Super@123', // Will be hashed
    role: 'SUPER_ADMIN',
    avatar: 'https://picsum.photos/seed/alex/100',
    status: 'ACTIVE',
    dataScope: 'ALL_LEADS',
    teamId: 't1',
    lastActive: '2 mins ago',
    isOnline: true,
    createdAt: new Date('2025-01-01')
  },
  {
    id: 'u2',
    name: 'Sarah Admin',
    email: 'admin@edulead.com',
    password: 'Admin@123',
    role: 'ADMIN',
    avatar: 'https://picsum.photos/seed/sarah/100',
    status: 'ACTIVE',
    dataScope: 'ALL_LEADS',
    teamId: 't1',
    lastActive: '10 mins ago',
    isOnline: true,
    createdAt: new Date('2025-01-02')
  },
  {
    id: 'u3',
    name: 'John Caller',
    email: 'caller@edulead.com',
    password: 'Caller@123',
    role: 'TELECALLER',
    avatar: 'https://picsum.photos/seed/john/100',
    status: 'ACTIVE',
    dataScope: 'ONLY_ASSIGNED',
    teamId: 't2',
    lastActive: '1 hour ago',
    isOnline: false,
    createdAt: new Date('2025-01-03')
  },
  {
    id: 'u4',
    name: 'Lisa Counselor',
    email: 'counselor@edulead.com',
    password: 'Counselor@123',
    role: 'COUNSELOR',
    avatar: 'https://picsum.photos/seed/lisa/100',
    status: 'ACTIVE',
    dataScope: 'TEAM_ONLY',
    teamId: 't3',
    lastActive: 'Active now',
    isOnline: true,
    createdAt: new Date('2025-01-04')
  },
  {
    id: 'u5',
    name: 'Mark Media',
    email: 'media@edulead.com',
    password: 'Media@123',
    role: 'SOCIAL_MEDIA',
    avatar: 'https://picsum.photos/seed/mark/100',
    status: 'ACTIVE',
    dataScope: 'ALL_LEADS',
    teamId: 't1',
    lastActive: '5 hours ago',
    isOnline: false,
    createdAt: new Date('2025-01-05')
  },
  {
    id: 'u6',
    name: 'Kevin Field',
    email: 'field@edulead.com',
    password: 'Field@123',
    role: 'FIELD_MARKETING',
    avatar: 'https://picsum.photos/seed/kevin/100',
    status: 'ACTIVE',
    dataScope: 'ONLY_ASSIGNED',
    teamId: 't4',
    lastActive: 'Active now',
    isOnline: true,
    createdAt: new Date('2025-01-06')
  },
  {
    id: 'u7',
    name: 'Robert Agent',
    email: 'agent@edulead.com',
    password: 'Agent@123',
    role: 'AGENT_MANAGER',
    avatar: 'https://picsum.photos/seed/robert/100',
    status: 'ACTIVE',
    dataScope: 'TEAM_ONLY',
    teamId: 't5',
    lastActive: '30 mins ago',
    isOnline: true,
    createdAt: new Date('2025-01-07')
  },
  {
    id: 'u8',
    name: 'Emma AI',
    email: 'ai@edulead.com',
    password: 'AI@123',
    role: 'AI_OPERATOR',
    avatar: 'https://picsum.photos/seed/emma/100',
    status: 'ACTIVE',
    dataScope: 'ALL_LEADS',
    teamId: 't1',
    lastActive: '15 mins ago',
    isOnline: true,
    createdAt: new Date('2025-01-08')
  }
];

async function setupUsers() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);

    console.log('✓ Connected to MongoDB');

    // Hash passwords and prepare users
    const usersToInsert = await Promise.all(
      dummyUsers.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return {
          ...user,
          passwordHash: hashedPassword,
          password: undefined // Remove plain text password
        };
      })
    );

    // Delete existing users collection
    await db.collection('users').deleteMany({});
    console.log('✓ Cleared existing users');

    // Insert users
    const result = await db.collection('users').insertMany(usersToInsert);
    console.log(`✓ Inserted ${result.insertedCount} users`);

    // Display credentials
    console.log('\n📋 TEST LOGIN CREDENTIALS:\n');
    dummyUsers.forEach(user => {
      console.log(`${user.role.padEnd(15)} | Email: ${user.email.padEnd(25)} | Password: ${user.password}`);
    });

    console.log('\n✅ Users Setup Complete!');
    console.log('\n📝 All users created with status ACTIVE');
    console.log('🔑 Use above credentials to login');
    console.log('✨ Role-based access will be enforced on pages');

  } catch (error) {
    console.error('✗ Error:', error.message);
  } finally {
    await client.close();
  }
}

setupUsers();
