import { getDB } from '../_lib/db.js';
import { verifyAdmin } from '../_lib/adminAuth.js';

export default async function handler(req, res) {
  const admin = verifyAdmin(req);
  if (!admin) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  try {
    const db = await getDB();
    const users = db.collection('users');
    const sessions = db.collection('learning_sessions');

    const totalStudents = await users.countDocuments();
    const allUsers = await users.find({}, { projection: { password: 0, profilePhotoBase64: 0 } }).toArray();
    const allSessions = await sessions.find({}).toArray();

    // Average engagement score
    const avgEngagement = allUsers.length > 0
      ? Math.round(allUsers.reduce((s, u) => s + (u.engagementScore || 100), 0) / allUsers.length)
      : 0;

    // Total violations
    const totalViolations = allUsers.reduce((s, u) => {
      const v = u.proctoringViolations || [];
      return s + v.reduce((vs, vi) => vs + (vi.count || 0), 0);
    }, 0);

    // Average quiz score from sessions
    const quizSessions = allSessions.filter(s => s.quiz_score != null);
    const avgQuizScore = quizSessions.length > 0
      ? Math.round(quizSessions.reduce((s, q) => s + q.quiz_score, 0) / quizSessions.length)
      : 0;

    // Module completion counts
    const moduleCompletions = {};
    allUsers.forEach(u => {
      const mp = u.moduleProgress || {};
      Object.entries(mp).forEach(([moduleId, data]) => {
        if (!moduleCompletions[moduleId]) moduleCompletions[moduleId] = { passed: 0, total: 0 };
        moduleCompletions[moduleId].total++;
        if (data.status === 'unlocked' || data.score >= 75) moduleCompletions[moduleId].passed++;
      });
    });

    // Recent signups (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSignups = allUsers.filter(u => u.created_at && new Date(u.created_at) >= weekAgo).length;

    res.json({
      totalStudents,
      avgEngagement,
      totalViolations,
      avgQuizScore,
      totalSessions: allSessions.length,
      recentSignups,
      moduleCompletions,
    });
  } catch (err) {
    console.error('Admin analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}
