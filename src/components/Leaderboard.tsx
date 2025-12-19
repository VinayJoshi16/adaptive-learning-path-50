import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Medal, Award, Clock, Target, TrendingUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avg_engagement_score: number;
  avg_quiz_score: number;
  total_sessions: number;
  total_video_watch_time: number;
  intervention_pass_rate: number;
}

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.rpc('get_leaderboard');
    
    if (error) {
      console.error('Error loading leaderboard:', error);
    } else {
      setEntries(data || []);
    }
    setIsLoading(false);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{index + 1}</span>;
    }
  };

  const getOverallScore = (entry: LeaderboardEntry) => {
    return Math.round((entry.avg_engagement_score + entry.avg_quiz_score) / 2);
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-soft p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h3 className="font-display font-semibold text-lg text-foreground">
            Leaderboard
          </h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-soft p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h3 className="font-display font-semibold text-lg text-foreground">
            Leaderboard
          </h3>
        </div>
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No students on the leaderboard yet</p>
          <p className="text-sm text-muted-foreground mt-1">Complete learning sessions to appear here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-soft p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h3 className="font-display font-semibold text-lg text-foreground">
          Leaderboard
        </h3>
        <span className="text-xs text-muted-foreground ml-auto">
          Top {entries.length} students
        </span>
      </div>
      
      <div className="space-y-2">
        {entries.map((entry, index) => (
          <div
            key={entry.user_id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg transition-colors",
              index === 0 && "bg-yellow-500/10 border border-yellow-500/20",
              index === 1 && "bg-gray-500/10 border border-gray-500/20",
              index === 2 && "bg-amber-600/10 border border-amber-600/20",
              index > 2 && "bg-muted/30 hover:bg-muted/50"
            )}
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-8 flex justify-center">
              {getRankIcon(index)}
            </div>
            
            {/* User Info */}
            <div className="flex-grow min-w-0">
              <p className="font-medium text-foreground truncate">
                {entry.display_name}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  {entry.total_sessions} sessions
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(entry.total_video_watch_time)}
                </span>
              </div>
            </div>
            
            {/* Scores */}
            <div className="flex-shrink-0 flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Engagement</p>
                <p className={cn(
                  "font-semibold text-sm",
                  entry.avg_engagement_score >= 70 ? "text-success" :
                  entry.avg_engagement_score >= 40 ? "text-warning" : "text-destructive"
                )}>
                  {Math.round(entry.avg_engagement_score)}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Quiz</p>
                <p className={cn(
                  "font-semibold text-sm",
                  entry.avg_quiz_score >= 70 ? "text-success" :
                  entry.avg_quiz_score >= 40 ? "text-warning" : "text-destructive"
                )}>
                  {Math.round(entry.avg_quiz_score)}%
                </p>
              </div>
              <div className="text-right border-l border-border pl-3">
                <p className="text-xs text-muted-foreground">Overall</p>
                <p className="font-bold text-primary flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {getOverallScore(entry)}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
