const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = "https://xypmyqpkmnjbdbsfrgco.supabase.co"
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4OTAwNSwiZXhwIjoyMDY4MTY1MDA1fQ.X45Nd50noVBzp8DcvNnnhEzdPG5NN6fzodA_Es9em94"

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createWardrobeTable() {
  console.log('🚀 Creating wardrobe_profiles table...')
  
  try {
    // First, let's check what tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')

    if (tablesError) {
      console.error('❌ Error checking existing tables:', tablesError)
    } else {
      console.log('📋 Existing tables:', tables?.map(t => t.table_name) || [])
    }

    // Create the table using raw SQL
    const createTableSQL = `
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
    `

    const { data: createResult, error: createError } = await supabase.rpc('exec', {
      sql: createTableSQL
    })

    if (createError) {
      console.log('⚠️  RPC exec failed, trying direct SQL execution...')
      
      // Alternative approach: Use the REST API directly
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({
          sql: createTableSQL
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Direct SQL execution failed:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      console.log('✅ Table created via direct SQL execution!')
    } else {
      console.log('✅ Table created via RPC!')
    }

    // Enable RLS
    const rlsSQL = `
      ALTER TABLE wardrobe_profiles ENABLE ROW LEVEL SECURITY;
      
      -- Drop existing policies if they exist
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
    `

    // Execute RLS setup
    const rlsResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({
        sql: rlsSQL
      })
    })

    if (rlsResponse.ok) {
      console.log('✅ RLS policies created!')
    } else {
      console.log('⚠️  RLS setup may have failed, but table should still work')
    }

    // Test the table
    const { data: testData, error: testError } = await supabase
      .from('wardrobe_profiles')
      .select('count')
      .limit(1)

    if (testError) {
      console.error('❌ Error testing table:', testError)
      return false
    }

    console.log('✅ Table test successful!')
    console.log('🎉 wardrobe_profiles table is ready!')
    
    return true

  } catch (error) {
    console.error('❌ Setup failed:', error)
    return false
  }
}

// Run the setup
createWardrobeTable().then(success => {
  if (success) {
    console.log('\n🎯 Success! Next steps:')
    console.log('1. Refresh your app (localhost:3003/wardrobes)')
    console.log('2. Try adding a new wardrobe profile')
    console.log('3. The "Add Wardrobe" button should now work!')
  } else {
    console.log('\n💡 If this failed, you can create the table manually:')
    console.log('1. Go to https://supabase.com/dashboard/project/xypmyqpkmnjbdbsfrgco')
    console.log('2. Click "SQL Editor"')
    console.log('3. Run the CREATE TABLE command from above')
  }
  process.exit(success ? 0 : 1)
})