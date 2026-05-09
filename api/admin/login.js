import jwt from 'jsonwebtoken';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { adminKey, password } = req.body || {};

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
}
