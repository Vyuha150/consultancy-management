/**
 * MongoDB Connection Utility for Next.js
 * ======================================
 * Handles MongoDB connection with connection pooling
 */

import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri: string = process.env.MONGODB_URI;
const dbName: string = process.env.DB_NAME || 'edulead_crm';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  // If cached, return the cached connection
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Connect to MongoDB
  const client = await MongoClient.connect(uri);
  const db = client.db(dbName);

  // Cache the connection
  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export async function getDatabase(): Promise<Db> {
  const { db } = await connectToDatabase();
  return db;
}

// Helper to serialize MongoDB documents
export function serializeDoc(doc: any): any {
  if (doc === null || doc === undefined) {
    return null;
  }
  
  if (Array.isArray(doc)) {
    return doc.map(serializeDoc);
  }
  
  if (typeof doc === 'object') {
    const serialized: any = {};
    for (const [key, value] of Object.entries(doc)) {
      if (value !== null && typeof value === 'object' && '_bsontype' in value) {
        // Handle ObjectId and other BSON types
        serialized[key] = value.toString();
      } else if (value instanceof Date) {
        serialized[key] = value.toISOString();
      } else if (typeof value === 'object') {
        serialized[key] = serializeDoc(value);
      } else {
        serialized[key] = value;
      }
    }
    return serialized;
  }
  
  return doc;
}
