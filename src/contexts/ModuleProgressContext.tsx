import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PASSING_SCORE } from '@/lib/recommendation-engine';
import { getSessions } from '@/lib/session-store';

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

  useEffect(() => {
    async function loadProgress() {
      if (!user) {
        setProgress(new Map());
        setLoading(false);
        return;
      }
      try {
        const data = await getSessions();
        const progressMap = new Map<string, ModuleProgress>();
        [...data].reverse().forEach((session) => {
          const existing = progressMap.get(session.moduleId);
          const passed = session.quizScore >= PASSING_SCORE;
          if (existing) {
            progressMap.set(session.moduleId, {
              moduleId: session.moduleId,
              passed: existing.passed || passed,
              bestScore: Math.max(existing.bestScore, session.quizScore),
              attempts: existing.attempts + 1,
            });
          } else {
            progressMap.set(session.moduleId, {
              moduleId: session.moduleId,
              passed,
              bestScore: session.quizScore,
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

  const isModuleUnlocked = useCallback(
    (moduleId: string, moduleOrder: number) => {
      if (moduleOrder === 1) return true;
      import('@/lib/content-data').then(({ modules: allModules }) => {
        const previousModule = allModules.find((m) => m.order === moduleOrder - 1);
        if (!previousModule) return true;
        const prevProgress = progress.get(previousModule.id);
        return prevProgress?.passed ?? false;
      });
      return moduleOrder === 1;
    },
    [progress]
  );

  const recordQuizResult = useCallback((moduleId: string, score: number) => {
    const passed = score >= PASSING_SCORE;
    setProgress((prev) => {
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

  const getModuleProgress = useCallback(
    (moduleId: string) => progress.get(moduleId),
    [progress]
  );

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
