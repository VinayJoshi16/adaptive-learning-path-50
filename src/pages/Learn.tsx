import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ModuleCard } from '@/components/ui/module-card';
import { ScoreGauge } from '@/components/ui/score-gauge';
import { FaceLandmarkOverlay } from '@/components/FaceLandmarkOverlay';
import { modules } from '@/lib/content-data';
import { useLearning } from '@/contexts/LearningContext';
import { useEngagementTracker } from '@/hooks/use-engagement-tracker';
import { 
  BookOpen, 
  Play, 
  Square, 
  Eye, 
  EyeOff,
  Camera,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Learn() {
  const navigate = useNavigate();
  const { state, selectModule, startLearning, finishLearning } = useLearning();
  const { 
    state: engagementState, 
    videoRef, 
    canvasRef, 
    startTracking, 
    stopTracking 
  } = useEngagementTracker();

  const [showWebcam, setShowWebcam] = useState(false);

  const handleModuleSelect = (moduleId: string) => {
    selectModule(moduleId);
  };

  const handleStartLearning = async () => {
    startLearning();
    await startTracking();
    setShowWebcam(true);
  };

  const handleFinishLearning = () => {
    const finalScore = stopTracking();
    finishLearning(finalScore);
    setShowWebcam(false);
    navigate('/quiz');
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {!state.isLearning ? (
          // Module Selection View
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
                Select a learning module based on your current level. Your engagement will be tracked 
                during the session to provide personalized recommendations.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {modules.map(module => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  onSelect={handleModuleSelect}
                  selected={state.currentModule?.id === module.id}
                />
              ))}
            </div>

            {state.currentModule && (
              <div className="flex justify-center animate-scale-in">
                <Button 
                  variant="hero" 
                  size="xl" 
                  onClick={handleStartLearning}
                  className="flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Start Learning Session
                </Button>
              </div>
            )}
          </div>
        ) : (
          // Active Learning View
          <div className="animate-fade-in">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content Area */}
              <div className="lg:col-span-2">
                <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
                  {/* Module Header */}
                  <div className="gradient-primary p-6">
                    <h1 className="font-display text-2xl font-bold text-primary-foreground mb-2">
                      {state.currentModule?.title}
                    </h1>
                    <p className="text-primary-foreground/80 text-sm">
                      {state.currentModule?.description}
                    </p>
                  </div>

                  {/* Module Content */}
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
                              {paragraph.split('\n').map((item, i) => (
                                <li key={i}>{item.replace(/^- /, '')}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-muted-foreground leading-relaxed">
                              {paragraph}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Bar */}
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
                    >
                      <Square className="w-4 h-4" />
                      Finish & Take Quiz
                    </Button>
                  </div>
                </div>
              </div>

              {/* Engagement Sidebar */}
              <div className="space-y-6">
                {/* Webcam Feed with Overlay */}
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
                  
                  {/* Hidden video element for processing */}
                  <video 
                    ref={videoRef} 
                    width={320} 
                    height={240} 
                    muted 
                    playsInline
                    className="hidden"
                  />
                  <canvas ref={canvasRef} width={320} height={240} className="hidden" />
                  
                  {/* Visual overlay */}
                  <FaceLandmarkOverlay
                    videoRef={videoRef}
                    isTracking={engagementState.isTracking}
                    faceDetected={engagementState.faceDetected}
                    attentionState={engagementState.attentionState}
                    className="w-full"
                  />
                </div>

                {/* Engagement Score Card */}
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
                    />
                  </div>

                  {/* Status Indicators */}
                  <div className="space-y-3">
                    <div className={cn(
                      "flex items-center justify-between p-3 rounded-lg transition-colors",
                      engagementState.faceDetected 
                        ? "bg-success/10 text-success" 
                        : "bg-destructive/10 text-destructive"
                    )}>
                      <div className="flex items-center gap-2">
                        {engagementState.faceDetected ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <AlertCircle className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium">Face Detection</span>
                      </div>
                      <span className="text-xs">
                        {engagementState.faceDetected ? 'Detected' : 'Not Found'}
                      </span>
                    </div>

                    <div className={cn(
                      "flex items-center justify-between p-3 rounded-lg transition-colors",
                      engagementState.attentionState === 'attentive'
                        ? "bg-success/10 text-success"
                        : engagementState.attentionState === 'distracted'
                        ? "bg-warning/10 text-warning"
                        : "bg-muted text-muted-foreground"
                    )}>
                      <div className="flex items-center gap-2">
                        {engagementState.attentionState === 'attentive' ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium">Attention</span>
                      </div>
                      <span className="text-xs capitalize">
                        {engagementState.attentionState}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tips Card */}
                <div className="bg-card rounded-xl border border-border shadow-soft p-6">
                  <h3 className="font-display font-semibold text-foreground mb-3">
                    Tips for Better Engagement
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <span>Keep your face visible to the camera</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <span>Ensure good lighting on your face</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <span>Stay focused on the content</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
