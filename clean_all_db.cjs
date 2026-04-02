const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'edulead_crm';

async function cleanAllDatabases() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🧹 Cleaning all EduLead databases...\n');
    await client.connect();
    
    const admin = client.db().admin();
    
    // Drop database
    try {
      await client.db(DB_NAME).dropDatabase();
      console.log(`✓ Dropped ${DB_NAME}`);
    } catch (e) {
      console.log('  edulead_crm did not exist');
    }
    
    try {
      await client.db('edulead-pro').dropDatabase();
      console.log('✓ Dropped edulead-pro');
    } catch (e) {
      console.log('  edulead-pro did not exist');
    }
    
    // List remaining databases
    const databases = await admin.listDatabases();
    console.log('\n📋 Remaining databases:');
    databases.databases.forEach(db => {
      console.log(`  - ${db.name}`);
    });
    
    await client.close();
    console.log('\n✓ Cleanup complete');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

cleanAllDatabases();
