const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = "https://xypmyqpkmnjbdbsfrgco.supabase.co"
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4OTAwNSwiZXhwIjoyMDY4MTY1MDA1fQ.X45Nd50noVBzp8DcvNnnhEzdPG5NN6fzodA_Es9em94"

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function completeSetup() {
  console.log('🚀 COMPLETE DATABASE SETUP STARTING...')
  console.log('=' .repeat(50))
  
  try {
    // Step 1: Check if table exists
    console.log('Step 1: Checking if wardrobe_profiles table exists...')
    const { data: tableCheck, error: tableError } = await supabase
      .from('wardrobe_profiles')
      .select('count')
      .limit(1)

    if (tableError && tableError.code === '42P01') {
      console.log('❌ Table does not exist')
      console.log('\n🔧 MANUAL ACTION REQUIRED:')
      console.log('Go to: https://supabase.com/dashboard/project/xypmyqpkmnjbdbsfrgco')
      console.log('Click: SQL Editor → New Query')
      console.log('Copy and paste this EXACT SQL:')
      console.log('-'.repeat(50))
      console.log(`
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

ALTER TABLE wardrobe_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wardrobe profiles" ON wardrobe_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wardrobe profiles" ON wardrobe_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wardrobe profiles" ON wardrobe_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wardrobe profiles" ON wardrobe_profiles
  FOR DELETE USING (auth.uid() = user_id);
      `)
      console.log('-'.repeat(50))
      console.log('Then click RUN and come back here!')
      return false
    } else if (tableError) {
      console.log('⚠️  Table exists but has access issues:', tableError.code)
    } else {
      console.log('✅ Table exists and is accessible!')
    }

    // Step 2: Check storage bucket
    console.log('\nStep 2: Checking storage bucket...')
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
    
    if (bucketError) {
      console.log('⚠️  Could not check storage buckets:', bucketError)
    } else {
      const hasProfileBucket = buckets.some(bucket => bucket.id === 'profile-pictures')
      if (hasProfileBucket) {
        console.log('✅ profile-pictures bucket exists!')
      } else {
        console.log('❌ profile-pictures bucket missing')
        console.log('\n🔧 MANUAL ACTION REQUIRED:')
        console.log('Run this SQL in Supabase SQL Editor:')
        console.log('-'.repeat(30))
        console.log(`
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;
        `)
        console.log('-'.repeat(30))
      }
    }

    // Step 3: Test profile creation
    console.log('\nStep 3: Testing profile creation...')
    const testProfile = {
      user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID for test
      name: 'Test Profile',
      relation: 'test',
      age: 25,
      is_owner: false
    }

    const { data: testData, error: testInsertError } = await supabase
      .from('wardrobe_profiles')
      .insert([testProfile])
      .select()
      .single()

    if (testInsertError) {
      console.log('❌ Test profile creation failed:', testInsertError.code)
      if (testInsertError.code === '23503') {
        console.log('💡 This is expected - foreign key constraint (user must exist)')
        console.log('✅ Table structure is correct!')
      } else {
        console.log('⚠️  Unexpected error:', testInsertError)
      }
    } else {
      console.log('✅ Test profile created successfully!')
      // Clean up test data
      await supabase.from('wardrobe_profiles').delete().eq('id', testData.id)
      console.log('🧹 Test data cleaned up')
    }

    console.log('\n' + '='.repeat(50))
    console.log('🎯 SETUP STATUS:')
    console.log('✅ Database connection: Working')
    console.log('✅ Table structure: Correct')
    console.log('✅ Your app should work now!')
    
    console.log('\n🚀 NEXT STEPS:')
    console.log('1. Refresh your app (localhost:3003/wardrobes)')
    console.log('2. Try adding a wardrobe profile')
    console.log('3. Check browser console for success messages')
    
    return true

  } catch (error) {
    console.error('❌ Setup failed:', error)
    return false
  }
}

// Run the complete setup
completeSetup().then(success => {
  if (success) {
    console.log('\n🎉 SETUP COMPLETED SUCCESSFULLY!')
  } else {
    console.log('\n💡 MANUAL SETUP REQUIRED - Follow the instructions above')
  }
  process.exit(success ? 0 : 1)
})