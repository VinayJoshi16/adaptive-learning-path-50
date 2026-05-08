import { Router } from 'express';
import { getDB } from '../db.js';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

const router = Router();

// Middleware to verify user token
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Generate quiz for a specific module
router.get('/generate/:moduleId', authenticate, async (req, res) => {
  try {
    const { moduleId } = req.params;
    
    // In a real production environment with LeetCode-style structure in MongoDB:
    // const db = getDB();
    // const questions = await db.collection('questions').find({ tags: moduleId }).limit(5).toArray();
    
    // For now, mock data based on module
    let questions = [];
    if (moduleId === 'python') {
      questions = [
        { id: 1, type: 'mcq', question: 'What is the output of print(2 ** 3)?', options: ['6', '8', '9', 'Error'], answer: '8' },
        { id: 2, type: 'coding', question: 'Write a Python function to return the sum of an array.', testCases: [{ input: '[1, 2, 3]', expected: '6' }] }
      ];
    } else if (moduleId === 'dsa') {
      questions = [
        { id: 1, type: 'mcq', question: 'What is the time complexity of binary search?', options: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'], answer: 'O(log n)' },
        { id: 2, type: 'coding', question: 'Reverse a Linked List (simulate with an array for now)', testCases: [{ input: '[1, 2, 3]', expected: '[3, 2, 1]' }] }
      ];
    } else {
      questions = [
        { id: 1, type: 'mcq', question: `What is a core feature of ${moduleId}?`, options: ['Speed', 'Portability', 'Both', 'None'], answer: 'Both' }
      ];
    }

    res.json({ questions });
  } catch (err) {
    console.error('Quiz generation error:', err);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

// Submit quiz and calculate score
router.post('/submit', authenticate, async (req, res) => {
  try {
    const { moduleId, answers, proctoringViolationsCount = 0 } = req.body;
    
    // Simulate score calculation
    // Assume answers is an object mapping questionId to answer string/code
    const score = Math.floor(Math.random() * 30) + 70; // Mock score between 70-100 for testing, normally calculated
    
    const passed = score >= 75; // 75% threshold
    const status = passed ? 'unlocked' : 'locked';

    const db = getDB();
    const users = db.collection('users');

    // Update user module progress and violations
    const updateResult = await users.updateOne(
      { _id: new ObjectId(req.userId) },
      { 
        $set: { 
          [`moduleProgress.${moduleId}`]: { score, status, attempts: 1 } // Would increment attempts in reality
        },
        $push: {
          proctoringViolations: { moduleId, count: proctoringViolationsCount, date: new Date() }
        }
      }
    );

    res.json({ score, passed, message: passed ? 'Module passed!' : 'Keep trying!' });
  } catch (err) {
    console.error('Quiz submission error:', err);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

export default router;
