-- First, check if the column already exists to avoid errors
DO $$ 
BEGIN
    -- Check if date_of_birth column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'wardrobe_profiles' 
        AND column_name = 'date_of_birth'
    ) THEN
        -- Add date_of_birth column to wardrobe_profiles table
        ALTER TABLE wardrobe_profiles 
        ADD COLUMN date_of_birth DATE;
        
        RAISE NOTICE 'Added date_of_birth column to wardrobe_profiles table';
    ELSE
        RAISE NOTICE 'date_of_birth column already exists in wardrobe_profiles table';
    END IF;
END $$;

-- Update existing profiles to have a calculated DOB based on current age
-- This is a one-time migration for existing data
UPDATE wardrobe_profiles 
SET date_of_birth = CURRENT_DATE - INTERVAL '1 year' * COALESCE(age, 25)
WHERE date_of_birth IS NULL AND age IS NOT NULL;

-- Add index for better performance on DOB queries if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'wardrobe_profiles' 
        AND indexname = 'idx_wardrobe_profiles_dob'
    ) THEN
        CREATE INDEX idx_wardrobe_profiles_dob ON wardrobe_profiles(date_of_birth);
        RAISE NOTICE 'Created index idx_wardrobe_profiles_dob';
    ELSE
        RAISE NOTICE 'Index idx_wardrobe_profiles_dob already exists';
    END IF;
END $$;

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'wardrobe_profiles' 
ORDER BY ordinal_position;
