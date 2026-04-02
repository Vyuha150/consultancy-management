const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edulead_crm';
const DB_NAME = process.env.DB_NAME || 'edulead_crm';

async function resetDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('✓ Connected to MongoDB');

    const db = client.db(DB_NAME);

    // Drop existing collections
    console.log('Dropping existing collections...');
    try {
      await db.collection('users').drop();
    } catch (e) {
      // Collection doesn't exist, continue
    }
    console.log('✓ Database cleaned');

    // Create 8 users with bcrypt hashing
    const users = [
      {
        name: 'Super Admin',
        email: 'super@edulead.com',
        password: 'Super@123',
        role: 'SUPER_ADMIN',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Super',
        dataScope: 'ALL_LEADS',
        team: 'Admin',
        status: 'ACTIVE'
      },
      {
        name: 'Admin',
        email: 'admin@edulead.com',
        password: 'Admin@123',
        role: 'ADMIN',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
        dataScope: 'ALL_LEADS',
        team: 'Admin',
        status: 'ACTIVE'
      },
      {
        name: 'Telecaller',
        email: 'caller@edulead.com',
        password: 'Caller@123',
        role: 'TELECALLER',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Caller',
        dataScope: 'ONLY_ASSIGNED',
        team: 'Telecalling',
        status: 'ACTIVE'
      },
      {
        name: 'Counselor',
        email: 'counselor@edulead.com',
        password: 'Counselor@123',
        role: 'COUNSELOR',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Counselor',
        dataScope: 'TEAM_ONLY',
        team: 'Counseling',
        status: 'ACTIVE'
      },
      {
        name: 'Social Media',
        email: 'media@edulead.com',
        password: 'Media@123',
        role: 'SOCIAL_MEDIA',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Media',
        dataScope: 'ALL_LEADS',
        team: 'Marketing',
        status: 'ACTIVE'
      },
      {
        name: 'Field Marketing',
        email: 'field@edulead.com',
        password: 'Field@123',
        role: 'FIELD_MARKETING',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Field',
        dataScope: 'ONLY_ASSIGNED',
        team: 'Marketing',
        status: 'ACTIVE'
      },
      {
        name: 'Agent Manager',
        email: 'agent@edulead.com',
        password: 'Agent@123',
        role: 'AGENT_MANAGER',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Agent',
        dataScope: 'TEAM_ONLY',
        team: 'Operations',
        status: 'ACTIVE'
      },
      {
        name: 'AI Operator',
        email: 'ai@edulead.com',
        password: 'AI@123',
        role: 'AI_OPERATOR',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AI',
        dataScope: 'ALL_LEADS',
        team: 'AI',
        status: 'ACTIVE'
      }
    ];

    console.log('Creating users with bcrypt hashing...');
    const saltRounds = 10;
    const createdUsers = [];

    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      await db.collection('users').insertOne({
        ...userData,
        password: hashedPassword,
        createdAt: new Date()
      });
      createdUsers.push({
        name: userData.name,
        email: userData.email,
        plainPassword: userData.password,
        role: userData.role
      });
    }

    console.log('\n✓ Database reset complete!');
    console.log('\n📋 Created 8 test users:\n');
    createdUsers.forEach(user => {
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.plainPassword}`);
      console.log(`  Role: ${user.role}`);
      console.log('  ---');
    });

    await client.close();
    console.log('\n✓ Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    await client.close();
    process.exit(1);
  }
}

resetDatabase();
