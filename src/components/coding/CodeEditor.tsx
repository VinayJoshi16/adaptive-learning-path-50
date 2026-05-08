import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Play } from 'lucide-react';
import { toast } from 'sonner';
import { STARTER_TEMPLATES } from '@/lib/coding-questions';

interface CodeEditorProps {
  initialCode?: string;
  defaultLanguage?: string;
  onRun?: (output: string, passed: boolean) => void;
  onSubmit?: (code: string, language: string) => void;
}

export function CodeEditor({ initialCode = '', defaultLanguage = 'python', onRun, onSubmit }: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(defaultLanguage);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  // Reset code when initialCode changes (new question selected)
  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  // Auto-load starter template when language changes
  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    // Only reset to template if current code is empty or matches a template
    const isTemplate = Object.values(STARTER_TEMPLATES).some(t => code.trim() === t.trim());
    if (!code.trim() || isTemplate) {
      setCode(STARTER_TEMPLATES[newLang] || '');
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || '');
  };

  const executeCode = async () => {
    setIsRunning(true);
    setOutput('Running code...');
    
    try {
      const response = await fetch('/api/code/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify({
          language,
          source_code: code,
          inputs: ''
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Execution failed');
      }

      // If server returned a fallback hint, run client-side for JS
      if (data.fallback && language === 'javascript') {
        runClientSideJS();
        return;
      }

      const resultOutput = data.stderr ? `Error:\n${data.stderr}` : data.stdout;
      setOutput(resultOutput || 'Program executed successfully with no output.');
      
      if (onRun) {
        onRun(resultOutput, !data.stderr);
      }
    } catch (err: any) {
      // Fallback: run JavaScript client-side
      if (language === 'javascript') {
        runClientSideJS();
      } else {
        setOutput(`Failed to execute: ${err.message}\n\nTip: JavaScript can run locally. Select JavaScript to use the built-in evaluator.`);
        toast.error('Remote execution unavailable');
      }
    } finally {
      setIsRunning(false);
    }
  };

  const runClientSideJS = () => {
    try {
      const logs: string[] = [];
      const mockConsole = { log: (...args: any[]) => logs.push(args.map(String).join(' ')), error: (...args: any[]) => logs.push('Error: ' + args.map(String).join(' ')) };
      const fn = new Function('console', code);
      fn(mockConsole);
      const result = logs.join('\n') || 'Program executed with no output.';
      setOutput(result);
      if (onRun) onRun(result, true);
    } catch (e: any) {
      setOutput(`Runtime Error:\n${e.message}`);
      if (onRun) onRun(e.message, false);
    }
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(code, language);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-4">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="python">Python 3</SelectItem>
              <SelectItem value="javascript">JavaScript (Node)</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
              <SelectItem value="c">C</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={executeCode} disabled={isRunning} className="flex items-center gap-2">
            {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Run
          </Button>
          <Button variant="hero" size="sm" onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      </div>
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        <div className="border-r border-border h-[400px] lg:h-auto">
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              padding: { top: 16 },
            }}
          />
        </div>
        <div className="bg-[#1e1e1e] text-[#d4d4d4] p-4 font-mono text-sm overflow-auto h-[200px] lg:h-auto border-t lg:border-t-0 border-border">
          <div className="text-muted-foreground mb-2 select-none border-b border-[#333] pb-2">Output Console</div>
          <pre className="whitespace-pre-wrap">{output}</pre>
        </div>
      </div>
    </div>
  );
}
