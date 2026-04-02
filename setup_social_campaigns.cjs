#!/usr/bin/env node

/**
 * Setup Script for Call Sheets & Campaigns
 * Populates MongoDB with sample data for testing
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/';
const DB_NAME = process.env.DB_NAME || 'edulead_crm';

const sampleCampaigns = [
  {
    name: 'Spring 2025 UK Campaign',
    platform: 'INSTAGRAM',
    status: 'ACTIVE',
    budget: 5000,
    spent: 1200,
    leadsCount: 45,
    qualifiedCount: 28,
    convertedCount: 12,
    roi: 15.6,
    notes: 'Instagram ads targeting Indian students interested in UK universities',
    createdAt: new Date('2025-01-15')
  },
  {
    name: 'LinkedIn Professional Network',
    platform: 'LINKEDIN',
    status: 'ACTIVE',
    budget: 3500,
    spent: 800,
    leadsCount: 32,
    qualifiedCount: 24,
    convertedCount: 8,
    roi: 12.3,
    notes: 'LinkedIn campaigns for MBA and professional masters programs',
    createdAt: new Date('2025-01-18')
  },
  {
    name: 'WhatsApp Business Campaign',
    platform: 'WHATSAPP',
    status: 'ACTIVE',
    budget: 2000,
    spent: 450,
    leadsCount: 68,
    qualifiedCount: 35,
    convertedCount: 18,
    roi: 22.5,
    notes: 'WhatsApp broadcasts and group announcements for new intakes',
    createdAt: new Date('2025-01-20')
  },
  {
    name: 'Facebook Community Engagement',
    platform: 'FACEBOOK',
    status: 'PAUSED',
    budget: 4000,
    spent: 3200,
    leadsCount: 89,
    qualifiedCount: 42,
    convertedCount: 15,
    roi: 8.2,
    notes: 'Facebook page ads and community building',
    createdAt: new Date('2025-01-10')
  },
  {
    name: 'Google Ads - Search Campaign',
    platform: 'GOOGLE',
    status: 'ACTIVE',
    budget: 6000,
    spent: 4500,
    leadsCount: 125,
    qualifiedCount: 78,
    convertedCount: 32,
    roi: 18.9,
    notes: 'Google search ads for education-related keywords',
    createdAt: new Date('2025-01-12')
  },
  {
    name: 'YouTube Educational Content',
    platform: 'YOUTUBE',
    status: 'ACTIVE',
    budget: 3000,
    spent: 1500,
    leadsCount: 52,
    qualifiedCount: 31,
    convertedCount: 11,
    roi: 14.2,
    notes: 'YouTube channel ads and sponsored educational videos',
    createdAt: new Date('2025-01-22')
  }
];

const sampleCallSheets = [
  {
    name: 'Q1 2025 - Delhi Region Leads',
    status: 'ACTIVE',
    totalRows: 25,
    completedRows: 12,
    assignedTo: [],
    rows: [
      {
        name: 'Arjun Kumar',
        phone: '+91 8765432109',
        location: 'Delhi',
        callStatus: 'CALLED',
        interestLevel: 'WARM',
        remarks: 'Interested in US programs, follow-up after 2 weeks',
        isPotential: true,
        isConverted: false,
        updatedAt: new Date('2025-01-22')
      },
      {
        name: 'Priya Singh',
        phone: '+91 9876543210',
        location: 'Delhi',
        callStatus: 'CALLED',
        interestLevel: 'HOT',
        remarks: 'Very interested, scheduling counseling',
        isPotential: true,
        isConverted: true,
        updatedAt: new Date('2025-01-23')
      },
      {
        name: 'Vikram Sharma',
        phone: '+91 7654321098',
        location: 'Mumbai',
        callStatus: 'CALLED',
        interestLevel: 'HOT',
        remarks: 'Ready to apply, need documents list',
        isPotential: true,
        isConverted: true,
        updatedAt: new Date('2025-01-23')
      },
      {
        name: 'Neha Patel',
        phone: '+91 9123456789',
        location: 'Bangalore',
        callStatus: 'NOT_CALLED',
        interestLevel: 'COLD',
        remarks: 'General inquiry, needs follow-up',
        isPotential: false,
        isConverted: false,
        updatedAt: new Date('2025-01-15')
      },
      {
        name: 'Rohan Desai',
        phone: '+91 9234567890',
        location: 'Ahmedabad',
        callStatus: 'CALLED',
        interestLevel: 'HOT',
        remarks: 'Engineering student, wants UK placement programs',
        isPotential: true,
        isConverted: false,
        updatedAt: new Date('2025-01-22')
      }
    ],
    createdAt: new Date('2025-01-10')
  },
  {
    name: 'Q1 2025 - South India Leads',
    status: 'ACTIVE',
    totalRows: 20,
    completedRows: 8,
    assignedTo: [],
    rows: [
      {
        name: 'Kavya Nair',
        phone: '+91 8123456789',
        location: 'Kochi',
        callStatus: 'CALLED',
        interestLevel: 'COLD',
        remarks: 'MBA aspirant, follow-up next month',
        isPotential: true,
        isConverted: false,
        updatedAt: new Date('2025-01-20')
      },
      {
        name: 'Divya Reddy',
        phone: '+91 7890123456',
        location: 'Visakhapatnam',
        callStatus: 'CALLED',
        interestLevel: 'HOT',
        remarks: 'Very interested, scheduled counseling for Jan 28',
        isPotential: true,
        isConverted: true,
        updatedAt: new Date('2025-01-23')
      },
      {
        name: 'Anjali Verma',
        phone: '+91 8901234567',
        location: 'Pune',
        callStatus: 'CALLED',
        interestLevel: 'WARM',
        remarks: 'Interested in scholarship info',
        isPotential: true,
        isConverted: false,
        updatedAt: new Date('2025-01-21')
      }
    ],
    createdAt: new Date('2025-01-12')
  },
  {
    name: 'Q1 2025 - North India Leads',
    status: 'ACTIVE',
    totalRows: 30,
    completedRows: 15,
    assignedTo: [],
    rows: [
      {
        name: 'Sanjay Singh',
        phone: '+91 8234567012',
        location: 'Jaipur',
        callStatus: 'CALLED',
        interestLevel: 'WARM',
        remarks: 'Needs guidance on college selection',
        isPotential: true,
        isConverted: false,
        updatedAt: new Date('2025-01-22')
      },
      {
        name: 'Aditya Gupta',
        phone: '+91 9345678901',
        location: 'Hyderabad',
        callStatus: 'CALLED',
        interestLevel: 'WARM',
        remarks: 'Interested in fall intake programs',
        isPotential: true,
        isConverted: false,
        updatedAt: new Date('2025-01-21')
      }
    ],
    createdAt: new Date('2025-01-14')
  }
];

async function setupData() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);

    console.log('✓ Connected to MongoDB');

    // Insert campaigns
    console.log('\nInserting campaigns...');
    const campaignsResult = await db.collection('campaigns').insertMany(sampleCampaigns);
    console.log(`✓ Inserted ${campaignsResult.insertedCount} campaigns`);

    // Insert call sheets
    console.log('\nInserting call sheets...');
    const sheetsResult = await db.collection('callSheets').insertMany(sampleCallSheets);
    console.log(`✓ Inserted ${sheetsResult.insertedCount} call sheets`);

    // Verify data
    const campaignCount = await db.collection('campaigns').countDocuments();
    const sheetsCount = await db.collection('callSheets').countDocuments();

    console.log('\n✓ Setup Complete!');
    console.log(`  - Total campaigns in DB: ${campaignCount}`);
    console.log(`  - Total call sheets in DB: ${sheetsCount}`);

    // Show sample data
    console.log('\nSample campaign:');
    const campaign = await db.collection('campaigns').findOne();
    console.log(`  Name: ${campaign.name}`);
    console.log(`  Platform: ${campaign.platform}`);
    console.log(`  Status: ${campaign.status}`);
    console.log(`  Leads: ${campaign.leadsCount}`);

    console.log('\nSample call sheet:');
    const sheet = await db.collection('callSheets').findOne();
    console.log(`  Name: ${sheet.name}`);
    console.log(`  Rows: ${sheet.totalRows}`);
    console.log(`  Status: ${sheet.status}`);

  } catch (error) {
    console.error('✗ Error:', error.message);
  } finally {
    await client.close();
  }
}

setupData();
