import React, { createContext, useContext, useState, useCallback } from 'react';
import { Module, getModuleById } from '@/lib/content-data';
import { RecommendationResult, RecommendationType } from '@/lib/recommendation-engine';

interface LearningState {
  studentId: string;
  currentModule: Module | null;
  engagementScore: number;
  quizScore: number;
  isLearning: boolean;
  recommendation: RecommendationResult | null;
  recommendationEngine: 'rules' | 'ml';
}

interface LearningContextType {
  state: LearningState;
  setStudentId: (id: string) => void;
  selectModule: (moduleId: string) => void;
  startLearning: () => void;
  finishLearning: (engagementScore: number) => void;
  setQuizScore: (score: number) => void;
  setRecommendation: (rec: RecommendationResult) => void;
  setRecommendationEngine: (engine: 'rules' | 'ml') => void;
  resetSession: () => void;
}

const initialState: LearningState = {
  studentId: 'student_001',
  currentModule: null,
  engagementScore: 0,
  quizScore: 0,
  isLearning: false,
  recommendation: null,
  recommendationEngine: 'rules',
};

const LearningContext = createContext<LearningContextType | null>(null);

export function LearningProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LearningState>(initialState);

  const setStudentId = useCallback((id: string) => {
    setState(prev => ({ ...prev, studentId: id }));
  }, []);

  const selectModule = useCallback((moduleId: string) => {
    const module = getModuleById(moduleId);
    setState(prev => ({ ...prev, currentModule: module || null }));
  }, []);

  const startLearning = useCallback(() => {
    setState(prev => ({ ...prev, isLearning: true, engagementScore: 0 }));
  }, []);

  const finishLearning = useCallback((engagementScore: number) => {
    setState(prev => ({ ...prev, isLearning: false, engagementScore }));
  }, []);

  const setQuizScore = useCallback((score: number) => {
    setState(prev => ({ ...prev, quizScore: score }));
  }, []);

  const setRecommendation = useCallback((rec: RecommendationResult) => {
    setState(prev => ({ ...prev, recommendation: rec }));
  }, []);

  const setRecommendationEngine = useCallback((engine: 'rules' | 'ml') => {
    setState(prev => ({ ...prev, recommendationEngine: engine }));
  }, []);

  const resetSession = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentModule: null,
      engagementScore: 0,
      quizScore: 0,
      isLearning: false,
      recommendation: null,
    }));
  }, []);

  return (
    <LearningContext.Provider
      value={{
        state,
        setStudentId,
        selectModule,
        startLearning,
        finishLearning,
        setQuizScore,
        setRecommendation,
        setRecommendationEngine,
        resetSession,
      }}
    >
      {children}
    </LearningContext.Provider>
  );
}

export function useLearning() {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
}
