const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edulead-crm';

const sampleAssignments = [
  {
    leadId: 'lead001',
    leadName: 'Rajesh Kumar',
    assignedTo: 'counselor001',
    assignedToName: 'Priya Sharma',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    notes: 'Interested in MBA programs in USA. Follow up on GMAT preparation.',
    dueDate: new Date('2026-02-05'),
    createdAt: new Date('2026-01-20'),
    completedAt: null
  },
  {
    leadId: 'lead002',
    leadName: 'Anjali Patel',
    assignedTo: 'counselor002',
    assignedToName: 'Rahul Verma',
    status: 'PENDING',
    priority: 'MEDIUM',
    notes: 'Looking for undergraduate programs in Canada. Schedule campus tour.',
    dueDate: new Date('2026-02-10'),
    createdAt: new Date('2026-01-22'),
    completedAt: null
  },
  {
    leadId: 'lead003',
    leadName: 'Vikram Singh',
    assignedTo: 'counselor001',
    assignedToName: 'Priya Sharma',
    status: 'COMPLETED',
    priority: 'HIGH',
    notes: 'Application submitted for MS in Computer Science at Stanford.',
    dueDate: new Date('2026-01-25'),
    createdAt: new Date('2026-01-10'),
    completedAt: new Date('2026-01-24')
  },
  {
    leadId: 'lead004',
    leadName: 'Meera Desai',
    assignedTo: 'counselor003',
    assignedToName: 'Amit Kapoor',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    notes: 'Preparing documents for UK visa. Need passport scan and bank statements.',
    dueDate: new Date('2026-02-08'),
    createdAt: new Date('2026-01-18'),
    completedAt: null
  },
  {
    leadId: 'lead005',
    leadName: 'Arjun Reddy',
    assignedTo: 'counselor002',
    assignedToName: 'Rahul Verma',
    status: 'PENDING',
    priority: 'LOW',
    notes: 'Initial consultation scheduled. Discuss program options and budget.',
    dueDate: new Date('2026-02-15'),
    createdAt: new Date('2026-01-23'),
    completedAt: null
  },
  {
    leadId: 'lead006',
    leadName: 'Kavya Nair',
    assignedTo: 'counselor001',
    assignedToName: 'Priya Sharma',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    notes: 'Follow up on scholarship application. Deadline approaching.',
    dueDate: new Date('2026-01-30'),
    createdAt: new Date('2026-01-15'),
    completedAt: null
  },
  {
    leadId: 'lead007',
    leadName: 'Rohan Malhotra',
    assignedTo: 'counselor003',
    assignedToName: 'Amit Kapoor',
    status: 'COMPLETED',
    priority: 'MEDIUM',
    notes: 'Offer letter received from University of Melbourne. Processing acceptance.',
    dueDate: new Date('2026-01-20'),
    createdAt: new Date('2026-01-05'),
    completedAt: new Date('2026-01-19')
  },
  {
    leadId: 'lead008',
    leadName: 'Sneha Iyer',
    assignedTo: 'counselor002',
    assignedToName: 'Rahul Verma',
    status: 'PENDING',
    priority: 'HIGH',
    notes: 'Urgent: IELTS exam preparation. Book test date.',
    dueDate: new Date('2026-02-03'),
    createdAt: new Date('2026-01-24'),
    completedAt: null
  },
  {
    leadId: 'lead009',
    leadName: 'Karthik Bose',
    assignedTo: 'counselor001',
    assignedToName: 'Priya Sharma',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    notes: 'Review SOP draft and provide feedback. Second revision needed.',
    dueDate: new Date('2026-02-12'),
    createdAt: new Date('2026-01-21'),
    completedAt: null
  },
  {
    leadId: 'lead010',
    leadName: 'Divya Krishnan',
    assignedTo: 'counselor003',
    assignedToName: 'Amit Kapoor',
    status: 'PENDING',
    priority: 'LOW',
    notes: 'Initial inquiry about part-time MBA programs. Send brochure.',
    dueDate: new Date('2026-02-20'),
    createdAt: new Date('2026-01-25'),
    completedAt: null
  },
  {
    leadId: 'lead011',
    leadName: 'Aditya Chopra',
    assignedTo: 'counselor002',
    assignedToName: 'Rahul Verma',
    status: 'COMPLETED',
    priority: 'HIGH',
    notes: 'Visa approved! Student ready for departure. Conduct pre-departure briefing.',
    dueDate: new Date('2026-01-22'),
    createdAt: new Date('2026-01-08'),
    completedAt: new Date('2026-01-21')
  },
  {
    leadId: 'lead012',
    leadName: 'Pooja Menon',
    assignedTo: 'counselor001',
    assignedToName: 'Priya Sharma',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    notes: 'Coordinate with university for accommodation booking.',
    dueDate: new Date('2026-02-07'),
    createdAt: new Date('2026-01-19'),
    completedAt: null
  }
];

async function setupAssignments() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✓ Connected to MongoDB');
    
    const db = client.db();
    const assignmentsCollection = db.collection('assignments');
    
    // Clear existing assignments
    await assignmentsCollection.deleteMany({});
    console.log('✓ Cleared existing assignments');
    
    // Insert sample assignments
    const result = await assignmentsCollection.insertMany(sampleAssignments);
    console.log(`✓ Successfully created ${result.insertedCount} assignments`);
    
    // Display summary
    console.log('\n📊 Assignment Summary:');
    console.log(`   Total: ${sampleAssignments.length}`);
    console.log(`   Pending: ${sampleAssignments.filter(a => a.status === 'PENDING').length}`);
    console.log(`   In Progress: ${sampleAssignments.filter(a => a.status === 'IN_PROGRESS').length}`);
    console.log(`   Completed: ${sampleAssignments.filter(a => a.status === 'COMPLETED').length}`);
    console.log(`   High Priority: ${sampleAssignments.filter(a => a.priority === 'HIGH').length}`);
    console.log(`   Medium Priority: ${sampleAssignments.filter(a => a.priority === 'MEDIUM').length}`);
    console.log(`   Low Priority: ${sampleAssignments.filter(a => a.priority === 'LOW').length}`);
    
  } catch (error) {
    console.error('❌ Error setting up assignments:', error);
    throw error;
  } finally {
    await client.close();
    console.log('\n✓ Database connection closed');
  }
}

setupAssignments()
  .then(() => {
    console.log('\n✅ Assignment setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  });
