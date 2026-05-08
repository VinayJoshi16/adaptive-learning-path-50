import { Router } from 'express';
import { getDB } from '../db.js';

const router = Router();

// Multi-provider code execution with fallback chain
router.post('/execute', async (req, res) => {
  try {
    const { language, source_code, inputs = '' } = req.body;

    if (!language || !source_code) {
      return res.status(400).json({ error: 'Language and source code are required' });
    }

    // Try providers in order
    let result;
    
    // Provider 1: Judge0 CE (free, community edition)
    result = await tryJudge0(language, source_code, inputs);
    if (result) return res.json(result);
    
    // Provider 2: Wandbox (free, no API key)
    result = await tryWandbox(language, source_code, inputs);
    if (result) return res.json(result);

    // Provider 3: Client-side execution hint for JS/Python
    if (language === 'javascript' || language === 'python') {
      return res.json({
        stdout: '',
        stderr: 'Remote execution unavailable. Use the built-in evaluator.',
        code: 1,
        fallback: true,
      });
    }

    return res.status(503).json({ error: 'Code execution service temporarily unavailable. Please try again later.' });

  } catch (err) {
    console.error('Code execution error:', err);
    res.status(500).json({ error: 'Failed to execute code' });
  }
});

// ─── Judge0 Community Edition (free, hosted at judge0.com) ───
async function tryJudge0(language, source_code, inputs) {
  const langMap = {
    'python': 71,     // Python 3
    'javascript': 63, // Node.js
    'java': 62,       // Java (OpenJDK 13)
    'c': 50,          // C (GCC 9.2)
    'cpp': 54,        // C++ (GCC 9.2)
  };

  const langId = langMap[language.toLowerCase()];
  if (!langId) return null;

  try {
    // Submit
    const submitRes = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true&fields=*', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': process.env.JUDGE0_API_KEY || '',
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
      },
      body: JSON.stringify({
        language_id: langId,
        source_code: Buffer.from(source_code).toString('base64'),
        stdin: inputs ? Buffer.from(inputs).toString('base64') : '',
      }),
    });

    if (!submitRes.ok) return null;
    const data = await submitRes.json();

    const stdout = data.stdout ? Buffer.from(data.stdout, 'base64').toString() : '';
    const stderr = data.stderr ? Buffer.from(data.stderr, 'base64').toString() : '';
    const compileErr = data.compile_output ? Buffer.from(data.compile_output, 'base64').toString() : '';

    return {
      stdout: stdout,
      stderr: stderr || compileErr,
      code: data.status?.id === 3 ? 0 : 1, // 3 = Accepted
      signal: null,
    };
  } catch (e) {
    console.log('Judge0 unavailable:', e.message);
    return null;
  }
}

// ─── Wandbox (free, no API key, supports C/C++/Python/JS) ───
async function tryWandbox(language, source_code, inputs) {
  const compilerMap = {
    'python': 'cpython-3.10.2',
    'javascript': 'nodejs-16.14.0',
    'c': 'gcc-12.1.0',
    'cpp': 'gcc-12.1.0',
  };

  const compiler = compilerMap[language.toLowerCase()];
  if (!compiler) return null;

  // Wandbox needs different options for C vs C++
  const options = language === 'cpp' ? 'warning,c++17' : language === 'c' ? 'warning,c17' : '';

  try {
    const resp = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        compiler,
        code: source_code,
        stdin: inputs,
        options,
      }),
    });

    if (!resp.ok) return null;
    const data = await resp.json();

    return {
      stdout: data.program_output || '',
      stderr: data.compiler_error || data.program_error || '',
      code: data.status === '0' || data.status === 0 ? 0 : 1,
      signal: data.signal || null,
    };
  } catch (e) {
    console.log('Wandbox unavailable:', e.message);
    return null;
  }
}

export default router;
