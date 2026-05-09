export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { language, source_code, inputs = '' } = req.body || {};

    if (!language || !source_code) {
      return res.status(400).json({ error: 'Language and source code are required' });
    }

    let result;

    // Provider 1: Judge0 CE via RapidAPI
    result = await tryJudge0(language, source_code, inputs);
    if (result) return res.json(result);

    // Provider 2: Wandbox
    result = await tryWandbox(language, source_code, inputs);
    if (result) return res.json(result);

    // Provider 3: For JS only — tell client to run locally
    if (language === 'javascript') {
      return res.json({ stdout: '', stderr: '', code: 0, fallback: true });
    }

    return res.status(503).json({ error: 'All code execution providers unavailable. Try JavaScript for local execution.' });
  } catch (err) {
    console.error('Code execution error:', err);
    res.status(500).json({ error: 'Failed to execute code: ' + err.message });
  }
}

async function tryJudge0(language, source_code, inputs) {
  const apiKey = process.env.JUDGE0_API_KEY;
  if (!apiKey) return null;

  const langMap = { 'python': 71, 'javascript': 63, 'java': 62, 'c': 50, 'cpp': 54 };
  const langId = langMap[language.toLowerCase()];
  if (!langId) return null;

  try {
    const submitRes = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
      },
      body: JSON.stringify({
        language_id: langId,
        source_code: Buffer.from(source_code).toString('base64'),
        stdin: inputs ? Buffer.from(inputs).toString('base64') : '',
      }),
    });

    if (!submitRes.ok) return null;

    const data = await submitRes.json();
    const decode = (b64) => b64 ? Buffer.from(b64, 'base64').toString('utf-8') : '';
    const stdout = decode(data.stdout);
    const stderr = decode(data.stderr);
    const compileErr = decode(data.compile_output);
    const isSuccess = data.status?.id === 3;

    return {
      stdout,
      stderr: stderr || compileErr || (isSuccess ? '' : (data.status?.description || '')),
      code: isSuccess ? 0 : 1,
      signal: null,
    };
  } catch {
    return null;
  }
}

async function tryWandbox(language, source_code, inputs) {
  const compilerMap = { 'python': 'cpython-3.10.2', 'javascript': 'nodejs-16.14.0', 'c': 'gcc-12.1.0', 'cpp': 'gcc-12.1.0' };
  const compiler = compilerMap[language.toLowerCase()];
  if (!compiler) return null;

  const options = language === 'cpp' ? 'warning,c++17' : language === 'c' ? 'warning,c17' : '';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const resp = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ compiler, code: source_code, stdin: inputs, options }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    if (!resp.ok) return null;

    const data = await resp.json();
    return {
      stdout: data.program_output || '',
      stderr: data.compiler_error || data.program_error || '',
      code: (data.status === '0' || data.status === 0) ? 0 : 1,
      signal: data.signal || null,
    };
  } catch {
    return null;
  }
}
