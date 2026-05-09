import { ObjectId } from 'mongodb';
import { getDB } from '../_lib/db.js';
import { verifyAdmin } from '../_lib/adminAuth.js';

export default async function handler(req, res) {
  try {
    const db = await getDB();
    const subparts = db.collection('admin_subparts');

    // Admin-protected POST: create a subpart
    if (req.method === 'POST') {
      const admin = verifyAdmin(req);
      if (!admin) {
        return res.status(401).json({ error: 'Admin authentication required' });
      }

      const { moduleId, title, content, order, quizQuestions, codingQuestions, videoUrl, youtubeUrl } = req.body || {};
      if (!moduleId || !title || !content) {
        return res.status(400).json({ error: 'moduleId, title, and content are required' });
      }

      const doc = {
        moduleId, title, content,
        order: Number(order) || 1,
        quizQuestions: quizQuestions || [],
        codingQuestions: codingQuestions || [],
        videoUrl: videoUrl || '',
        youtubeUrl: youtubeUrl || '',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = await subparts.insertOne(doc);
      return res.status(201).json({ id: result.insertedId.toString(), ...doc, message: 'Subpart created' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Admin subparts error:', err);
    res.status(500).json({ error: 'Failed to process subparts request' });
  }
}
