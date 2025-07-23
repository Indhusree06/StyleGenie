# Weather Smart Wardrobe Profile Migration Guide

This guide will help you set up separate wardrobes for each family member in your Weather Smart application.

## 🎯 What This Migration Does

**Before Migration:**
- All clothing items are stored in one main wardrobe
- Family member profiles exist but can't have their own wardrobes
- Items are only associated with the main user

**After Migration:**
- Each family member gets their own separate wardrobe
- Items can be assigned to specific family members
- Main wardrobe remains for the primary user
- Better organization and personalized recommendations

## 🚀 How to Run the Migration

### Option 1: Node.js Script (Recommended)

1. **Open your terminal** in the project root directory

2. **Install dependencies** (if not already done):
   \`\`\`bash
   npm install
   \`\`\`

3. **Run the migration script**:
   \`\`\`bash
   npm run migrate:wardrobe-profiles
   \`\`\`

4. **Wait for completion** - you'll see progress messages like:
   \`\`\`
   🚀 Starting wardrobe profile migration...
   1️⃣ Checking if wardrobe_profile_id column exists...
   2️⃣ Adding wardrobe_profile_id column to wardrobe_items table...
   ✅ Successfully added wardrobe_profile_id column!
   🎉 Migration completed successfully!
   \`\`\`

### Option 2: Manual SQL (Backup Method)

If the Node.js script doesn't work:

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Copy the contents** of `scripts/add-wardrobe-profile-column.sql`
4. **Paste and run** the SQL commands
5. **Check for success messages** in the output

## 🔍 Verifying the Migration

After running the migration, verify it worked:

1. **Check the database structure**:
   - Go to Supabase Dashboard → Table Editor
   - Open the `wardrobe_items` table
   - Look for the new `wardrobe_profile_id` column

2. **Test the application**:
   - Refresh your Weather Smart app
   - Go to `/wardrobes` page
   - Create a new family member profile
   - Add items to their wardrobe
   - Verify items appear in their separate wardrobe

## 📊 Database Changes Made

### New Column Added
\`\`\`sql
wardrobe_items.wardrobe_profile_id UUID REFERENCES wardrobe_profiles(id)
\`\`\`

### Indexes Created
- `idx_wardrobe_items_profile_id` - Fast lookups by profile
- `idx_wardrobe_items_user_profile` - Fast user + profile queries
- `idx_wardrobe_profiles_user_id` - Fast profile lookups

### Security Policies Updated
- Users can only access their own wardrobes and family member wardrobes
- Proper Row Level Security (RLS) for multi-user safety

## 🎉 What You Can Do Now

After successful migration:

1. **Create Family Member Profiles**:
   - Go to `/wardrobes`
   - Click "Add Family Member"
   - Fill in details (name, age, relationship, etc.)

2. **Add Items to Specific Wardrobes**:
   - When adding clothes, select which family member it belongs to
   - Items will be stored in their separate wardrobe

3. **View Separate Wardrobes**:
   - Each family member has their own wardrobe page
   - Items are organized by person
   - Age-appropriate suggestions and categories

4. **Get Personalized Recommendations**:
   - AI suggestions based on individual profiles
   - Weather recommendations per person
   - Age-appropriate clothing suggestions

## 🛠️ Troubleshooting

### Migration Script Fails
\`\`\`bash
❌ Migration failed with error: ...
\`\`\`

**Solutions:**
1. Check your internet connection
2. Verify Supabase credentials are correct
3. Try the manual SQL method instead
4. Check Supabase dashboard for any service issues

### Column Already Exists
\`\`\`bash
✅ wardrobe_profile_id column already exists!
\`\`\`

**This is normal!** The migration has already been run successfully.

### Permission Errors
\`\`\`bash
❌ Error: insufficient_privilege
\`\`\`

**Solutions:**
1. Make sure you're using the service role key (not anon key)
2. Check that your Supabase project has the correct permissions
3. Try running the SQL manually in Supabase Dashboard

### App Still Shows "Database Update Required"
1. **Hard refresh** your browser (Ctrl+F5 or Cmd+Shift+R)
2. **Clear browser cache** for the app
3. **Restart your development server** (`npm run dev`)
4. **Check browser console** for any JavaScript errors

## 📞 Need Help?

If you encounter issues:

1. **Check the error messages** - they usually contain helpful information
2. **Try the manual SQL method** if the script fails
3. **Verify your Supabase connection** in the dashboard
4. **Share the specific error message** if you need assistance

## 🔄 Rolling Back (If Needed)

If you need to undo the migration:

\`\`\`sql
-- Remove the column (this will delete all profile associations)
ALTER TABLE wardrobe_items DROP COLUMN IF EXISTS wardrobe_profile_id;

-- Remove indexes
DROP INDEX IF EXISTS idx_wardrobe_items_profile_id;
DROP INDEX IF EXISTS idx_wardrobe_items_user_profile;
\`\`\`

**⚠️ Warning:** This will remove all associations between items and family member profiles!

## 🎯 Next Steps

After successful migration:

1. **Refresh your application**
2. **Go to `/wardrobes` page**
3. **Create family member profiles**
4. **Start adding items to specific wardrobes**
5. **Enjoy personalized wardrobe management for the whole family!**
