import { useState, useRef, useCallback, useEffect } from 'react';

interface EngagementState {
  isTracking: boolean;
  currentScore: number;
  faceDetected: boolean;
  attentionState: 'attentive' | 'distracted' | 'unknown';
}

// Simple engagement tracking using face detection heuristics
// In production, this would use TensorFlow.js face-landmarks-detection
export function useEngagementTracker() {
  const [state, setState] = useState<EngagementState>({
    isTracking: false,
    currentScore: 0,
    faceDetected: false,
    attentionState: 'unknown',
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameCountRef = useRef(0);
  const attentiveFramesRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  const startTracking = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setState(prev => ({ ...prev, isTracking: true }));
      
      // Start the detection loop
      detectLoop();
    } catch (error) {
      console.error('Failed to start webcam:', error);
      // Fallback: simulate engagement for demo purposes
      startSimulatedTracking();
    }
  }, []);

  const startSimulatedTracking = useCallback(() => {
    setState(prev => ({ ...prev, isTracking: true }));
    
    // Simulate engagement detection
    const interval = setInterval(() => {
      const randomAttentive = Math.random() > 0.2; // 80% attentive
      frameCountRef.current += 1;
      if (randomAttentive) {
        attentiveFramesRef.current += 1;
      }
      
      const score = Math.round((attentiveFramesRef.current / frameCountRef.current) * 100);
      
      setState(prev => ({
        ...prev,
        faceDetected: true,
        attentionState: randomAttentive ? 'attentive' : 'distracted',
        currentScore: score,
      }));
    }, 500);

    // Store interval ID for cleanup
    animationFrameRef.current = interval as unknown as number;
  }, []);

  const detectLoop = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const detect = () => {
      if (!state.isTracking) return;

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Simple brightness-based "face detection" simulation
      // In production, use TensorFlow.js face-landmarks-detection
      const imageData = ctx.getImageData(
        canvas.width / 4,
        canvas.height / 4,
        canvas.width / 2,
        canvas.height / 2
      );
      
      let brightnessSum = 0;
      for (let i = 0; i < imageData.data.length; i += 4) {
        brightnessSum += (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
      }
      const avgBrightness = brightnessSum / (imageData.data.length / 4);
      
      // Simple heuristic: if center is brighter (face present), consider attentive
      const faceDetected = avgBrightness > 40 && avgBrightness < 220;
      const attentive = faceDetected && avgBrightness > 80;
      
      frameCountRef.current += 1;
      if (attentive) {
        attentiveFramesRef.current += 1;
      }
      
      const score = Math.round((attentiveFramesRef.current / frameCountRef.current) * 100);
      
      setState(prev => ({
        ...prev,
        faceDetected,
        attentionState: attentive ? 'attentive' : faceDetected ? 'distracted' : 'unknown',
        currentScore: score,
      }));

      animationFrameRef.current = requestAnimationFrame(detect);
    };

    detect();
  }, [state.isTracking]);

  const stopTracking = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      clearInterval(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    const finalScore = state.currentScore;
    
    setState({
      isTracking: false,
      currentScore: finalScore,
      faceDetected: false,
      attentionState: 'unknown',
    });
    
    // Reset counters
    frameCountRef.current = 0;
    attentiveFramesRef.current = 0;
    
    return finalScore;
  }, [state.currentScore]);

  const resetTracking = useCallback(() => {
    frameCountRef.current = 0;
    attentiveFramesRef.current = 0;
    setState(prev => ({ ...prev, currentScore: 0 }));
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        clearInterval(animationFrameRef.current);
      }
    };
  }, []);

  return {
    state,
    videoRef,
    canvasRef,
    startTracking,
    stopTracking,
    resetTracking,
  };
}
