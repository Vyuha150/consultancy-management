const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edulead_crm';
const DB_NAME = process.env.DB_NAME || 'edulead_crm';

const newCounselor = {
  name: 'Counselor',
  email: 'counselor.new@edulead.com',
  password: 'Counselor@123',
  role: 'COUNSELOR',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CounselorNew',
  dataScope: 'TEAM_ONLY',
  team: 'Counseling',
  status: 'ACTIVE'
};

async function addCounselorUser() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('✓ Connected to MongoDB');

    const db = client.db(DB_NAME);
    const existing = await db.collection('users').findOne({ email: newCounselor.email });

    if (existing) {
      console.log('User already exists with this email. No changes made.');
      return;
    }

    const hashedPassword = await bcrypt.hash(newCounselor.password, 10);
    await db.collection('users').insertOne({
      ...newCounselor,
      password: hashedPassword,
      createdAt: new Date()
    });

    console.log('✓ Counselor user created');
    console.log(`Email: ${newCounselor.email}`);
    console.log(`Password: ${newCounselor.password}`);
    console.log(`Role: ${newCounselor.role}`);
  } catch (error) {
    console.error('Error:', error);
    process.exitCode = 1;
  } finally {
    await client.close();
    console.log('✓ Connection closed');
  }
}

addCounselorUser();
