import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { QuizQuestion } from '@/lib/content-data';
import { cn } from '@/lib/utils';
import { Brain, CheckCircle, XCircle, Sparkles } from 'lucide-react';

interface EngagementInterventionProps {
  open: boolean;
  onClose: () => void;
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
}

export function EngagementIntervention({ 
  open, 
  onClose, 
  questions, 
  onComplete 
}: EngagementInterventionProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctOption) {
        correct++;
      }
    });
    const finalScore = Math.round((correct / questions.length) * 100);
    setScore(finalScore);
    setSubmitted(true);
  };

  const handleClose = () => {
    onComplete(score);
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    onClose();
  };

  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <DialogTitle className="font-display text-xl">
              {submitted ? 'Great job refocusing!' : 'Time to Refocus!'}
            </DialogTitle>
          </div>
          <DialogDescription>
            {submitted 
              ? `You scored ${score}% on the refocus questions.`
              : "We noticed your engagement dropped. Answer these quick questions to help you get back on track!"
            }
          </DialogDescription>
        </DialogHeader>

        {!submitted ? (
          <div className="space-y-6 mt-4">
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

            <div className="p-4 rounded-xl bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground mb-1">
                {score >= 75 
                  ? "You're back on track!" 
                  : score >= 50 
                  ? "Good effort! Keep focusing."
                  : "Review the material more carefully."}
              </p>
              <p className="text-2xl font-display font-bold text-primary">{score}%</p>
            </div>

            <Button onClick={handleClose} className="w-full">
              Continue Learning
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
