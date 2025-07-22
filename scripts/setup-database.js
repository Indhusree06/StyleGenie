const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = "https://xypmyqpkmnjbdbsfrgco.supabase.co"
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4OTAwNSwiZXhwIjoyMDY4MTY1MDA1fQ.X45Nd50noVBzp8DcvNnnhEzdPG5NN6fzodA_Es9em94"

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  console.log('🚀 Setting up wardrobe_profiles database table...')
  
  try {
    // Create the wardrobe_profiles table
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
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

        -- Enable Row Level Security
        ALTER TABLE wardrobe_profiles ENABLE ROW LEVEL SECURITY;

        -- Create RLS policies
        DROP POLICY IF EXISTS "Users can view own wardrobe profiles" ON wardrobe_profiles;
        CREATE POLICY "Users can view own wardrobe profiles" ON wardrobe_profiles
          FOR SELECT USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can insert own wardrobe profiles" ON wardrobe_profiles;
        CREATE POLICY "Users can insert own wardrobe profiles" ON wardrobe_profiles
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can update own wardrobe profiles" ON wardrobe_profiles;
        CREATE POLICY "Users can update own wardrobe profiles" ON wardrobe_profiles
          FOR UPDATE USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can delete own wardrobe profiles" ON wardrobe_profiles;
        CREATE POLICY "Users can delete own wardrobe profiles" ON wardrobe_profiles
          FOR DELETE USING (auth.uid() = user_id);

        -- Create updated_at trigger
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        DROP TRIGGER IF EXISTS update_wardrobe_profiles_updated_at ON wardrobe_profiles;
        CREATE TRIGGER update_wardrobe_profiles_updated_at 
          BEFORE UPDATE ON wardrobe_profiles 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `
    })

    if (error) {
      console.error('❌ Error creating table:', error)
      return false
    }

    console.log('✅ wardrobe_profiles table created successfully!')

    // Create storage bucket for profile pictures
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('profile-pictures', {
      public: true
    })

    if (bucketError && !bucketError.message.includes('already exists')) {
      console.error('❌ Error creating storage bucket:', bucketError)
    } else {
      console.log('✅ profile-pictures storage bucket ready!')
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

    console.log('✅ Database setup completed successfully!')
    console.log('🎉 You can now add wardrobe profiles in your app!')
    return true

  } catch (error) {
    console.error('❌ Setup failed:', error)
    return false
  }
}

// Run the setup
setupDatabase().then(success => {
  if (success) {
    console.log('\n🎯 Next steps:')
    console.log('1. Refresh your app (localhost:3003/wardrobes)')
    console.log('2. Try adding a new wardrobe profile')
    console.log('3. Check the browser console for success messages')
  } else {
    console.log('\n💡 Manual setup required:')
    console.log('1. Go to your Supabase dashboard')
    console.log('2. Open SQL Editor')
    console.log('3. Run the SQL commands from the setup script')
  }
  process.exit(success ? 0 : 1)
})
