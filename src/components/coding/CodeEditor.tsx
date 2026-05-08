import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Play } from 'lucide-react';
import { toast } from 'sonner';

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

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || '');
  };

  const executeCode = async () => {
    setIsRunning(true);
    setOutput('Running code...');
    
    try {
      // Proxy request to our backend which talks to Piston API
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

      const resultOutput = data.stderr ? `Error:\n${data.stderr}` : data.stdout;
      setOutput(resultOutput || 'Program executed successfully with no output.');
      
      if (onRun) {
        onRun(resultOutput, !data.stderr);
      }
    } catch (err: any) {
      setOutput(`Failed to execute: ${err.message}`);
      toast.error('Code execution failed');
    } finally {
      setIsRunning(false);
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
          <Select value={language} onValueChange={setLanguage}>
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
