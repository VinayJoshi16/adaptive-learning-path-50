import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js';
import authRoutes from './routes/auth.js';
import sessionsRoutes from './routes/sessions.js';
import codeRoutes from './routes/code.js';
import quizRoutes from './routes/quiz.js';
import adminRoutes from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.get('/api', (req, res) => {
  res.json({ ok: true, message: 'PALM API', endpoints: ['/api/health', '/api/auth', '/api/sessions', '/api/code', '/api/quiz', '/api/admin'] });
});

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/admin', adminRoutes);


app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Global error handler - always return JSON
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
