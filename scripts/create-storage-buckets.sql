-- Create storage buckets for wardrobe images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'wardrobe-images',
    'wardrobe-images',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'outfit-images',
    'outfit-images',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profile-avatars',
    'profile-avatars',
    true,
    2097152, -- 2MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies
-- Wardrobe images policies
CREATE POLICY "Users can upload own wardrobe images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'wardrobe-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view own wardrobe images" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'wardrobe-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update own wardrobe images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'wardrobe-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own wardrobe images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'wardrobe-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Outfit images policies
CREATE POLICY "Users can upload own outfit images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'outfit-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view own outfit images" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'outfit-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update own outfit images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'outfit-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own outfit images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'outfit-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Profile avatars policies
CREATE POLICY "Users can upload own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'profile-avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view own avatar" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'profile-avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'profile-avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own avatar" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'profile-avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );
