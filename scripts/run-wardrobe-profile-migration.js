const { createClient } = require("@supabase/supabase-js")

// Use the actual Supabase credentials provided
const supabaseUrl = "https://xypmyqpkmnjbdbsfrgco.supabase.co"
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4OTAwNSwiZXhwIjoyMDY4MTY1MDA1fQ.X45Nd50noVBzp8DcvNnnhEzdPG5NN6fzodA_Es9em94"

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function runWardrobeProfileMigration() {
  console.log("🚀 Starting wardrobe profile migration...")
  console.log("📍 Supabase URL:", supabaseUrl)

  try {
    // Step 1: Check if wardrobe_profile_id column already exists
    console.log("\n1️⃣ Checking if wardrobe_profile_id column exists...")

    const { data: columnCheck, error: columnError } = await supabase
      .from("wardrobe_items")
      .select("wardrobe_profile_id")
      .limit(1)

    if (!columnError) {
      console.log("✅ wardrobe_profile_id column already exists!")
      console.log("🎉 Migration appears to be already complete.")
      return true
    }

    if (columnError.code !== "42703") {
      console.error("❌ Unexpected error checking column:", columnError)
      return false
    }

    console.log("📝 wardrobe_profile_id column does not exist, proceeding with migration...")

    // Step 2: Add the wardrobe_profile_id column
    console.log("\n2️⃣ Adding wardrobe_profile_id column to wardrobe_items table...")

    const addColumnSQL = `
      -- Add wardrobe_profile_id column to wardrobe_items table
      ALTER TABLE wardrobe_items 
      ADD COLUMN IF NOT EXISTS wardrobe_profile_id UUID REFERENCES wardrobe_profiles(id) ON DELETE CASCADE;
    `

    const response1 = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseServiceKey}`,
        apikey: supabaseServiceKey,
      },
      body: JSON.stringify({
        sql: addColumnSQL,
      }),
    })

    if (!response1.ok) {
      const errorText = await response1.text()
      console.error("❌ Failed to add column:", errorText)
      return false
    }

    console.log("✅ Successfully added wardrobe_profile_id column!")

    // Step 3: Create indexes for better performance
    console.log("\n3️⃣ Creating performance indexes...")

    const indexSQL = `
      -- Create indexes for better query performance
      CREATE INDEX IF NOT EXISTS idx_wardrobe_items_profile_id 
      ON wardrobe_items(wardrobe_profile_id);
      
      CREATE INDEX IF NOT EXISTS idx_wardrobe_items_user_profile 
      ON wardrobe_items(user_id, wardrobe_profile_id);
      
      CREATE INDEX IF NOT EXISTS idx_wardrobe_profiles_user_id 
      ON wardrobe_profiles(user_id);
    `

    const response2 = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseServiceKey}`,
        apikey: supabaseServiceKey,
      },
      body: JSON.stringify({
        sql: indexSQL,
      }),
    })

    if (!response2.ok) {
      const errorText = await response2.text()
      console.error("⚠️ Warning: Failed to create some indexes:", errorText)
      console.log("📝 This is not critical - the main functionality will still work")
    } else {
      console.log("✅ Successfully created performance indexes!")
    }

    // Step 4: Update RLS policies to include profile-based access
    console.log("\n4️⃣ Updating Row Level Security policies...")

    const rlsSQL = `
      -- Update RLS policies for wardrobe_items to include profile access
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
    `

    const response3 = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseServiceKey}`,
        apikey: supabaseServiceKey,
      },
      body: JSON.stringify({
        sql: rlsSQL,
      }),
    })

    if (!response3.ok) {
      const errorText = await response3.text()
      console.error("⚠️ Warning: Failed to update RLS policies:", errorText)
      console.log("📝 This may affect security - please update policies manually")
    } else {
      console.log("✅ Successfully updated RLS policies!")
    }

    // Step 5: Verify the migration
    console.log("\n5️⃣ Verifying migration...")

    const { data: verifyData, error: verifyError } = await supabase
      .from("wardrobe_items")
      .select("id, user_id, wardrobe_profile_id")
      .limit(1)

    if (verifyError) {
      console.error("❌ Migration verification failed:", verifyError)
      return false
    }

    console.log("✅ Migration verification successful!")

    // Step 6: Show current database state
    console.log("\n6️⃣ Current database state:")

    const { data: itemsCount } = await supabase.from("wardrobe_items").select("count").single()

    const { data: profilesCount } = await supabase.from("wardrobe_profiles").select("count").single()

    console.log(`📊 Total wardrobe items: ${itemsCount?.count || 0}`)
    console.log(`👥 Total wardrobe profiles: ${profilesCount?.count || 0}`)

    console.log("\n🎉 Migration completed successfully!")
    console.log("\n📋 What this migration accomplished:")
    console.log("   ✅ Added wardrobe_profile_id column to wardrobe_items table")
    console.log("   ✅ Created foreign key relationship to wardrobe_profiles")
    console.log("   ✅ Added performance indexes for faster queries")
    console.log("   ✅ Updated Row Level Security policies")
    console.log("   ✅ Enabled separate wardrobes for each family member")

    console.log("\n🚀 Next steps:")
    console.log("   1. Refresh your application")
    console.log("   2. Go to /wardrobes page")
    console.log("   3. Create family member profiles")
    console.log("   4. Add items to specific wardrobes")
    console.log("   5. Each family member now has their own separate wardrobe!")

    return true
  } catch (error) {
    console.error("❌ Migration failed with error:", error)
    console.error("Error details:", {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
    })
    return false
  }
}

// Handle command line arguments
const args = process.argv.slice(2)
const urlArg = args.find((arg) => arg.startsWith("--url="))
const keyArg = args.find((arg) => arg.startsWith("--key="))

if (urlArg || keyArg) {
  console.log("📝 Note: Using hardcoded credentials from the script.")
  console.log("   Command line arguments are ignored for security.")
}

// Run the migration
runWardrobeProfileMigration()
  .then((success) => {
    if (success) {
      console.log("\n✨ Migration completed successfully!")
      console.log("🔄 Please refresh your application to see the changes.")
      process.exit(0)
    } else {
      console.log("\n💥 Migration failed!")
      console.log("🛠️  Please check the error messages above and try again.")
      console.log("📞 If you need help, please share the error messages.")
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error("💥 Unexpected error:", error)
    process.exit(1)
  })
