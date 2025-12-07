-- Create learning_sessions table for storing PALM session data
CREATE TABLE public.learning_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  module_title TEXT NOT NULL,
  engagement_score REAL NOT NULL DEFAULT 0,
  quiz_score REAL NOT NULL DEFAULT 0,
  recommendation TEXT NOT NULL DEFAULT 'repeat',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read sessions (no auth required for demo)
CREATE POLICY "Anyone can view sessions"
ON public.learning_sessions
FOR SELECT
USING (true);

-- Allow anyone to insert sessions (no auth required for demo)
CREATE POLICY "Anyone can create sessions"
ON public.learning_sessions
FOR INSERT
WITH CHECK (true);

-- Allow anyone to delete their own sessions by student_id
CREATE POLICY "Anyone can delete sessions"
ON public.learning_sessions
FOR DELETE
USING (true);