import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface VideoTrackingState {
  watchDuration: number;
  totalDuration: number;
  watchPercentage: number;
  isPlaying: boolean;
}

export function useVideoTracking(moduleId: string) {
  const { user } = useAuth();
  const [state, setState] = useState<VideoTrackingState>({
    watchDuration: 0,
    totalDuration: 0,
    watchPercentage: 0,
    isPlaying: false,
  });
  
  const watchedSecondsRef = useRef<Set<number>>(new Set());
  const lastPositionRef = useRef(0);
  const saveIntervalRef = useRef<number | null>(null);

  // Load existing progress from database
  useEffect(() => {
    if (!user || !moduleId) return;
    
    const loadProgress = async () => {
      const { data } = await supabase
        .from('video_watch_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('module_id', moduleId)
        .maybeSingle();
      
      if (data) {
        setState(prev => ({
          ...prev,
          watchDuration: data.watch_duration_seconds,
          totalDuration: data.total_duration_seconds,
          watchPercentage: data.watch_percentage,
        }));
        lastPositionRef.current = data.last_position_seconds;
      }
    };
    
    loadProgress();
  }, [user, moduleId]);

  const saveProgress = useCallback(async () => {
    if (!user || !moduleId || state.totalDuration === 0) return;
    
    const watchDuration = watchedSecondsRef.current.size;
    const watchPercentage = Math.min(100, Math.round((watchDuration / state.totalDuration) * 100));
    
    const { error } = await supabase
      .from('video_watch_progress')
      .upsert({
        user_id: user.id,
        module_id: moduleId,
        watch_duration_seconds: watchDuration,
        total_duration_seconds: state.totalDuration,
        watch_percentage: watchPercentage,
        last_position_seconds: lastPositionRef.current,
        completed: watchPercentage >= 90,
      }, {
        onConflict: 'user_id,module_id',
      });
    
    if (!error) {
      setState(prev => ({
        ...prev,
        watchDuration,
        watchPercentage,
      }));
    }
  }, [user, moduleId, state.totalDuration]);

  // Auto-save every 10 seconds when playing
  useEffect(() => {
    if (state.isPlaying) {
      saveIntervalRef.current = window.setInterval(() => {
        saveProgress();
      }, 10000);
    }
    
    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [state.isPlaying, saveProgress]);

  const handleTimeUpdate = useCallback((currentTime: number) => {
    const second = Math.floor(currentTime);
    watchedSecondsRef.current.add(second);
    lastPositionRef.current = second;
    
    const watchDuration = watchedSecondsRef.current.size;
    const watchPercentage = state.totalDuration > 0 
      ? Math.min(100, Math.round((watchDuration / state.totalDuration) * 100))
      : 0;
    
    setState(prev => ({
      ...prev,
      watchDuration,
      watchPercentage,
    }));
  }, [state.totalDuration]);

  const handleDurationChange = useCallback((duration: number) => {
    setState(prev => ({ ...prev, totalDuration: Math.floor(duration) }));
  }, []);

  const handlePlay = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  const handlePause = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }));
    saveProgress();
  }, [saveProgress]);

  const handleEnded = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }));
    saveProgress();
  }, [saveProgress]);

  return {
    state,
    handleTimeUpdate,
    handleDurationChange,
    handlePlay,
    handlePause,
    handleEnded,
    saveProgress,
    lastPosition: lastPositionRef.current,
  };
}
