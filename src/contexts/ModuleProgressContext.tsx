import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PASSING_SCORE } from '@/lib/recommendation-engine';

interface ModuleProgress {
  moduleId: string;
  passed: boolean;
  bestScore: number;
  attempts: number;
}

interface ModuleProgressContextType {
  progress: Map<string, ModuleProgress>;
  isModuleUnlocked: (moduleId: string, moduleOrder: number) => boolean;
  recordQuizResult: (moduleId: string, score: number) => void;
  getModuleProgress: (moduleId: string) => ModuleProgress | undefined;
  loading: boolean;
}

const ModuleProgressContext = createContext<ModuleProgressContextType | null>(null);

export function ModuleProgressProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Map<string, ModuleProgress>>(new Map());
  const [loading, setLoading] = useState(true);

  // Load progress from database
  useEffect(() => {
    async function loadProgress() {
      if (!user) {
        setProgress(new Map());
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('learning_sessions')
          .select('module_id, quiz_score')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const progressMap = new Map<string, ModuleProgress>();
        
        data?.forEach(session => {
          const existing = progressMap.get(session.module_id);
          const passed = session.quiz_score >= PASSING_SCORE;
          
          if (existing) {
            progressMap.set(session.module_id, {
              moduleId: session.module_id,
              passed: existing.passed || passed,
              bestScore: Math.max(existing.bestScore, session.quiz_score),
              attempts: existing.attempts + 1,
            });
          } else {
            progressMap.set(session.module_id, {
              moduleId: session.module_id,
              passed,
              bestScore: session.quiz_score,
              attempts: 1,
            });
          }
        });

        setProgress(progressMap);
      } catch (error) {
        console.error('Failed to load progress:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProgress();
  }, [user]);

  const isModuleUnlocked = useCallback((moduleId: string, moduleOrder: number) => {
    // First module is always unlocked
    if (moduleOrder === 1) return true;
    
    // Find the previous module and check if it was passed
    // We need to check all modules with lower order
    const modules = Array.from(progress.values());
    
    // Import dynamically to avoid circular deps
    import('@/lib/content-data').then(({ modules: allModules }) => {
      const previousModule = allModules.find(m => m.order === moduleOrder - 1);
      if (!previousModule) return true;
      
      const prevProgress = progress.get(previousModule.id);
      return prevProgress?.passed ?? false;
    });
    
    // For now, check if any module with order-1 is passed
    // This is a simplified check - the real logic is in the component
    return moduleOrder === 1;
  }, [progress]);

  const recordQuizResult = useCallback((moduleId: string, score: number) => {
    const passed = score >= PASSING_SCORE;
    
    setProgress(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(moduleId);
      
      if (existing) {
        newMap.set(moduleId, {
          moduleId,
          passed: existing.passed || passed,
          bestScore: Math.max(existing.bestScore, score),
          attempts: existing.attempts + 1,
        });
      } else {
        newMap.set(moduleId, {
          moduleId,
          passed,
          bestScore: score,
          attempts: 1,
        });
      }
      
      return newMap;
    });
  }, []);

  const getModuleProgress = useCallback((moduleId: string) => {
    return progress.get(moduleId);
  }, [progress]);

  return (
    <ModuleProgressContext.Provider
      value={{
        progress,
        isModuleUnlocked,
        recordQuizResult,
        getModuleProgress,
        loading,
      }}
    >
      {children}
    </ModuleProgressContext.Provider>
  );
}

export function useModuleProgress() {
  const context = useContext(ModuleProgressContext);
  if (!context) {
    throw new Error('useModuleProgress must be used within a ModuleProgressProvider');
  }
  return context;
}
