/**
 * Database Population Script
 * Adds dummy campaigns and updates user records with additional data
 * Run: node setup_dummy_data.js
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edulead_crm';

async function setupDummyData() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();

    // ===== Setup Campaigns =====
    const campaignsCollection = db.collection('campaigns');
    
    // Clear existing campaigns
    await campaignsCollection.deleteMany({});
    console.log('Cleared existing campaigns');

    // Create dummy campaigns
    const campaigns = [
      {
        name: 'LinkedIn Recruitment Drive 2026',
        platform: 'LINKEDIN',
        status: 'ACTIVE',
        leads: 245,
        conversions: 18,
        budget: 5000,
        spent: 3200,
        roi: 28,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-03-31'),
        description: 'Targeting professionals interested in online education',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Instagram Awareness Campaign',
        platform: 'INSTAGRAM',
        status: 'ACTIVE',
        leads: 512,
        conversions: 32,
        budget: 3000,
        spent: 2800,
        roi: 45,
        startDate: new Date('2026-01-10'),
        endDate: new Date('2026-04-10'),
        description: 'Student testimonials and course highlights',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Facebook Lead Generation',
        platform: 'FACEBOOK',
        status: 'ACTIVE',
        leads: 678,
        conversions: 52,
        budget: 4500,
        spent: 4200,
        roi: 35,
        startDate: new Date('2025-12-15'),
        endDate: new Date('2026-02-15'),
        description: 'Conversion-focused ads targeting parents',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'WhatsApp Automated Messages',
        platform: 'WHATSAPP',
        status: 'ACTIVE',
        leads: 892,
        conversions: 156,
        budget: 800,
        spent: 320,
        roi: 189,
        startDate: new Date('2025-11-01'),
        endDate: new Date('2026-12-31'),
        description: 'Automated nurture sequences for leads',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Google Ads Search Campaign',
        platform: 'GOOGLE',
        status: 'PAUSED',
        leads: 421,
        conversions: 34,
        budget: 6000,
        spent: 5800,
        roi: 18,
        startDate: new Date('2025-10-01'),
        endDate: new Date('2026-01-31'),
        description: 'Keyword-based search ads for premium programs',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Email Newsletter Campaign',
        platform: 'EMAIL',
        status: 'ACTIVE',
        leads: 1250,
        conversions: 95,
        budget: 200,
        spent: 180,
        roi: 267,
        startDate: new Date('2025-12-01'),
        endDate: new Date('2026-12-31'),
        description: 'Weekly educational updates and offers',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const campaignResult = await campaignsCollection.insertMany(campaigns);
    console.log(`Successfully created ${campaignResult.insertedCount} campaigns`);

    // ===== Update Users with additional data =====
    const usersCollection = db.collection('users');
    
    // Update admin user
    await usersCollection.updateOne(
      { email: 'admin@edulead.com' },
      {
        $set: {
          phone: '+91-9876543210',
          department: 'Administration',
          leadsHandled: 1250,
          conversions: 185,
          successRate: 14.8,
          lastLogin: new Date(),
          updatedAt: new Date()
        }
      }
    );

    // Update regular user
    await usersCollection.updateOne(
      { email: 'user@edulead.com' },
      {
        $set: {
          phone: '+91-9123456789',
          department: 'Counseling',
          leadsHandled: 450,
          conversions: 67,
          successRate: 14.9,
          lastLogin: new Date(),
          updatedAt: new Date()
        }
      }
    );

    console.log('Updated user profiles with additional data');

    console.log('\n=== Dummy Data Setup Complete ===');
    console.log('✓ 6 campaigns created');
    console.log('✓ User profiles updated with metrics');
    console.log('================================\n');

  } catch (error) {
    console.error('Error setting up dummy data:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

setupDummyData();
