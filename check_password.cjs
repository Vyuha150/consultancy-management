const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edulead_crm';
const DB_NAME = process.env.DB_NAME || 'edulead_crm';

async function checkPassword() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const user = await db.collection('users').findOne({ email: 'admin@edulead.com' });
    
    console.log('User object:', JSON.stringify(user, null, 2));
    console.log('Password field type:', typeof user.password);
    console.log('Password field:', user.password);
    console.log('Password length:', user.password.length);
    console.log('First 50 chars:', user.password.substring(0, 50));
    
    await client.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkPassword();
