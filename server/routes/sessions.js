import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { authMiddleware } from '../middleware/auth.js';
import { getDB } from '../db.js';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const sessions = db.collection('learning_sessions');
    const docs = await sessions
      .find({ user_id: req.user.userId })
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

    res.json(data);
  } catch (err) {
    console.error('Error fetching sessions:', err);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

router.post('/', async (req, res) => {
  try {
    const db = getDB();
    const sessions = db.collection('learning_sessions');
    const {
      studentId,
      moduleId,
      moduleTitle,
      engagementScore,
      quizScore,
      recommendation,
    } = req.body;

    if (!moduleId || !moduleTitle || engagementScore == null || quizScore == null || !recommendation) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const doc = {
      student_id: studentId || req.user.userId,
      user_id: req.user.userId,
      module_id: moduleId,
      module_title: moduleTitle,
      engagement_score: Number(engagementScore),
      quiz_score: Number(quizScore),
      recommendation,
      created_at: new Date(),
    };

    const result = await sessions.insertOne(doc);
    const inserted = await sessions.findOne({ _id: result.insertedId });

    res.status(201).json({
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
  } catch (err) {
    console.error('Error adding session:', err);
    res.status(500).json({ error: 'Failed to save session' });
  }
});

router.delete('/', async (req, res) => {
  try {
    const db = getDB();
    const sessions = db.collection('learning_sessions');
    await sessions.deleteMany({ user_id: req.user.userId });
    res.json({ ok: true });
  } catch (err) {
    console.error('Error clearing sessions:', err);
    res.status(500).json({ error: 'Failed to clear sessions' });
  }
});

export default router;
