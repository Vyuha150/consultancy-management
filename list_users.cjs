const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edulead_crm';
const DB_NAME = process.env.DB_NAME || 'edulead_crm';

async function listAllUsers() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const users = await db.collection('users').find({}).toArray();
    
    console.log(`Found ${users.length} users:\n`);
    users.forEach(user => {
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.name}`);
      console.log(`Password exists: ${user.password ? 'YES' : 'NO'}`);
      console.log(`Password value: ${user.password ? user.password.substring(0, 20) + '...' : 'NULL'}`);
      console.log('---');
    });
    
    await client.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

listAllUsers();
