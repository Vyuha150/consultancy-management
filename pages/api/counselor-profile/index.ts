/**
 * Counselor Profile Upload API
 * POST /api/counselor-profile - Upload counselor documents and verified details
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File as FormidableFile } from 'formidable';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { getDatabase } from '../../../lib/mongodb';

export const config = {
  api: {
    bodyParser: false,
  },
};

const ensureUploadDir = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const toSingleFile = (file: FormidableFile | FormidableFile[] | undefined) => {
  if (!file) return null;
  return Array.isArray(file) ? file[0] : file;
};

const toFileArray = (file: FormidableFile | FormidableFile[] | undefined) => {
  if (!file) return [] as FormidableFile[];
  return Array.isArray(file) ? file : [file];
};

const PROFILE_COLLECTIONS = ['counselorProfiles', 'counsellorProfiles', 'councellorProfiles'];
const DOC_COLLECTIONS = ['counselorDocuments', 'counsellorDocuments', 'councellorDocuments'];

const getPreferredCollection = async (db: any, names: string[]) => {
  for (const name of names) {
    const count = await db.collection(name).countDocuments();
    if (count > 0) return name;
  }
  return names[0];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const db = await getDatabase();
      const profileCollection = await getPreferredCollection(db, PROFILE_COLLECTIONS);
      const docCollection = await getPreferredCollection(db, DOC_COLLECTIONS);

      console.log('[COUNSELOR-API] Using collections:', { profileCollection, docCollection });

      const profiles = await db
        .collection(profileCollection)
        .find({})
        .sort({ updatedAt: -1 })
        .toArray();

      console.log('[COUNSELOR-API] Found profiles:', profiles.length);

      const profileIds = profiles.map((profile) => profile._id);
      const profileIdStrings = profiles.map((profile) => String(profile._id));
      
      console.log('[COUNSELOR-API] Searching for docs with profileIds:', profileIdStrings.slice(0, 2));

      const docs = await db
        .collection(docCollection)
        .find({ profileId: { $in: [...profileIds, ...profileIdStrings] } })
        .project({ data: 0 })
        .toArray();

      console.log('[COUNSELOR-API] Found documents:', docs.length, 'by profileId');

      // If no docs found by profileId, try alternative: fetch all docs and match manually
      let allDocs = docs;
      if (docs.length === 0) {
        console.log('[COUNSELOR-API] No docs found by profileId field, fetching all docs...');
        allDocs = await db
          .collection(docCollection)
          .find({})
          .project({ data: 0 })
          .limit(1)
          .toArray();
        console.log('[COUNSELOR-API] Total docs in collection:', allDocs.length);
        if (allDocs.length > 0) {
          console.log('[COUNSELOR-API] Sample doc structure:', JSON.stringify(allDocs[0], null, 2));
        }
      }

      const docsByProfile = allDocs.reduce<Record<string, any[]>>((acc, doc) => {
        // Try multiple ways to get the profile ID
        const profileId = doc.profileId || doc.parentId || doc.counselorProfileId;
        const key = String(profileId);
        if (!acc[key]) acc[key] = [];
        acc[key].push(doc);
        return acc;
      }, {});

      const finalDocs = await db
        .collection(docCollection)
        .find({})
        .project({ data: 0 })
        .toArray();

      console.log('[COUNSELOR-API] All docs in collection:', finalDocs.length);
      console.log('[COUNSELOR-API] Mapping by counselorId instead...');
      
      const docsByCounselorId = finalDocs.reduce<Record<string, any[]>>((acc, doc) => {
        const key = String(doc.counselorId);
        if (!acc[key]) acc[key] = [];
        acc[key].push(doc);
        return acc;
      }, {});

      console.log('[COUNSELOR-API] Docs by counselorId count:', Object.keys(docsByCounselorId).length);

      const payload = profiles.map((profile) => {
        const profileId = String(profile._id);
        const counselorId = profile.counselorId;
        // Try to match by profileId first, then by counselorId
        let profileDocs = docsByProfile[profileId] || [];
        if (profileDocs.length === 0) {
          console.log('[COUNSELOR-API] No profileId match for', profileId, ', trying counselorId:', counselorId);
          profileDocs = docsByCounselorId[counselorId] || [];
        }
        console.log('[COUNSELOR-API] Profile', profileId, 'has', profileDocs.length, 'documents');
        
        const lastUpload = profileDocs.reduce<Date | null>((latest, doc) => {
          const uploadedAt = doc.uploadedAt ? new Date(doc.uploadedAt) : null;
          if (!uploadedAt) return latest;
          if (!latest || uploadedAt > latest) return uploadedAt;
          return latest;
        }, null);

        return {
          id: profileId,
          counselorId: profile.counselorId,
          fullName: profile.fullName,
          mobile: profile.mobile,
          email: profile.email,
          aadhar: profile.aadhar,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
          totalDocs: profileDocs.length,
          lorCount: profileDocs.filter((doc) => doc.docType === 'LOR').length,
          lastUpload,
          docs: profileDocs.map((doc) => ({
            id: String(doc._id),
            docType: doc.docType,
            fileName: doc.fileName,
            mimeType: doc.mimeType,
            size: doc.size,
            uploadedAt: doc.uploadedAt,
          }))
        };
      });

      return res.status(200).json({ profiles: payload });
    }

    if (req.method === 'PATCH') {
      try {
        const { profileId, status, action, docId } = req.body;
        
        if (!profileId) {
          return res.status(400).json({ error: 'Missing profileId' });
        }

        const db = await getDatabase();
        const profileCollection = await getPreferredCollection(db, PROFILE_COLLECTIONS);
        const docCollection = await getPreferredCollection(db, DOC_COLLECTIONS);
        const { ObjectId } = await import('mongodb');

        if (action === 'updateStatus' && status) {
          // Update profile status
          await db.collection(profileCollection).updateOne(
            { _id: new ObjectId(profileId) },
            { $set: { status, updatedAt: new Date() } }
          );
          return res.status(200).json({ success: true, message: 'Status updated' });
        }

        if (action === 'deleteDoc' && docId) {
          // Delete a specific document
          await db.collection(docCollection).deleteOne({ _id: new ObjectId(docId) });
          return res.status(200).json({ success: true, message: 'Document deleted' });
        }

        return res.status(400).json({ error: 'Invalid action' });
      } catch (error) {
        console.error('Counselor PATCH error:', error);
        return res.status(500).json({ error: 'Failed to process request' });
      }
    }

    if (req.method === 'DELETE') {
      try {
        let profileId = req.query.profileId;
        if (Array.isArray(profileId)) {
          profileId = profileId[0];
        }
        
        if (!profileId) {
          return res.status(400).json({ error: 'Missing profileId' });
        }

        const db = await getDatabase();
        const profileCollection = await getPreferredCollection(db, PROFILE_COLLECTIONS);
        const docCollection = await getPreferredCollection(db, DOC_COLLECTIONS);
        const { ObjectId } = await import('mongodb');

        // Delete all documents for this profile
        await db.collection(docCollection).deleteMany({ 
          profileId: new ObjectId(profileId as string) 
        });

        // Delete the profile
        await db.collection(profileCollection).deleteOne({ 
          _id: new ObjectId(profileId as string) 
        });

        return res.status(200).json({ success: true, message: 'Profile and all documents deleted' });
      } catch (error) {
        console.error('Counselor DELETE error:', error);
        return res.status(500).json({ error: 'Failed to delete profile' });
      }
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const uploadDir = path.join(os.tmpdir(), 'counselor-uploads');
    ensureUploadDir(uploadDir);

    const form = new IncomingForm({
      uploadDir,
      keepExtensions: true,
      multiples: true,
    });

    return new Promise((resolve) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          return resolve(res.status(400).json({ error: 'Failed to parse upload' }));
        }

        const fullName = String(fields.fullName || '').trim();
        const mobile = String(fields.mobile || '').trim();
        const email = String(fields.email || '').trim();
        const aadhar = String(fields.aadhar || '').trim();
        const counselorId = String(fields.counselorId || '').trim();

        if (!fullName || !mobile || !email || !aadhar || !counselorId) {
          return resolve(res.status(400).json({ error: 'Missing required personal details' }));
        }

        const requiredFiles = [
          { key: 'marksheet', label: 'Marksheet', docType: 'MARKSHEET' },
          { key: 'certificate', label: 'Certificate', docType: 'CERTIFICATE' },
          { key: 'transcript', label: 'Transcript', docType: 'TRANSCRIPT' },
          { key: 'consolidated', label: 'Consolidated', docType: 'CONSOLIDATED' },
          { key: 'resume', label: 'Resume', docType: 'RESUME' },
          { key: 'sop', label: 'SOP', docType: 'SOP' },
          { key: 'passport', label: 'Passport', docType: 'PASSPORT' },
        ];

        const missing = requiredFiles.filter((file) => !toSingleFile(files[file.key] as any));
        const lorFiles = toFileArray(files.lorFiles as any);

        if (missing.length > 0 || lorFiles.length === 0) {
          return resolve(res.status(400).json({ error: 'Missing required documents or LOR files' }));
        }

        try {
          const db = await getDatabase();
          const profileCollection = await getPreferredCollection(db, PROFILE_COLLECTIONS);
          const docCollection = await getPreferredCollection(db, DOC_COLLECTIONS);

          const profileResult = await db.collection(profileCollection).findOneAndUpdate(
            { counselorId },
            {
              $set: {
                fullName,
                mobile,
                email,
                aadhar,
                updatedAt: new Date(),
              },
              $setOnInsert: {
                createdAt: new Date(),
              },
            },
            { upsert: true, returnDocument: 'after' }
          );

          const profileId = profileResult.value?._id;

          console.log('[COUNSELOR-API] Profile saved:', { counselorId, profileId: String(profileId), profileIdType: typeof profileId });

          const storeFile = async (file: FormidableFile, docType: string) => {
            const buffer = fs.readFileSync(file.filepath);
            const docData = {
              profileId,
              counselorId,
              docType,
              fileName: file.originalFilename || 'document',
              mimeType: file.mimetype || 'application/octet-stream',
              size: file.size,
              data: buffer,
              uploadedAt: new Date(),
            };
            console.log('[COUNSELOR-API] About to insert doc:', { docType, fileName: docData.fileName, profileId: String(profileId), hasProfileId: !!profileId });
            const insertResult = await db.collection(docCollection).insertOne(docData);
            console.log('[COUNSELOR-API] Doc inserted:', { insertedId: String(insertResult.insertedId), docType });
            fs.unlinkSync(file.filepath);
          };

          for (const file of requiredFiles) {
            const uploadFile = toSingleFile(files[file.key] as any);
            if (uploadFile) {
              await storeFile(uploadFile, file.docType);
            }
          }

          for (const lorFile of lorFiles) {
            await storeFile(lorFile, 'LOR');
          }

          return resolve(res.status(200).json({ success: true, profileId: String(profileId) }));
        } catch (storeError) {
          console.error('Counselor upload error:', storeError);
          return resolve(res.status(500).json({ error: 'Failed to store documents' }));
        }
      });
    });
  } catch (error) {
    console.error('Counselor profile API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
