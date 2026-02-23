const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edulead_crm';
const DB_NAME = process.env.DB_NAME || 'edulead_crm';

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🌱 Seeding database with dummy data...\n');
    await client.connect();
    
    const db = client.db(DB_NAME);

    // Get existing users
    const users = await db.collection('users').find({}).toArray();
    const userIds = users.map(u => u._id.toString());
    
    console.log(`Found ${users.length} users`);

    // Clear existing collections (optional)
    const collectionsToCreate = ['leads', 'tasks', 'projects', 'campaigns', 'assignments', 'field_marketing_leads', 'callSheets'];
    
    for (const collection of collectionsToCreate) {
      try {
        await db.collection(collection).deleteMany({});
        console.log(`✓ Cleared ${collection}`);
      } catch (e) {
        console.log(`  ${collection} didn't exist`);
      }
    }

    // Create Projects
    const projects = [
      {
        name: 'Q1 2026 Intake Campaign',
        description: 'Spring intake campaign for universities',
        type: 'INTAKE',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-03-31'),
        status: 'ACTIVE',
        createdAt: new Date()
      },
      {
        name: 'Social Media Lead Generation',
        description: 'Facebook and Instagram lead campaign',
        type: 'CAMPAIGN',
        startDate: new Date('2026-01-15'),
        endDate: new Date('2026-06-30'),
        status: 'ACTIVE',
        createdAt: new Date()
      },
      {
        name: 'Monthly Batch Processing',
        description: 'Batch processing for January intake',
        type: 'BATCH',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-01-31'),
        status: 'COMPLETED',
        createdAt: new Date()
      },
      {
        name: 'Partnership Universities',
        description: 'Leads from partner university networks',
        type: 'INTAKE',
        startDate: new Date('2025-12-01'),
        endDate: new Date('2026-05-31'),
        status: 'ACTIVE',
        createdAt: new Date()
      },
      {
        name: 'Fall 2026 USA Intake',
        description: 'Major intake for US universities',
        type: 'INTAKE',
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-08-31'),
        status: 'ACTIVE',
        createdAt: new Date()
      },
      {
        name: 'UK Universities Summer Drive',
        description: 'Focused campaign for UK institutions',
        type: 'CAMPAIGN',
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-07-31'),
        status: 'PLANNED',
        createdAt: new Date()
      },
      {
        name: 'Australia & New Zealand Programs',
        description: 'Outreach for ANZ universities',
        type: 'INTAKE',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-06-30'),
        status: 'ACTIVE',
        createdAt: new Date()
      },
      {
        name: 'WhatsApp AI Beta Program',
        description: 'Testing AI-powered lead qualification via WhatsApp',
        type: 'CAMPAIGN',
        startDate: new Date('2025-11-01'),
        endDate: new Date('2026-04-30'),
        status: 'ACTIVE',
        createdAt: new Date()
      }
    ];
    const projectResult = await db.collection('projects').insertMany(projects);
    const projectIds = Object.values(projectResult.insertedIds).map(id => id.toString());
    console.log(`✓ Created ${projects.length} projects`);

    // Create Campaigns
    const campaigns = [
      {
        name: 'Spring 2026 USA Intake - Facebook',
        platform: 'FACEBOOK',
        description: 'Main intake campaign for US universities',
        status: 'ACTIVE',
        budget: 50000,
        spent: 12000,
        leads: 245,
        conversions: 28,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-04-30'),
        targetAudience: 'Students interested in STEM programs in USA',
        createdAt: new Date()
      },
      {
        name: 'Instagram STEM Campaign',
        platform: 'INSTAGRAM',
        description: 'Targeting STEM students for Fall intake',
        status: 'ACTIVE',
        budget: 20000,
        spent: 5000,
        leads: 320,
        conversions: 45,
        startDate: new Date('2026-01-15'),
        endDate: new Date('2026-06-30'),
        targetAudience: 'Engineering and Computer Science aspirants',
        createdAt: new Date()
      },
      {
        name: 'Referral Program Q1',
        platform: 'REFERRAL',
        description: 'Alumni and student referral program',
        status: 'ACTIVE',
        budget: 10000,
        spent: 2000,
        leads: 85,
        conversions: 18,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-03-31'),
        targetAudience: 'Referred students from existing clients',
        createdAt: new Date()
      },
      {
        name: 'UK Universities - LinkedIn Ads',
        platform: 'LINKEDIN',
        description: 'Professional networking campaign for UK programs',
        status: 'ACTIVE',
        budget: 35000,
        spent: 8500,
        leads: 156,
        conversions: 22,
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-05-31'),
        targetAudience: 'Working professionals seeking Masters programs',
        createdAt: new Date()
      },
      {
        name: 'Google Ads - MBA Programs',
        platform: 'GOOGLE',
        description: 'Search ads targeting MBA aspirants',
        status: 'ACTIVE',
        budget: 45000,
        spent: 18000,
        leads: 198,
        conversions: 31,
        startDate: new Date('2025-12-01'),
        endDate: new Date('2026-04-30'),
        targetAudience: 'Business professionals seeking MBA',
        createdAt: new Date()
      },
      {
        name: 'Canada Immigration Pathway - Facebook',
        platform: 'FACEBOOK',
        description: 'Study + Immigration pathway to Canada',
        status: 'ACTIVE',
        budget: 28000,
        spent: 15000,
        leads: 412,
        conversions: 56,
        startDate: new Date('2025-11-01'),
        endDate: new Date('2026-03-31'),
        targetAudience: 'Students interested in PR pathway through education',
        createdAt: new Date()
      },
      {
        name: 'WhatsApp Business API Pilot',
        platform: 'WHATSAPP',
        description: 'AI-powered WhatsApp bot for lead qualification',
        status: 'ACTIVE',
        budget: 15000,
        spent: 4200,
        leads: 567,
        conversions: 89,
        startDate: new Date('2025-12-15'),
        endDate: new Date('2026-05-31'),
        targetAudience: 'All incoming queries via WhatsApp',
        createdAt: new Date()
      },
      {
        name: 'Australia - YouTube Pre-roll',
        platform: 'YOUTUBE',
        description: 'Video ads for Australian universities',
        status: 'PAUSED',
        budget: 22000,
        spent: 11000,
        leads: 134,
        conversions: 15,
        startDate: new Date('2025-11-01'),
        endDate: new Date('2026-02-28'),
        targetAudience: 'Students researching study abroad options',
        createdAt: new Date()
      },
      {
        name: 'Email Nurture Campaign - Warm Leads',
        platform: 'EMAIL',
        description: 'Automated email sequence for warm leads',
        status: 'ACTIVE',
        budget: 5000,
        spent: 1200,
        leads: 0,
        conversions: 34,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        targetAudience: 'Existing warm leads in database',
        createdAt: new Date()
      },
      {
        name: 'Twitter (X) - Scholarship Awareness',
        platform: 'TWITTER',
        description: 'Promoting scholarship opportunities',
        status: 'COMPLETED',
        budget: 8000,
        spent: 7800,
        leads: 92,
        conversions: 12,
        startDate: new Date('2025-10-01'),
        endDate: new Date('2025-12-31'),
        targetAudience: 'Students seeking financial aid',
        createdAt: new Date()
      }
    ];
    await db.collection('campaigns').insertMany(campaigns);
    console.log(`✓ Created ${campaigns.length} campaigns`);

    // Create Leads
    const leads = [
      {
        name: 'Arjun Sharma',
        email: 'arjun.sharma@email.com',
        phone: '+91-9876543210',
        source: 'WHATSAPP_AI',
        stage: 'QUALIFIED',
        interestLevel: 'HOT',
        countryPreference: ['USA', 'Canada'],
        program: 'Computer Science',
        budget: '40-50 lakhs',
        intakeMonth: 'Fall 2026',
        consentStatus: true,
        consentDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedTo: userIds[2],
        notes: []
      },
      {
        name: 'Priya Patel',
        email: 'priya.patel@email.com',
        phone: '+91-8765432109',
        source: 'SOCIAL_MEDIA',
        stage: 'CONTACTED',
        interestLevel: 'WARM',
        countryPreference: ['Australia', 'UK'],
        program: 'Business Administration',
        budget: '30-40 lakhs',
        intakeMonth: 'Spring 2026',
        consentStatus: true,
        consentDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedTo: userIds[1],
        notes: []
      },
      {
        name: 'Rahul Singh',
        email: 'rahul.singh@email.com',
        phone: '+91-7654321098',
        source: 'TELECALLER_SHEET',
        stage: 'NEW',
        interestLevel: 'COLD',
        countryPreference: ['USA'],
        program: 'Engineering',
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedTo: userIds[2],
        notes: []
      },
      {
        name: 'Sophia Williams',
        email: 'sophia.w@email.com',
        phone: '+1-4155552671',
        source: 'SOCIAL_MEDIA',
        stage: 'COUNSELING',
        interestLevel: 'HOT',
        countryPreference: ['USA', 'Canada'],
        program: 'Data Science',
        budget: '50-60 lakhs',
        intakeMonth: 'Fall 2026',
        consentStatus: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedTo: userIds[3],
        notes: []
      },
      {
        name: 'Kavya Desai',
        email: 'kavya.d@email.com',
        phone: '+91-6543210987',
        source: 'REFERRAL',
        stage: 'QUALIFIED',
        interestLevel: 'WARM',
        countryPreference: ['USA', 'UK', 'Canada'],
        program: 'Masters in Engineering',
        budget: '40-50 lakhs',
        intakeMonth: 'Fall 2026',
        consentStatus: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedTo: userIds[1],
        notes: []
      },
      {
        name: 'Vikram Reddy',
        email: 'vikram.reddy@email.com',
        phone: '+91-9988776655',
        source: 'FIELD_MARKETING',
        stage: 'APPLIED',
        interestLevel: 'HOT',
        countryPreference: ['Canada'],
        program: 'Data Analytics',
        budget: '35-40 lakhs',
        intakeMonth: 'Fall 2026',
        consentStatus: true,
        consentDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedTo: userIds[2],
        notes: []
      },
      {
        name: 'Ananya Iyer',
        email: 'ananya.iyer@email.com',
        phone: '+91-8877665544',
        source: 'SOCIAL_MEDIA',
        stage: 'OFFER_RECEIVED',
        interestLevel: 'HOT',
        countryPreference: ['UK', 'Australia'],
        program: 'MBA',
        budget: '45-55 lakhs',
        intakeMonth: 'Spring 2026',
        consentStatus: true,
        consentDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedTo: userIds[1],
        notes: []
      },
      {
        name: 'Rohan Malhotra',
        email: 'rohan.malhotra@email.com',
        phone: '+91-7766554433',
        source: 'WHATSAPP_AI',
        stage: 'CONTACTED',
        interestLevel: 'WARM',
        countryPreference: ['USA', 'Germany'],
        program: 'Mechanical Engineering',
        budget: '30-35 lakhs',
        intakeMonth: 'Fall 2026',
        consentStatus: true,
        consentDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedTo: userIds[2],
        notes: []
      },
      {
        name: 'Sneha Gupta',
        email: 'sneha.gupta@email.com',
        phone: '+91-6655443322',
        source: 'REFERRAL',
        stage: 'CONVERTED',
        interestLevel: 'HOT',
        countryPreference: ['Canada'],
        program: 'Computer Science',
        budget: '40-50 lakhs',
        intakeMonth: 'Fall 2026',
        consentStatus: true,
        consentDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedTo: userIds[1],
        notes: []
      },
      {
        name: 'Aditya Nair',
        email: 'aditya.nair@email.com',
        phone: '+91-5544332211',
        source: 'TELECALLER_SHEET',
        stage: 'QUALIFIED',
        interestLevel: 'HOT',
        countryPreference: ['USA', 'UK'],
        program: 'Artificial Intelligence',
        budget: '50-60 lakhs',
        intakeMonth: 'Fall 2026',
        consentStatus: true,
        consentDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedTo: userIds[3],
        notes: []
      },
      {
        name: 'Riya Khanna',
        email: 'riya.khanna@email.com',
        phone: '+91-4433221100',
        source: 'FIELD_MARKETING',
        stage: 'COUNSELING',
        interestLevel: 'WARM',
        countryPreference: ['Australia', 'New Zealand'],
        program: 'Healthcare Management',
        budget: '25-30 lakhs',
        intakeMonth: 'Spring 2026',
        consentStatus: true,
        consentDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedTo: userIds[1],
        notes: []
      },
      {
        name: 'Karthik Rao',
        email: 'karthik.rao@email.com',
        phone: '+91-3322110099',
        source: 'SOCIAL_MEDIA',
        stage: 'NEW',
        interestLevel: 'COLD',
        countryPreference: ['USA'],
        program: 'Electrical Engineering',
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedTo: userIds[2],
        notes: []
      },
      {
        name: 'Meera Krishnan',
        email: 'meera.krishnan@email.com',
        phone: '+91-2211009988',
        source: 'WHATSAPP_AI',
        stage: 'LOST',
        interestLevel: 'COLD',
        countryPreference: ['UK'],
        program: 'Finance',
        budget: '20-25 lakhs',
        intakeMonth: 'Spring 2026',
        consentStatus: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedTo: userIds[1],
        notes: []
      },
      {
        name: 'Siddharth Kapoor',
        email: 'siddharth.kapoor@email.com',
        phone: '+91-1100998877',
        source: 'REFERRAL',
        stage: 'APPLIED',
        interestLevel: 'HOT',
        countryPreference: ['Canada', 'USA'],
        program: 'Civil Engineering',
        budget: '35-40 lakhs',
        intakeMonth: 'Fall 2026',
        consentStatus: true,
        consentDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedTo: userIds[2],
        notes: []
      },
      {
        name: 'Ishita Mehta',
        email: 'ishita.mehta@email.com',
        phone: '+91-9988001122',
        source: 'SOCIAL_MEDIA',
        stage: 'OFFER_RECEIVED',
        interestLevel: 'HOT',
        countryPreference: ['USA'],
        program: 'Information Systems',
        budget: '45-50 lakhs',
        intakeMonth: 'Fall 2026',
        consentStatus: true,
        consentDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedTo: userIds[3],
        notes: []
      },
      {
        name: 'Harsh Verma',
        email: 'harsh.verma@email.com',
        phone: '+91-8877112233',
        source: 'FIELD_MARKETING',
        stage: 'CONTACTED',
        interestLevel: 'WARM',
        countryPreference: ['Australia'],
        program: 'Architecture',
        budget: '30-35 lakhs',
        intakeMonth: 'Spring 2026',
        consentStatus: true,
        consentDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedTo: userIds[1],
        notes: []
      },
      {
        name: 'Divya Menon',
        email: 'divya.menon@email.com',
        phone: '+91-7766223344',
        source: 'TELECALLER_SHEET',
        stage: 'QUALIFIED',
        interestLevel: 'HOT',
        countryPreference: ['UK', 'Ireland'],
        program: 'Psychology',
        budget: '25-30 lakhs',
        intakeMonth: 'Fall 2026',
        consentStatus: true,
        consentDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedTo: userIds[2],
        notes: []
      },
      {
        name: 'Nikhil Joshi',
        email: 'nikhil.joshi@email.com',
        phone: '+91-6655334455',
        source: 'WHATSAPP_AI',
        stage: 'COUNSELING',
        interestLevel: 'WARM',
        countryPreference: ['Germany', 'Netherlands'],
        program: 'Biotechnology',
        budget: '20-25 lakhs',
        intakeMonth: 'Fall 2026',
        consentStatus: true,
        consentDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedTo: userIds[3],
        notes: []
      },
      {
        name: 'Pooja Agarwal',
        email: 'pooja.agarwal@email.com',
        phone: '+91-5544556677',
        source: 'SOCIAL_MEDIA',
        stage: 'APPLIED',
        interestLevel: 'HOT',
        countryPreference: ['Canada'],
        program: 'Marketing',
        budget: '30-35 lakhs',
        intakeMonth: 'Spring 2026',
        consentStatus: true,
        consentDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedTo: userIds[1],
        notes: []
      },
      {
        name: 'Aryan Bose',
        email: 'aryan.bose@email.com',
        phone: '+91-4433667788',
        source: 'REFERRAL',
        stage: 'NEW',
        interestLevel: 'COLD',
        countryPreference: ['USA', 'Canada'],
        program: 'Cyber Security',
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedTo: userIds[2],
        notes: []
      }
    ];
    await db.collection('leads').insertMany(leads);
    console.log(`✓ Created ${leads.length} leads`);

    // Create Tasks
    const tasks = [
      {
        title: 'Follow up call with Arjun',
        description: 'Discuss university preferences and financial options',
        leadName: 'Arjun Sharma',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'HIGH',
        status: 'ASSIGNED',
        type: 'CALL',
        assignedTo: userIds[2],
        projectId: projectIds[0],
        source: 'WHATSAPP_AI',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Send admission requirements',
        description: 'Email Priya about required documents',
        leadName: 'Priya Patel',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        type: 'EMAIL',
        assignedTo: userIds[1],
        projectId: projectIds[0],
        source: 'SOCIAL_MEDIA',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Schedule counseling session',
        description: 'Book appointment for Sophia for course discussion',
        leadName: 'Sophia Williams',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'HIGH',
        status: 'ASSIGNED',
        type: 'MEETING',
        assignedTo: userIds[3],
        projectId: projectIds[0],
        source: 'SOCIAL_MEDIA',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Process admission application',
        description: 'Review and submit Kavya\'s application',
        leadName: 'Kavya Desai',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'MEDIUM',
        status: 'ASSIGNED',
        type: 'ADMIN',
        assignedTo: userIds[1],
        projectId: projectIds[0],
        source: 'REFERRAL',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Document verification for Vikram',
        description: 'Check transcripts and certificates for Canada applications',
        leadName: 'Vikram Reddy',
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        type: 'ADMIN',
        assignedTo: userIds[2],
        projectId: projectIds[2],
        source: 'FIELD_MARKETING',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Visa guidance call - Ananya',
        description: 'Discuss UK visa process and timeline',
        leadName: 'Ananya Iyer',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'HIGH',
        status: 'ASSIGNED',
        type: 'CALL',
        assignedTo: userIds[1],
        projectId: projectIds[3],
        source: 'SOCIAL_MEDIA',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Send scholarship information to Rohan',
        description: 'Forward USA scholarship deadlines and requirements',
        leadName: 'Rohan Malhotra',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'MEDIUM',
        status: 'ASSIGNED',
        type: 'EMAIL',
        assignedTo: userIds[2],
        projectId: projectIds[0],
        source: 'WHATSAPP_AI',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Congratulations call - Sneha',
        description: 'Celebrate visa approval and discuss pre-departure',
        leadName: 'Sneha Gupta',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'LOW',
        status: 'COMPLETED',
        type: 'CALL',
        assignedTo: userIds[1],
        projectId: projectIds[2],
        source: 'REFERRAL',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'University shortlisting session - Aditya',
        description: 'Help select 5-7 universities for AI program',
        leadName: 'Aditya Nair',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'HIGH',
        status: 'ASSIGNED',
        type: 'MEETING',
        assignedTo: userIds[3],
        projectId: projectIds[0],
        source: 'TELECALLER_SHEET',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'SOP review for Riya',
        description: 'Review and provide feedback on Statement of Purpose',
        leadName: 'Riya Khanna',
        dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        type: 'ADMIN',
        assignedTo: userIds[1],
        projectId: projectIds[4],
        source: 'FIELD_MARKETING',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Follow-up with Karthik',
        description: 'Second attempt to reach for interest confirmation',
        leadName: 'Karthik Rao',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'LOW',
        status: 'ASSIGNED',
        type: 'CALL',
        assignedTo: userIds[2],
        projectId: projectIds[0],
        source: 'SOCIAL_MEDIA',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'LOR coordination - Siddharth',
        description: 'Contact professors for Letters of Recommendation',
        leadName: 'Siddharth Kapoor',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'HIGH',
        status: 'ASSIGNED',
        type: 'ADMIN',
        assignedTo: userIds[2],
        projectId: projectIds[2],
        source: 'REFERRAL',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Offer comparison meeting - Ishita',
        description: 'Compare multiple university offers and finalize decision',
        leadName: 'Ishita Mehta',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        type: 'MEETING',
        assignedTo: userIds[3],
        projectId: projectIds[0],
        source: 'SOCIAL_MEDIA',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Portfolio review for Harsh',
        description: 'Review architecture portfolio for Australian applications',
        leadName: 'Harsh Verma',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'MEDIUM',
        status: 'ASSIGNED',
        type: 'MEETING',
        assignedTo: userIds[1],
        projectId: projectIds[4],
        source: 'FIELD_MARKETING',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'GRE preparation guidance - Divya',
        description: 'Recommend test prep resources and timeline',
        leadName: 'Divya Menon',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'MEDIUM',
        status: 'ASSIGNED',
        type: 'EMAIL',
        assignedTo: userIds[2],
        projectId: projectIds[3],
        source: 'TELECALLER_SHEET',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'University application tracking - Nikhil',
        description: 'Update application status for all submitted universities',
        leadName: 'Nikhil Joshi',
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'LOW',
        status: 'ASSIGNED',
        type: 'ADMIN',
        assignedTo: userIds[3],
        projectId: projectIds[0],
        source: 'WHATSAPP_AI',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Financial planning session - Pooja',
        description: 'Discuss education loan options and budget planning',
        leadName: 'Pooja Agarwal',
        dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'HIGH',
        status: 'ASSIGNED',
        type: 'MEETING',
        assignedTo: userIds[1],
        projectId: projectIds[2],
        source: 'SOCIAL_MEDIA',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Initial consultation - Aryan',
        description: 'First meeting to understand requirements and preferences',
        leadName: 'Aryan Bose',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'MEDIUM',
        status: 'ASSIGNED',
        type: 'MEETING',
        assignedTo: userIds[2],
        projectId: projectIds[0],
        source: 'REFERRAL',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Send financial aid information',
        description: 'Email scholarship and loan options',
        leadName: 'Arjun Sharma',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'LOW',
        status: 'UNASSIGNED',
        type: 'EMAIL',
        projectId: projectIds[0],
        source: 'WHATSAPP_AI',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    await db.collection('tasks').insertMany(tasks);
    console.log(`✓ Created ${tasks.length} tasks`);

    // Create Field Marketing Leads
    const fieldLeads = [
      {
        name: 'Aditya Kumar',
        phone: '+91-9123456789',
        location: 'Mumbai, Maharashtra',
        eventTag: 'College Fair - Mumbai',
        interest: 'HOT',
        followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Very interested in UK universities, asked for brochures',
        status: 'ACTIVE',
        assignedTo: userIds[5],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Neha Gupta',
        phone: '+91-8234567890',
        location: 'Delhi, Delhi NCR',
        eventTag: 'Education Expo - Delhi',
        interest: 'WARM',
        followUpDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Engineering focused, considering US and Canada',
        status: 'ACTIVE',
        assignedTo: userIds[5],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Rohan Verma',
        phone: '+91-7345678901',
        location: 'Bangalore, Karnataka',
        eventTag: 'Tech Summit - Bangalore',
        interest: 'HOT',
        followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Interested in Data Science and AI programs',
        status: 'ACTIVE',
        assignedTo: userIds[5],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Divya Sharma',
        phone: '+91-6456789012',
        location: 'Pune, Maharashtra',
        eventTag: 'Business School Event',
        interest: 'WARM',
        followUpDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'MBA aspirant, prefers Australia and UK',
        status: 'ACTIVE',
        assignedTo: userIds[5],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Akshay Patel',
        phone: '+91-5567890123',
        location: 'Ahmedabad, Gujarat',
        eventTag: 'College Fair - Ahmedabad',
        interest: 'COLD',
        followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Inquired about programs, needs more information',
        status: 'ACTIVE',
        assignedTo: userIds[5],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Tanvi Menon',
        phone: '+91-9988776611',
        location: 'Hyderabad, Telangana',
        eventTag: 'University Seminar - Hyderabad',
        interest: 'HOT',
        followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Wants to apply for MS in Computer Science, Fall 2026',
        status: 'ACTIVE',
        assignedTo: userIds[5],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Varun Jain',
        phone: '+91-8877665522',
        location: 'Chennai, Tamil Nadu',
        eventTag: 'Study Abroad Fair - Chennai',
        interest: 'WARM',
        followUpDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Interested in Australian universities, Budget conscious',
        status: 'ACTIVE',
        assignedTo: userIds[5],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Simran Kaur',
        phone: '+91-7766554433',
        location: 'Chandigarh, Punjab',
        eventTag: 'College Roadshow - Chandigarh',
        interest: 'HOT',
        followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Looking for Canada PR pathway through education',
        status: 'ACTIVE',
        assignedTo: userIds[5],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Kunal Shah',
        phone: '+91-6655443322',
        location: 'Surat, Gujarat',
        eventTag: 'MBA Information Session - Surat',
        interest: 'WARM',
        followUpDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Working professional seeking MBA in USA',
        status: 'ACTIVE',
        assignedTo: userIds[5],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Aishwarya Reddy',
        phone: '+91-5544332211',
        location: 'Visakhapatnam, Andhra Pradesh',
        eventTag: 'Education Expo - Vizag',
        interest: 'COLD',
        followUpDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Just exploring options, not in immediate decision phase',
        status: 'ACTIVE',
        assignedTo: userIds[5],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Arjun Nambiar',
        phone: '+91-4433221100',
        location: 'Kochi, Kerala',
        eventTag: 'Study in UK Seminar - Kochi',
        interest: 'HOT',
        followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Ready to apply for Spring 2026 intake, UK focused',
        status: 'ACTIVE',
        assignedTo: userIds[5],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Ritika Bajaj',
        phone: '+91-3322110099',
        location: 'Jaipur, Rajasthan',
        eventTag: 'College Fair - Jaipur',
        interest: 'WARM',
        followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Interested in Fashion Design programs in UK and Italy',
        status: 'ACTIVE',
        assignedTo: userIds[5],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Mohit Agarwal',
        phone: '+91-2211009988',
        location: 'Lucknow, Uttar Pradesh',
        eventTag: 'University Fair - Lucknow',
        interest: 'HOT',
        followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Wants to study Medicine in Europe, strong academic profile',
        status: 'ACTIVE',
        assignedTo: userIds[5],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Shruti Das',
        phone: '+91-1100998877',
        location: 'Kolkata, West Bengal',
        eventTag: 'Study Abroad Workshop - Kolkata',
        interest: 'WARM',
        followUpDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Interested in Psychology programs, needs financial aid',
        status: 'ACTIVE',
        assignedTo: userIds[5],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Gaurav Malhotra',
        phone: '+91-9988001122',
        location: 'Indore, Madhya Pradesh',
        eventTag: 'Engineering College Fair - Indore',
        interest: 'COLD',
        followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Parents attended, student unavailable for discussion',
        status: 'ACTIVE',
        assignedTo: userIds[5],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    await db.collection('field_marketing_leads').insertMany(fieldLeads);
    console.log(`✓ Created ${fieldLeads.length} field marketing leads`);

    // Create Assignments
    const assignments = [
      {
        leadId: leads[0]._id,
        assignedTo: userIds[2],
        assignedBy: userIds[0],
        type: 'COUNSELING',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        leadId: leads[1]._id,
        assignedTo: userIds[1],
        assignedBy: userIds[0],
        type: 'FOLLOW_UP',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        leadId: leads[3]._id,
        assignedTo: userIds[3],
        assignedBy: userIds[0],
        type: 'COUNSELING',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    await db.collection('assignments').insertMany(assignments);
    console.log(`✓ Created ${assignments.length} assignments`);

    // Create Call Sheets
    const callSheets = [
      {
        name: 'Engineering Seminar Leads - January 2026',
        status: 'ACTIVE',
        totalRows: 5,
        completedRows: 2,
        assignedTo: [userIds[2]], // Telecaller
        rows: [
          {
            id: new ObjectId(),
            name: 'Vikram Reddy',
            phone: '+91-9123456789',
            location: 'Hyderabad',
            callStatus: 'INTERESTED',
            interestLevel: 'HOT',
            remarks: 'Very interested in USA programs, wants callback tomorrow',
            nextFollowUp: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            isPotential: true,
            isConverted: false,
            lastEditedBy: userIds[2],
            updatedAt: new Date()
          },
          {
            id: new ObjectId(),
            name: 'Anjali Mehta',
            phone: '+91-9234567890',
            location: 'Mumbai',
            callStatus: 'CALLED',
            interestLevel: 'WARM',
            remarks: 'Asked about scholarships',
            isPotential: false,
            isConverted: false,
            updatedAt: new Date()
          },
          {
            id: new ObjectId(),
            name: 'Karthik Kumar',
            phone: '+91-9345678901',
            location: 'Chennai',
            callStatus: 'BUSY',
            remarks: 'Call back after 6 PM',
            isPotential: false,
            isConverted: false,
            updatedAt: new Date()
          },
          {
            id: new ObjectId(),
            name: 'Sneha Gupta',
            phone: '+91-9456789012',
            location: 'Delhi',
            callStatus: 'NOT_INTERESTED',
            interestLevel: 'COLD',
            remarks: 'Already applied elsewhere',
            isPotential: false,
            isConverted: false,
            updatedAt: new Date()
          },
          {
            id: new ObjectId(),
            name: 'Ravi Verma',
            phone: '+91-9567890123',
            location: 'Bangalore',
            callStatus: 'NOT_CALLED',
            isPotential: false,
            isConverted: false,
            updatedAt: new Date()
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Facebook Ad Leads - December 2025',
        status: 'ARCHIVED',
        totalRows: 3,
        completedRows: 3,
        assignedTo: [userIds[2], userIds[1]],
        rows: [
          {
            id: new ObjectId(),
            name: 'Pradeep Shah',
            phone: '+91-9678901234',
            location: 'Pune',
            callStatus: 'INTERESTED',
            interestLevel: 'HOT',
            remarks: 'Converted to lead',
            isPotential: true,
            isConverted: true,
            updatedAt: new Date()
          },
          {
            id: new ObjectId(),
            name: 'Meera Nair',
            phone: '+91-9789012345',
            location: 'Kochi',
            callStatus: 'NOT_INTERESTED',
            remarks: 'Budget constraints',
            isPotential: false,
            isConverted: false,
            updatedAt: new Date()
          },
          {
            id: new ObjectId(),
            name: 'Amit Joshi',
            phone: '+91-9890123456',
            location: 'Ahmedabad',
            callStatus: 'CALLED',
            interestLevel: 'WARM',
            remarks: 'Interested in UK universities',
            isPotential: true,
            isConverted: false,
            updatedAt: new Date()
          }
        ],
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        name: 'WhatsApp AI Bot Leads - January 2026',
        status: 'ACTIVE',
        totalRows: 8,
        completedRows: 5,
        assignedTo: [userIds[2]],
        rows: [
          {
            id: new ObjectId(),
            name: 'Deepak Chopra',
            phone: '+91-8899001122',
            location: 'Jaipur',
            callStatus: 'INTERESTED',
            interestLevel: 'HOT',
            remarks: 'Looking for Canada PR pathway, ready to proceed',
            nextFollowUp: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            isPotential: true,
            isConverted: false,
            lastEditedBy: userIds[2],
            updatedAt: new Date()
          },
          {
            id: new ObjectId(),
            name: 'Pallavi Reddy',
            phone: '+91-7788991122',
            location: 'Hyderabad',
            callStatus: 'CALLED',
            interestLevel: 'WARM',
            remarks: 'Wants to discuss MBA programs, scheduled meeting',
            nextFollowUp: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            isPotential: true,
            isConverted: false,
            updatedAt: new Date()
          },
          {
            id: new ObjectId(),
            name: 'Sanjay Gupta',
            phone: '+91-6677889900',
            location: 'Lucknow',
            callStatus: 'BUSY',
            remarks: 'Phone switched off, try tomorrow',
            isPotential: false,
            isConverted: false,
            updatedAt: new Date()
          },
          {
            id: new ObjectId(),
            name: 'Nisha Kapoor',
            phone: '+91-5566778899',
            location: 'Delhi',
            callStatus: 'NOT_INTERESTED',
            remarks: 'Decided to study in India',
            isPotential: false,
            isConverted: false,
            updatedAt: new Date()
          },
          {
            id: new ObjectId(),
            name: 'Manish Kumar',
            phone: '+91-4455667788',
            location: 'Patna',
            callStatus: 'INTERESTED',
            interestLevel: 'WARM',
            remarks: 'Interested in Germany, needs more information',
            nextFollowUp: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            isPotential: true,
            isConverted: false,
            updatedAt: new Date()
          },
          {
            id: new ObjectId(),
            name: 'Priyanka Sharma',
            phone: '+91-3344556677',
            location: 'Mumbai',
            callStatus: 'NOT_CALLED',
            isPotential: false,
            isConverted: false,
            updatedAt: new Date()
          },
          {
            id: new ObjectId(),
            name: 'Rahul Mishra',
            phone: '+91-2233445566',
            location: 'Bhopal',
            callStatus: 'NOT_CALLED',
            isPotential: false,
            isConverted: false,
            updatedAt: new Date()
          },
          {
            id: new ObjectId(),
            name: 'Swati Jain',
            phone: '+91-1122334455',
            location: 'Indore',
            callStatus: 'NOT_CALLED',
            isPotential: false,
            isConverted: false,
            updatedAt: new Date()
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'College Fair - Bangalore Tech Event',
        status: 'ACTIVE',
        totalRows: 6,
        completedRows: 4,
        assignedTo: [userIds[1], userIds[2]],
        rows: [
          {
            id: new ObjectId(),
            name: 'Arjun Prakash',
            phone: '+91-9988770011',
            location: 'Bangalore',
            callStatus: 'INTERESTED',
            interestLevel: 'HOT',
            remarks: 'AI/ML aspirant, excellent profile, ready to apply',
            nextFollowUp: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            isPotential: true,
            isConverted: false,
            lastEditedBy: userIds[1],
            updatedAt: new Date()
          },
          {
            id: new ObjectId(),
            name: 'Lakshmi Iyer',
            phone: '+91-8877660022',
            location: 'Bangalore',
            callStatus: 'CALLED',
            interestLevel: 'WARM',
            remarks: 'Needs parents approval, follow up next week',
            nextFollowUp: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            isPotential: true,
            isConverted: false,
            updatedAt: new Date()
          },
          {
            id: new ObjectId(),
            name: 'Vivek Nair',
            phone: '+91-7766550033',
            location: 'Bangalore',
            callStatus: 'BUSY',
            remarks: 'In class, will call back in evening',
            isPotential: false,
            isConverted: false,
            updatedAt: new Date()
          },
          {
            id: new ObjectId(),
            name: 'Kavitha Rao',
            phone: '+91-6655440044',
            location: 'Bangalore',
            callStatus: 'INTERESTED',
            interestLevel: 'HOT',
            remarks: 'Ready for Australia, strong interest in Sydney universities',
            nextFollowUp: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            isPotential: true,
            isConverted: false,
            updatedAt: new Date()
          },
          {
            id: new ObjectId(),
            name: 'Suresh Reddy',
            phone: '+91-5544330055',
            location: 'Bangalore',
            callStatus: 'NOT_CALLED',
            isPotential: false,
            isConverted: false,
            updatedAt: new Date()
          },
          {
            id: new ObjectId(),
            name: 'Divya Menon',
            phone: '+91-4433220066',
            location: 'Bangalore',
            callStatus: 'NOT_CALLED',
            isPotential: false,
            isConverted: false,
            updatedAt: new Date()
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Referral Program - Q1 2026',
        status: 'DRAFT',
        totalRows: 4,
        completedRows: 0,
        assignedTo: [userIds[3]],
        rows: [
          {
            id: new ObjectId(),
            name: 'Tanvi Saxena',
            phone: '+91-9900112233',
            location: 'Noida',
            callStatus: 'NOT_CALLED',
            isPotential: false,
            isConverted: false,
            updatedAt: new Date()
          },
          {
            id: new ObjectId(),
            name: 'Karan Malhotra',
            phone: '+91-8800223344',
            location: 'Gurgaon',
            callStatus: 'NOT_CALLED',
            isPotential: false,
            isConverted: false,
            updatedAt: new Date()
          },
          {
            id: new ObjectId(),
            name: 'Aditi Verma',
            phone: '+91-7700334455',
            location: 'Delhi',
            callStatus: 'NOT_CALLED',
            isPotential: false,
            isConverted: false,
            updatedAt: new Date()
          },
          {
            id: new ObjectId(),
            name: 'Rohit Sharma',
            phone: '+91-6600445566',
            location: 'Faridabad',
            callStatus: 'NOT_CALLED',
            isPotential: false,
            isConverted: false,
            updatedAt: new Date()
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    await db.collection('callSheets').insertMany(callSheets);
    console.log(`✓ Created ${callSheets.length} call sheets`);

    console.log('\n✅ Database seeding complete!');
    console.log(`
📊 Summary:
  - Projects: ${projects.length}
  - Campaigns: ${campaigns.length}
  - Leads: ${leads.length}
  - Tasks: ${tasks.length}
  - Field Marketing Leads: ${fieldLeads.length}
  - Assignments: ${assignments.length}
  - Call Sheets: ${callSheets.length}
    `);

    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedDatabase();
