-- Create table for tracking intervention quiz attempts
CREATE TABLE public.intervention_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.learning_sessions(id) ON DELETE SET NULL,
  module_id TEXT NOT NULL,
  score REAL NOT NULL DEFAULT 0,
  passed BOOLEAN NOT NULL DEFAULT false,
  questions_count INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for tracking video watch progress
CREATE TABLE public.video_watch_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  watch_duration_seconds INTEGER NOT NULL DEFAULT 0,
  total_duration_seconds INTEGER NOT NULL DEFAULT 0,
  watch_percentage REAL NOT NULL DEFAULT 0,
  last_position_seconds INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- Enable RLS on intervention_attempts
ALTER TABLE public.intervention_attempts ENABLE ROW LEVEL SECURITY;

-- RLS policies for intervention_attempts
CREATE POLICY "Users can view own intervention attempts" 
ON public.intervention_attempts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own intervention attempts" 
ON public.intervention_attempts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Enable RLS on video_watch_progress
ALTER TABLE public.video_watch_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for video_watch_progress
CREATE POLICY "Users can view own video progress" 
ON public.video_watch_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own video progress" 
ON public.video_watch_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own video progress" 
ON public.video_watch_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at on video_watch_progress
CREATE TRIGGER update_video_watch_progress_updated_at
BEFORE UPDATE ON public.video_watch_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();