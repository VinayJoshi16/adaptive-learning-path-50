// Database-backed session storage using Lovable Cloud
import { supabase } from '@/integrations/supabase/client';
import { RecommendationType } from './recommendation-engine';

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

// Fetch all sessions for current authenticated user
export async function getSessions(): Promise<LearningSession[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('learning_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    studentId: row.student_id,
    userId: row.user_id,
    moduleId: row.module_id,
    moduleTitle: row.module_title,
    engagementScore: row.engagement_score,
    quizScore: row.quiz_score,
    recommendation: row.recommendation as RecommendationType,
    timestamp: row.created_at,
  }));
}

// Fetch sessions for current user (same as getSessions for authenticated users)
export async function getSessionsByStudent(studentId: string): Promise<LearningSession[]> {
  return getSessions();
}

// Add a new session to database
export async function addSession(session: Omit<LearningSession, 'id' | 'timestamp' | 'userId'>): Promise<LearningSession | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('User not authenticated');
    return null;
  }

  const { data, error } = await supabase
    .from('learning_sessions')
    .insert({
      student_id: session.studentId,
      user_id: user.id,
      module_id: session.moduleId,
      module_title: session.moduleTitle,
      engagement_score: session.engagementScore,
      quiz_score: session.quizScore,
      recommendation: session.recommendation,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding session:', error);
    return null;
  }

  return {
    id: data.id,
    studentId: data.student_id,
    userId: data.user_id,
    moduleId: data.module_id,
    moduleTitle: data.module_title,
    engagementScore: data.engagement_score,
    quizScore: data.quiz_score,
    recommendation: data.recommendation as RecommendationType,
    timestamp: data.created_at,
  };
}

// Clear all sessions for current user
export async function clearSessions(studentId?: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return;
  }

  await supabase
    .from('learning_sessions')
    .delete()
    .eq('user_id', user.id);
}

// Get session statistics for current user
export async function getSessionStats(studentId: string) {
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
