import { useEffect, useRef, useState } from 'react';
import { useVideoTracking } from '@/hooks/use-video-tracking';
import { Video, Play, Pause, RotateCcw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  videoUrl: string;
  moduleId: string;
  title: string;
  className?: string;
}

export function VideoPlayer({ videoUrl, moduleId, title, className }: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isYouTube] = useState(videoUrl.includes('youtube'));
  
  const {
    state,
    handleTimeUpdate,
    handleDurationChange,
    handlePlay,
    handlePause,
    handleEnded,
  } = useVideoTracking(moduleId);

  // For YouTube embeds, we use postMessage API
  useEffect(() => {
    if (!isYouTube) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube.com') return;
      
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'onStateChange') {
          if (data.info === 1) handlePlay();
          else if (data.info === 2) handlePause();
          else if (data.info === 0) handleEnded();
        }
        if (data.event === 'infoDelivery' && data.info) {
          if (data.info.currentTime !== undefined) {
            handleTimeUpdate(data.info.currentTime);
          }
          if (data.info.duration !== undefined) {
            handleDurationChange(data.info.duration);
          }
        }
      } catch {
        // Not a JSON message, ignore
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isYouTube, handleTimeUpdate, handleDurationChange, handlePlay, handlePause, handleEnded]);

  // Enable YouTube API by appending enablejsapi=1
  const getEmbedUrl = () => {
    const url = new URL(videoUrl);
    url.searchParams.set('enablejsapi', '1');
    url.searchParams.set('origin', window.location.origin);
    return url.toString();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-lg text-foreground">Video Lecture</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {state.isPlaying ? (
            <Pause className="w-4 h-4 text-primary animate-pulse" />
          ) : state.watchPercentage > 0 ? (
            <Play className="w-4 h-4" />
          ) : null}
          <span>{formatTime(state.watchDuration)} watched</span>
        </div>
      </div>
      
      <div className="aspect-video rounded-lg overflow-hidden bg-muted">
        <iframe
          ref={iframeRef}
          src={getEmbedUrl()}
          title={`${title} Video`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Watch Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Watch Progress</span>
          <span className={cn(
            "font-medium",
            state.watchPercentage >= 90 ? "text-success" :
            state.watchPercentage >= 50 ? "text-warning" :
            "text-muted-foreground"
          )}>
            {state.watchPercentage}%
          </span>
        </div>
        <Progress 
          value={state.watchPercentage} 
          className="h-2"
        />
        {state.watchPercentage >= 90 && (
          <p className="text-xs text-success flex items-center gap-1">
            <RotateCcw className="w-3 h-3" />
            Video completed!
          </p>
        )}
      </div>
    </div>
  );
}
