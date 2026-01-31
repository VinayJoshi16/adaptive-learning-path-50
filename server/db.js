import { MongoClient } from 'mongodb';

let client = null;
let db = null;

export async function connectDB() {
  if (db) return db;
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/palm';
  console.log('Connecting to MongoDB at', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
  client = new MongoClient(uri);
  await client.connect();
  db = client.db();
  console.log('Connected to MongoDB successfully');
  return db;
}

export function getDB() {
  return db;
}
