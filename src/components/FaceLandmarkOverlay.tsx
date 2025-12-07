import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface FaceLandmarkOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isTracking: boolean;
  faceDetected: boolean;
  attentionState: 'attentive' | 'distracted' | 'unknown';
  className?: string;
}

export function FaceLandmarkOverlay({
  videoRef,
  isTracking,
  faceDetected,
  attentionState,
  className,
}: FaceLandmarkOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isTracking || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const drawFrame = () => {
      if (!video || video.readyState < 2) {
        animationId = requestAnimationFrame(drawFrame);
        return;
      }

      // Set canvas size to match video
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;

      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Draw overlay based on attention state
      if (faceDetected) {
        // Draw face detection indicator
        const borderColor = attentionState === 'attentive' 
          ? 'rgba(34, 197, 94, 0.8)' // green
          : 'rgba(234, 179, 8, 0.8)'; // yellow
        
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 4;
        ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

        // Draw status label
        ctx.fillStyle = borderColor;
        ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          attentionState === 'attentive' ? '👁 FOCUSED' : '⚠ LOOK AT SCREEN',
          canvas.width / 2,
          canvas.height - 10
        );

        // Draw crosshair at center when attentive
        if (attentionState === 'attentive') {
          const cx = canvas.width / 2;
          const cy = canvas.height / 2 - 20;
          
          ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cx - 20, cy);
          ctx.lineTo(cx + 20, cy);
          ctx.moveTo(cx, cy - 20);
          ctx.lineTo(cx, cy + 20);
          ctx.stroke();

          // Draw circle around center
          ctx.beginPath();
          ctx.arc(cx, cy, 40, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else {
        // No face detected
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
        ctx.lineWidth = 4;
        ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

        ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
        ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('❌ NO FACE DETECTED', canvas.width / 2, canvas.height - 10);
      }

      animationId = requestAnimationFrame(drawFrame);
    };

    drawFrame();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isTracking, faceDetected, attentionState, videoRef]);

  if (!isTracking) return null;

  return (
    <div className={cn("relative rounded-lg overflow-hidden border border-border", className)}>
      <canvas
        ref={canvasRef}
        className="w-full h-auto"
        style={{ maxWidth: '320px' }}
      />
      <div className="absolute top-2 left-2 flex items-center gap-2">
        <div className={cn(
          "w-2 h-2 rounded-full animate-pulse",
          faceDetected ? "bg-success" : "bg-destructive"
        )} />
        <span className="text-xs font-medium text-primary-foreground bg-foreground/60 px-2 py-0.5 rounded">
          LIVE
        </span>
      </div>
    </div>
  );
}
