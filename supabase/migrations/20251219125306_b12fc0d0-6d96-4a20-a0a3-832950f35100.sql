-- Create a function to get leaderboard data (aggregated across all users)
CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE (
  user_id uuid,
  display_name text,
  avg_engagement_score real,
  avg_quiz_score real,
  total_sessions integer,
  total_video_watch_time integer,
  intervention_pass_rate real
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id as user_id,
    COALESCE(p.display_name, 'Anonymous') as display_name,
    COALESCE(AVG(ls.engagement_score), 0)::real as avg_engagement_score,
    COALESCE(AVG(ls.quiz_score), 0)::real as avg_quiz_score,
    COUNT(DISTINCT ls.id)::integer as total_sessions,
    COALESCE(SUM(vwp.watch_duration_seconds), 0)::integer as total_video_watch_time,
    CASE 
      WHEN COUNT(ia.id) > 0 THEN (COUNT(CASE WHEN ia.passed THEN 1 END)::real / COUNT(ia.id)::real * 100)
      ELSE 0
    END as intervention_pass_rate
  FROM public.profiles p
  LEFT JOIN public.learning_sessions ls ON p.id = ls.user_id
  LEFT JOIN public.video_watch_progress vwp ON p.id = vwp.user_id
  LEFT JOIN public.intervention_attempts ia ON p.id = ia.user_id
  GROUP BY p.id, p.display_name
  HAVING COUNT(ls.id) > 0
  ORDER BY (COALESCE(AVG(ls.engagement_score), 0) + COALESCE(AVG(ls.quiz_score), 0)) / 2 DESC
  LIMIT 50;
$$;