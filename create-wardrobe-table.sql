-- Create wardrobe_profiles table for Style Genie app
-- Run this SQL in your Supabase SQL Editor

-- Create the wardrobe_profiles table
CREATE TABLE IF NOT EXISTS wardrobe_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  relation VARCHAR(100),
  age INTEGER,
  profile_picture_url TEXT,
  profile_picture_path TEXT,
  is_owner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE wardrobe_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own wardrobe profiles" ON wardrobe_profiles;
DROP POLICY IF EXISTS "Users can insert own wardrobe profiles" ON wardrobe_profiles;
DROP POLICY IF EXISTS "Users can update own wardrobe profiles" ON wardrobe_profiles;
DROP POLICY IF EXISTS "Users can delete own wardrobe profiles" ON wardrobe_profiles;

-- Create RLS policies
CREATE POLICY "Users can view own wardrobe profiles" ON wardrobe_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wardrobe profiles" ON wardrobe_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wardrobe profiles" ON wardrobe_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wardrobe profiles" ON wardrobe_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_wardrobe_profiles_updated_at ON wardrobe_profiles;
CREATE TRIGGER update_wardrobe_profiles_updated_at 
  BEFORE UPDATE ON wardrobe_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for profile pictures (optional)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Test the table (this should return 0 for an empty table)
SELECT COUNT(*) as profile_count FROM wardrobe_profiles;