/**
 * Counselor Document Download API
 * GET /api/counselor-profile/doc/:id - Download a counselor document
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { getDatabase } from '../../../../lib/mongodb';

const safeFileName = (name: string) => name.replace(/["\\]/g, '_');

const DOC_COLLECTIONS = ['counselorDocuments', 'counsellorDocuments', 'councellorDocuments'];

const getPreferredCollection = async (db: any, names: string[]) => {
  for (const name of names) {
    const count = await db.collection(name).countDocuments();
    if (count > 0) return name;
  }
  return names[0];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (!id || Array.isArray(id)) {
      return res.status(400).json({ error: 'Invalid document id' });
    }

    const db = await getDatabase();
    const docCollection = await getPreferredCollection(db, DOC_COLLECTIONS);
    
    console.log('[COUNSELOR-DOC] Downloading from collection:', docCollection);

    const doc = await db.collection(docCollection).findOne({ _id: new ObjectId(id) });

    if (!doc) {
      console.log('[COUNSELOR-DOC] Document not found:', id);
      return res.status(404).json({ error: 'Document not found' });
    }

    console.log('[COUNSELOR-DOC] Found document:', { id, fileName: doc.fileName, size: doc.size });

    const fileName = safeFileName(doc.fileName || 'document');
    const mimeType = doc.mimeType || 'application/octet-stream';
    let fileBuffer: Buffer;

    if (Buffer.isBuffer(doc.data)) {
      fileBuffer = doc.data;
    } else if (doc.data && doc.data.buffer) {
      fileBuffer = Buffer.from(doc.data.buffer);
    } else {
      fileBuffer = Buffer.from([]);
    }

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.status(200).send(fileBuffer);
  } catch (error) {
    console.error('Document download error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
