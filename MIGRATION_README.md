# Wardrobe Profile Migration Guide

This migration adds support for separate wardrobes for each family member profile in StyleGenie.

## What This Migration Does

1. **Adds `wardrobe_profile_id` column** to the `wardrobe_items` table
2. **Creates foreign key relationship** to `wardrobe_profiles` table
3. **Adds performance indexes** for faster queries
4. **Updates Row Level Security policies** for proper access control
5. **Enables separate wardrobes** for each family member

## Before Migration

- All wardrobe items belong to the main user
- No way to separate items by family member
- Single shared wardrobe space

## After Migration

- Each family member can have their own wardrobe
- Items can be assigned to specific profiles
- Main user wardrobe still exists (items with `wardrobe_profile_id = NULL`)
- Better organization and privacy

## How to Run Migration

### Option 1: Using npm script (Recommended)
\`\`\`bash
# Navigate to your project directory
cd /path/to/your/stylegenie-project

# Run the migration
npm run migrate:wardrobe-profiles
\`\`\`

### Option 2: Manual SQL execution
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy contents of `scripts/add-wardrobe-profile-column.sql`
4. Execute the SQL

## Verification

After running the migration, verify it worked:

\`\`\`sql
-- Check if column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'wardrobe_items' 
AND column_name = 'wardrobe_profile_id';

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'wardrobe_items' 
AND indexname LIKE '%profile%';
\`\`\`

## Troubleshooting

### Error: "relation does not exist"
- Make sure `wardrobe_profiles` table exists first
- Run the wardrobe profiles creation script

### Error: "permission denied"
- Use service role key, not anon key
- Check Supabase credentials

### Error: "column already exists"
- Migration already completed
- Safe to ignore this error

## Rollback (if needed)

\`\`\`sql
-- Remove the column (WARNING: This will delete data!)
ALTER TABLE wardrobe_items DROP COLUMN IF EXISTS wardrobe_profile_id;

-- Remove indexes
DROP INDEX IF EXISTS idx_wardrobe_items_profile_id;
DROP INDEX IF EXISTS idx_wardrobe_items_user_profile;
\`\`\`

## Next Steps

1. Refresh your application
2. Go to `/wardrobes` page
3. Create family member profiles
4. Add items to specific wardrobes
5. Test the separate wardrobe functionality
