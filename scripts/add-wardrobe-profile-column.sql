-- Migration script to add wardrobe_profile_id column to wardrobe_items table
-- This enables separate wardrobes for each family member profile

-- Step 1: Add the wardrobe_profile_id column
ALTER TABLE wardrobe_items 
ADD COLUMN IF NOT EXISTS wardrobe_profile_id UUID REFERENCES wardrobe_profiles(id) ON DELETE CASCADE;

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_profile_id 
ON wardrobe_items(wardrobe_profile_id);

CREATE INDEX IF NOT EXISTS idx_wardrobe_items_user_profile 
ON wardrobe_items(user_id, wardrobe_profile_id);

CREATE INDEX IF NOT EXISTS idx_wardrobe_profiles_user_id 
ON wardrobe_profiles(user_id);

-- Step 3: Update RLS policies to include profile-based access
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

-- Step 4: Add helpful comments
COMMENT ON COLUMN wardrobe_items.wardrobe_profile_id IS 'Links wardrobe items to specific family member profiles. NULL means item belongs to main user wardrobe.';

-- Verification query (optional - for testing)
-- SELECT 
--   column_name, 
--   data_type, 
--   is_nullable,
--   column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'wardrobe_items' 
-- AND column_name = 'wardrobe_profile_id';
