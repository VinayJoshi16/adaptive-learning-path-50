import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { QuizQuestion } from '@/lib/content-data';
import { cn } from '@/lib/utils';
import { Brain, CheckCircle, XCircle, Sparkles, AlertTriangle, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const MINIMUM_PASSING_SCORE = 60;

interface EngagementInterventionProps {
  open: boolean;
  onClose: () => void;
  questions: QuizQuestion[];
  onComplete: (score: number, passed: boolean) => void;
  moduleId?: string;
  sessionId?: string;
}

export function EngagementIntervention({ 
  open, 
  onClose, 
  questions, 
  onComplete,
  moduleId,
  sessionId,
}: EngagementInterventionProps) {
  const { user } = useAuth();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Reset state when dialog opens with new questions
  useEffect(() => {
    if (open && questions.length > 0) {
      setAnswers({});
      setSubmitted(false);
      setScore(0);
      setPassed(false);
    }
  }, [open, questions]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const saveAttemptToDatabase = async (finalScore: number, didPass: boolean, correct: number) => {
    if (!user || !moduleId) return;
    
    try {
      await supabase.from('intervention_attempts').insert({
        user_id: user.id,
        session_id: sessionId || null,
        module_id: moduleId,
        score: finalScore,
        passed: didPass,
        questions_count: questions.length,
        correct_answers: correct,
      });
    } catch (error) {
      console.error('Failed to save intervention attempt:', error);
    }
  };

  const handleSubmit = async () => {
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctOption) {
        correct++;
      }
    });
    const finalScore = Math.round((correct / questions.length) * 100);
    const didPass = finalScore >= MINIMUM_PASSING_SCORE;
    
    setScore(finalScore);
    setPassed(didPass);
    setSubmitted(true);
    setAttempts(prev => prev + 1);
    
    // Save attempt to database
    await saveAttemptToDatabase(finalScore, didPass, correct);
    
    // Only call onComplete with passed=true if they actually passed
    onComplete(finalScore, didPass);
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  const handleClose = () => {
    // Only allow closing after passing
    if (!passed) return;
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setAttempts(0);
    onClose();
  };

  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen && passed) handleClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => !passed && e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <DialogTitle className="font-display text-xl">
              {submitted ? (passed ? 'Great job!' : 'Try Again') : 'Time to Refocus!'}
            </DialogTitle>
          </div>
          <DialogDescription>
            {submitted 
              ? passed 
                ? `You scored ${score}% and can continue learning.`
                : `You scored ${score}%. You need at least ${MINIMUM_PASSING_SCORE}% to continue.`
              : `Your engagement dropped. Answer these questions to continue. You need at least ${MINIMUM_PASSING_SCORE}% to proceed.`
            }
          </DialogDescription>
        </DialogHeader>

        {!submitted ? (
          <div className="space-y-6 mt-4">
            {attempts > 0 && (
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-warning text-sm">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Attempt {attempts + 1} - Review the questions carefully!</span>
                </div>
              </div>
            )}
            
            {questions.map((question, index) => (
              <div key={question.id} className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </span>
                  <p className="text-sm font-medium text-foreground">
                    {question.question}
                  </p>
                </div>
                <RadioGroup
                  value={answers[question.id] || ''}
                  onValueChange={(value) => handleAnswerChange(question.id, value)}
                  className="ml-9"
                >
                  {(['a', 'b', 'c', 'd'] as const).map(option => (
                    <div 
                      key={option}
                      className={cn(
                        "flex items-center space-x-2 p-2 rounded-lg transition-all cursor-pointer",
                        answers[question.id] === option
                          ? "bg-primary/10 border border-primary"
                          : "hover:bg-muted border border-transparent"
                      )}
                      onClick={() => handleAnswerChange(question.id, option)}
                    >
                      <RadioGroupItem value={option} id={`int-${question.id}-${option}`} />
                      <Label 
                        htmlFor={`int-${question.id}-${option}`}
                        className="flex-1 cursor-pointer text-sm"
                      >
                        {question.options[option]}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}

            <Button 
              onClick={handleSubmit} 
              disabled={!allAnswered}
              className="w-full"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Submit Answers
            </Button>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {/* Results */}
            <div className="space-y-2">
              {questions.map((question, index) => {
                const isCorrect = answers[question.id] === question.correctOption;
                return (
                  <div 
                    key={question.id}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg text-sm",
                      isCorrect ? "bg-success/10" : "bg-destructive/10"
                    )}
                  >
                    {isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                    )}
                    <span className="font-medium">Q{index + 1}</span>
                    <span className="text-muted-foreground truncate flex-1">
                      {question.question}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className={cn(
              "p-4 rounded-xl text-center",
              passed ? "bg-success/10" : "bg-destructive/10"
            )}>
              <p className="text-sm text-muted-foreground mb-1">
                {passed 
                  ? "You're back on track!" 
                  : `You need ${MINIMUM_PASSING_SCORE}% to continue. Try again!`
                }
              </p>
              <p className={cn(
                "text-2xl font-display font-bold",
                passed ? "text-success" : "text-destructive"
              )}>
                {score}%
              </p>
              {!passed && (
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum required: {MINIMUM_PASSING_SCORE}%
                </p>
              )}
            </div>

            {passed ? (
              <Button onClick={handleClose} className="w-full">
                Continue Learning
              </Button>
            ) : (
              <Button onClick={handleRetry} variant="outline" className="w-full">
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
