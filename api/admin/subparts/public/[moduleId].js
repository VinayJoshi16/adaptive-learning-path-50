import { getDB } from '../../../_lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { moduleId } = req.query;

  if (!moduleId) {
    return res.status(400).json({ error: 'Module ID is required' });
  }

  try {
    const db = await getDB();
    const subparts = db.collection('admin_subparts');
    const docs = await subparts.find({ moduleId }).sort({ order: 1 }).toArray();
    res.json({
      subparts: docs.map(s => ({
        id: s._id.toString(),
        moduleId: s.moduleId,
        title: s.title,
        content: s.content,
        order: s.order || 1,
        quizQuestions: s.quizQuestions || [],
        codingQuestions: s.codingQuestions || [],
        videoUrl: s.videoUrl || '',
        youtubeUrl: s.youtubeUrl || '',
      })),
    });
  } catch (err) {
    console.error('Public subparts error:', err);
    res.json({ subparts: [] });
  }
}
