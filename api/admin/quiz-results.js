import { getDB } from '../_lib/db.js';
import { verifyAdmin } from '../_lib/adminAuth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const admin = verifyAdmin(req);
  if (!admin) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  try {
    const db = await getDB();
    const users = db.collection('users');
    const allUsers = await users.find({}, { projection: { password: 0, profilePhotoBase64: 0 } }).toArray();

    const results = [];
    allUsers.forEach(u => {
      const mp = u.moduleProgress || {};
      Object.entries(mp).forEach(([moduleId, data]) => {
        results.push({
          studentId: u._id.toString(),
          studentName: u.display_name || u.email,
          studentEmail: u.email,
          moduleId,
          score: data.score || 0,
          status: data.status || 'locked',
          passed: (data.score || 0) >= 75,
          attempts: data.attempts || 1,
        });
      });
    });

    res.json({ results });
  } catch (err) {
    console.error('Admin quiz results error:', err);
    res.status(500).json({ error: 'Failed to fetch quiz results' });
  }
}
