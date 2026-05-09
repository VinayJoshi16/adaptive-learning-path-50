import { ObjectId } from 'mongodb';
import { getDB } from '../_lib/db.js';
import { verifyAdmin } from '../_lib/adminAuth.js';

export default async function handler(req, res) {
  // Public endpoint for GET with /public path - check query param
  const isPublic = req.query.public === 'true';

  if (isPublic && req.method === 'GET') {
    try {
      const db = await getDB();
      const modules = db.collection('admin_modules');
      const docs = await modules.find({}).sort({ order: 1 }).toArray();
      return res.json({
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
          videoUrl: m.videoUrl || '',
          youtubeUrl: m.youtubeUrl || '',
        })),
      });
    } catch (err) {
      console.error('Public modules error:', err);
      return res.json({ modules: [] });
    }
  }

  // All other operations require admin auth
  const admin = verifyAdmin(req);
  if (!admin) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  try {
    const db = await getDB();
    const modules = db.collection('admin_modules');

    if (req.method === 'GET') {
      const docs = await modules.find({}).sort({ order: 1 }).toArray();
      return res.json({
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
    }

    if (req.method === 'POST') {
      const { title, level, description, content, duration, order, topics, contentType, videoUrl, youtubeUrl } = req.body || {};
      if (!title || !level || !description || !content) {
        return res.status(400).json({ error: 'Title, level, description, and content are required' });
      }
      const doc = {
        title, level, description, content,
        contentType: contentType || 'general',
        duration: Number(duration) || 10,
        order: Number(order) || 1,
        topics: topics || [],
        videoUrl: videoUrl || '',
        youtubeUrl: youtubeUrl || '',
        created_at: new Date(),
        updated_at: new Date(),
      };
      const result = await modules.insertOne(doc);
      return res.status(201).json({ id: result.insertedId.toString(), ...doc, message: 'Module created successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Admin modules error:', err);
    res.status(500).json({ error: 'Failed to process modules request' });
  }
}
