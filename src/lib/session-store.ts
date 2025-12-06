// Local session storage (will be replaced with Lovable Cloud later)
import { RecommendationType } from './recommendation-engine';

export interface LearningSession {
  id: string;
  studentId: string;
  moduleId: string;
  moduleTitle: string;
  engagementScore: number;
  quizScore: number;
  recommendation: RecommendationType;
  timestamp: string;
}

const STORAGE_KEY = 'palm_sessions';

export function getSessions(): LearningSession[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function getSessionsByStudent(studentId: string): LearningSession[] {
  return getSessions().filter(s => s.studentId === studentId);
}

export function addSession(session: Omit<LearningSession, 'id' | 'timestamp'>): LearningSession {
  const sessions = getSessions();
  const newSession: LearningSession = {
    ...session,
    id: `session_${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  sessions.push(newSession);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  return newSession;
}

export function clearSessions(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getSessionStats(studentId: string) {
  const sessions = getSessionsByStudent(studentId);
  
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      avgEngagement: 0,
      avgQuizScore: 0,
      remedialCount: 0,
      repeatCount: 0,
      advancedCount: 0,
    };
  }

  const avgEngagement = sessions.reduce((sum, s) => sum + s.engagementScore, 0) / sessions.length;
  const avgQuizScore = sessions.reduce((sum, s) => sum + s.quizScore, 0) / sessions.length;
  
  return {
    totalSessions: sessions.length,
    avgEngagement: Math.round(avgEngagement),
    avgQuizScore: Math.round(avgQuizScore),
    remedialCount: sessions.filter(s => s.recommendation === 'remedial').length,
    repeatCount: sessions.filter(s => s.recommendation === 'repeat').length,
    advancedCount: sessions.filter(s => s.recommendation === 'advanced').length,
  };
}
