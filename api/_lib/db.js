import { MongoClient } from 'mongodb';

let cached = global.__mongo;
if (!cached) cached = global.__mongo = { client: null, promise: null };

export async function getDB() {
  if (cached.client) return cached.client.db();
  if (!cached.promise) {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/palm';
    cached.promise = MongoClient.connect(uri);
  }
  cached.client = await cached.promise;
  return cached.client.db();
}
