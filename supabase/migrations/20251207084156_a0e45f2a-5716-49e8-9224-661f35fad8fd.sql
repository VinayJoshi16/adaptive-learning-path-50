-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  RETURN new;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update learning_sessions: add user_id column for authenticated users
ALTER TABLE public.learning_sessions 
ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Anyone can view sessions" ON public.learning_sessions;
DROP POLICY IF EXISTS "Anyone can create sessions" ON public.learning_sessions;
DROP POLICY IF EXISTS "Anyone can delete sessions" ON public.learning_sessions;

-- Create new policies for authenticated users
CREATE POLICY "Users can view own sessions"
ON public.learning_sessions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
ON public.learning_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
ON public.learning_sessions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
ON public.learning_sessions
FOR DELETE
USING (auth.uid() = user_id);