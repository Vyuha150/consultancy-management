/**
 * Call Sheet Row Update API
 * PATCH /api/call-sheets/update-row - Update a specific row in a call sheet
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await getDatabase();
    const { sheetId, rowId, updates } = req.body;

    if (!sheetId || !rowId) {
      return res.status(400).json({ error: 'Sheet ID and Row ID are required' });
    }

    // Build the update object for the specific row
    const updateFields: any = {
      updatedAt: new Date()
    };

    if (updates.callStatus !== undefined) updateFields['rows.$.callStatus'] = updates.callStatus;
    if (updates.interestLevel !== undefined) updateFields['rows.$.interestLevel'] = updates.interestLevel;
    if (updates.remarks !== undefined) updateFields['rows.$.remarks'] = updates.remarks;
    if (updates.nextFollowUp !== undefined) updateFields['rows.$.nextFollowUp'] = updates.nextFollowUp;
    if (updates.isPotential !== undefined) updateFields['rows.$.isPotential'] = updates.isPotential;

    // Update the specific row in the rows array
    const result = await db.collection('callSheets').updateOne(
      { 
        _id: new ObjectId(sheetId),
        'rows.id': new ObjectId(rowId)
      },
      { 
        $set: updateFields
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Sheet or row not found' });
    }

    // Update completedRows count if call status changed
    if (updates.callStatus && updates.callStatus !== 'NOT_CALLED') {
      await db.collection('callSheets').updateOne(
        { _id: new ObjectId(sheetId) },
        { $inc: { completedRows: 1 } }
      );
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Update row API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
