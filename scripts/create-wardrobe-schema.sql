-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO public.categories (name, description, icon) VALUES
    ('dresses', 'Dresses and gowns', 'dress'),
    ('tops', 'Shirts, blouses, and tops', 'shirt'),
    ('bottoms', 'Pants, jeans, and skirts', 'pants'),
    ('shoes', 'All types of footwear', 'shoe'),
    ('outerwear', 'Jackets, coats, and blazers', 'jacket'),
    ('accessories', 'Jewelry, bags, and accessories', 'accessory')
ON CONFLICT (name) DO NOTHING;

-- Create tags table
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#6B7280',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert common tags
INSERT INTO public.tags (name, color) VALUES
    ('casual', '#10B981'),
    ('formal', '#3B82F6'),
    ('business', '#6366F1'),
    ('party', '#EC4899'),
    ('summer', '#F59E0B'),
    ('winter', '#6B7280'),
    ('spring', '#84CC16'),
    ('fall', '#EA580C'),
    ('black', '#1F2937'),
    ('white', '#F9FAFB'),
    ('red', '#EF4444'),
    ('blue', '#3B82F6'),
    ('green', '#10B981'),
    ('yellow', '#F59E0B'),
    ('pink', '#EC4899'),
    ('purple', '#8B5CF6'),
    ('gray', '#6B7280'),
    ('brown', '#92400E'),
    ('cotton', '#84CC16'),
    ('silk', '#EC4899'),
    ('wool', '#6B7280'),
    ('denim', '#3B82F6'),
    ('leather', '#92400E'),
    ('polyester', '#6B7280')
ON CONFLICT (name) DO NOTHING;

-- Create wardrobe_items table
CREATE TABLE IF NOT EXISTS public.wardrobe_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    brand TEXT,
    color TEXT,
    size TEXT,
    price DECIMAL(10,2),
    purchase_date DATE,
    image_url TEXT,
    image_path TEXT, -- For Supabase Storage
    is_favorite BOOLEAN DEFAULT FALSE,
    condition TEXT CHECK (condition IN ('new', 'excellent', 'good', 'fair', 'poor')) DEFAULT 'good',
    last_worn DATE,
    wear_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wardrobe_item_tags junction table (many-to-many)
CREATE TABLE IF NOT EXISTS public.wardrobe_item_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wardrobe_item_id UUID REFERENCES public.wardrobe_items(id) ON DELETE CASCADE NOT NULL,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(wardrobe_item_id, tag_id)
);

-- Create outfits table
CREATE TABLE IF NOT EXISTS public.outfits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    occasion TEXT,
    weather_condition TEXT,
    temperature_range TEXT,
    season TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    worn_date DATE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create outfit_items junction table
CREATE TABLE IF NOT EXISTS public.outfit_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    outfit_id UUID REFERENCES public.outfits(id) ON DELETE CASCADE NOT NULL,
    wardrobe_item_id UUID REFERENCES public.wardrobe_items(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(outfit_id, wardrobe_item_id)
);

-- Create outfit_recommendations table (AI generated outfits)
CREATE TABLE IF NOT EXISTS public.outfit_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    occasion TEXT,
    weather_data JSONB,
    location TEXT,
    ai_response TEXT,
    recommended_items JSONB, -- Array of wardrobe item IDs
    similar_items JSONB, -- Online shopping suggestions
    is_saved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_user_id ON public.wardrobe_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_category_id ON public.wardrobe_items(category_id);
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_created_at ON public.wardrobe_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wardrobe_item_tags_item_id ON public.wardrobe_item_tags(wardrobe_item_id);
CREATE INDEX IF NOT EXISTS idx_wardrobe_item_tags_tag_id ON public.wardrobe_item_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_outfits_user_id ON public.outfits(user_id);
CREATE INDEX IF NOT EXISTS idx_outfit_items_outfit_id ON public.outfit_items(outfit_id);
CREATE INDEX IF NOT EXISTS idx_outfit_recommendations_user_id ON public.outfit_recommendations(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wardrobe_item_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfit_recommendations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Wardrobe items policies
CREATE POLICY "Users can view own wardrobe items" ON public.wardrobe_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wardrobe items" ON public.wardrobe_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wardrobe items" ON public.wardrobe_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wardrobe items" ON public.wardrobe_items
    FOR DELETE USING (auth.uid() = user_id);

-- Wardrobe item tags policies
CREATE POLICY "Users can manage own item tags" ON public.wardrobe_item_tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.wardrobe_items 
            WHERE id = wardrobe_item_tags.wardrobe_item_id 
            AND user_id = auth.uid()
        )
    );

-- Outfits policies
CREATE POLICY "Users can view own outfits" ON public.outfits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own outfits" ON public.outfits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own outfits" ON public.outfits
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own outfits" ON public.outfits
    FOR DELETE USING (auth.uid() = user_id);

-- Outfit items policies
CREATE POLICY "Users can manage own outfit items" ON public.outfit_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.outfits 
            WHERE id = outfit_items.outfit_id 
            AND user_id = auth.uid()
        )
    );

-- Outfit recommendations policies
CREATE POLICY "Users can view own recommendations" ON public.outfit_recommendations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations" ON public.outfit_recommendations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendations" ON public.outfit_recommendations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recommendations" ON public.outfit_recommendations
    FOR DELETE USING (auth.uid() = user_id);

-- Allow public read access to categories and tags
CREATE POLICY "Anyone can view categories" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view tags" ON public.tags
    FOR SELECT USING (true);

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_wardrobe_items
    BEFORE UPDATE ON public.wardrobe_items
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_outfits
    BEFORE UPDATE ON public.outfits
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
