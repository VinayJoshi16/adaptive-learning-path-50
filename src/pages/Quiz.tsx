import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScoreGauge } from '@/components/ui/score-gauge';
import { useLearning } from '@/contexts/LearningContext';
import { getQuestionsByModuleId, QuizQuestion } from '@/lib/content-data';
import { getRuleBasedRecommendation, getMLBasedRecommendation } from '@/lib/recommendation-engine';
import { addSession } from '@/lib/session-store';
import { cn } from '@/lib/utils';
import { 
  ClipboardList, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  RotateCcw,
  Sparkles,
  Settings2,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export default function Quiz() {
  const navigate = useNavigate();
  const { 
    state, 
    setQuizScore, 
    setRecommendation, 
    setRecommendationEngine,
    resetSession 
  } = useLearning();

  const questions = useMemo(() => {
    if (!state.currentModule) return [];
    return getQuestionsByModuleId(state.currentModule.id);
  }, [state.currentModule]);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctOption) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const handleSubmit = () => {
    const score = calculateScore();
    setQuizScore(score);
    
    // Get recommendation based on selected engine
    const currentLevel = state.currentModule?.level || 'beginner';
    const recommendation = state.recommendationEngine === 'ml'
      ? getMLBasedRecommendation(state.engagementScore, score, currentLevel)
      : getRuleBasedRecommendation(state.engagementScore, score, currentLevel);
    
    setRecommendation(recommendation);

    // Save session
    addSession({
      studentId: state.studentId,
      moduleId: state.currentModule?.id || '',
      moduleTitle: state.currentModule?.title || '',
      engagementScore: state.engagementScore,
      quizScore: score,
      recommendation: recommendation.type,
    });

    setSubmitted(true);
  };

  const handleRestart = () => {
    resetSession();
    navigate('/learn');
  };

  if (!state.currentModule) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center py-20">
            <ClipboardList className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              No Module Selected
            </h2>
            <p className="text-muted-foreground mb-6">
              Please complete a learning module first before taking the quiz.
            </p>
            <Button asChild variant="hero" size="lg">
              <a href="/learn">Go to Learning</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {!submitted ? (
            // Quiz Form
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  <ClipboardList className="w-4 h-4" />
                  Knowledge Check
                </div>
                <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                  Quiz: {state.currentModule.title}
                </h1>
                <p className="text-muted-foreground">
                  Answer all questions to receive your personalized recommendation.
                </p>
              </div>

              {/* Engine Selection */}
              <div className="bg-card rounded-xl border border-border shadow-soft p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Settings2 className="w-4 h-4" />
                    <span>Recommendation Engine:</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={state.recommendationEngine === 'rules' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setRecommendationEngine('rules')}
                    >
                      Rule-Based
                    </Button>
                    <Button
                      variant={state.recommendationEngine === 'ml' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setRecommendationEngine('ml')}
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      ML Model
                    </Button>
                  </div>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-6">
                {questions.map((question, index) => (
                  <div 
                    key={question.id}
                    className="bg-card rounded-xl border border-border shadow-soft p-6"
                  >
                    <div className="flex items-start gap-4">
                      <span className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center font-display font-bold text-primary-foreground text-sm flex-shrink-0">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground mb-4">
                          {question.question}
                        </h3>
                        <RadioGroup
                          value={answers[question.id] || ''}
                          onValueChange={(value) => handleAnswerChange(question.id, value)}
                        >
                          {(['a', 'b', 'c', 'd'] as const).map(option => (
                            <div 
                              key={option}
                              className={cn(
                                "flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer",
                                answers[question.id] === option
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50 hover:bg-muted/50"
                              )}
                              onClick={() => handleAnswerChange(question.id, option)}
                            >
                              <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                              <Label 
                                htmlFor={`${question.id}-${option}`}
                                className="flex-1 cursor-pointer text-sm"
                              >
                                <span className="font-medium uppercase mr-2">{option}.</span>
                                {question.options[option]}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="mt-8 flex justify-center">
                <Button
                  variant="hero"
                  size="xl"
                  onClick={handleSubmit}
                  disabled={Object.keys(answers).length < questions.length}
                  className="flex items-center gap-2"
                >
                  Submit Quiz
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ) : (
            // Results View
            <div className="animate-scale-in">
              <div className="text-center mb-8">
                <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                  Session Complete!
                </h1>
                <p className="text-muted-foreground">
                  Here are your results and personalized recommendation.
                </p>
              </div>

              {/* Scores */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-card rounded-xl border border-border shadow-soft p-6 flex flex-col items-center">
                  <ScoreGauge 
                    score={state.engagementScore} 
                    label="Engagement Score"
                    size="lg"
                  />
                </div>
                <div className="bg-card rounded-xl border border-border shadow-soft p-6 flex flex-col items-center">
                  <ScoreGauge 
                    score={state.quizScore} 
                    label="Quiz Score"
                    size="lg"
                  />
                </div>
              </div>

              {/* Answers Review */}
              <div className="bg-card rounded-xl border border-border shadow-soft p-6 mb-8">
                <h3 className="font-display font-semibold text-lg text-foreground mb-4">
                  Answer Review
                </h3>
                <div className="space-y-3">
                  {questions.map((question, index) => {
                    const isCorrect = answers[question.id] === question.correctOption;
                    return (
                      <div 
                        key={question.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg",
                          isCorrect ? "bg-success/10" : "bg-destructive/10"
                        )}
                      >
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                        )}
                        <span className="text-sm font-medium">Q{index + 1}</span>
                        <span className="text-sm text-muted-foreground flex-1 truncate">
                          {question.question}
                        </span>
                        {!isCorrect && (
                          <span className="text-xs text-muted-foreground">
                            Correct: {question.correctOption.toUpperCase()}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recommendation */}
              {state.recommendation && (
                <div className={cn(
                  "rounded-xl border-2 shadow-elevated p-6 mb-8",
                  state.recommendation.type === 'advanced' && "border-success bg-success/5",
                  state.recommendation.type === 'repeat' && "border-warning bg-warning/5",
                  state.recommendation.type === 'remedial' && "border-destructive bg-destructive/5"
                )}>
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                      state.recommendation.type === 'advanced' && "bg-success text-success-foreground",
                      state.recommendation.type === 'repeat' && "bg-warning text-warning-foreground",
                      state.recommendation.type === 'remedial' && "bg-destructive text-destructive-foreground"
                    )}>
                      {state.recommendation.type === 'advanced' && <TrendingUp className="w-6 h-6" />}
                      {state.recommendation.type === 'repeat' && <Minus className="w-6 h-6" />}
                      {state.recommendation.type === 'remedial' && <TrendingDown className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-display font-semibold text-lg text-foreground">
                          Recommendation: {state.recommendation.type.charAt(0).toUpperCase() + state.recommendation.type.slice(1)} Content
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {state.recommendationEngine === 'ml' ? 'ML Model' : 'Rule-Based'}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {state.recommendation.message}
                      </p>
                      <p className="text-sm font-medium mt-2">
                        Suggested next level: <span className="capitalize">{state.recommendation.nextModuleLevel}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  variant="hero" 
                  size="lg"
                  onClick={handleRestart}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Start New Session
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate('/dashboard')}
                >
                  View Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
