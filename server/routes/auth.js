import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { getDB } from '../db.js';

const router = Router();

router.post('/signup', async (req, res) => {
  try {
    const db = getDB();
    if (!db) {
      return res.status(503).json({ error: 'Database not connected. Please try again.' });
    }
    const users = db.collection('users');
    const { email, password, displayName } = req.body;

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
    const message = err.message || 'Failed to create account';
    res.status(500).json({ error: message });
  }
});

router.post('/signin', async (req, res) => {
  try {
    const db = getDB();
    const users = db.collection('users');
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await users.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        user_metadata: { display_name: user.display_name },
      },
    });
  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ error: 'Failed to sign in' });
  }
});

router.post('/signout', (req, res) => {
  res.json({ ok: true });
});

router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const db = getDB();
    const users = db.collection('users');
    const user = await users.findOne(
      { _id: new ObjectId(decoded.userId) },
      { projection: { password: 0 } }
    );
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        user_metadata: { display_name: user.display_name },
      },
    });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});

export default router;
