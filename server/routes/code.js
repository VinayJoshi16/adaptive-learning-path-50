import { Router } from 'express';
import { getDB } from '../db.js';

const router = Router();

// Free Piston API proxy to safely execute code
router.post('/execute', async (req, res) => {
  try {
    const { language, source_code, inputs = '' } = req.body;

    if (!language || !source_code) {
      return res.status(400).json({ error: 'Language and source code are required' });
    }

    // Map common language names to Piston language versions
    const languageMap = {
      'python': { language: 'python', version: '3.10.0' },
      'javascript': { language: 'javascript', version: '18.15.0' },
      'java': { language: 'java', version: '15.0.2' },
      'c': { language: 'c', version: '10.2.0' },
      'cpp': { language: 'c++', version: '10.2.0' },
    };

    const targetLang = languageMap[language.toLowerCase()];

    if (!targetLang) {
      return res.status(400).json({ error: 'Unsupported language' });
    }

    const payload = {
      language: targetLang.language,
      version: targetLang.version,
      files: [{ content: source_code }],
      stdin: inputs
    };

    // Public Piston execution engine (official endpoint)
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.message) {
      // Piston error
      return res.status(400).json({ error: result.message });
    }

    // Save submission to DB
    const authHeader = req.headers.authorization;
    if (authHeader) {
        // Simple log for now, you could decode the JWT to attach to user
    }

    res.json({
      stdout: result.run.stdout,
      stderr: result.run.stderr,
      code: result.run.code,
      signal: result.run.signal
    });

  } catch (err) {
    console.error('Code execution error:', err);
    res.status(500).json({ error: 'Failed to execute code' });
  }
});

export default router;
