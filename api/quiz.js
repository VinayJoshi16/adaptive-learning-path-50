import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { getDB } from '../_lib/db.js';

function getUserId(req) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    return decoded.userId;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const db = await getDB();

    if (req.method === 'GET') {
      const { moduleId } = req.query;
      // Generate quiz for a module
      let questions = [];
      if (moduleId === 'python') {
        questions = [
          { id: 1, type: 'mcq', question: 'What is the output of print(2 ** 3)?', options: ['6', '8', '9', 'Error'], answer: '8' },
          { id: 2, type: 'coding', question: 'Write a Python function to return the sum of an array.', testCases: [{ input: '[1, 2, 3]', expected: '6' }] },
        ];
      } else if (moduleId === 'dsa') {
        questions = [
          { id: 1, type: 'mcq', question: 'What is the time complexity of binary search?', options: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'], answer: 'O(log n)' },
          { id: 2, type: 'coding', question: 'Reverse a Linked List (simulate with an array for now)', testCases: [{ input: '[1, 2, 3]', expected: '[3, 2, 1]' }] },
        ];
      } else {
        questions = [
          { id: 1, type: 'mcq', question: `What is a core feature of ${moduleId}?`, options: ['Speed', 'Portability', 'Both', 'None'], answer: 'Both' },
        ];
      }
      return res.json({ questions });
    }

    if (req.method === 'POST') {
      const { moduleId, answers, proctoringViolationsCount = 0 } = req.body || {};
      const score = Math.floor(Math.random() * 30) + 70;
      const passed = score >= 75;
      const status = passed ? 'unlocked' : 'locked';

      const users = db.collection('users');
      await users.updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: { [`moduleProgress.${moduleId}`]: { score, status, attempts: 1 } },
          $push: { proctoringViolations: { moduleId, count: proctoringViolationsCount, date: new Date() } },
        }
      );

      return res.json({ score, passed, message: passed ? 'Module passed!' : 'Keep trying!' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Quiz error:', err);
    res.status(500).json({ error: 'Failed to process quiz request' });
  }
}
