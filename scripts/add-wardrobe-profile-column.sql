-- Migration: Add wardrobe_profile_id column to wardrobe_items table
-- This enables separate wardrobes for different family members
-- Run this in Supabase SQL Editor if the Node.js script doesn't work

-- Step 1: Check if column already exists (this will error if it doesn't exist, which is expected)
DO $$
BEGIN
    -- Try to select the column to see if it exists
    PERFORM 1 FROM information_schema.columns 
    WHERE table_name = 'wardrobe_items' 
    AND column_name = 'wardrobe_profile_id';
    
    IF FOUND THEN
        RAISE NOTICE 'Column wardrobe_profile_id already exists in wardrobe_items table';
        RAISE EXCEPTION 'Migration already completed - column exists';
    END IF;
END $$;

-- Step 2: Add the wardrobe_profile_id column
ALTER TABLE wardrobe_items 
ADD COLUMN wardrobe_profile_id UUID REFERENCES wardrobe_profiles(id) ON DELETE CASCADE;

-- Step 3: Add comment to document the column
COMMENT ON COLUMN wardrobe_items.wardrobe_profile_id 
IS 'References the wardrobe profile this item belongs to. NULL means it belongs to the main user wardrobe.';

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_profile_id 
ON wardrobe_items(wardrobe_profile_id);

CREATE INDEX IF NOT EXISTS idx_wardrobe_items_user_profile 
ON wardrobe_items(user_id, wardrobe_profile_id);

CREATE INDEX IF NOT EXISTS idx_wardrobe_profiles_user_id 
ON wardrobe_profiles(user_id);

-- Step 5: Update Row Level Security policies
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own wardrobe items" ON wardrobe_items;
DROP POLICY IF EXISTS "Users can insert own wardrobe items" ON wardrobe_items;
DROP POLICY IF EXISTS "Users can update own wardrobe items" ON wardrobe_items;
DROP POLICY IF EXISTS "Users can delete own wardrobe items" ON wardrobe_items;

-- Create new policies that support both main wardrobe and profile-specific wardrobes
CREATE POLICY "Users can view own wardrobe items" ON wardrobe_items
  FOR SELECT USING (
    auth.uid() = user_id OR 
    wardrobe_profile_id IN (
      SELECT id FROM wardrobe_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own wardrobe items" ON wardrobe_items
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND (
      wardrobe_profile_id IS NULL OR 
      wardrobe_profile_id IN (
        SELECT id FROM wardrobe_profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update own wardrobe items" ON wardrobe_items
  FOR UPDATE USING (
    auth.uid() = user_id AND (
      wardrobe_profile_id IS NULL OR 
      wardrobe_profile_id IN (
        SELECT id FROM wardrobe_profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete own wardrobe items" ON wardrobe_items
  FOR DELETE USING (
    auth.uid() = user_id AND (
      wardrobe_profile_id IS NULL OR 
      wardrobe_profile_id IN (
        SELECT id FROM wardrobe_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Step 6: Verify the migration
DO $$
BEGIN
    -- Check if the column was added successfully
    PERFORM 1 FROM information_schema.columns 
    WHERE table_name = 'wardrobe_items' 
    AND column_name = 'wardrobe_profile_id';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Migration failed - column was not created';
    END IF;
    
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'wardrobe_profile_id column has been added to wardrobe_items table';
    RAISE NOTICE 'Indexes and RLS policies have been updated';
    RAISE NOTICE 'You can now create separate wardrobes for family members';
END $$;
