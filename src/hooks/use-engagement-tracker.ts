import { useState, useRef, useCallback, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

interface EngagementState {
  isTracking: boolean;
  currentScore: number;
  faceDetected: boolean;
  attentionState: 'attentive' | 'distracted' | 'unknown';
  modelLoaded: boolean;
}

// Singleton: load model once and reuse across component lifecycles
let globalDetector: faceLandmarksDetection.FaceLandmarksDetector | null = null;
let modelLoadingPromise: Promise<boolean> | null = null;

async function ensureModelLoaded(): Promise<boolean> {
  if (globalDetector) return true;
  if (modelLoadingPromise) return modelLoadingPromise;

  modelLoadingPromise = (async () => {
    try {
      await tf.ready();
      // Try webgl first, fall back to cpu
      try { await tf.setBackend('webgl'); } catch { await tf.setBackend('cpu'); }

      const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
      globalDetector = await faceLandmarksDetection.createDetector(model, {
        runtime: 'tfjs',
        refineLandmarks: false, // FAST: skip iris refinement (saves ~40% load time)
        maxFaces: 1,
      });
      console.log('Face detection model loaded');
      return true;
    } catch (err) {
      console.error('Model load failed:', err);
      modelLoadingPromise = null;
      return false;
    }
  })();

  return modelLoadingPromise;
}

// Preload model immediately on import (background)
ensureModelLoaded();

export function useEngagementTracker() {
  const [state, setState] = useState<EngagementState>({
    isTracking: false,
    currentScore: 0,
    faceDetected: false,
    attentionState: 'unknown',
    modelLoaded: !!globalDetector,
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameCountRef = useRef(0);
  const attentiveFramesRef = useRef(0);
  const intervalRef = useRef<number | null>(null);
  const isTrackingRef = useRef(false);

  // Check if model finished preloading
  useEffect(() => {
    if (globalDetector) {
      setState(prev => ({ ...prev, modelLoaded: true }));
    }
  }, []);

  const calculateHeadPose = (landmarks: faceLandmarksDetection.Keypoint[]) => {
    const noseTip = landmarks[1];
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];

    if (!noseTip || !leftEye || !rightEye) {
      return { isLookingAtScreen: false };
    }

    const eyeCenterX = (leftEye.x + rightEye.x) / 2;
    const eyeWidth = Math.abs(rightEye.x - leftEye.x);
    const noseOffset = noseTip.x - eyeCenterX;
    const yaw = (noseOffset / eyeWidth) * 100;

    return { isLookingAtScreen: Math.abs(yaw) < 25 };
  };

  const detectOnce = useCallback(async () => {
    if (!videoRef.current || !globalDetector || !isTrackingRef.current) return;
    const video = videoRef.current;
    if (video.readyState < 2) return;

    try {
      const faces = await globalDetector.estimateFaces(video, { flipHorizontal: false });
      const faceDetected = faces.length > 0;
      let attentive = false;

      if (faceDetected && faces[0].keypoints) {
        attentive = calculateHeadPose(faces[0].keypoints).isLookingAtScreen;
      }

      frameCountRef.current += 1;
      if (attentive) attentiveFramesRef.current += 1;

      const score = frameCountRef.current > 0
        ? Math.round((attentiveFramesRef.current / frameCountRef.current) * 100)
        : 0;

      setState(prev => ({
        ...prev,
        faceDetected,
        attentionState: attentive ? 'attentive' : faceDetected ? 'distracted' : 'unknown',
        currentScore: score,
      }));
    } catch (err) {
      // Silently continue
    }
  }, []);

  const startTracking = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isTracking: true }));

      // Load model (fast if already preloaded)
      const loaded = await ensureModelLoaded();
      if (!loaded) {
        setState(prev => ({ ...prev, isTracking: false }));
        return;
      }
      setState(prev => ({ ...prev, modelLoaded: true }));

      // Use low resolution for speed
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user', frameRate: { ideal: 15 } },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      isTrackingRef.current = true;

      // Detect every 500ms instead of every frame (~60fps → 2fps = 30x less CPU)
      intervalRef.current = window.setInterval(detectOnce, 500);
    } catch (error) {
      console.error('Failed to start webcam:', error);
      setState(prev => ({ ...prev, isTracking: false }));
    }
  }, [detectOnce]);

  const stopTracking = useCallback(() => {
    isTrackingRef.current = false;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const finalScore = state.currentScore;

    setState(prev => ({
      ...prev,
      isTracking: false,
      faceDetected: false,
      attentionState: 'unknown',
    }));

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
      isTrackingRef.current = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
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

