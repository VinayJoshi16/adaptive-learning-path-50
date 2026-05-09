import { ObjectId } from 'mongodb';
import { getDB } from '../../_lib/db.js';
import { verifyAdmin } from '../../_lib/adminAuth.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  const admin = verifyAdmin(req);
  if (!admin) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  try {
    const db = await getDB();
    const users = db.collection('users');

    if (req.method === 'GET') {
      const user = await users.findOne(
        { _id: new ObjectId(id) },
        { projection: { password: 0 } }
      );
      if (!user) return res.status(404).json({ error: 'Student not found' });

      const sessions = db.collection('learning_sessions');
      const userSessions = await sessions.find({ user_id: id }).sort({ created_at: -1 }).toArray();

      return res.json({
        student: {
          id: user._id.toString(),
          email: user.email,
          displayName: user.display_name,
          profilePhoto: user.profilePhotoBase64 || null,
          engagementScore: user.engagementScore || 100,
          moduleProgress: user.moduleProgress || {},
          codingPerformance: user.codingPerformance || {},
          proctoringViolations: user.proctoringViolations || [],
          createdAt: user.created_at,
        },
        sessions: userSessions.map(s => ({
          id: s._id.toString(),
          moduleId: s.module_id,
          moduleTitle: s.module_title,
          engagementScore: s.engagement_score,
          quizScore: s.quiz_score,
          recommendation: s.recommendation,
          timestamp: s.created_at,
        })),
      });
    }

    if (req.method === 'DELETE') {
      const result = await users.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }
      // Clean up sessions
      const sessions = db.collection('learning_sessions');
      await sessions.deleteMany({ user_id: id });
      return res.json({ ok: true, message: 'Student deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Admin student by ID error:', err);
    res.status(500).json({ error: 'Failed to process student request' });
  }
}
