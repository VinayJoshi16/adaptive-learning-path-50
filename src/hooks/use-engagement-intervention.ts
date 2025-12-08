import { useState, useCallback, useRef, useEffect } from 'react';
import { QuizQuestion, getInterventionQuestions } from '@/lib/content-data';

const ENGAGEMENT_DROP_THRESHOLD = 65;
const CHECK_INTERVAL_MS = 5000;
const MIN_TRACKING_TIME_MS = 10000;
const COOLDOWN_MS = 60000;
const MIN_FACE_DETECTION_TIME_MS = 3000;

interface EngagementHistory {
  timestamp: number;
  score: number;
  topics: string[];
}

export function useEngagementIntervention(
  currentEngagementScore: number,
  isTracking: boolean,
  moduleTopics: string[] = [],
  faceDetected: boolean = false
) {
  const [showIntervention, setShowIntervention] = useState(false);
  const [interventionQuestions, setInterventionQuestions] = useState<QuizQuestion[]>([]);
  const [interventionCompleted, setInterventionCompleted] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  
  const historyRef = useRef<EngagementHistory[]>([]);
  const lastInterventionRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const checkIntervalRef = useRef<number | null>(null);
  const faceDetectionStartRef = useRef<number>(0);

  // Track face detection - require stable detection for MIN_FACE_DETECTION_TIME_MS
  useEffect(() => {
    if (!isTracking) {
      setFaceVerified(false);
      faceDetectionStartRef.current = 0;
      return;
    }

    if (faceDetected) {
      if (faceDetectionStartRef.current === 0) {
        faceDetectionStartRef.current = Date.now();
      } else if (Date.now() - faceDetectionStartRef.current >= MIN_FACE_DETECTION_TIME_MS) {
        setFaceVerified(true);
      }
    } else {
      faceDetectionStartRef.current = 0;
    }
  }, [faceDetected, isTracking]);

  useEffect(() => {
    if (!isTracking) {
      historyRef.current = [];
      startTimeRef.current = 0;
      return;
    }

    if (startTimeRef.current === 0) {
      startTimeRef.current = Date.now();
    }

    historyRef.current.push({
      timestamp: Date.now(),
      score: currentEngagementScore,
      topics: moduleTopics,
    });

    const twoMinutesAgo = Date.now() - 120000;
    historyRef.current = historyRef.current.filter(h => h.timestamp > twoMinutesAgo);
  }, [currentEngagementScore, isTracking, moduleTopics]);

  const checkEngagement = useCallback(() => {
    if (!isTracking || !faceVerified) return;
    
    const now = Date.now();
    const timeSinceStart = now - startTimeRef.current;
    const timeSinceLastIntervention = now - lastInterventionRef.current;
    
    if (timeSinceStart < MIN_TRACKING_TIME_MS) return;
    if (lastInterventionRef.current > 0 && timeSinceLastIntervention < COOLDOWN_MS) return;
    
    if (currentEngagementScore < ENGAGEMENT_DROP_THRESHOLD) {
      const highEngagementHistory = historyRef.current.filter(h => h.score >= 70);
      const topics = new Set<string>();
      highEngagementHistory.forEach(h => h.topics.forEach(t => topics.add(t)));
      
      const topicsArray = topics.size > 0 ? Array.from(topics) : moduleTopics.slice(0, 2);
      const questions = getInterventionQuestions(topicsArray, 3);
      
      if (questions.length > 0) {
        setInterventionQuestions(questions);
        setShowIntervention(true);
        setInterventionCompleted(false);
        lastInterventionRef.current = now;
      }
    }
  }, [currentEngagementScore, isTracking, moduleTopics, faceVerified]);

  useEffect(() => {
    if (isTracking && faceVerified) {
      checkIntervalRef.current = window.setInterval(checkEngagement, CHECK_INTERVAL_MS);
    }
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [isTracking, checkEngagement, faceVerified]);

  const closeIntervention = useCallback(() => {
    // Only allow closing if intervention is completed
    if (interventionCompleted) {
      setShowIntervention(false);
    }
  }, [interventionCompleted]);

  const handleInterventionComplete = useCallback((score: number) => {
    console.log('Intervention completed with score:', score);
    setInterventionCompleted(true);
  }, []);

  // Check if learning should be blocked (intervention active and not completed)
  const isLearningBlocked = showIntervention && !interventionCompleted;

  return {
    showIntervention,
    interventionQuestions,
    closeIntervention,
    handleInterventionComplete,
    faceVerified,
    isLearningBlocked,
    interventionCompleted,
  };
}
