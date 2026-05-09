import { getDB } from '../_lib/db.js';
import { verifyAdmin } from '../_lib/adminAuth.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const admin = verifyAdmin(req);
  if (!admin) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  try {
    const db = await getDB();
    const users = db.collection('users');

    if (req.method === 'GET') {
      const docs = await users.find({}, { projection: { password: 0 } }).sort({ created_at: -1 }).toArray();
      const students = docs.map(u => ({
        id: u._id.toString(),
        email: u.email,
        displayName: u.display_name || 'Unknown',
        profilePhoto: u.profilePhotoBase64 ? true : false,
        engagementScore: u.engagementScore || 100,
        moduleProgress: u.moduleProgress || {},
        codingPerformance: u.codingPerformance || {},
        proctoringViolations: u.proctoringViolations || [],
        createdAt: u.created_at,
      }));
      return res.json({ students });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Admin students error:', err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
}
