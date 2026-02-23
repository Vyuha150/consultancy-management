const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edulead_crm';
const DB_NAME = process.env.DB_NAME || 'edulead_crm';

async function testLogin() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    await client.connect();
    console.log('✓ Connected\n');

    const db = client.db(DB_NAME);
    const usersCollection = db.collection('users');

    // Check all users
    console.log('📋 Users in database:');
    const users = await usersCollection.find({}).toArray();
    console.log(`Found ${users.length} users\n`);
    
    users.forEach(user => {
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.name}`);
      console.log(`Role: ${user.role}`);
      console.log(`Password Hash: ${user.password.substring(0, 30)}...`);
      console.log('---');
    });

    // Test login with super admin
    console.log('\n🧪 Testing login with super@edulead.com / Super@123\n');
    
    const testEmail = 'super@edulead.com';
    const testPassword = 'Super@123';

    // Try regex search
    const user = await usersCollection.findOne({ 
      email: { $regex: `^${testEmail}$`, $options: 'i' } 
    });

    if (!user) {
      console.log('❌ User not found in database');
      return;
    }

    console.log(`✓ Found user: ${user.name}`);
    console.log(`  Email in DB: ${user.email}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Password hash: ${user.password.substring(0, 40)}...`);

    // Test password comparison
    const storedPassword = typeof user.password === 'string' ? user.password : String(user.password);
    console.log(`\n🔐 Comparing passwords:`);
    console.log(`  Plain password: ${testPassword}`);
    console.log(`  Hash: ${storedPassword.substring(0, 40)}...`);

    const isValid = await bcrypt.compare(testPassword, storedPassword);
    console.log(`  Match result: ${isValid ? '✓ VALID' : '❌ INVALID'}`);

    if (!isValid) {
      // Try to understand why
      console.log('\n🔍 Debugging password hash...');
      console.log(`  Hash algorithm: bcryptjs v3`);
      console.log(`  Test with different password...`);
      
      // Try a few other passwords
      const testPasswords = ['super', 'Super', 'SUPER@123', 'Super@12'];
      for (const pwd of testPasswords) {
        const match = await bcrypt.compare(pwd, storedPassword);
        if (match) {
          console.log(`  ⚠️  Password "${pwd}" matches! (should be "Super@123")`);
        }
      }
    }

    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testLogin();
