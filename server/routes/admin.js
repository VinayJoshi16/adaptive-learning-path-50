import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { getDB } from '../db.js';
import { adminMiddleware } from '../middleware/adminAuth.js';

const router = Router();

/* ──────────────── Public: fetch admin‑created modules (students) ──────────────── */

router.get('/modules/public', async (req, res) => {
  try {
    const db = getDB();
    if (!db) return res.json({ modules: [] });
    const modules = db.collection('admin_modules');
    const docs = await modules.find({}).sort({ order: 1 }).toArray();
    res.json({
      modules: docs.map(m => ({
        id: m._id.toString(),
        title: m.title,
        level: m.level || 'beginner',
        description: m.description,
        content: m.content,
        duration: m.duration || 10,
        order: m.order || 1,
        topics: m.topics || [],
        contentType: m.contentType || 'general',
      })),
    });
  } catch (err) {
    console.error('Public modules error:', err);
    res.json({ modules: [] });
  }
});

/* ──────────────── Admin Login ──────────────── */

router.post('/login', (req, res) => {
  const { adminKey, password } = req.body;

  const validKey = process.env.ADMIN_KEY || 'PALM-ADMIN-2026';
  const validPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (!adminKey || !password) {
    return res.status(400).json({ error: 'Admin key and password are required' });
  }

  if (adminKey !== validKey || password !== validPassword) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }

  const token = jwt.sign(
    { role: 'admin', adminKey },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '12h' }
  );

  res.json({ token, message: 'Admin authenticated successfully' });
});

/* ──────────────── Verify (lightweight auth check) ──────────────── */

router.get('/verify', adminMiddleware, (req, res) => {
  res.json({ ok: true, role: 'admin' });
});

/* ──────────────── Students ──────────────── */

router.get('/students', adminMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const users = db.collection('users');
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

    res.json({ students });
  } catch (err) {
    console.error('Admin students error:', err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

router.get('/students/:id', adminMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const users = db.collection('users');
    const user = await users.findOne(
      { _id: new ObjectId(req.params.id) },
      { projection: { password: 0 } }
    );

    if (!user) return res.status(404).json({ error: 'Student not found' });

    // Fetch their learning sessions too
    const sessions = db.collection('learning_sessions');
    const userSessions = await sessions
      .find({ user_id: req.params.id })
      .sort({ created_at: -1 })
      .toArray();

    res.json({
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
  } catch (err) {
    console.error('Admin student detail error:', err);
    res.status(500).json({ error: 'Failed to fetch student details' });
  }
});

router.delete('/students/:id', adminMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const users = db.collection('users');
    const result = await users.deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Also clean up their sessions
    const sessions = db.collection('learning_sessions');
    await sessions.deleteMany({ user_id: req.params.id });

    res.json({ ok: true, message: 'Student deleted successfully' });
  } catch (err) {
    console.error('Admin delete student error:', err);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

/* ──────────────── Analytics ──────────────── */

router.get('/analytics', adminMiddleware, async (req, res) => {
  try {
    const db = getDB();
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
});

/* ──────────────── Modules (CRUD) ──────────────── */

router.get('/modules', adminMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const modules = db.collection('admin_modules');
    const docs = await modules.find({}).sort({ order: 1 }).toArray();
    res.json({
      modules: docs.map(m => ({
        id: m._id.toString(),
        title: m.title,
        level: m.level,
        description: m.description,
        content: m.content,
        duration: m.duration,
        order: m.order,
        topics: m.topics || [],
        contentType: m.contentType || 'general',
        createdAt: m.created_at,
      })),
    });
  } catch (err) {
    console.error('Admin modules error:', err);
    res.status(500).json({ error: 'Failed to fetch modules' });
  }
});

router.post('/modules', adminMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const modules = db.collection('admin_modules');
    const { title, level, description, content, duration, order, topics, contentType } = req.body;

    if (!title || !level || !description || !content) {
      return res.status(400).json({ error: 'Title, level, description, and content are required' });
    }

    const doc = {
      title,
      level,
      description,
      content,
      contentType: contentType || 'general',
      duration: Number(duration) || 10,
      order: Number(order) || 1,
      topics: topics || [],
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await modules.insertOne(doc);
    res.status(201).json({
      id: result.insertedId.toString(),
      ...doc,
      message: 'Module created successfully',
    });
  } catch (err) {
    console.error('Admin create module error:', err);
    res.status(500).json({ error: 'Failed to create module' });
  }
});

router.put('/modules/:id', adminMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const modules = db.collection('admin_modules');
    const { title, level, description, content, duration, order, topics } = req.body;

    const update = { updated_at: new Date() };
    if (title) update.title = title;
    if (level) update.level = level;
    if (description) update.description = description;
    if (content) update.content = content;
    if (duration) update.duration = Number(duration);
    if (order) update.order = Number(order);
    if (topics) update.topics = topics;

    const result = await modules.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: update }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Module not found' });
    }

    res.json({ ok: true, message: 'Module updated successfully' });
  } catch (err) {
    console.error('Admin update module error:', err);
    res.status(500).json({ error: 'Failed to update module' });
  }
});

router.delete('/modules/:id', adminMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const modules = db.collection('admin_modules');
    const result = await modules.deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Module not found' });
    }

    res.json({ ok: true, message: 'Module deleted successfully' });
  } catch (err) {
    console.error('Admin delete module error:', err);
    res.status(500).json({ error: 'Failed to delete module' });
  }
});

/* ──────────────── Proctoring Logs ──────────────── */

router.get('/proctoring-logs', adminMiddleware, async (req, res) => {
  try {
    const db = getDB();
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

    // Sort by date descending
    logs.sort((a, b) => (b.date ? new Date(b.date) : 0) - (a.date ? new Date(a.date) : 0));

    res.json({ logs });
  } catch (err) {
    console.error('Admin proctoring logs error:', err);
    res.status(500).json({ error: 'Failed to fetch proctoring logs' });
  }
});

/* ──────────────── Quiz Results ──────────────── */

router.get('/quiz-results', adminMiddleware, async (req, res) => {
  try {
    const db = getDB();
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
});

export default router;
