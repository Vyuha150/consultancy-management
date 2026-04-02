#!/usr/bin/env node

/**
 * Verification Script - Check campaigns and call sheets setup
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/';
const DB_NAME = process.env.DB_NAME || 'edulead_crm';

async function verify() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);

    console.log('🔍 Verifying Social Media & Call Sheets Setup...\n');

    // Check campaigns
    const campaigns = await db.collection('campaigns').find({}).toArray();
    console.log(`✓ Campaigns in Database: ${campaigns.length}`);
    if (campaigns.length > 0) {
      console.log('  Sample campaigns:');
      campaigns.slice(0, 3).forEach(c => {
        console.log(`    - ${c.name} (${c.platform}) - Status: ${c.status}`);
      });
    }

    // Check call sheets
    const sheets = await db.collection('callSheets').find({}).toArray();
    console.log(`\n✓ Call Sheets in Database: ${sheets.length}`);
    if (sheets.length > 0) {
      console.log('  Sample call sheets:');
      sheets.slice(0, 3).forEach(s => {
        console.log(`    - ${s.name} (${s.totalRows} rows) - Status: ${s.status}`);
      });
    }

    // Check social media activities
    const activities = await db.collection('socialMediaActivities').countDocuments();
    console.log(`\n✓ Social Media Activities: ${activities}`);

    // Campaign statistics
    const activeCount = campaigns.filter(c => c.status === 'ACTIVE').length;
    const totalLeads = campaigns.reduce((sum, c) => sum + (c.leadsCount || 0), 0);
    const totalConversions = campaigns.reduce((sum, c) => sum + (c.convertedCount || 0), 0);

    console.log('\n📊 Campaign Statistics:');
    console.log(`  - Active campaigns: ${activeCount}`);
    console.log(`  - Total leads: ${totalLeads}`);
    console.log(`  - Total conversions: ${totalConversions}`);

    // Platform breakdown
    const platforms = {};
    campaigns.forEach(c => {
      platforms[c.platform] = (platforms[c.platform] || 0) + 1;
    });

    console.log('\n🌐 Platform Breakdown:');
    Object.entries(platforms).forEach(([platform, count]) => {
      console.log(`  - ${platform}: ${count} campaign(s)`);
    });

    console.log('\n✅ Verification Complete!');
    console.log('\n📝 API Endpoints Available:');
    console.log('  - GET/POST /api/campaigns');
    console.log('  - GET/POST /api/call-sheets');
    console.log('  - POST /api/uploads (file upload)');
    console.log('  - GET/POST /api/social-media');

    console.log('\n🎯 Test Instructions:');
    console.log('  1. Go to Social Media Hub (http://localhost:3000)');
    console.log('  2. Click "Campaigns" tab to see all campaigns');
    console.log('  3. Click "New Campaign" button to create a campaign');
    console.log('  4. Select platform (FACEBOOK, INSTAGRAM, LINKEDIN, WHATSAPP, etc.)');
    console.log('  5. Go to "Uploads" tab to upload call sheets');
    console.log('  6. Upload sample-leads.csv file to test');

  } catch (error) {
    console.error('✗ Verification Error:', error.message);
  } finally {
    await client.close();
  }
}

verify();
