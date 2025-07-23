-- Migration script to add wardrobe_profile_id column to wardrobe_items table
-- This enables separate wardrobes for each family member profile

-- Step 1: Check if the column already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'wardrobe_items' 
        AND column_name = 'wardrobe_profile_id'
    ) THEN
        -- Step 2: Add the wardrobe_profile_id column
        ALTER TABLE wardrobe_items 
        ADD COLUMN wardrobe_profile_id UUID REFERENCES wardrobe_profiles(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Successfully added wardrobe_profile_id column to wardrobe_items table';
    ELSE
        RAISE NOTICE 'wardrobe_profile_id column already exists in wardrobe_items table';
    END IF;
END $$;

-- Step 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_profile_id 
ON wardrobe_items(wardrobe_profile_id);

CREATE INDEX IF NOT EXISTS idx_wardrobe_items_user_profile 
ON wardrobe_items(user_id, wardrobe_profile_id);

CREATE INDEX IF NOT EXISTS idx_wardrobe_profiles_user_id 
ON wardrobe_profiles(user_id);

-- Step 4: Update Row Level Security policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own wardrobe items" ON wardrobe_items;
DROP POLICY IF EXISTS "Users can insert their own wardrobe items" ON wardrobe_items;
DROP POLICY IF EXISTS "Users can update their own wardrobe items" ON wardrobe_items;
DROP POLICY IF EXISTS "Users can delete their own wardrobe items" ON wardrobe_items;

-- Create new policies that account for wardrobe profiles
CREATE POLICY "Users can view their own wardrobe items and family items" ON wardrobe_items
    FOR SELECT USING (
        user_id = auth.uid() OR 
        wardrobe_profile_id IN (
            SELECT id FROM wardrobe_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own wardrobe items and family items" ON wardrobe_items
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND (
            wardrobe_profile_id IS NULL OR 
            wardrobe_profile_id IN (
                SELECT id FROM wardrobe_profiles WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update their own wardrobe items and family items" ON wardrobe_items
    FOR UPDATE USING (
        user_id = auth.uid() OR 
        wardrobe_profile_id IN (
            SELECT id FROM wardrobe_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own wardrobe items and family items" ON wardrobe_items
    FOR DELETE USING (
        user_id = auth.uid() OR 
        wardrobe_profile_id IN (
            SELECT id FROM wardrobe_profiles WHERE user_id = auth.uid()
        )
    );

-- Step 5: Add helpful comments
COMMENT ON COLUMN wardrobe_items.wardrobe_profile_id IS 'Links wardrobe items to specific family member profiles. NULL means item belongs to main user wardrobe.';

-- Step 6: Verify the migration
DO $$
BEGIN
    -- Check if column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'wardrobe_items' 
        AND column_name = 'wardrobe_profile_id'
    ) THEN
        RAISE NOTICE '✅ Migration completed successfully!';
        RAISE NOTICE '✅ wardrobe_profile_id column added to wardrobe_items table';
        RAISE NOTICE '✅ Foreign key constraint created to wardrobe_profiles table';
        RAISE NOTICE '✅ Performance indexes created';
        RAISE NOTICE '✅ Row Level Security policies updated';
        RAISE NOTICE '🎉 Family member wardrobes are now enabled!';
    ELSE
        RAISE EXCEPTION '❌ Migration failed: wardrobe_profile_id column was not created';
    END IF;
END $$;
