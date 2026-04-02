/**
 * Social Media Activities API
 * GET /api/social-media - Get social media activities with optional filters
 * POST /api/social-media - Create new social media activity/upload
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase, serializeDoc } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const db = await getDatabase();

    if (req.method === 'GET') {
      const { platform, status, campaignId } = req.query;

      const query: Record<string, any> = {};
      if (platform) query.platform = platform;
      if (status) query.status = status;
      if (campaignId) query.campaignId = campaignId;

      const activities = await db
        .collection('socialMediaActivities')
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();

      return res.status(200).json(serializeDoc(activities));
    }

    if (req.method === 'POST') {
      const { campaignId, platform, activityType, description, status, engagementMetrics, fileUrl } = req.body;

      // Validation
      if (!campaignId || !platform) {
        return res.status(400).json({ error: 'Campaign ID and platform are required' });
      }

      // Verify campaign exists
      const campaign = await db
        .collection('campaigns')
        .findOne({ _id: new ObjectId(campaignId) });

      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }

      const newActivity = {
        campaignId: new ObjectId(campaignId),
        platform,
        activityType: activityType || 'UPLOAD', // UPLOAD, ENGAGEMENT, COMMENT, SHARE, etc.
        description: description || '',
        status: status || 'ACTIVE',
        engagementMetrics: engagementMetrics || {
          likes: 0,
          comments: 0,
          shares: 0,
          impressions: 0,
          clicks: 0,
          conversions: 0
        },
        fileUrl: fileUrl || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.collection('socialMediaActivities').insertOne(newActivity);

      return res.status(201).json({
        success: true,
        _id: result.insertedId.toString(),
        id: result.insertedId.toString(),
        ...newActivity,
        campaignId: campaignId
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Social media API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
