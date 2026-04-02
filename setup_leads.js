/**
 * Leads Setup Script
 * Populates database with realistic dummy leads
 * Run: node setup_leads.js
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edulead_crm';

async function setupLeads() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const leadsCollection = db.collection('leads');

    // Clear existing leads
    await leadsCollection.deleteMany({});
    console.log('Cleared existing leads');

    // Create dummy leads with realistic data
    const leads = [
      {
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@email.com',
        phone: '+91-9876543210',
        source: 'WHATSAPP_AI',
        pipeline: 'CONTACTED',
        qualificationScore: 85,
        interestedCountries: ['USA', 'Canada'],
        interestedPrograms: ['MS Computer Science', 'MBA'],
        status: 'ACTIVE',
        createdAt: new Date('2026-01-15'),
        updatedAt: new Date('2026-01-24'),
        notes: 'Strong candidate, high engagement',
        followUpDate: new Date('2026-01-26'),
        assignedTo: null
      },
      {
        name: 'Priya Singh',
        email: 'priya.singh@email.com',
        phone: '+91-9123456789',
        source: 'SOCIAL_MEDIA',
        pipeline: 'QUALIFIED',
        qualificationScore: 92,
        interestedCountries: ['UK', 'USA'],
        interestedPrograms: ['MS Engineering', 'PhD Research'],
        status: 'ACTIVE',
        createdAt: new Date('2026-01-10'),
        updatedAt: new Date('2026-01-24'),
        notes: 'Excellent fit for premium programs',
        followUpDate: new Date('2026-01-25'),
        assignedTo: null
      },
      {
        name: 'Amit Patel',
        email: 'amit.patel@email.com',
        phone: '+91-9988776655',
        source: 'TELECALLER_SHEET',
        pipeline: 'NEW',
        qualificationScore: 65,
        interestedCountries: ['Australia'],
        interestedPrograms: ['Bachelor of Commerce'],
        status: 'ACTIVE',
        createdAt: new Date('2026-01-22'),
        updatedAt: new Date('2026-01-24'),
        notes: 'First contact made',
        followUpDate: new Date('2026-01-28'),
        assignedTo: null
      },
      {
        name: 'Neha Sharma',
        email: 'neha.sharma@email.com',
        phone: '+91-8765432109',
        source: 'FACEBOOK',
        pipeline: 'COUNSELING',
        qualificationScore: 78,
        interestedCountries: ['USA'],
        interestedPrograms: ['MS Business Analytics'],
        status: 'ACTIVE',
        createdAt: new Date('2026-01-08'),
        updatedAt: new Date('2026-01-24'),
        notes: 'In counseling phase, waiting for decision',
        followUpDate: new Date('2026-01-27'),
        assignedTo: null
      },
      {
        name: 'Vikram Reddy',
        email: 'vikram.reddy@email.com',
        phone: '+91-7654321098',
        source: 'REFERRAL',
        pipeline: 'APPLIED',
        qualificationScore: 88,
        interestedCountries: ['Canada', 'USA'],
        interestedPrograms: ['MS Software Engineering'],
        status: 'ACTIVE',
        createdAt: new Date('2026-01-05'),
        updatedAt: new Date('2026-01-24'),
        notes: 'Application submitted, awaiting admission',
        followUpDate: new Date('2026-02-05'),
        assignedTo: null
      },
      {
        name: 'Isha Gupta',
        email: 'isha.gupta@email.com',
        phone: '+91-6543210987',
        source: 'WHATSAPP_AI',
        pipeline: 'CONVERTED',
        qualificationScore: 95,
        interestedCountries: ['UK'],
        interestedPrograms: ['MBA Finance'],
        status: 'ACTIVE',
        createdAt: new Date('2025-11-20'),
        updatedAt: new Date('2026-01-24'),
        notes: 'Accepted admission offer',
        followUpDate: null,
        assignedTo: null
      },
      {
        name: 'Rohan Verma',
        email: 'rohan.verma@email.com',
        phone: '+91-5432109876',
        source: 'INSTAGRAM',
        pipeline: 'CONTACTED',
        qualificationScore: 72,
        interestedCountries: ['Germany'],
        interestedPrograms: ['MS Engineering'],
        status: 'ACTIVE',
        createdAt: new Date('2026-01-18'),
        updatedAt: new Date('2026-01-24'),
        notes: 'Interested but needs more info',
        followUpDate: new Date('2026-01-29'),
        assignedTo: null
      },
      {
        name: 'Anjali Desai',
        email: 'anjali.desai@email.com',
        phone: '+91-4321098765',
        source: 'GOOGLE_ADS',
        pipeline: 'QUALIFIED',
        qualificationScore: 81,
        interestedCountries: ['USA', 'Australia'],
        interestedPrograms: ['MS Data Science'],
        status: 'ACTIVE',
        createdAt: new Date('2026-01-12'),
        updatedAt: new Date('2026-01-24'),
        notes: 'Met all eligibility criteria',
        followUpDate: new Date('2026-01-26'),
        assignedTo: null
      },
      {
        name: 'Sameer Khan',
        email: 'sameer.khan@email.com',
        phone: '+91-3210987654',
        source: 'TELECALLER_SHEET',
        pipeline: 'NEW',
        qualificationScore: 58,
        interestedCountries: ['Canada'],
        interestedPrograms: ['Graduate Diploma'],
        status: 'ACTIVE',
        createdAt: new Date('2026-01-23'),
        updatedAt: new Date('2026-01-24'),
        notes: 'Cold lead from outreach',
        followUpDate: new Date('2026-01-30'),
        assignedTo: null
      },
      {
        name: 'Divya Nair',
        email: 'divya.nair@email.com',
        phone: '+91-2109876543',
        source: 'SOCIAL_MEDIA',
        pipeline: 'OFFER',
        qualificationScore: 90,
        interestedCountries: ['UK', 'USA'],
        interestedPrograms: ['MBA International Business'],
        status: 'ACTIVE',
        createdAt: new Date('2025-12-15'),
        updatedAt: new Date('2026-01-24'),
        notes: 'Offer sent, awaiting response',
        followUpDate: new Date('2026-01-28'),
        assignedTo: null
      }
    ];

    const result = await leadsCollection.insertMany(leads);
    console.log(`\n✓ Successfully created ${result.insertedCount} leads\n`);

    // Create assignments collection if needed
    const assignmentsCollection = db.collection('assignments');
    console.log('Assignments collection ready for use');

    console.log('\n=== Leads Setup Complete ===');
    console.log(`Created ${result.insertedCount} leads with:`);
    console.log('  - Names and contact info');
    console.log('  - Source attribution (WhatsApp, Social, Telecaller, etc.)');
    console.log('  - Pipeline stages (New, Contacted, Qualified, etc.)');
    console.log('  - Qualification scores (58-95)');
    console.log('  - Interested countries and programs');
    console.log('  - Follow-up dates');
    console.log('  - Assignment slots (ready for team assignment)');
    console.log('============================\n');

  } catch (error) {
    console.error('Error setting up leads:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

setupLeads();
