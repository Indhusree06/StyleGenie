-- Create wardrobe_profiles table
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

-- Create RLS policies
ALTER TABLE wardrobe_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own wardrobe profiles
CREATE POLICY "Users can view own wardrobe profiles" ON wardrobe_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own wardrobe profiles
CREATE POLICY "Users can insert own wardrobe profiles" ON wardrobe_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own wardrobe profiles
CREATE POLICY "Users can update own wardrobe profiles" ON wardrobe_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own wardrobe profiles
CREATE POLICY "Users can delete own wardrobe profiles" ON wardrobe_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_wardrobe_profiles_updated_at 
  BEFORE UPDATE ON wardrobe_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for profile pictures if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for profile pictures
CREATE POLICY "Users can upload profile pictures" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view profile pictures" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users can update their profile pictures" ON storage.objects
  FOR UPDATE USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their profile pictures" ON storage.objects
  FOR DELETE USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);
