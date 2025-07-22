const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = "https://xypmyqpkmnjbdbsfrgco.supabase.co"
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4OTAwNSwiZXhwIjoyMDY4MTY1MDA1fQ.X45Nd50noVBzp8DcvNnnhEzdPG5NN6fzodA_Es9em94"

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkAndCreateTable() {
  console.log('🔍 Checking database status...')
  
  try {
    // First, let's check if we can connect at all
    console.log('Testing basic connection...')
    
    // Try to list existing tables using a different approach
    const { data: existingTables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')

    if (tablesError) {
      console.log('⚠️  Could not check existing tables via pg_tables, trying alternative...')
      
      // Try direct table access
      const { data: testData, error: testError } = await supabase
        .from('wardrobe_profiles')
        .select('count')
        .limit(1)

      if (testError) {
        if (testError.code === '42P01') {
          console.log('❌ Table wardrobe_profiles does not exist')
          console.log('🔧 Creating table now...')
          
          // Create the table using individual SQL statements
          await createTableStep()
          return
        } else {
          console.error('❌ Unexpected error:', testError)
          return
        }
      } else {
        console.log('✅ Table wardrobe_profiles already exists!')
        console.log('📊 Current row count:', testData)
        return
      }
    } else {
      console.log('📋 Existing tables:', existingTables?.map(t => t.tablename) || [])
      
      const hasWardrobeTable = existingTables?.some(t => t.tablename === 'wardrobe_profiles')
      
      if (hasWardrobeTable) {
        console.log('✅ Table wardrobe_profiles already exists!')
      } else {
        console.log('❌ Table wardrobe_profiles does not exist')
        console.log('🔧 Creating table now...')
        await createTableStep()
      }
    }

  } catch (error) {
    console.error('❌ Error checking database:', error)
  }
}

async function createTableStep() {
  try {
    // Step 1: Create the table
    console.log('Step 1: Creating table structure...')
    
    const createTableQuery = `
      CREATE TABLE wardrobe_profiles (
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

    const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableQuery })
    
    if (createError) {
      console.error('❌ Error creating table:', createError)
      console.log('💡 Please run this SQL manually in Supabase dashboard:')
      console.log(createTableQuery)
      return false
    }

    console.log('✅ Table created successfully!')

    // Step 2: Enable RLS
    console.log('Step 2: Setting up security policies...')
    
    const rlsQuery = `
      ALTER TABLE wardrobe_profiles ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Users can view own wardrobe profiles" ON wardrobe_profiles
        FOR SELECT USING (auth.uid() = user_id);

      CREATE POLICY "Users can insert own wardrobe profiles" ON wardrobe_profiles
        FOR INSERT WITH CHECK (auth.uid() = user_id);

      CREATE POLICY "Users can update own wardrobe profiles" ON wardrobe_profiles
        FOR UPDATE USING (auth.uid() = user_id);

      CREATE POLICY "Users can delete own wardrobe profiles" ON wardrobe_profiles
        FOR DELETE USING (auth.uid() = user_id);
    `

    const { error: rlsError } = await supabase.rpc('exec_sql', { sql: rlsQuery })
    
    if (rlsError) {
      console.log('⚠️  RLS setup may have failed, but table should still work')
    } else {
      console.log('✅ Security policies created!')
    }

    // Step 3: Test the table
    console.log('Step 3: Testing table...')
    
    const { data: testData, error: testError } = await supabase
      .from('wardrobe_profiles')
      .select('count')
      .limit(1)

    if (testError) {
      console.error('❌ Table test failed:', testError)
      return false
    }

    console.log('✅ Table test successful!')
    console.log('🎉 Database setup completed!')
    
    return true

  } catch (error) {
    console.error('❌ Error in table creation:', error)
    return false
  }
}

// Run the check
checkAndCreateTable().then(() => {
  console.log('\n🎯 Next steps:')
  console.log('1. Refresh your app (localhost:3003/wardrobes)')
  console.log('2. Check browser console for "wardrobe_profiles table exists: true"')
  console.log('3. Try adding a new wardrobe profile')
  process.exit(0)
})