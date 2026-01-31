import { api } from '@/lib/api';
import type { RecommendationType } from './recommendation-engine';

export interface LearningSession {
  id: string;
  studentId: string;
  userId?: string;
  moduleId: string;
  moduleTitle: string;
  engagementScore: number;
  quizScore: number;
  recommendation: RecommendationType;
  timestamp: string;
}

export async function getSessions(): Promise<LearningSession[]> {
  try {
    const data = await api<LearningSession[]>('/sessions');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getSessionsByStudent(_studentId: string): Promise<LearningSession[]> {
  return getSessions();
}

export async function addSession(
  session: Omit<LearningSession, 'id' | 'timestamp' | 'userId'>
): Promise<LearningSession | null> {
  try {
    const data = await api<LearningSession>('/sessions', {
      method: 'POST',
      body: JSON.stringify({
        studentId: session.studentId,
        moduleId: session.moduleId,
        moduleTitle: session.moduleTitle,
        engagementScore: session.engagementScore,
        quizScore: session.quizScore,
        recommendation: session.recommendation,
      }),
    });
    return data;
  } catch {
    return null;
  }
}

export async function clearSessions(_studentId?: string): Promise<void> {
  try {
    await api('/sessions', { method: 'DELETE' });
  } catch {
    // ignore
  }
}

export async function getSessionStats(_studentId: string) {
  const sessions = await getSessions();
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
  const avgEngagement =
    sessions.reduce((sum, s) => sum + s.engagementScore, 0) / sessions.length;
  const avgQuizScore =
    sessions.reduce((sum, s) => sum + s.quizScore, 0) / sessions.length;
  return {
    totalSessions: sessions.length,
    avgEngagement: Math.round(avgEngagement),
    avgQuizScore: Math.round(avgQuizScore),
    remedialCount: sessions.filter((s) => s.recommendation === 'remedial').length,
    repeatCount: sessions.filter((s) => s.recommendation === 'repeat').length,
    advancedCount: sessions.filter((s) => s.recommendation === 'advanced').length,
  };
}
