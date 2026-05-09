import { getDB } from '../../_lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await getDB();
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
        videoUrl: m.videoUrl || '',
        youtubeUrl: m.youtubeUrl || '',
      })),
    });
  } catch (err) {
    console.error('Public modules error:', err);
    res.json({ modules: [] });
  }
}
