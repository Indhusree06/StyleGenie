-- Add wardrobe_profile_id column to wardrobe_items table
-- Run this SQL in your Supabase SQL Editor

-- Add the column (if it doesn't exist)
ALTER TABLE wardrobe_items 
ADD COLUMN IF NOT EXISTS wardrobe_profile_id UUID REFERENCES wardrobe_profiles(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_profile_id ON wardrobe_items(wardrobe_profile_id);

-- Update RLS policies to include profile access
DROP POLICY IF EXISTS "Users can view own wardrobe items" ON wardrobe_items;
DROP POLICY IF EXISTS "Users can insert own wardrobe items" ON wardrobe_items;
DROP POLICY IF EXISTS "Users can update own wardrobe items" ON wardrobe_items;
DROP POLICY IF EXISTS "Users can delete own wardrobe items" ON wardrobe_items;

-- New RLS policies that consider both user_id and profile access
CREATE POLICY "Users can view own wardrobe items" ON wardrobe_items
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (wardrobe_profile_id IS NOT NULL AND 
     EXISTS (SELECT 1 FROM wardrobe_profiles WHERE id = wardrobe_profile_id AND user_id = auth.uid()))
  );

CREATE POLICY "Users can insert own wardrobe items" ON wardrobe_items
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    (wardrobe_profile_id IS NULL OR 
     EXISTS (SELECT 1 FROM wardrobe_profiles WHERE id = wardrobe_profile_id AND user_id = auth.uid()))
  );

CREATE POLICY "Users can update own wardrobe items" ON wardrobe_items
  FOR UPDATE USING (
    auth.uid() = user_id AND
    (wardrobe_profile_id IS NULL OR 
     EXISTS (SELECT 1 FROM wardrobe_profiles WHERE id = wardrobe_profile_id AND user_id = auth.uid()))
  );

CREATE POLICY "Users can delete own wardrobe items" ON wardrobe_items
  FOR DELETE USING (
    auth.uid() = user_id AND
    (wardrobe_profile_id IS NULL OR 
     EXISTS (SELECT 1 FROM wardrobe_profiles WHERE id = wardrobe_profile_id AND user_id = auth.uid()))
  );

-- Test the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'wardrobe_items' 
AND column_name = 'wardrobe_profile_id';