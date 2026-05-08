import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ModuleCard } from '@/components/ui/module-card';
import { ScoreGauge } from '@/components/ui/score-gauge';
import { FaceLandmarkOverlay } from '@/components/FaceLandmarkOverlay';
import { EngagementIntervention } from '@/components/EngagementIntervention';
import { modules, codingModules, getModuleByOrder, type Module } from '@/lib/content-data';
import { PASSING_SCORE } from '@/lib/recommendation-engine';
import { useLearning } from '@/contexts/LearningContext';
import { useModuleProgress } from '@/contexts/ModuleProgressContext';
import { useEngagementTracker } from '@/hooks/use-engagement-tracker';
import { useEngagementIntervention } from '@/hooks/use-engagement-intervention';
import { 
  BookOpen, Play, Square, Eye, EyeOff, Camera, AlertCircle, CheckCircle, Loader2, Lock, ChevronLeft, List, PauseCircle, VideoIcon
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useRef } from 'react';

interface Subpart {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  order: number;
  quizQuestions: any[];
  codingQuestions: any[];
  videoUrl?: string;
  youtubeUrl?: string;
}

/** Extract YouTube video ID from various URL formats */
function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
  return m ? m[1] : null;
}

const ATTENTION_THRESHOLD = 65;

export default function Learn() {
  const navigate = useNavigate();
  const { state, selectModule, startLearning, finishLearning, grantQuizAccess } = useLearning();
  const { progress, getModuleProgress } = useModuleProgress();
  const [adminModules, setAdminModules] = useState<Module[]>([]);

  useEffect(() => {
    const API = import.meta.env.VITE_API_URL || '/api';
    fetch(`${API}/admin/modules/public`)
      .then(r => r.json())
      .then(d => setAdminModules(d.modules || []))
      .catch(() => {});
  }, []);

  // Merge admin-created modules into the correct category
  const allGeneralModules = useMemo(() => {
    const adminGeneral = adminModules.filter(m => (m as any).contentType === 'general').map((m, i) => ({ ...m, order: modules.length + i + 1 }));
    return [...modules, ...adminGeneral];
  }, [adminModules]);

  // Subpart state
  const [subparts, setSubparts] = useState<Subpart[]>([]);
  const [activeSubpart, setActiveSubpart] = useState<Subpart | null>(null);
  const [showSubpartView, setShowSubpartView] = useState(false);
  const [subpartProgress, setSubpartProgress] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem('subpart_progress') || '{}'); } catch { return {}; }
  });

  const saveSubpartProgress = useCallback((id: string) => {
    setSubpartProgress(prev => {
      const next = { ...prev, [id]: true };
      localStorage.setItem('subpart_progress', JSON.stringify(next));
      return next;
    });
  }, []);

  const fetchSubparts = useCallback(async (moduleId: string) => {
    const API = import.meta.env.VITE_API_URL || '/api';
    try {
      const r = await fetch(`${API}/admin/subparts/public/${moduleId}`);
      const d = await r.json();
      return d.subparts || [];
    } catch { return []; }
  }, []);

  const allCodingModules = useMemo(() => {
    const adminCoding = adminModules.filter(m => (m as any).contentType === 'coding').map((m, i) => ({ ...m, order: codingModules.length + i + 1 }));
    return [...codingModules, ...adminCoding];
  }, [adminModules]);
  const { 
    state: engagementState, videoRef, canvasRef, startTracking, stopTracking 
  } = useEngagementTracker();

  const moduleTopics = useMemo(() => state.currentModule?.topics || [], [state.currentModule]);
  
  const { 
    showIntervention, 
    interventionQuestions, 
    closeIntervention, 
    handleInterventionComplete,
    faceVerified,
    isLearningBlocked,
    interventionCompleted
  } = useEngagementIntervention(
    engagementState.currentScore,
    engagementState.isTracking,
    moduleTopics,
    engagementState.faceDetected
  );

  const isModuleUnlocked = (moduleOrder: number, isCoding: boolean = false): boolean => {
    if (moduleOrder === 1) return true;
    const prevModule = getModuleByOrder(moduleOrder - 1, isCoding);
    if (!prevModule) return true;
    const prevProgress = getModuleProgress(prevModule.id);
    return prevProgress?.passed ?? false;
  };

  const handleModuleSelect = async (moduleId: string) => {
    const module = allGeneralModules.find(m => m.id === moduleId) || allCodingModules.find(m => m.id === moduleId);
    const isCoding = allCodingModules.some(m => m.id === moduleId);
    const isAdmin = adminModules.some(m => m.id === moduleId);
    if (module && (isAdmin || isModuleUnlocked(module.order, isCoding))) {
      if (isAdmin) {
        // Check for subparts
        const subs = await fetchSubparts(moduleId);
        if (subs.length > 0) {
          setSubparts(subs);
          setActiveSubpart(null);
          setShowSubpartView(true);
          selectModule(module);
          return;
        }
        selectModule(module);
      } else {
        selectModule(moduleId);
      }
    }
  };

  const handleSubpartSelect = (subpart: Subpart) => {
    setActiveSubpart(subpart);
    // Store subpart quiz questions for Quiz page to pick up
    if (subpart.quizQuestions && subpart.quizQuestions.length > 0) {
      localStorage.setItem('active_subpart_quiz', JSON.stringify(subpart.quizQuestions));
    } else {
      localStorage.removeItem('active_subpart_quiz');
    }
    localStorage.setItem('active_subpart_id', subpart.id);
    // Override currentModule content with subpart content (including videos)
    if (state.currentModule) {
      selectModule({
        ...state.currentModule,
        title: `${state.currentModule.title} — ${subpart.title}`,
        content: subpart.content,
        topics: [subpart.title],
        videoUrl: subpart.videoUrl || '',
        youtubeUrl: subpart.youtubeUrl || '',
      } as Module);
    }
    setShowSubpartView(false);
  };

  const isSubpartUnlocked = (subpart: Subpart, index: number) => {
    if (index === 0) return true;
    // Previous subpart must be completed
    const prev = subparts[index - 1];
    return prev ? !!subpartProgress[prev.id] : true;
  };

  const handleBackToSubparts = () => {
    setShowSubpartView(true);
    setActiveSubpart(null);
  };

  const handleStartLearning = async () => {
    startLearning();
    await startTracking();
  };

  const handleFinishLearning = () => {
    const finalScore = stopTracking();
    finishLearning(finalScore);
    // Mark subpart as completed if we were in a subpart
    if (activeSubpart) {
      saveSubpartProgress(activeSubpart.id);
    }
    grantQuizAccess();
    navigate('/quiz');
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {!state.isLearning ? (
          <div className="animate-fade-in">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <BookOpen className="w-4 h-4" />
                Select Your Module
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Choose What to Learn
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Complete modules in order. You must score at least {PASSING_SCORE}% to unlock the next module.
              </p>
            </div>

            <Tabs defaultValue="general" className="w-full mb-8">
              <div className="flex justify-center mb-8">
                <TabsList className="grid w-[400px] grid-cols-2">
                  <TabsTrigger value="general">General Learning</TabsTrigger>
                  <TabsTrigger value="coding">Coding Modules</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="general">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allGeneralModules.map(module => {
                    const unlocked = isModuleUnlocked(module.order);
                    const isAdmin = adminModules.some(m => m.id === module.id);
                    const moduleProgress = getModuleProgress(module.id);
                    
                    return (
                      <div key={module.id} className="relative">
                        {!unlocked && !isAdmin && (
                          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 rounded-xl flex flex-col items-center justify-center gap-2">
                            <Lock className="w-8 h-8 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground text-center px-4">
                              Pass the previous quiz to unlock
                            </p>
                          </div>
                        )}
                        <ModuleCard
                          module={module}
                          onSelect={handleModuleSelect}
                          selected={state.currentModule?.id === module.id}
                          completed={moduleProgress?.passed}
                          bestScore={moduleProgress?.bestScore}
                        />
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="coding">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allCodingModules.map(module => {
                    const unlocked = isModuleUnlocked(module.order, true); 
                    const isAdmin = adminModules.some(m => m.id === module.id);
                    const moduleProgress = getModuleProgress(module.id);
                    
                    return (
                      <div key={module.id} className="relative">
                        {!unlocked && !isAdmin && (
                          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 rounded-xl flex flex-col items-center justify-center gap-2">
                            <Lock className="w-8 h-8 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground text-center px-4">
                              Pass the previous quiz to unlock
                            </p>
                          </div>
                        )}
                        <ModuleCard
                          module={module}
                          onSelect={handleModuleSelect}
                          selected={state.currentModule?.id === module.id}
                          completed={moduleProgress?.passed}
                          bestScore={moduleProgress?.bestScore}
                        />
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
            {/* Subpart / Topic View for admin modules */}
            {showSubpartView && state.currentModule && subparts.length > 0 && (
              <div className="animate-fade-in mt-8">
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => { setShowSubpartView(false); setSubparts([]); }}
                      className="p-2 rounded-lg hover:bg-muted transition-colors">
                      <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground">{state.currentModule.title}</h2>
                      <p className="text-sm text-muted-foreground">{subparts.length} topics • Complete each to unlock the next</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {subparts.map((sub, idx) => {
                      const unlocked = isSubpartUnlocked(sub, idx);
                      const completed = !!subpartProgress[sub.id];
                      return (
                        <div key={sub.id}
                          onClick={() => unlocked && handleSubpartSelect(sub)}
                          className={cn(
                            "relative rounded-xl border p-4 transition-all cursor-pointer",
                            completed ? "border-green-500/30 bg-green-500/5" :
                            unlocked ? "border-border hover:border-primary hover:shadow-md bg-card" :
                            "border-border/50 bg-muted/30 cursor-not-allowed opacity-60"
                          )}>
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0",
                              completed ? "bg-green-500 text-white" :
                              unlocked ? "gradient-primary text-primary-foreground" :
                              "bg-muted text-muted-foreground"
                            )}>
                              {completed ? <CheckCircle className="w-5 h-5" /> : unlocked ? idx + 1 : <Lock className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className={cn("font-medium text-sm", unlocked ? "text-foreground" : "text-muted-foreground")}>{sub.title}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                {(sub.quizQuestions || []).length > 0 && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 font-medium">Quiz</span>
                                )}
                                {(sub.codingQuestions || []).length > 0 && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-500 font-medium">Coding</span>
                                )}
                                {completed && <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-500 font-medium">Completed</span>}
                                {!unlocked && <span className="text-[10px] text-muted-foreground">Pass previous topic to unlock</span>}
                              </div>
                            </div>
                            {unlocked && !completed && <Play className="w-4 h-4 text-primary flex-shrink-0" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Start Learning button (for modules without subparts, or when subpart is selected) */}
            {state.currentModule && !showSubpartView && (
              <div className="flex flex-col items-center gap-3 animate-scale-in mt-6">
                {activeSubpart && (
                  <button onClick={handleBackToSubparts} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Back to topics
                  </button>
                )}
                <Button variant="hero" size="xl" onClick={handleStartLearning} className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Start Learning Session
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 relative">
                {/* ATTENTION BLUR OVERLAY */}
                {engagementState.isTracking && engagementState.modelLoaded && (
                  !engagementState.faceDetected || engagementState.attentionState === 'distracted' || engagementState.currentScore < ATTENTION_THRESHOLD
                ) && (
                  <div className="absolute inset-0 z-30 backdrop-blur-lg bg-background/60 rounded-xl flex flex-col items-center justify-center gap-4 animate-fade-in">
                    <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                      <PauseCircle className="w-10 h-10 text-destructive" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-foreground">Content Paused</h3>
                    <p className="text-sm text-muted-foreground text-center max-w-xs">
                      {!engagementState.faceDetected
                        ? 'Your face is not detected. Please return to the camera frame.'
                        : engagementState.currentScore < ATTENTION_THRESHOLD
                        ? `Your engagement score is ${engagementState.currentScore}% (minimum ${ATTENTION_THRESHOLD}%). Please focus on the screen.`
                        : 'You appear distracted. Please look at the screen to continue.'}
                    </p>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
                      <AlertCircle className="w-4 h-4" />
                      Video & content will resume when attention is restored
                    </div>
                  </div>
                )}
                <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
                  <div className="gradient-primary p-6">
                    <h1 className="font-display text-2xl font-bold text-primary-foreground mb-2">
                      {state.currentModule?.title}
                    </h1>
                    <p className="text-primary-foreground/80 text-sm">{state.currentModule?.description}</p>
                  </div>

                  {/* VIDEO PLAYER SECTION */}
                  {((state.currentModule as any)?.videoUrl || (state.currentModule as any)?.youtubeUrl) && (
                    <div className="border-b border-border p-4">
                      <h3 className="font-display font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                        <VideoIcon className="w-4 h-4 text-primary" /> Video Lecture
                      </h3>
                      {(() => {
                        const ytId = getYouTubeId((state.currentModule as any)?.youtubeUrl || '');
                        const videoUrl = (state.currentModule as any)?.videoUrl || '';
                        const isDistracted = engagementState.isTracking && engagementState.modelLoaded && (
                          !engagementState.faceDetected || engagementState.attentionState === 'distracted' || engagementState.currentScore < ATTENTION_THRESHOLD
                        );
                        if (ytId) {
                          return (
                            <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                              <iframe
                                src={`https://www.youtube.com/embed/${ytId}?autoplay=0&rel=0`}
                                title="Video Lecture"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full"
                              />
                              {isDistracted && <div className="absolute inset-0 bg-black/80 z-10" />}
                            </div>
                          );
                        }
                        if (videoUrl) {
                          return (
                            <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                              <video
                                src={videoUrl}
                                controls
                                className="w-full h-full"
                                id="module-video-player"
                              />
                              {isDistracted && <div className="absolute inset-0 bg-black/80 z-10" />}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}

                  <div className="p-6">
                    <div className="prose prose-slate max-w-none">
                      {state.currentModule?.content.split('\n\n').map((paragraph, idx) => (
                        <div key={idx} className="mb-4">
                          {paragraph.startsWith('**') ? (
                            <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                              {paragraph.replace(/\*\*/g, '')}
                            </h3>
                          ) : paragraph.startsWith('-') ? (
                            <ul className="list-disc list-inside text-muted-foreground space-y-1">
                              {paragraph.split('\n').map((item, i) => <li key={i}>{item.replace(/^- /, '')}</li>)}
                            </ul>
                          ) : (
                            <p className="text-muted-foreground leading-relaxed">{paragraph}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-border p-6 flex justify-between items-center bg-muted/30">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Camera className="w-4 h-4" />
                      <span>Engagement tracking active</span>
                    </div>
                    <Button 
                      variant="accent" 
                      size="lg" 
                      onClick={handleFinishLearning} 
                      className="flex items-center gap-2"
                      disabled={isLearningBlocked}
                    >
                      <Square className="w-4 h-4" />
                      {isLearningBlocked ? 'Complete Quiz First' : 'Finish & Take Quiz'}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-card rounded-xl border border-border shadow-soft p-4">
                  <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-primary" />
                    Live Camera Feed
                  </h3>
                  {!engagementState.modelLoaded && engagementState.isTracking && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground p-4">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading face detection model...
                    </div>
                  )}
                  <video ref={videoRef} width={320} height={240} muted playsInline className="hidden" />
                  <canvas ref={canvasRef} width={320} height={240} className="hidden" />
                  <FaceLandmarkOverlay
                    videoRef={videoRef}
                    isTracking={engagementState.isTracking}
                    faceDetected={engagementState.faceDetected}
                    attentionState={engagementState.attentionState}
                    className="w-full"
                  />
                </div>

                <div className="bg-card rounded-xl border border-border shadow-soft p-6">
                  <h3 className="font-display font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" />
                    Live Engagement
                  </h3>
                  <div className="flex justify-center mb-6">
                    <ScoreGauge 
                      score={engagementState.currentScore} 
                      label="Engagement Score" 
                      size="lg" 
                      animate 
                      threshold={65}
                      showThreshold
                    />
                  </div>
                  {engagementState.currentScore <= 70 && engagementState.currentScore > 65 && faceVerified && (
                    <div className="mb-4 p-3 rounded-lg bg-warning/10 border border-warning/20 text-warning">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <AlertCircle className="w-4 h-4" />
                        <span>Engagement dropping! Stay focused to avoid a quiz popup.</span>
                      </div>
                    </div>
                  )}
                  <div className="space-y-3">
                    <div className={cn(
                      "flex items-center justify-between p-3 rounded-lg transition-colors",
                      engagementState.faceDetected ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    )}>
                      <div className="flex items-center gap-2">
                        {engagementState.faceDetected ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        <span className="text-sm font-medium">Face Detection</span>
                      </div>
                      <span className="text-xs">{engagementState.faceDetected ? 'Detected' : 'Not Found'}</span>
                    </div>
                    <div className={cn(
                      "flex items-center justify-between p-3 rounded-lg transition-colors",
                      faceVerified ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                    )}>
                      <div className="flex items-center gap-2">
                        {faceVerified ? <CheckCircle className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                        <span className="text-sm font-medium">Face Verified</span>
                      </div>
                      <span className="text-xs">{faceVerified ? 'Verified' : 'Verifying...'}</span>
                    </div>
                    <div className={cn(
                      "flex items-center justify-between p-3 rounded-lg transition-colors",
                      engagementState.attentionState === 'attentive' ? "bg-success/10 text-success" :
                      engagementState.attentionState === 'distracted' ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
                    )}>
                      <div className="flex items-center gap-2">
                        {engagementState.attentionState === 'attentive' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        <span className="text-sm font-medium">Attention</span>
                      </div>
                      <span className="text-xs capitalize">{engagementState.attentionState}</span>
                    </div>
                    {isLearningBlocked && (
                      <div className="p-3 rounded-lg bg-destructive/10 text-destructive">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Complete the intervention quiz to continue</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <EngagementIntervention
        open={showIntervention}
        onClose={closeIntervention}
        questions={interventionQuestions}
        onComplete={handleInterventionComplete}
      />
    </div>
  );
}
