/**
 * Call Sheets API
 * GET /api/call-sheets - Get all call sheets with optional filters
 * POST /api/call-sheets - Create new call sheet from uploaded file
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
      const { assignedTo, status } = req.query;

      const query: Record<string, any> = {};
      if (assignedTo) query.assignedTo = assignedTo;
      if (status) query.status = status;

      const sheets = await db
        .collection('callSheets')
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();

      return res.status(200).json(serializeDoc(sheets));
    }

    if (req.method === 'POST') {
      const { name, status, rows, assignedTo, uploadId } = req.body;
      let resolvedRows = rows;

      if ((!resolvedRows || !Array.isArray(resolvedRows)) && uploadId) {
        const uploadDoc = await db.collection('uploadSessions').findOne({
          _id: new ObjectId(uploadId)
        });
        if (uploadDoc && Array.isArray(uploadDoc.rows)) {
          resolvedRows = uploadDoc.rows;
          await db.collection('uploadSessions').deleteOne({ _id: uploadDoc._id });
        }
      }

      // Validation
      if (!name || !Array.isArray(resolvedRows)) {
        return res.status(400).json({ error: 'Name and rows are required' });
      }

      const newSheet = {
        name,
        status: status || 'ACTIVE',
        totalRows: resolvedRows.length,
        completedRows: 0,
        assignedTo: assignedTo || [],
        rows: resolvedRows.map((row: any) => ({
          id: new ObjectId(),
          name: row.name || '',
          phone: row.phone || '',
          location: row.location || '',
          callStatus: row.callStatus || 'NOT_CALLED',
          interestLevel: row.interestLevel || 'COLD',
          remarks: row.remarks || '',
          nextFollowUp: row.nextFollowUp || null,
          isPotential: row.isPotential || false,
          isConverted: row.isConverted || false,
          lastEditedBy: row.lastEditedBy || null,
          updatedAt: new Date()
        })),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.collection('callSheets').insertOne(newSheet);

      return res.status(201).json({
        success: true,
        _id: result.insertedId.toString(),
        id: result.insertedId.toString(),
        ...newSheet
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Call sheets API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
