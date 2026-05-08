import { useState } from 'react';
import { CodeEditor } from '@/components/coding/CodeEditor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Terminal } from 'lucide-react';
import { toast } from 'sonner';

export default function CodingPractice() {
  const [problemDescription, setProblemDescription] = useState(
    "Write a function `twoSum(nums, target)` that returns the indices of the two numbers such that they add up to target.\n\nExample:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1]."
  );

  const handleRun = (output: string, passed: boolean) => {
    if (passed) {
      toast.success('Code executed successfully!');
    } else {
      toast.error('Execution encountered an error.');
    }
  };

  const handleSubmit = (code: string, language: string) => {
    // In a real app, this would send to an API to evaluate against hidden test cases
    toast.success(`Code submitted for evaluation in ${language}!`);
    console.log("Submitted code:", code);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 h-[calc(100vh-8rem)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Coding Practice Environment</h1>
            <p className="text-muted-foreground">Hone your skills with interactive coding challenges.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 h-full pb-8">
          {/* Problem Description Column */}
          <Card className="shadow-soft flex flex-col overflow-hidden h-full">
            <CardHeader className="bg-muted/30 border-b border-border py-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <CardTitle className="text-lg">Problem Statement</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6">
              <div className="prose prose-slate dark:prose-invert">
                <h3 className="text-xl font-bold mb-4">Two Sum</h3>
                <div className="flex gap-2 mb-6">
                  <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded text-xs font-medium">Easy</span>
                  <span className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground">Array</span>
                  <span className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground">Hash Table</span>
                </div>
                <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  {problemDescription}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Code Editor Column */}
          <div className="lg:col-span-2 h-[600px] lg:h-full">
            <CodeEditor 
              defaultLanguage="python" 
              initialCode="def twoSum(nums, target):\n    # Write your code here\n    pass\n\nprint(twoSum([2,7,11,15], 9))"
              onRun={handleRun}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
