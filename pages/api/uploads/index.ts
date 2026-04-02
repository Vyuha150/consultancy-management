/**
 * File Upload API
 * POST /api/uploads - Handle file uploads (CSV/XLS/XLSX)
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import os from 'os';
import path from 'path';
import * as XLSX from 'xlsx';
import { parse } from 'csv-parse/sync';
import { getDatabase } from '../../../lib/mongodb';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface ParsedRow {
  name?: string;
  phone?: string;
  location?: string;
  interestLevel?: string;
  remarks?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const uploadDir = path.join(os.tmpdir(), 'uploads');
    const form = new IncomingForm({
      uploadDir,
      keepExtensions: true,
    });

    // Create upload directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          return resolve(res.status(400).json({ error: 'Failed to parse file' }));
        }

        const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

        if (!uploadedFile) {
          return resolve(res.status(400).json({ error: 'No file provided' }));
        }

        try {
          const ext = path.extname(uploadedFile.originalFilename || '').toLowerCase();

          let rows: ParsedRow[] = [];

          if (ext === '.csv') {
            // Parse CSV
            const fileContent = fs.readFileSync(uploadedFile.filepath, 'utf-8');
            const records = parse(fileContent, {
              columns: true,
              skip_empty_lines: true,
            }) as ParsedRow[];
            rows = records;
          } else if (['.xlsx', '.xls'].includes(ext)) {
            // Parse Excel
            const fileBuffer = fs.readFileSync(uploadedFile.filepath);
            const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            rows = XLSX.utils.sheet_to_json(worksheet) as ParsedRow[];
          } else {
            return resolve(res.status(400).json({ error: 'Unsupported file format' }));
          }

          // Clean and format rows
          const formattedRows = rows.map((row) => ({
            name: row.name?.toString().trim() || '',
            phone: row.phone?.toString().trim() || '',
            location: row.location?.toString().trim() || '',
            interestLevel: row.interestLevel?.toString().toUpperCase() || 'COLD',
            remarks: row.remarks?.toString().trim() || '',
            callStatus: 'NOT_CALLED',
            isPotential: false,
            isConverted: false,
          }));

          const db = await getDatabase();
          const uploadResult = await db.collection('uploadSessions').insertOne({
            fileName: uploadedFile.originalFilename,
            rowCount: formattedRows.length,
            rows: formattedRows,
            createdAt: new Date()
          });

          // Clean up uploaded file
          fs.unlinkSync(uploadedFile.filepath);

          return resolve(
            res.status(200).json({
              success: true,
              fileName: uploadedFile.originalFilename,
              rowCount: formattedRows.length,
              rows: formattedRows,
              uploadId: uploadResult.insertedId.toString(),
            })
          );
        } catch (parseError) {
          console.error('File parsing error:', parseError);
          return resolve(res.status(400).json({ error: 'Failed to parse file content' }));
        }
      });
    });
  } catch (error) {
    console.error('Upload API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
