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
    const allUsers = await users.find(
      { 'proctoringViolations.0': { $exists: true } },
      { projection: { password: 0, profilePhotoBase64: 0 } }
    ).toArray();

    const logs = [];
    allUsers.forEach(u => {
      (u.proctoringViolations || []).forEach(v => {
        logs.push({
          studentId: u._id.toString(),
          studentName: u.display_name || u.email,
          studentEmail: u.email,
          moduleId: v.moduleId || 'unknown',
          violationCount: v.count || 0,
          date: v.date || null,
        });
      });
    });

    logs.sort((a, b) => (b.date ? new Date(b.date) : 0) - (a.date ? new Date(a.date) : 0));

    res.json({ logs });
  } catch (err) {
    console.error('Admin proctoring logs error:', err);
    res.status(500).json({ error: 'Failed to fetch proctoring logs' });
  }
}
