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

export function useEngagementTracker() {
  const [state, setState] = useState<EngagementState>({
    isTracking: false,
    currentScore: 0,
    faceDetected: false,
    attentionState: 'unknown',
    modelLoaded: false,
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<faceLandmarksDetection.FaceLandmarksDetector | null>(null);
  const frameCountRef = useRef(0);
  const attentiveFramesRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const isTrackingRef = useRef(false);

  const loadModel = useCallback(async () => {
    try {
      await tf.ready();
      await tf.setBackend('webgl');
      
      const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
      const detector = await faceLandmarksDetection.createDetector(model, {
        runtime: 'tfjs',
        refineLandmarks: true,
        maxFaces: 1,
      });
      
      detectorRef.current = detector;
      setState(prev => ({ ...prev, modelLoaded: true }));
      console.log('Face detection model loaded successfully');
      return true;
    } catch (error) {
      console.error('Failed to load face detection model:', error);
      return false;
    }
  }, []);

  const calculateHeadPose = (landmarks: faceLandmarksDetection.Keypoint[]) => {
    // Key facial landmarks for head pose estimation
    const noseTip = landmarks[1]; // Nose tip
    const leftEye = landmarks[33]; // Left eye inner corner
    const rightEye = landmarks[263]; // Right eye inner corner
    const leftMouth = landmarks[61]; // Left mouth corner
    const rightMouth = landmarks[291]; // Right mouth corner
    
    if (!noseTip || !leftEye || !rightEye) {
      return { yaw: 0, isLookingAtScreen: false };
    }

    // Calculate eye center
    const eyeCenterX = (leftEye.x + rightEye.x) / 2;
    const eyeWidth = Math.abs(rightEye.x - leftEye.x);
    
    // Estimate yaw (left-right rotation) based on nose position relative to eye center
    const noseOffset = noseTip.x - eyeCenterX;
    const yaw = (noseOffset / eyeWidth) * 100; // Normalize to percentage
    
    // Calculate mouth width for additional reference
    let mouthWidth = 0;
    if (leftMouth && rightMouth) {
      mouthWidth = Math.abs(rightMouth.x - leftMouth.x);
    }
    
    // Determine if looking at screen (yaw within threshold)
    const yawThreshold = 25; // Allow some head movement
    const isLookingAtScreen = Math.abs(yaw) < yawThreshold;
    
    return { yaw, isLookingAtScreen, eyeWidth, mouthWidth };
  };

  const detectEngagement = useCallback(async () => {
    if (!videoRef.current || !detectorRef.current || !isTrackingRef.current) {
      return;
    }

    try {
      const video = videoRef.current;
      
      if (video.readyState < 2) {
        animationFrameRef.current = requestAnimationFrame(detectEngagement);
        return;
      }

      const faces = await detectorRef.current.estimateFaces(video, {
        flipHorizontal: false,
      });

      const faceDetected = faces.length > 0;
      let attentive = false;

      if (faceDetected && faces[0].keypoints) {
        const { isLookingAtScreen } = calculateHeadPose(faces[0].keypoints);
        attentive = isLookingAtScreen;
      }

      frameCountRef.current += 1;
      if (attentive) {
        attentiveFramesRef.current += 1;
      }

      const score = frameCountRef.current > 0 
        ? Math.round((attentiveFramesRef.current / frameCountRef.current) * 100)
        : 0;

      setState(prev => ({
        ...prev,
        faceDetected,
        attentionState: attentive ? 'attentive' : faceDetected ? 'distracted' : 'unknown',
        currentScore: score,
      }));

      if (isTrackingRef.current) {
        animationFrameRef.current = requestAnimationFrame(detectEngagement);
      }
    } catch (error) {
      console.error('Face detection error:', error);
      if (isTrackingRef.current) {
        animationFrameRef.current = requestAnimationFrame(detectEngagement);
      }
    }
  }, []);

  const startTracking = useCallback(async () => {
    try {
      // Load model if not already loaded
      if (!detectorRef.current) {
        setState(prev => ({ ...prev, isTracking: true }));
        const loaded = await loadModel();
        if (!loaded) {
          console.error('Could not load face detection model');
          setState(prev => ({ ...prev, isTracking: false }));
          return;
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      isTrackingRef.current = true;
      setState(prev => ({ ...prev, isTracking: true }));

      // Start detection loop
      detectEngagement();
    } catch (error) {
      console.error('Failed to start webcam:', error);
      setState(prev => ({ ...prev, isTracking: false }));
    }
  }, [loadModel, detectEngagement]);

  const stopTracking = useCallback(() => {
    isTrackingRef.current = false;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    const finalScore = state.currentScore;

    setState(prev => ({
      ...prev,
      isTracking: false,
      faceDetected: false,
      attentionState: 'unknown',
    }));

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
      isTrackingRef.current = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
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
