const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edulead-crm';

async function checkAssignments() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✓ Connected to MongoDB');
    
    const db = client.db();
    const assignmentsCollection = db.collection('assignments');
    
    const count = await assignmentsCollection.countDocuments();
    console.log(`\n📊 Total assignments in DB: ${count}`);
    
    if (count > 0) {
      const assignments = await assignmentsCollection.find({}).limit(5).toArray();
      console.log('\n📝 Sample assignments:');
      assignments.forEach((a, idx) => {
        console.log(`\n${idx + 1}. ${a.leadName}`);
        console.log(`   Status: ${a.status}`);
        console.log(`   Priority: ${a.priority}`);
        console.log(`   Assigned to: ${a.assignedToName}`);
        console.log(`   ID: ${a._id}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkAssignments();
