import jwt from 'jsonwebtoken';
import { getDB } from './_lib/db.js';

function getUserId(req) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    return decoded.userId;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const db = await getDB();
    const sessions = db.collection('learning_sessions');

    if (req.method === 'GET') {
      const docs = await sessions
        .find({ user_id: userId })
        .sort({ created_at: 1 })
        .toArray();
      const data = docs.map((d) => ({
        id: d._id.toString(),
        studentId: d.student_id,
        userId: d.user_id,
        moduleId: d.module_id,
        moduleTitle: d.module_title,
        engagementScore: d.engagement_score,
        quizScore: d.quiz_score,
        recommendation: d.recommendation,
        timestamp: d.created_at,
      }));
      return res.json(data);
    }

    if (req.method === 'POST') {
      const {
        studentId,
        moduleId,
        moduleTitle,
        engagementScore,
        quizScore,
        recommendation,
      } = req.body || {};

      if (!moduleId || !moduleTitle || engagementScore == null || quizScore == null || !recommendation) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const doc = {
        student_id: studentId || userId,
        user_id: userId,
        module_id: moduleId,
        module_title: moduleTitle,
        engagement_score: Number(engagementScore),
        quiz_score: Number(quizScore),
        recommendation,
        created_at: new Date(),
      };

      const result = await sessions.insertOne(doc);
      const inserted = await sessions.findOne({ _id: result.insertedId });
      return res.status(201).json({
        id: inserted._id.toString(),
        studentId: inserted.student_id,
        userId: inserted.user_id,
        moduleId: inserted.module_id,
        moduleTitle: inserted.module_title,
        engagementScore: inserted.engagement_score,
        quizScore: inserted.quiz_score,
        recommendation: inserted.recommendation,
        timestamp: inserted.created_at,
      });
    }

    if (req.method === 'DELETE') {
      await sessions.deleteMany({ user_id: userId });
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Sessions error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
