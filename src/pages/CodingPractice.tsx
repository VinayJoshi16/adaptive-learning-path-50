import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { CodeEditor } from '@/components/coding/CodeEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { codingQuestions, getUniqueTopics, STARTER_TEMPLATES, type CodingQuestion } from '@/lib/coding-questions';
import { useEngagementTracker } from '@/hooks/use-engagement-tracker';
import { FaceLandmarkOverlay } from '@/components/FaceLandmarkOverlay';
import { ScoreGauge } from '@/components/ui/score-gauge';
import {
  Terminal, Search, Filter, BookOpen, CheckCircle, Circle, ChevronLeft,
  Camera, AlertCircle, PauseCircle, Loader2, Shield, Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'] as const;
const LANGUAGES = ['All', 'python', 'javascript', 'java', 'cpp', 'c'] as const;
const LANG_LABELS: Record<string, string> = { python: 'Python', javascript: 'JavaScript', java: 'Java', cpp: 'C++', c: 'C' };
const DIFF_COLORS: Record<string, string> = {
  Easy: 'bg-emerald-500/10 text-emerald-500',
  Medium: 'bg-amber-500/10 text-amber-500',
  Hard: 'bg-red-500/10 text-red-500',
};

export default function CodingPractice() {
  // Question library state
  const [selectedQuestion, setSelectedQuestion] = useState<CodingQuestion | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('All');
  const [filterTopic, setFilterTopic] = useState<string>('All');
  const [filterLang, setFilterLang] = useState<string>('All');
  const [solvedIds, setSolvedIds] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('solved_questions') || '[]')); } catch { return new Set(); }
  });

  // Security state
  const [violations, setViolations] = useState(0);
  const [securityActive, setSecurityActive] = useState(false);
  const MAX_VIOLATIONS = 5;

  // Engagement
  const { state: engState, videoRef, canvasRef, startTracking, stopTracking } = useEngagementTracker();

  const topics = useMemo(() => ['All', ...getUniqueTopics()], []);

  const filtered = useMemo(() => {
    return codingQuestions.filter(q => {
      if (filterDifficulty !== 'All' && q.difficulty !== filterDifficulty) return false;
      if (filterTopic !== 'All' && q.topic !== filterTopic) return false;
      if (filterLang !== 'All' && !q.languages.includes(filterLang)) return false;
      if (searchQuery) {
        const s = searchQuery.toLowerCase();
        return q.title.toLowerCase().includes(s) || q.tags.some(t => t.toLowerCase().includes(s)) || q.topic.toLowerCase().includes(s);
      }
      return true;
    });
  }, [filterDifficulty, filterTopic, filterLang, searchQuery]);

  const markSolved = useCallback((id: string) => {
    setSolvedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem('solved_questions', JSON.stringify([...next]));
      return next;
    });
  }, []);

  // Ref to avoid re-registering security listeners when stopTracking identity changes
  const stopTrackingRef = useRef(stopTracking);
  stopTrackingRef.current = stopTracking;

  // Security: detect tab switch, copy-paste, minimize
  useEffect(() => {
    if (!securityActive) return;

    let lastViolationTime = 0;
    const DEBOUNCE_MS = 2000; // prevent rapid-fire violations

    const addViolation = (reason: string) => {
      const now = Date.now();
      if (now - lastViolationTime < DEBOUNCE_MS) return;
      lastViolationTime = now;

      setViolations(v => {
        const n = v + 1;
        toast.error(`⚠️ ${reason} — Violation ${n}/${MAX_VIOLATIONS}`);
        // Log to localStorage
        const logs = JSON.parse(localStorage.getItem('violation_log') || '[]');
        logs.push({ reason, time: new Date().toISOString(), count: n });
        localStorage.setItem('violation_log', JSON.stringify(logs));
        if (n >= MAX_VIOLATIONS) {
          toast.error('Maximum violations reached. Session auto-submitted.');
          setTimeout(() => {
            setSelectedQuestion(null);
            setSecurityActive(false);
            stopTrackingRef.current();
          }, 500);
        }
        return n;
      });
    };

    const onVisibility = () => {
      if (document.hidden) addViolation('Tab switch detected');
    };

    const onCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      addViolation('Copy/Paste blocked');
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12') {
        e.preventDefault();
        addViolation('DevTools shortcut blocked');
      }
      if (e.ctrlKey && ['u'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        addViolation('View source blocked');
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('copy', onCopy);
    document.addEventListener('paste', onCopy);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('paste', onCopy);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [securityActive]);

  const handleAutoSubmit = () => {
    toast.error('Coding session auto-submitted due to violations.');
    setSelectedQuestion(null);
    setSecurityActive(false);
    stopTracking();
  };

  const handleSelectQuestion = async (q: CodingQuestion) => {
    setSelectedQuestion(q);
    setSecurityActive(true);
    setViolations(0);
    await startTracking();
  };

  const handleBackToLibrary = () => {
    setSelectedQuestion(null);
    setSecurityActive(false);
    stopTracking();
  };

  const handleSubmit = (code: string, language: string) => {
    if (selectedQuestion) {
      markSolved(selectedQuestion.id);
      toast.success('Code submitted successfully! ✅');
    }
  };

  const handleRun = (output: string, passed: boolean) => {
    if (passed) toast.success('Code ran successfully!');
    else toast.error('Execution error.');
  };

  const isDistracted = engState.isTracking && engState.modelLoaded && (
    !engState.faceDetected || engState.attentionState === 'distracted' || engState.currentScore < 65
  );

  // ───────────── QUESTION DETAIL VIEW ─────────────
  if (selectedQuestion) {
    return (
      <div className="min-h-screen py-6">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <button onClick={handleBackToLibrary} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-xl font-bold text-foreground">{selectedQuestion.title}</h1>
                <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', DIFF_COLORS[selectedQuestion.difficulty])}>{selectedQuestion.difficulty}</span>
                {selectedQuestion.tags.map(t => (
                  <span key={t} className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground">{t}</span>
                ))}
              </div>
            </div>
            {/* Security badge */}
            <div className="flex items-center gap-2">
              <div className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium', violations > 0 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500')}>
                <Shield className="w-3.5 h-3.5" />
                {violations}/{MAX_VIOLATIONS} violations
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-4 h-[calc(100vh-10rem)]">
            {/* Problem + Camera col */}
            <div className="flex flex-col gap-4 overflow-y-auto">
              <Card className="shadow-soft flex-1">
                <CardHeader className="bg-muted/30 border-b border-border py-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <CardTitle className="text-sm">Problem</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 text-sm space-y-4">
                  <p className="text-muted-foreground leading-relaxed">{selectedQuestion.description}</p>
                  <div>
                    <h4 className="font-semibold text-foreground text-xs mb-1">Example</h4>
                    <pre className="text-xs bg-muted/50 rounded-lg p-3 whitespace-pre-wrap text-muted-foreground">{selectedQuestion.examples}</pre>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-xs mb-1">Constraints</h4>
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{selectedQuestion.constraints}</pre>
                  </div>
                </CardContent>
              </Card>

              {/* Camera Feed */}
              <Card className="shadow-soft">
                <CardHeader className="py-2 px-3 border-b border-border">
                  <div className="flex items-center gap-2 text-xs">
                    <Camera className="w-3.5 h-3.5 text-primary" />
                    <span className="font-medium">Proctoring</span>
                    <span className={cn('ml-auto px-1.5 py-0.5 rounded text-[10px] font-medium', engState.faceDetected ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500')}>
                      {engState.faceDetected ? 'Face OK' : 'No Face'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-2">
                  {!engState.modelLoaded && engState.isTracking && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground p-2">
                      <Loader2 className="w-3 h-3 animate-spin" /> Loading...
                    </div>
                  )}
                  <video ref={videoRef} width={320} height={240} muted playsInline className="hidden" />
                  <canvas ref={canvasRef} width={320} height={240} className="hidden" />
                  <FaceLandmarkOverlay videoRef={videoRef} isTracking={engState.isTracking} faceDetected={engState.faceDetected} attentionState={engState.attentionState} className="w-full rounded-lg" />
                  <div className="mt-2">
                    <ScoreGauge score={engState.currentScore} minScore={65} label="Engagement" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Code Editor */}
            <div className="lg:col-span-3 relative">
              {/* Distraction overlay */}
              {isDistracted && (
                <div className="absolute inset-0 z-30 backdrop-blur-lg bg-background/60 rounded-xl flex flex-col items-center justify-center gap-4 animate-fade-in">
                  <PauseCircle className="w-12 h-12 text-destructive" />
                  <h3 className="font-display text-lg font-bold">Coding Paused</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-xs">
                    {!engState.faceDetected ? 'Face not detected. Return to camera frame.' : 'Please focus on the screen to continue coding.'}
                  </p>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> Editor will resume when attention is restored
                  </div>
                </div>
              )}
              <CodeEditor
                initialCode={selectedQuestion.starterCode[selectedQuestion.languages[0]] || STARTER_TEMPLATES[selectedQuestion.languages[0]] || ''}
                defaultLanguage={selectedQuestion.languages[0]}
                onRun={handleRun}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ───────────── QUESTION LIBRARY VIEW ─────────────
  const solvedCount = codingQuestions.filter(q => solvedIds.has(q.id)).length;

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Question Library</h1>
              <p className="text-muted-foreground text-sm">Solve coding challenges across difficulty levels and topics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              {solvedCount}/{codingQuestions.length} Solved
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" style={{ width: `${(solvedCount / codingQuestions.length) * 100}%` }} />
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search questions, tags, topics..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <select value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)} className="rounded-lg border border-border bg-card text-foreground text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40">
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d === 'All' ? '🎯 All Levels' : d}</option>)}
          </select>
          <select value={filterTopic} onChange={e => setFilterTopic(e.target.value)} className="rounded-lg border border-border bg-card text-foreground text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40">
            {topics.map(t => <option key={t} value={t}>{t === 'All' ? '📂 All Topics' : t}</option>)}
          </select>
          <select value={filterLang} onChange={e => setFilterLang(e.target.value)} className="rounded-lg border border-border bg-card text-foreground text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40">
            {LANGUAGES.map(l => <option key={l} value={l}>{l === 'All' ? '💻 All Languages' : LANG_LABELS[l] || l}</option>)}
          </select>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {(['Easy', 'Medium', 'Hard'] as const).map(d => {
            const total = codingQuestions.filter(q => q.difficulty === d).length;
            const solved = codingQuestions.filter(q => q.difficulty === d && solvedIds.has(q.id)).length;
            return (
              <div key={d} className={cn('rounded-xl border p-3 flex items-center justify-between', DIFF_COLORS[d].replace('text-', 'border-').replace('/10', '/20'), 'bg-card')}>
                <div>
                  <p className={cn('text-xs font-semibold', DIFF_COLORS[d].split(' ')[1])}>{d}</p>
                  <p className="text-lg font-bold text-foreground">{solved}<span className="text-muted-foreground text-sm">/{total}</span></p>
                </div>
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', DIFF_COLORS[d])}>
                  {d === 'Easy' ? '🟢' : d === 'Medium' ? '🟡' : '🔴'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Question List */}
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Filter className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p>No questions match your filters.</p>
            </div>
          )}
          {filtered.map((q, idx) => {
            const solved = solvedIds.has(q.id);
            return (
              <div key={q.id} onClick={() => handleSelectQuestion(q)}
                className={cn(
                  'rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md',
                  solved ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-border bg-card hover:border-primary/40'
                )}>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-muted text-muted-foreground text-sm font-bold">
                    {solved ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-foreground">{q.title}</span>
                      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium', DIFF_COLORS[q.difficulty])}>{q.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] text-muted-foreground">{q.topic}</span>
                      {q.tags.map(t => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {q.languages.slice(0, 3).map(l => (
                      <span key={l} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">{LANG_LABELS[l]}</span>
                    ))}
                    {q.languages.length > 3 && <span className="text-[10px] text-muted-foreground">+{q.languages.length - 3}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
