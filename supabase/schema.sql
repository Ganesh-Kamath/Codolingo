-- VYNTAX Supabase Schema (Draft)

-- 1. Users & Auth mapping
-- In Supabase, auth.users handles login. We'll map to public.profiles.
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  email text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Core Curriculum Engine (Content Admin)
-- Courses
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  category text,
  difficulty text,
  is_published boolean DEFAULT false,
  order_index int DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Units
CREATE TABLE public.units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  unit_number int NOT NULL,
  title text NOT NULL,
  subtitle text,
  description text,
  theme_color text,
  created_at timestamp with time zone DEFAULT now()
);

-- Skills (Topics within a unit)
CREATE TABLE public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid REFERENCES public.units(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  description text,
  order_index int NOT NULL,
  icon_name text,
  requires_skill_id uuid REFERENCES public.skills(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Lessons
CREATE TABLE public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id uuid REFERENCES public.skills(id) ON DELETE CASCADE,
  title text NOT NULL,
  order_index int NOT NULL,
  estimated_minutes int DEFAULT 5,
  xp_reward int DEFAULT 20,
  created_at timestamp with time zone DEFAULT now()
);

-- Lesson Steps (The actual content & exercises)
CREATE TABLE public.lesson_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE,
  type text NOT NULL, -- 'learn', 'predict', 'write', 'apply', 'mastery'
  title text NOT NULL,
  content_markdown text,
  code_snippet text,
  prompt text,
  starter_code text,
  solution_code text,
  order_index int NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Tests for coding exercises
CREATE TABLE public.exercise_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id uuid REFERENCES public.lesson_steps(id) ON DELETE CASCADE,
  description text NOT NULL,
  expected_output text NOT NULL,
  hidden boolean DEFAULT false
);

-- 3. User Progress & Gamification
CREATE TABLE public.user_progress (
  user_id uuid REFERENCES public.profiles(id) PRIMARY KEY,
  active_course_id uuid REFERENCES public.courses(id),
  total_xp int DEFAULT 0,
  level int DEFAULT 1,
  streak int DEFAULT 0,
  best_streak int DEFAULT 0,
  energy int DEFAULT 5,
  max_energy int DEFAULT 5,
  daily_goal_xp int DEFAULT 50,
  daily_xp_earned int DEFAULT 0,
  last_activity_date date DEFAULT CURRENT_DATE
);

CREATE TABLE public.user_completed_skills (
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id uuid REFERENCES public.skills(id) ON DELETE CASCADE,
  mastery_level int DEFAULT 1,
  completed_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (user_id, skill_id)
);

CREATE TABLE public.user_completed_lessons (
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);

-- 4. Mistake Engine
CREATE TABLE public.user_mistakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id uuid REFERENCES public.skills(id),
  lesson_id uuid REFERENCES public.lessons(id),
  mistake_type text NOT NULL,
  explanation text,
  user_code text,
  frequency int DEFAULT 1,
  resolved boolean DEFAULT false,
  last_occurred_at timestamp with time zone DEFAULT now()
);

-- 5. Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_completed_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_completed_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mistakes ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Curriculum is readable by all authenticated users
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Courses are viewable by everyone" ON public.courses FOR SELECT USING (true);
-- ... same for units, skills, lessons, steps

-- Users can read/update their own progress
CREATE POLICY "Users can view own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);
-- ... same for completed tables and mistakes
