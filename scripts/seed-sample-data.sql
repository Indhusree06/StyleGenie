-- This script adds sample data for testing
-- Note: Replace 'sample-user-id' with actual user ID when testing

-- Sample wardrobe items (you'll need to replace user_id with actual user ID)
DO $$
DECLARE
    sample_user_id UUID := '00000000-0000-0000-0000-000000000000'; -- Replace with actual user ID
    dress_category_id UUID;
    tops_category_id UUID;
    bottoms_category_id UUID;
    shoes_category_id UUID;
    outerwear_category_id UUID;
    accessories_category_id UUID;
    
    casual_tag_id UUID;
    formal_tag_id UUID;
    black_tag_id UUID;
    white_tag_id UUID;
    summer_tag_id UUID;
    winter_tag_id UUID;
    
    item1_id UUID;
    item2_id UUID;
    item3_id UUID;
    item4_id UUID;
    item5_id UUID;
    
    outfit1_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO dress_category_id FROM public.categories WHERE name = 'dresses';
    SELECT id INTO tops_category_id FROM public.categories WHERE name = 'tops';
    SELECT id INTO bottoms_category_id FROM public.categories WHERE name = 'bottoms';
    SELECT id INTO shoes_category_id FROM public.categories WHERE name = 'shoes';
    SELECT id INTO outerwear_category_id FROM public.categories WHERE name = 'outerwear';
    SELECT id INTO accessories_category_id FROM public.categories WHERE name = 'accessories';
    
    -- Get tag IDs
    SELECT id INTO casual_tag_id FROM public.tags WHERE name = 'casual';
    SELECT id INTO formal_tag_id FROM public.tags WHERE name = 'formal';
    SELECT id INTO black_tag_id FROM public.tags WHERE name = 'black';
    SELECT id INTO white_tag_id FROM public.tags WHERE name = 'white';
    SELECT id INTO summer_tag_id FROM public.tags WHERE name = 'summer';
    SELECT id INTO winter_tag_id FROM public.tags WHERE name = 'winter';
    
    -- Insert sample wardrobe items
    INSERT INTO public.wardrobe_items (id, user_id, category_id, name, description, brand, color, size, condition)
    VALUES 
        (gen_random_uuid(), sample_user_id, dress_category_id, 'Black Evening Dress', 'Elegant black dress perfect for formal occasions', 'Zara', 'Black', 'M', 'excellent'),
        (gen_random_uuid(), sample_user_id, tops_category_id, 'White Cotton T-Shirt', 'Basic white cotton t-shirt for everyday wear', 'Uniqlo', 'White', 'S', 'good'),
        (gen_random_uuid(), sample_user_id, bottoms_category_id, 'Blue Denim Jeans', 'Classic blue denim jeans', 'Levi''s', 'Blue', '30', 'good'),
        (gen_random_uuid(), sample_user_id, shoes_category_id, 'Black Leather Boots', 'Stylish black leather ankle boots', 'Dr. Martens', 'Black', '8', 'excellent'),
        (gen_random_uuid(), sample_user_id, outerwear_category_id, 'Navy Blazer', 'Professional navy blazer for business occasions', 'H&M', 'Navy', 'M', 'good')
    RETURNING id INTO item1_id;
    
    -- Note: In a real application, you would add the tag associations here
    -- This is just sample structure - actual implementation would need proper user authentication
    
END $$;
