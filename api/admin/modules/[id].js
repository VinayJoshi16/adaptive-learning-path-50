import { ObjectId } from 'mongodb';
import { getDB } from '../../_lib/db.js';
import { verifyAdmin } from '../../_lib/adminAuth.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Module ID is required' });
  }

  const admin = verifyAdmin(req);
  if (!admin) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  try {
    const db = await getDB();
    const modules = db.collection('admin_modules');

    if (req.method === 'PUT') {
      const { title, level, description, content, duration, order, topics } = req.body || {};
      const update = { updated_at: new Date() };
      if (title) update.title = title;
      if (level) update.level = level;
      if (description) update.description = description;
      if (content) update.content = content;
      if (duration) update.duration = Number(duration);
      if (order) update.order = Number(order);
      if (topics) update.topics = topics;

      const result = await modules.updateOne({ _id: new ObjectId(id) }, { $set: update });
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Module not found' });
      }
      return res.json({ ok: true, message: 'Module updated successfully' });
    }

    if (req.method === 'DELETE') {
      const result = await modules.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Module not found' });
      }
      return res.json({ ok: true, message: 'Module deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Admin module by ID error:', err);
    res.status(500).json({ error: 'Failed to process module request' });
  }
}
