import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDB } from '../_lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const db = await getDB();
    const users = db.collection('users');
    const { email, password, displayName } = req.body || {};

    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'Email, password, and display name are required' });
    }

    const existing = await users.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await users.insertOne({
      email: email.toLowerCase(),
      password: hashedPassword,
      display_name: displayName,
      created_at: new Date(),
    });

    const userId = result.insertedId.toString();
    const token = jwt.sign(
      { userId, email: email.toLowerCase() },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: userId,
        email: email.toLowerCase(),
        user_metadata: { display_name: displayName },
      },
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: err.message || 'Failed to create account' });
  }
}
