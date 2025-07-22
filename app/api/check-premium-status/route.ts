import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { wardrobeProfileService } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    // Get the current user from the session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ isPremium: false }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Check if user has multiple wardrobe profiles (premium feature)
    const profiles = await wardrobeProfileService.getWardrobeProfiles(userId);
    
    // User is considered premium if they have at least one additional wardrobe profile
    const isPremium = (profiles && profiles.length > 0);
    
    return NextResponse.json({ isPremium });
  } catch (error) {
    console.error('Error checking premium status:', error);
    return NextResponse.json({ isPremium: false }, { status: 500 });
  }
}
