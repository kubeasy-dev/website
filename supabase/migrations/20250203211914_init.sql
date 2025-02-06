/*
  # Initial Schema Setup for Kubeasy v2

  1. Tables
    - users
      - Extended user profile information
      - Linked to Supabase auth.users
    - challenges
      - Core challenge information
      - Difficulty levels and categories
    - user_progress
      - Track user progress on challenges
      - Store completion status and timestamps
    - user_achievements
      - Track user achievements and badges
    - api_tokens
      - Store API tokens for CLI access

  2. Security
    - RLS policies for all tables
    - Secure access patterns for user data
*/

-- Create custom types
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE challenge_status AS ENUM ('not_started', 'in_progress', 'completed');

-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  difficulty difficulty_level NOT NULL,
  tags text[] NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  challenge_id uuid REFERENCES challenges(id) NOT NULL,
  status challenge_status DEFAULT 'not_started',
  started_at timestamptz,
  completed_at timestamptz,
  UNIQUE(user_id, challenge_id)
);

CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  logo_url text NOT NULL,
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  achievement_id uuid REFERENCES achievements(id) NOT NULL,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);


-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view challenges"
  ON challenges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view their own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_challenges_updated_at
  BEFORE UPDATE ON challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
