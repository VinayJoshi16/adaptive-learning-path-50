import { ObjectId } from 'mongodb';
import { getDB } from '../../_lib/db.js';
import { verifyAdmin } from '../../_lib/adminAuth.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID is required' });
  }

  try {
    const db = await getDB();
    const subparts = db.collection('admin_subparts');

    // Check if this is a "public" request for getting subparts by moduleId
    // The route pattern /api/admin/subparts/public/[moduleId] is handled separately
    // This handles /api/admin/subparts/[id] for admin operations (PUT/DELETE)
    // and /api/admin/subparts/[moduleId] for admin GET listing

    if (req.method === 'GET') {
      // This could be either:
      // 1. Admin listing subparts for a module (id = moduleId)
      // Check if it looks like a moduleId (not an ObjectId)
      const admin = verifyAdmin(req);
      if (!admin) {
        return res.status(401).json({ error: 'Admin authentication required' });
      }

      const docs = await subparts.find({ moduleId: id }).sort({ order: 1 }).toArray();
      return res.json({
        subparts: docs.map(s => ({
          id: s._id.toString(),
          moduleId: s.moduleId,
          title: s.title,
          content: s.content,
          order: s.order,
          quizQuestions: s.quizQuestions || [],
          codingQuestions: s.codingQuestions || [],
          createdAt: s.created_at,
        })),
      });
    }

    if (req.method === 'PUT') {
      const admin = verifyAdmin(req);
      if (!admin) {
        return res.status(401).json({ error: 'Admin authentication required' });
      }

      const { title, content, order, quizQuestions, codingQuestions } = req.body || {};
      const update = { updated_at: new Date() };
      if (title) update.title = title;
      if (content) update.content = content;
      if (order != null) update.order = Number(order);
      if (quizQuestions) update.quizQuestions = quizQuestions;
      if (codingQuestions) update.codingQuestions = codingQuestions;

      await subparts.updateOne({ _id: new ObjectId(id) }, { $set: update });
      return res.json({ ok: true, message: 'Subpart updated' });
    }

    if (req.method === 'DELETE') {
      const admin = verifyAdmin(req);
      if (!admin) {
        return res.status(401).json({ error: 'Admin authentication required' });
      }

      await subparts.deleteOne({ _id: new ObjectId(id) });
      return res.json({ ok: true, message: 'Subpart deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Admin subpart by ID error:', err);
    res.status(500).json({ error: 'Failed to process subpart request' });
  }
}
