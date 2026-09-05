-- ==============================================================================
-- NAWABI SAFAR: IDEMPOTENT SUPABASE SEED DATA MIGRATION
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PLACES (19 records)
-- ------------------------------------------------------------------------------
INSERT INTO public.places (
  id, slug, name, hindi_name, short_description, description, story, why_visit,
  category, sub_category, vibes, cover_image, gallery_images, image_credits,
  address, area, latitude, longitude, opening_time, closing_time, entry_fee,
  estimated_budget, best_time, recommended_duration, how_to_reach, nearby_place_ids,
  featured, hidden_gem, status, rating, reviews_count, created_at, updated_at
) VALUES (
  'bara-imambara', 'bara-imambara', 'Bara Imambara & Bhool Bhulaiya', 'बड़ा इमामबाड़ा व भूल भुलैया', 'The 18th-century architectural marvel featuring the world’s largest unsupported arched hall and an intricate 3D labyrinth.', 'Built in 1784 by Nawab Asaf-ud-Daula as a famine relief project, the Bara Imambara complex is the crowning glory of Awadhi architecture. The central hall (Asafi Mosque) stands 50 meters long and 15 meters high without a single supporting pillar or iron girder. Above this grand hall lies the legendary Bhool Bhulaiya (Labyrinth), an intricate network of over 1,000 interlocking passageways, 489 identical doorways, and acoustic whispering galleries with breathtaking panoramic views of Old Lucknow.', 'During the severe famine of 1784, Nawab Asaf-ud-Daula initiated this project under the famous proverb "Jisko na de Maula, usko de Asaf-ud-Daula". Nobles and citizens alike labored on the construction by day and dismantled parts by night to prolong employment with utmost dignity.', '["Experience the thrilling 3D labyrinth of Bhool Bhulaiya with an authorized guide","Witness the miraculous Central Hall standing without pillars or iron beams","Discover acoustic marvels where a whisper on one wall travels 50 meters to the opposite side","Step down into the historic multi-tiered Shahi Baoli (Royal Stepwell)","Marvel at the sunset vista overlooking Rumi Darwaza and Husainabad Clock Tower"]'::jsonb, 'historical', 'Heritage Monument', '["Heritage","Architecture","Photography","Family","Culture"]'::jsonb, 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80', '["https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80"]'::jsonb, 'Open Licensed Heritage Archive / Unsplash', 'Machchhi Bhavan, Hussainabad, Lucknow, Uttar Pradesh 226003', 'Hussainabad', 26.8689, 80.9129, '06:00 AM', '05:30 PM', '₹50 (Indians), ₹500 (Foreign Nationals) - Includes entry to Chota Imambara and Picture Gallery', 150, 'Morning', '2-3 Hours', '{"nearestMetro":"Durgapuri Metro Station (approx 4.5 km) or Charbagh Metro (5.2 km)","busRoute":"Direct city buses available to Chowk and Hussainabad from Charbagh Railway Station","autoCabTips":"E-rickshaws and auto-rickshaws are frequently available from Charbagh & Hazratganj (₹20-₹40 shared)","parking":"Designated paid parking lot right outside the main gate"}'::jsonb, '["rumi-darwaza","chota-imambara","hussainabad-clock-tower","tunday-kababi-chowk"]'::jsonb, true, false, 'published', 4.8, 1420, '2026-01-10T10:00:00Z', '2026-08-20T12:00:00Z'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, short_description = EXCLUDED.short_description,
  category = EXCLUDED.category, vibes = EXCLUDED.vibes, cover_image = EXCLUDED.cover_image,
  rating = EXCLUDED.rating, reviews_count = EXCLUDED.reviews_count, updated_at = NOW();

INSERT INTO public.places (
  id, slug, name, hindi_name, short_description, description, story, why_visit,
  category, sub_category, vibes, cover_image, gallery_images, image_credits,
  address, area, latitude, longitude, opening_time, closing_time, entry_fee,
  estimated_budget, best_time, recommended_duration, how_to_reach, nearby_place_ids,
  featured, hidden_gem, status, rating, reviews_count, created_at, updated_at
) VALUES (
  'rumi-darwaza', 'rumi-darwaza', 'Rumi Darwaza (Turkish Gate)', 'रूमी दरवाज़ा', 'The majestic 60-foot ornamental gateway modeled after the sublime porte of ancient Constantinople.', 'Standing tall at 60 feet between the Bara Imambara and Chota Imambara, the Rumi Darwaza is the visual icon of Lucknow. Commissioned by Nawab Asaf-ud-Daula in 1784, this ornate entrance served as the majestic gateway to the historic walled city of Old Lucknow. Its unique semi-circular arch is adorned with intricate floral carvings and topped with an octagonal lantern chamber that once radiated light across the royal boulevard.', 'Known as the Turkish Gate because of its resemblance to the ancient gateway in Istanbul (Constantinople), this gateway is an engineering marvel constructed entirely of Lakhnawi bricks (small thin baked bricks) and coated with finely polished lime plaster derived from mother-of-pearl shells.', '["Gaze upon the quintessential symbol of Lucknow’s royal grandeur","Spectacular evening lighting creating majestic silhouette photographs","Centrally located on the royal Hussainabad Heritage Corridor","Observe authentic Awadhi stucco artwork and Lakhnawi brick craftsmanship"]'::jsonb, 'landmarks', 'Architectural Gate', '["Heritage","Architecture","Photography","Sunset","Budget Friendly"]'::jsonb, 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80', '["https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80"]'::jsonb, 'Heritage Documentation Group / Open Source', 'Husainabad Heritage Corridor, Lucknow, Uttar Pradesh 226003', 'Hussainabad', 26.8711, 80.9122, 'Open 24 Hours (Exterior View)', 'Open 24 Hours', 'Free (Public Heritage Monument)', 0, 'Evening', '30-45 Mins', '{"nearestMetro":"Charbagh Metro Station (approx 4.8 km)","busRoute":"Direct heritage corridor route via Chowk","autoCabTips":"Walkable distance (300m) from Bara Imambara","parking":"Hussainabad heritage parking zone"}'::jsonb, '["bara-imambara","chota-imambara","hussainabad-clock-tower"]'::jsonb, true, false, 'published', 4.9, 2150, '2026-01-10T10:00:00Z', '2026-08-20T12:00:00Z'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, short_description = EXCLUDED.short_description,
  category = EXCLUDED.category, vibes = EXCLUDED.vibes, cover_image = EXCLUDED.cover_image,
  rating = EXCLUDED.rating, reviews_count = EXCLUDED.reviews_count, updated_at = NOW();

INSERT INTO public.places (
  id, slug, name, hindi_name, short_description, description, story, why_visit,
  category, sub_category, vibes, cover_image, gallery_images, image_credits,
  address, area, latitude, longitude, opening_time, closing_time, entry_fee,
  estimated_budget, best_time, recommended_duration, how_to_reach, nearby_place_ids,
  featured, hidden_gem, status, rating, reviews_count, created_at, updated_at
) VALUES (
  'chota-imambara', 'chota-imambara', 'Chota Imambara (Palace of Lights)', 'छोटा इमामबाड़ा (हुसैनाबाद इमामबाड़ा)', 'The breathtaking jewel of Hussainabad adorned with gold-plated domes, Belgian glass chandeliers, and Persian calligraphic art.', 'Also known as the Imambara of Husainabad, this resplendent monument was built in 1838 by Nawab Muhammad Ali Shah. Decorated with exquisite Belgian glass chandeliers, ornate crystal lanterns, gilded calligraphy, and an azure pool reflecting its pristine white façade, the monument illuminates with thousands of lanterns during festive evenings, earning its title as the "Palace of Lights". The complex also hosts the unfinished royal Taj Mahal miniature (Tomb of Zinat Algiya) and a royal treasury.', 'Nawab Muhammad Ali Shah was buried here alongside his mother. The Nawab had an obsession with illumination, importing hundreds of rare chandeliers from Belgium and London, each meticulously hung with pure silver chains.', '["Marvel at the magnificent collection of antique Belgian glass chandeliers and lanterns","See the golden dome reflecting on the royal water canal lined with fountains","Discover Arabic and Persian calligraphy etched seamlessly onto white marble","View the unique miniature version of Agra’s Taj Mahal built for the royal princess"]'::jsonb, 'historical', 'Heritage Complex', '["Heritage","Architecture","Photography","Peaceful","Culture"]'::jsonb, 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80', '["https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80"]'::jsonb, NULL, 'Husainabad, Old Lucknow, Uttar Pradesh 226003', 'Hussainabad', 26.8742, 80.9048, '06:00 AM', '05:30 PM', 'Included in Bara Imambara combo ticket (₹50 Indian / ₹500 Foreigner)', 50, 'Morning', '1-2 Hours', '{"nearestMetro":"Charbagh Metro Station (approx 5.5 km)","autoCabTips":"1 km from Bara Imambara via heritage pathway. Tonga / e-rickshaw available."}'::jsonb, '["bara-imambara","rumi-darwaza","hussainabad-clock-tower","picture-gallery"]'::jsonb, true, false, 'published', 4.7, 980, '2026-01-12T10:00:00Z', '2026-08-20T12:00:00Z'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, short_description = EXCLUDED.short_description,
  category = EXCLUDED.category, vibes = EXCLUDED.vibes, cover_image = EXCLUDED.cover_image,
  rating = EXCLUDED.rating, reviews_count = EXCLUDED.reviews_count, updated_at = NOW();

INSERT INTO public.places (
  id, slug, name, hindi_name, short_description, description, story, why_visit,
  category, sub_category, vibes, cover_image, gallery_images, image_credits,
  address, area, latitude, longitude, opening_time, closing_time, entry_fee,
  estimated_budget, best_time, recommended_duration, how_to_reach, nearby_place_ids,
  featured, hidden_gem, status, rating, reviews_count, created_at, updated_at
) VALUES (
  'the-british-residency', 'the-british-residency', 'The British Residency', 'रेज़िडेंसी (1857 की क्रांति का साक्षी)', 'The evocative ruins of the 1857 Siege of Lucknow, preserved amidst tranquil gardens, cannon marks, and a historical museum.', 'Set within 33 acres of peaceful green parkland, The British Residency served as the headquarters for the British East India Company’s resident general. Built between 1780 and 1800 by Nawab Saadat Ali Khan, it became the epicenter of the famous 1857 Siege of Lucknow. Today, its battle-scarred brick walls, shattered columns, and cannonball impact craters remain preserved as an open-air historical monument and solemn tribute to India’s First War of Independence.', 'During the 1857 uprising, thousands of Indian freedom fighters besieged the residency for nearly six months. The walls still bear bullet marks and cannon holes, while the on-site museum preserves original diaries, artillery, and dioramas depicting the siege.', '["Walk through one of India’s most poignant and historic 1857 battle grounds","Explore the Residency Museum featuring scale models, oil paintings, and original weapons","Enjoy calm, landscaped botanical lawns perfect for contemplative walks and reading","Visit the remains of the Banquet Hall, Begum Kothi, and St. Mary’s Church"]'::jsonb, 'historical', 'Heritage Ruins & Museum', '["Heritage","Peaceful","Photography","Culture","Outdoor"]'::jsonb, 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80', '["https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=1200&q=80"]'::jsonb, NULL, 'Mahatma Gandhi Marg, Deep Manak Nagar, Qaisar Bagh, Lucknow, Uttar Pradesh 226001', 'Qaiserbagh', 26.8617, 80.9272, '07:00 AM', '06:00 PM', '₹25 (Indians), ₹300 (Foreigners)', 50, 'Morning', '2 Hours', '{"nearestMetro":"KD Singh Babu Stadium Metro Station (approx 1.5 km)","autoCabTips":"Direct autos available from Hazratganj (5 mins drive)"}'::jsonb, '["hazratganj","chattar-manzil","state-museum"]'::jsonb, true, false, 'published', 4.6, 890, '2026-01-12T10:00:00Z', '2026-08-20T12:00:00Z'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, short_description = EXCLUDED.short_description,
  category = EXCLUDED.category, vibes = EXCLUDED.vibes, cover_image = EXCLUDED.cover_image,
  rating = EXCLUDED.rating, reviews_count = EXCLUDED.reviews_count, updated_at = NOW();

INSERT INTO public.places (
  id, slug, name, hindi_name, short_description, description, story, why_visit,
  category, sub_category, vibes, cover_image, gallery_images, image_credits,
  address, area, latitude, longitude, opening_time, closing_time, entry_fee,
  estimated_budget, best_time, recommended_duration, how_to_reach, nearby_place_ids,
  featured, hidden_gem, status, rating, reviews_count, created_at, updated_at
) VALUES (
  'tunday-kababi-chowk', 'tunday-kababi-chowk', 'Tunday Kababi (Original Chowk Branch)', 'टुंडे कबाबी (चौक बाज़ार)', 'The legendary culinary institution founded in 1905, serving legendary melt-in-mouth Galawati kebabs made with 160 secret spices.', 'No culinary pilgrimage to Lucknow is complete without savoring the world-famous Galawati kebabs at Tunday Kababi in the heart of Old Chowk. Founded in 1905 by Haji Murad Ali (fondly called "Tunday" due to his one-armed handicap), these legendary kebabs are crafted with finely minced meat marinated in over 160 secret aromatic spices and herbs, and seared over a slow charcoal flame on huge copper griddles so they literally dissolve upon contact.', 'Legend has it that an aging Nawab who lost all his teeth challenged the royal chefs to create a kebab that required zero chewing without compromising an ounce of royal flavor. Haji Murad Ali invented this heavenly preparation, winning royal patronage and legendary fame spanning four generations.', '["Taste the genuine culinary heritage of Awadh that has fed world dignitaries and food critics","Pair authentic Galawati Kebabs with piping hot, paper-thin Mughlai Ulte Tawe Ka Paratha","Experience the bustling heritage vibe of century-old Phoolwali Gali in Chowk","Complement your meal with traditional Sheermal and Phirni"]'::jsonb, 'food', 'Heritage Food Outlet', '["Food","Culture","Budget Friendly","Heritage"]'::jsonb, 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=80', '["https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80"]'::jsonb, NULL, '168/6, Phool Wali Gali, Chowk, Lucknow, Uttar Pradesh 226003', 'Chowk', 26.8672, 80.9031, '11:00 AM', '11:30 PM', 'Free (Food charges apply)', 250, 'Evening', '1 Hour', '{"nearestMetro":"Charbagh Metro (4.5 km)","autoCabTips":"Best reached via cycle-rickshaw or e-rickshaw inside the narrow heritage lanes of Chowk"}'::jsonb, '["chowk-bazaar","bara-imambara","prakash-kulfi-chowk"]'::jsonb, true, false, 'published', 4.9, 3400, '2026-01-14T10:00:00Z', '2026-08-20T12:00:00Z'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, short_description = EXCLUDED.short_description,
  category = EXCLUDED.category, vibes = EXCLUDED.vibes, cover_image = EXCLUDED.cover_image,
  rating = EXCLUDED.rating, reviews_count = EXCLUDED.reviews_count, updated_at = NOW();

INSERT INTO public.places (
  id, slug, name, hindi_name, short_description, description, story, why_visit,
  category, sub_category, vibes, cover_image, gallery_images, image_credits,
  address, area, latitude, longitude, opening_time, closing_time, entry_fee,
  estimated_budget, best_time, recommended_duration, how_to_reach, nearby_place_ids,
  featured, hidden_gem, status, rating, reviews_count, created_at, updated_at
) VALUES (
  'hazratganj-promenade', 'hazratganj-promenade', 'Hazratganj & Janpath Market', 'हज़रतगंज बाज़ार (गंजिंग)', 'The Victorian-styled shopping boulevard of Lucknow, home to heritage cafes, Chikankari emporiums, and evening "Ganjing" culture.', 'Dating back to 1810 when Nawab Saadat Ali Khan acquired the area, Hazratganj is Lucknow’s downtown heart. Renowned for its uniform Victorian black-and-cream heritage facades, vintage lamp posts, and bustling promenade, Hazratganj gave birth to the beloved local pastime "Ganjing" — leisurely strolling down the avenue with friends, enjoying chaat at Royal Cafe, browsing bookshops, and picking up authentic Chikankari garments.', 'In the British era, Hazratganj was modelled after London’s Queen Street. In 2010, on its 200th anniversary, the entire boulevard was restored to uniform vintage British architecture with uniform signage and vintage stone tiling.', '["Experience the iconic ritual of \"Ganjing\" in the vibrant evening buzz","Savor the famous crispy Basket Chaat at Royal Cafe Hazratganj","Shop for premium Handcrafted Chikankari & Zardozi attire at UP Handlooms and Janpath","Enjoy artisan masala chai and Bun Makkhan at the legendary Sharma Tea Stall nearby"]'::jsonb, 'shopping', 'Heritage Shopping Boulevard', '["Shopping","Food","Entertainment","Family","Culture"]'::jsonb, 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80', '["https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80"]'::jsonb, NULL, 'Hazratganj Main Market, MG Marg, Lucknow, Uttar Pradesh 226001', 'Hazratganj', 26.8524, 80.9423, '10:30 AM', '10:00 PM (Closed on Sundays for select shops)', 'Free entry', 600, 'Evening', '2-3 Hours', '{"nearestMetro":"Hazratganj Metro Station (Direct exit right onto the market promenade)","parking":"Multi-level parking facility available at Hazratganj underground lots"}'::jsonb, '["the-british-residency","royal-cafe-basket-chaat","sharma-tea-stall"]'::jsonb, true, false, 'published', 4.8, 1890, '2026-01-14T10:00:00Z', '2026-08-20T12:00:00Z'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, short_description = EXCLUDED.short_description,
  category = EXCLUDED.category, vibes = EXCLUDED.vibes, cover_image = EXCLUDED.cover_image,
  rating = EXCLUDED.rating, reviews_count = EXCLUDED.reviews_count, updated_at = NOW();

INSERT INTO public.places (
  id, slug, name, hindi_name, short_description, description, story, why_visit,
  category, sub_category, vibes, cover_image, gallery_images, image_credits,
  address, area, latitude, longitude, opening_time, closing_time, entry_fee,
  estimated_budget, best_time, recommended_duration, how_to_reach, nearby_place_ids,
  featured, hidden_gem, status, rating, reviews_count, created_at, updated_at
) VALUES (
  'janeshwar-mishra-park', 'janeshwar-mishra-park', 'Janeshwar Mishra Park', 'जनेश्वर मिश्र पार्क', 'Asia’s largest eco-friendly urban park featuring sprawling water bodies, cycling tracks, musical fountains, and tranquil greenery.', 'Spanning across an astounding 376 acres in Gomti Nagar, Janeshwar Mishra Park is conceptualized on the lines of London’s Hyde Park. It boasts vast emerald lawns, a massive centerpiece artificial lake with solar-powered paddle boats, over 25 km of jogging and cycling tracks, children’s adventure zones, migratory bird sanctuaries, and mesmerizing evening musical fountain shows.', 'Designed as a carbon sink and eco-habitat for the growing metropolis, the park planted over 200,000 indigenous trees, making it a sanctuary for butterflies, migratory ducks, and early morning fitness enthusiasts.', '["Spend a relaxing afternoon boating on the pristine lake waters","Rent eco-friendly bicycles for cycling down kilometers of tree-canopied lanes","Watch stunning sunset reflections over the expansive water bodies","Enjoy outdoor picnics, open air gymnasiums, and children’s amusement playgrounds"]'::jsonb, 'parks', 'Urban Eco Park', '["Peaceful","Family","Outdoor","Sunset","Budget Friendly"]'::jsonb, 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=1200&q=80', '["https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80"]'::jsonb, NULL, 'Gomti Nagar Extension, Patrakar Puram Road, Lucknow, Uttar Pradesh 226010', 'Gomti Nagar', 26.8398, 80.9984, '05:00 AM', '08:00 PM', '₹10 per person', 50, 'Morning', '2-3 Hours', '{"nearestMetro":"Indira Nagar / Lekhraj Metro (5 km), Gomti Nagar Railway Station (3 km)","autoCabTips":"Easily accessible via cab or auto from anywhere in Lucknow"}'::jsonb, '["gomti-riverfront-park","phoenix-palassio","ambedkar-memorial-park"]'::jsonb, true, false, 'published', 4.8, 1650, '2026-01-15T10:00:00Z', '2026-08-20T12:00:00Z'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, short_description = EXCLUDED.short_description,
  category = EXCLUDED.category, vibes = EXCLUDED.vibes, cover_image = EXCLUDED.cover_image,
  rating = EXCLUDED.rating, reviews_count = EXCLUDED.reviews_count, updated_at = NOW();

INSERT INTO public.places (
  id, slug, name, hindi_name, short_description, description, story, why_visit,
  category, sub_category, vibes, cover_image, gallery_images, image_credits,
  address, area, latitude, longitude, opening_time, closing_time, entry_fee,
  estimated_budget, best_time, recommended_duration, how_to_reach, nearby_place_ids,
  featured, hidden_gem, status, rating, reviews_count, created_at, updated_at
) VALUES (
  'ambedkar-memorial-park', 'ambedkar-memorial-park', 'Dr. Ambedkar Memorial Park', 'डॉ. आम्बेडकर मेमोरियल पार्क', 'A colossal architectural ensemble carved from pink Mirzapur sandstone with monumental elephant colonnades and reflective plazas.', 'Covering 107 acres along the Gomti river, this monumental park is constructed entirely from hard red and pink sandstone transported from Rajasthan and Mirzapur. The centerpiece is the grand Pratibimb Sthal (Reflection Stupa) flanked by a breathtaking colonnade of 62 colossal stone elephants standing in salute. In the evening, artistic illumination casts ethereal shadows across the vast plaza, making it a paradise for photographers and filmmakers.', 'One of the largest stone monuments built in modern India, the architecture draws inspiration from Buddhist Stupas and classical imperial monumentalism, requiring tens of thousands of master stonemasons over six years.', '["Witness the breathtaking grand vista of 62 life-sized carved stone elephants","Capture cinematic wide-angle sunset photographs on the reflective stone promenades","Admire the sheer grandeur of modern Indian stone architecture and engineering","Walk alongside the cool riverside breeze under dramatic evening floodlights"]'::jsonb, 'landmarks', 'Monumental Plaza', '["Photography","Architecture","Sunset","Family","Peaceful"]'::jsonb, 'https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?auto=format&fit=crop&w=1200&q=80', '["https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=1200&q=80"]'::jsonb, NULL, 'Vipul Khand 2, Vipul Khand, Gomti Nagar, Lucknow, Uttar Pradesh 226010', 'Gomti Nagar', 26.8482, 80.9765, '11:00 AM', '09:00 PM', '₹20 per person', 40, 'Evening', '1.5-2 Hours', '{"nearestMetro":"Bhootnath Market Metro (3.8 km)","autoCabTips":"Situated right on the main Lohia Path in Gomti Nagar"}'::jsonb, '["gomti-riverfront-park","janeshwar-mishra-park","marine-drive-gomti"]'::jsonb, true, false, 'published', 4.7, 1240, '2026-01-16T10:00:00Z', '2026-08-20T12:00:00Z'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, short_description = EXCLUDED.short_description,
  category = EXCLUDED.category, vibes = EXCLUDED.vibes, cover_image = EXCLUDED.cover_image,
  rating = EXCLUDED.rating, reviews_count = EXCLUDED.reviews_count, updated_at = NOW();

INSERT INTO public.places (
  id, slug, name, hindi_name, short_description, description, story, why_visit,
  category, sub_category, vibes, cover_image, gallery_images, image_credits,
  address, area, latitude, longitude, opening_time, closing_time, entry_fee,
  estimated_budget, best_time, recommended_duration, how_to_reach, nearby_place_ids,
  featured, hidden_gem, status, rating, reviews_count, created_at, updated_at
) VALUES (
  'chowk-bazaar-heritage-walk', 'chowk-bazaar-heritage-walk', 'Chowk Heritage Bazaar & Phoolwali Gali', 'चौक हेरिटेज बाज़ार व फूलवाली गली', 'The living heart of Old Lucknow teeming with traditional perfume ittar distillers, Zari zardozi artisans, silversmiths, and street food.', 'Chowk is the oldest continuously inhabited commercial hub of Lucknow, exuding old-world charm, narrow alleys, and traditional havelis. Here, 5th-generation perfumers craft natural floral Attar (Ittar) extracted using century-old hydro-distillation degs. Master craftspeople hand-embroider delicate Chikankari patterns on muslin, silversmiths beat pure silver into edible Chandi Ka Warq (silver foil), and the aroma of roasted spices fills every corner.', 'Established during the reign of early Nawabs, Chowk was designed with specialized alleys (Koochas) dedicated to specific artisan guilds: Ittar-makers, bone carvers, ivory inlayers, kite makers, and traditional sweet confectioners.', '["Sample pure organic Gulab, Shamama, and Mitti (baked earth) Attar at heritage perfume shops","Watch Chikankari artisans delicately hand-stitch Shadow-work, Murri, and Jaali embroidery","Taste traditional Malai Makkhan (winter cloud dessert), Ram Asrey’s Malai Pan, and Prakash Kulfi","Experience a photographic journey through authentic Awadhi alleyways and ancient carved wooden doorways"]'::jsonb, 'shopping', 'Heritage Bazaar', '["Culture","Shopping","Food","Heritage","Photography"]'::jsonb, 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80', '["https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=80"]'::jsonb, NULL, 'Old Chowk Ward, Lucknow, Uttar Pradesh 226003', 'Chowk', 26.8665, 80.9025, '10:00 AM', '10:00 PM (Best in late afternoons & evenings)', 'Free entry', 400, 'Evening', '2-3 Hours', '{"nearestMetro":"Charbagh Metro (4.8 km)","autoCabTips":"Take an e-rickshaw to Akbari Gate or Gol Darwaza"}'::jsonb, '["tunday-kababi-chowk","prakash-kulfi-chowk","bara-imambara"]'::jsonb, true, false, 'published', 4.8, 1540, '2026-01-18T10:00:00Z', '2026-08-20T12:00:00Z'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, short_description = EXCLUDED.short_description,
  category = EXCLUDED.category, vibes = EXCLUDED.vibes, cover_image = EXCLUDED.cover_image,
  rating = EXCLUDED.rating, reviews_count = EXCLUDED.reviews_count, updated_at = NOW();

INSERT INTO public.places (
  id, slug, name, hindi_name, short_description, description, story, why_visit,
  category, sub_category, vibes, cover_image, gallery_images, image_credits,
  address, area, latitude, longitude, opening_time, closing_time, entry_fee,
  estimated_budget, best_time, recommended_duration, how_to_reach, nearby_place_ids,
  featured, hidden_gem, status, rating, reviews_count, created_at, updated_at
) VALUES (
  'hussainabad-clock-tower', 'hussainabad-clock-tower', 'Husainabad Clock Tower & Picture Gallery', 'हुसैनाबाद घंटाघर व पिक्चर गैलरी', 'India’s tallest clock tower rising 221 feet, paired with a royal 19th-century portrait gallery overlooking a stepped water tank.', 'Built in 1881 by the Husainabad Trust to commemorate the arrival of Sir George Couper, the Husainabad Clock Tower is India’s tallest standalone clock tower, soaring 221 feet in Victorian Gothic style with intricate Islamic craftsmanship. Adjacent to it sits the historic Picture Gallery (Baradari), which overlooks a picturesque stepped water tank and houses life-sized optical-illusion oil portraits of the Nawabs of Awadh.', 'The portraits in the Picture Gallery were painted using special optical techniques by 19th-century master artists: as you walk across the hall, the eyes and shoe tips of the Nawabs seem to turn and follow your exact movement.', '["Marvel at India’s tallest clock tower, standing 221 feet tall with a 12-petalled flower dial","Experience the fascinating \"moving eyes\" illusion of the Nawabi royal portraits in the Picture Gallery","Stroll alongside the historic Husainabad Talab (Stepped Water Reservoir)","Fantastic vantage point for sunset golden hour photography"]'::jsonb, 'landmarks', 'Clock Tower & Heritage Gallery', '["Heritage","Photography","Architecture","Sunset","Hidden Gem"]'::jsonb, 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80', '["https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80"]'::jsonb, NULL, 'Husainabad Heritage Corridor, Near Rumi Darwaza, Lucknow, Uttar Pradesh 226003', 'Hussainabad', 26.8728, 80.9083, '08:00 AM', '06:00 PM', '₹20 (Picture Gallery), Clock Tower exterior is free', 30, 'Evening', '1 Hour', '{"nearestMetro":"Charbagh Metro (5 km)","autoCabTips":"Between Bara Imambara and Chota Imambara along the heritage walkway"}'::jsonb, '["bara-imambara","rumi-darwaza","chota-imambara"]'::jsonb, false, true, 'published', 4.6, 620, '2026-01-20T10:00:00Z', '2026-08-20T12:00:00Z'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, short_description = EXCLUDED.short_description,
  category = EXCLUDED.category, vibes = EXCLUDED.vibes, cover_image = EXCLUDED.cover_image,
  rating = EXCLUDED.rating, reviews_count = EXCLUDED.reviews_count, updated_at = NOW();

INSERT INTO public.places (
  id, slug, name, hindi_name, short_description, description, story, why_visit,
  category, sub_category, vibes, cover_image, gallery_images, image_credits,
  address, area, latitude, longitude, opening_time, closing_time, entry_fee,
  estimated_budget, best_time, recommended_duration, how_to_reach, nearby_place_ids,
  featured, hidden_gem, status, rating, reviews_count, created_at, updated_at
) VALUES (
  'dilkusha-kothi', 'dilkusha-kothi', 'Dilkusha Kothi & Hunting Lodge Ruins', 'दिलकुशा कोठी (शिकारगाह खंडहर)', 'A secluded 1800 Baroque hunting palace nestled in tranquil greenery, offering peaceful solitude and European grandeur.', 'Dilkusha Kothi (meaning "Heart’s Delight") was constructed around 1800 by the British officer Major Gore Ouseley for Nawab Saadat Ali Khan as a royal hunting lodge and countryside retreat. Built in English Baroque style with towering towers and grand archways inspired by Seaton Delaval Hall in England, its romantic ruins are now surrounded by verdant gardens away from the city bustle.', 'During the 1857 uprising, General Colin Campbell used this mansion as his forward operational headquarters before advancing to relieve the Residency. Though heavily bombarded, its majestic stone towers still pierce the Lucknow sky.', '["Discover an offbeat English Baroque ruin rarely crowded by mainstream tourists","Perfect peaceful sanctuary for photography, acoustic guitar, and quiet reading","Lush green landscaped lawns ideal for winter afternoon picnics","Learn about the lesser-known European architectural phase of Awadh"]'::jsonb, 'hidden-gems', 'Heritage Ruins & Park', '["Hidden Gem","Peaceful","Photography","Architecture","Heritage"]'::jsonb, 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80', '["https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80"]'::jsonb, NULL, 'Dilkusha Cantonment Area, Lucknow, Uttar Pradesh 226002', 'Cantonment', 26.8288, 80.9634, '08:00 AM', '06:00 PM', 'Free entry', 0, 'Morning', '1-1.5 Hours', '{"nearestMetro":"Sachivalaya Metro Station (approx 4 km)","autoCabTips":"Located in the clean and green Cantonment zone; auto or private cab recommended"}'::jsonb, '["la-martiniere-college","hazratganj-promenade"]'::jsonb, false, true, 'published', 4.7, 430, '2026-01-22T10:00:00Z', '2026-08-20T12:00:00Z'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, short_description = EXCLUDED.short_description,
  category = EXCLUDED.category, vibes = EXCLUDED.vibes, cover_image = EXCLUDED.cover_image,
  rating = EXCLUDED.rating, reviews_count = EXCLUDED.reviews_count, updated_at = NOW();

INSERT INTO public.places (
  id, slug, name, hindi_name, short_description, description, story, why_visit,
  category, sub_category, vibes, cover_image, gallery_images, image_credits,
  address, area, latitude, longitude, opening_time, closing_time, entry_fee,
  estimated_budget, best_time, recommended_duration, how_to_reach, nearby_place_ids,
  featured, hidden_gem, status, rating, reviews_count, created_at, updated_at
) VALUES (
  'la-martiniere-college', 'la-martiniere-college', 'La Martinière College & Constantia Estate', 'ला मार्टिनियर कॉलेज (कॉन्स्टेंटिया)', 'One of the world’s most unique architectural palaces, blending French, Italian, and Gothic castles with mythological gargoyles.', 'Founded in 1845 pursuant to the will of Major General Claude Martin, a French adventurer in the court of the Nawabs of Awadh, "Constantia" is among the most eccentric and spectacular heritage buildings in Asia. The grand mansion features classical columns, Roman arches, statues of Greek gods and lions, an underground tomb, and defensive battlements. It holds the rare distinction of being the only school in the British Empire to be awarded Royal Battle Honours for its role in 1857.', 'Claude Martin designed the estate to be self-sufficient and fortress-like, complete with underground cool chambers (Tehkhanas) for hot Indian summers, astronomical observatories, and a massive moat.', '["Admire the extraordinary French-Awadhi-Gothic palace architecture","Explore the historic Constantia grounds, lake, and astronomical memorial column","Visit the underground tomb chamber of Major General Claude Martin","Witness living heritage where prestigious traditions have thrived for over 180 years"]'::jsonb, 'culture', 'Heritage Institution & Palace', '["Architecture","Heritage","Culture","Photography","Hidden Gem"]'::jsonb, 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80', '["https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"]'::jsonb, NULL, 'La Martiniere Road, Martin Purva, Lucknow, Uttar Pradesh 226001', 'Martin Purva', 26.8378, 80.9575, '09:00 AM', '05:00 PM (Prior permission / visitor hours apply for interiors)', 'Free (Campus visitor pass required on working days)', 0, 'Morning', '1.5 Hours', '{"nearestMetro":"Hazratganj Metro (3 km)","autoCabTips":"Short auto ride from Kalidas Marg or Hazratganj"}'::jsonb, '["dilkusha-kothi","hazratganj-promenade","gomti-riverfront-park"]'::jsonb, true, true, 'published', 4.8, 780, '2026-01-25T10:00:00Z', '2026-08-20T12:00:00Z'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, short_description = EXCLUDED.short_description,
  category = EXCLUDED.category, vibes = EXCLUDED.vibes, cover_image = EXCLUDED.cover_image,
  rating = EXCLUDED.rating, reviews_count = EXCLUDED.reviews_count, updated_at = NOW();

INSERT INTO public.places (
  id, slug, name, hindi_name, short_description, description, story, why_visit,
  category, sub_category, vibes, cover_image, gallery_images, image_credits,
  address, area, latitude, longitude, opening_time, closing_time, entry_fee,
  estimated_budget, best_time, recommended_duration, how_to_reach, nearby_place_ids,
  featured, hidden_gem, status, rating, reviews_count, created_at, updated_at
) VALUES (
  'gomti-riverfront-park', 'gomti-riverfront-park', 'Gomti Riverfront Promenade', 'गोमती रिवरफ्रंट पार्क', 'A scenic riverfront promenade with walking esplanades, musical waters, cycle tracks, and sunset vantage points.', 'Redeveloped along the sacred Gomti river, the Gomti Riverfront Park provides a European-style riverwalk in the center of Lucknow. With manicured green lawns, illuminated bridges, open amphitheaters, musical fountains, and dedicated pedestrian paths, it is a favorite evening retreat for couples, families, and jogging enthusiasts.', 'The Gomti river is deeply intertwined with Lucknow’s romantic Nawabi poetry. In the 18th century, royal barges (Bajras) shaped like peacocks and fish sailed here carrying Nawabs and court poets.', '["Enjoy an evening breeze while strolling along the paved riverside boardwalk","Watch panoramic reflections of the illuminated Gandhi Setu and Lohia bridges","Rent tandem bicycles or enjoy serene sunset photography","Attend weekend musical and cultural performances at the open amphitheater"]'::jsonb, 'parks', 'Riverfront Boardwalk', '["Sunset","Peaceful","Photography","Family","Outdoor"]'::jsonb, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', '["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"]'::jsonb, NULL, 'Gomti Barrage Road, Gomti Nagar, Lucknow, Uttar Pradesh 226010', 'Gomti Nagar', 26.8527, 80.9638, '06:00 AM', '09:30 PM', '₹10 per person', 30, 'Sunset', '1.5-2 Hours', '{"nearestMetro":"KD Singh Babu Stadium Metro (approx 2 km)","autoCabTips":"Accessible from both Hazratganj and Gomti Nagar via Gomti Barrage"}'::jsonb, '["ambedkar-memorial-park","hazratganj-promenade","janeshwar-mishra-park"]'::jsonb, true, false, 'published', 4.6, 1100, '2026-01-26T10:00:00Z', '2026-08-20T12:00:00Z'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, short_description = EXCLUDED.short_description,
  category = EXCLUDED.category, vibes = EXCLUDED.vibes, cover_image = EXCLUDED.cover_image,
  rating = EXCLUDED.rating, reviews_count = EXCLUDED.reviews_count, updated_at = NOW();

INSERT INTO public.places (
  id, slug, name, hindi_name, short_description, description, story, why_visit,
  category, sub_category, vibes, cover_image, gallery_images, image_credits,
  address, area, latitude, longitude, opening_time, closing_time, entry_fee,
  estimated_budget, best_time, recommended_duration, how_to_reach, nearby_place_ids,
  featured, hidden_gem, status, rating, reviews_count, created_at, updated_at
) VALUES (
  'dastarkhwan-hazratganj', 'dastarkhwan-hazratganj', 'Dastarkhwan (Tulsi Theatre Complex)', 'दस्तरख़्वान (हज़रतगंज)', 'The mecca of Awadhi Mughlai curries, celebrated for aromatic Chicken Masala, Boti Kebab, and fragrant Shahi Tukda.', 'Situated in the Tulsi Complex near Hazratganj, Dastarkhwan is an indispensable benchmark for Lucknow’s rich curry traditions. Renowned for its rich gravies simmered with saffron, kewra, and roasted dry fruits, this culinary haven treats diners to unmatched Chicken Masala, Mutton Rogan Josh, melt-in-mouth Boti Kebabs, and decadent Shahi Tukda desserts.', 'Starting as a cozy Awadhi dining spot, Dastarkhwan preserved the slow-cooked "Dum" cooking techniques perfected in royal Nawab kitchens, where pots are sealed with dough to trap aromatic steam.', '["Feast on signature Awadhi Chicken Masala paired with warm roomali rotis","Taste succulent Boti Kebabs grilled over fragrant smoking coals","Experience the genuine dining hospitality of a royal Lucknowi Dastarkhwan (spread)","Relish authentic Shahi Tukda and Kheer prepared with pure reduced milk and pistachios"]'::jsonb, 'food', 'Awadhi Fine Casual Dining', '["Food","Family","Culture"]'::jsonb, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80', '["https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=80"]'::jsonb, NULL, 'Tulsi Theatre Building, China Bazaar Gate, Hazratganj, Lucknow, Uttar Pradesh 226001', 'Hazratganj', 26.8496, 80.9452, '12:30 PM', '11:00 PM', 'Free (Food dining charges)', 450, 'Evening', '1.5 Hours', '{"nearestMetro":"Hazratganj Metro (400m walk)","autoCabTips":"Right behind Tulsi Complex in central Hazratganj"}'::jsonb, '["hazratganj-promenade","royal-cafe-basket-chaat"]'::jsonb, true, false, 'published', 4.8, 2200, '2026-01-28T10:00:00Z', '2026-08-20T12:00:00Z'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, short_description = EXCLUDED.short_description,
  category = EXCLUDED.category, vibes = EXCLUDED.vibes, cover_image = EXCLUDED.cover_image,
  rating = EXCLUDED.rating, reviews_count = EXCLUDED.reviews_count, updated_at = NOW();

INSERT INTO public.places (
  id, slug, name, hindi_name, short_description, description, story, why_visit,
  category, sub_category, vibes, cover_image, gallery_images, image_credits,
  address, area, latitude, longitude, opening_time, closing_time, entry_fee,
  estimated_budget, best_time, recommended_duration, how_to_reach, nearby_place_ids,
  featured, hidden_gem, status, rating, reviews_count, created_at, updated_at
) VALUES (
  'royal-cafe-basket-chaat', 'royal-cafe-basket-chaat', 'Royal Cafe & The Famous Basket Chaat', 'रॉयल कैफ़े व मशहूर बास्केट चाट', 'The birthplace of Lucknow’s legendary crunchy Potato Basket Chaat loaded with sprouts, spiced curd, chutneys, and pomegranate.', 'Located in the prime heart of Hazratganj promenade, Royal Cafe made culinary history by inventing the iconic "Tokri Chaat" (Basket Chaat). A deep-fried crispy edible basket woven from shredded potatoes is filled to the brim with mashed potato patties, sprouted beans, chickpeas, sweetened whipped curd, spicy mint chutney, tangy tamarind saunth, crushed spices, crunchy sev, and jewel-like pomegranate seeds.', 'Conceptualized by master chaat chef Hardayal Maurya over three decades ago, this single dish revolutionized street gastronomy across northern India and became a quintessential Lucknowi experience.', '["Experience the incredible explosion of flavors and textures in one giant Basket Chaat","Watch the theatrical street chefs expertly assemble towering chaat bowls with lightning speed","Sample other Lucknow street favorites: Matar Ki Chaat, Pani Ke Batashe with 5 flavoured waters","Immerse in the quintessential buzzing Hazratganj foodie atmosphere"]'::jsonb, 'food', 'Street Food & Heritage Cafe', '["Food","Budget Friendly","Family","Shopping"]'::jsonb, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80', '["https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80"]'::jsonb, NULL, '51, Mahatma Gandhi Marg, Opp. Sahu Cinema, Hazratganj, Lucknow, Uttar Pradesh 226001', 'Hazratganj', 26.8519, 80.9419, '11:00 AM', '11:00 PM', 'Free', 220, 'Evening', '45 Mins', '{"nearestMetro":"Hazratganj Metro (Gate No. 2)","autoCabTips":"Directly on the main Hazratganj walkway"}'::jsonb, '["hazratganj-promenade","dastarkhwan-hazratganj","sharma-tea-stall"]'::jsonb, true, false, 'published', 4.7, 2900, '2026-01-30T10:00:00Z', '2026-08-20T12:00:00Z'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, short_description = EXCLUDED.short_description,
  category = EXCLUDED.category, vibes = EXCLUDED.vibes, cover_image = EXCLUDED.cover_image,
  rating = EXCLUDED.rating, reviews_count = EXCLUDED.reviews_count, updated_at = NOW();

INSERT INTO public.places (
  id, slug, name, hindi_name, short_description, description, story, why_visit,
  category, sub_category, vibes, cover_image, gallery_images, image_credits,
  address, area, latitude, longitude, opening_time, closing_time, entry_fee,
  estimated_budget, best_time, recommended_duration, how_to_reach, nearby_place_ids,
  featured, hidden_gem, status, rating, reviews_count, created_at, updated_at
) VALUES (
  'state-museum-lucknow', 'state-museum-lucknow', 'State Museum & Lucknow Zoo Complex', 'राज्य संग्रहालय व लखनऊ प्राणि उद्यान', 'One of northern India’s oldest and richest museums, housing ancient Mathura sculptures, an Egyptian mummy, and Awadhi royal artifacts.', 'Established in 1863 within the sprawling Prince of Wales Zoological Gardens, the State Museum of Lucknow houses over 100,000 priceless antiquities. Treasures include rare 2nd-century Kushana and Gupta stone sculptures from Mathura, an authentic Egyptian mummy, ancient Buddhist relics, coins of the Mauryas and Guptas, Mughal miniature paintings, and royal Awadhi armory.', 'Originally established at the Chota Imambara by the British Commissioner, the collection was later relocated to this dedicated multi-winged pavilion inside the zoological botanical gardens.', '["View an authentic ancient 3,000-year-old Egyptian mummy in the specialized Egyptology gallery","Discover rare Mathura red sandstone sculptures and medieval Buddhist iconography","Explore the Nawabi gallery exhibiting jeweled costumes, hookahs, and royal decrees","Enjoy a scenic walk through the historic Lucknow Zoo and botanical arboretum"]'::jsonb, 'culture', 'Museum & Heritage Garden', '["Culture","Family","Peaceful","Heritage","Budget Friendly"]'::jsonb, 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=1200&q=80', '["https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=1200&q=80"]'::jsonb, NULL, 'Narhi, Zoo Complex, Hazratganj, Lucknow, Uttar Pradesh 226001', 'Hazratganj', 26.8436, 80.9528, '10:30 AM', '04:30 PM (Closed on Mondays and Gazetted Holidays)', '₹15 (Museum), ₹80 (Zoo combo entry)', 100, 'Morning', '2-3 Hours', '{"nearestMetro":"Sachivalaya Metro (1.2 km)","autoCabTips":"Central location near Hazratganj and Governor House"}'::jsonb, '["hazratganj-promenade","the-british-residency"]'::jsonb, false, true, 'published', 4.6, 520, '2026-02-01T10:00:00Z', '2026-08-20T12:00:00Z'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, short_description = EXCLUDED.short_description,
  category = EXCLUDED.category, vibes = EXCLUDED.vibes, cover_image = EXCLUDED.cover_image,
  rating = EXCLUDED.rating, reviews_count = EXCLUDED.reviews_count, updated_at = NOW();

INSERT INTO public.places (
  id, slug, name, hindi_name, short_description, description, story, why_visit,
  category, sub_category, vibes, cover_image, gallery_images, image_credits,
  address, area, latitude, longitude, opening_time, closing_time, entry_fee,
  estimated_budget, best_time, recommended_duration, how_to_reach, nearby_place_ids,
  featured, hidden_gem, status, rating, reviews_count, created_at, updated_at
) VALUES (
  'prakash-kulfi-chowk', 'prakash-kulfi-chowk', 'Prakash Kulfi (Aminabad & Chowk)', 'प्रकाश कुल्फ़ी (अमीनाबाद व चौक)', 'The golden standard of Lucknow desserts since 1956, renowned for ultra-dense saffron pistachio Kesar Falooda Kulfi.', 'Since 1956, Prakash Kulfi has been the undisputed dessert crown of Lucknow. Made with 100% pure reduced buffalo milk slow-simmered for hours over wood fire, infused with Kashmiri saffron, fragrant green cardamom, and crunchy crushed pistachios, it is served layered over delicate, handmade corn-starch Falooda noodles.', 'Prakash Chandra Gupta started with a single hand-churned brass container packed in salted ice. The brand has remained fiercely focused on quality, rejecting chemical stabilizers or artificial essences.', '["Savor the richest, silkiest Kesar Pista Falooda Kulfi in India","Try the summer special Alphonso Mango Kulfi and Sugar-Free varieties","Experience the buzzing night-time bazaar energy of Aminabad & Chowk","Perfect sweet finish after savoring kebabs at Tunday or Wahid Biryani"]'::jsonb, 'food', 'Heritage Sweet & Dessert Parlour', '["Food","Budget Friendly","Family","Nightlife"]'::jsonb, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=1200&q=80', '["https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=1200&q=80"]'::jsonb, NULL, '12, 13, Fruit Market, Aminabad, Lucknow, Uttar Pradesh 226018', 'Aminabad', 26.8488, 80.9255, '10:00 AM', '11:30 PM', 'Free', 120, 'Night', '30 Mins', '{"nearestMetro":"Charbagh Metro (1.8 km)","autoCabTips":"Directly in the bustling central lane of Aminabad fruit market"}'::jsonb, '["aminabad-market","tunday-kababi-chowk"]'::jsonb, true, false, 'published', 4.9, 3100, '2026-02-02T10:00:00Z', '2026-08-20T12:00:00Z'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, short_description = EXCLUDED.short_description,
  category = EXCLUDED.category, vibes = EXCLUDED.vibes, cover_image = EXCLUDED.cover_image,
  rating = EXCLUDED.rating, reviews_count = EXCLUDED.reviews_count, updated_at = NOW();

INSERT INTO public.places (
  id, slug, name, hindi_name, short_description, description, story, why_visit,
  category, sub_category, vibes, cover_image, gallery_images, image_credits,
  address, area, latitude, longitude, opening_time, closing_time, entry_fee,
  estimated_budget, best_time, recommended_duration, how_to_reach, nearby_place_ids,
  featured, hidden_gem, status, rating, reviews_count, created_at, updated_at
) VALUES (
  'aminabad-market', 'aminabad-market', 'Aminabad Heritage Bazaar', 'अमीनाबाद ऐतिहासिक बाज़ार', 'One of India’s oldest shopping epicenters featuring sprawling lanes of Chikankari kurtas, bridal jewelry, footwear, and street foods.', 'Operational since the times of the Nawabs in the 18th century, Aminabad is the bustling retail powerhouse of Lucknow. Comprising vibrant sub-markets like Madan Mohan Malviya Marg, Gadbadjhala (famous for glass bangles and cosmetics), and Mohan Market (Chikankari fabrics), it offers an authentic, high-energy Indian market shopping experience at wholesale bargains.', 'Nawab Wazir Imdad Husain Khan "Amin-ud-Daulah" developed this market in the 1840s, building gates, mosques, and inn pavilions for merchants arriving along northern trade corridors.', '["Shop directly from traditional master wholesalers for authentic Chikankari and Kurta-pajamas","Discover rainbow bangles and bridal adornments in the vibrant alleys of Gadbadjhala","Indulge in Wahid Biryani, Alamgir kebabs, and Netram’s morning poori-kachori","Experience the thrilling, colorful pulse of an authentic traditional Indian marketplace"]'::jsonb, 'shopping', 'Heritage Wholesale & Retail Bazaar', '["Shopping","Food","Culture","Budget Friendly"]'::jsonb, 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80', '["https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80"]'::jsonb, NULL, 'Aminabad Main Road, Lucknow, Uttar Pradesh 226018', 'Aminabad', 26.8471, 80.9261, '11:00 AM', '10:00 PM (Closed on Thursdays)', 'Free', 500, 'Afternoon', '2-3 Hours', '{"nearestMetro":"Charbagh Metro (1.5 km)","autoCabTips":"E-rickshaws available from Charbagh & Kaisarbagh bus stations"}'::jsonb, '["prakash-kulfi-chowk","the-british-residency"]'::jsonb, true, false, 'published', 4.6, 1750, '2026-02-04T10:00:00Z', '2026-08-20T12:00:00Z'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, short_description = EXCLUDED.short_description,
  category = EXCLUDED.category, vibes = EXCLUDED.vibes, cover_image = EXCLUDED.cover_image,
  rating = EXCLUDED.rating, reviews_count = EXCLUDED.reviews_count, updated_at = NOW();

INSERT INTO public.places (
  id, slug, name, hindi_name, short_description, description, story, why_visit,
  category, sub_category, vibes, cover_image, gallery_images, image_credits,
  address, area, latitude, longitude, opening_time, closing_time, entry_fee,
  estimated_budget, best_time, recommended_duration, how_to_reach, nearby_place_ids,
  featured, hidden_gem, status, rating, reviews_count, created_at, updated_at
) VALUES (
  'sharma-tea-stall', 'sharma-tea-stall', 'Sharma Tea Stall & Bun Makkhan', 'शर्मा चाय स्टॉल व बन-मक्खन', 'The city’s beloved morning dialogue hub famous for spiced kulhad chai, pillowy bun makkhan, and crispy gol samosas.', 'Since 1949, Sharma Tea Stall in Lalbagh has been the epicenter of Lucknow’s social, political, and intellectual conversations. Morning visitors from all walks of life gather here for sweet, ginger-cardamom steeped milk tea served in clay Kulhads, accompanied by warm, pillowy bakery buns slathered with mountains of homemade white butter (Makkhan), and signature round spiced potato samosas.', 'Founded by Shri Om Prakash Sharma with a small kerosene stove, it has evolved into a cultural landmark where judges, students, artists, and politicians sit on stone benches to debate current affairs over steaming tea.', '["Experience the iconic morning breakfast ritual of Lucknow: Kulhad Chai + Fresh Bun Makkhan","Taste unique round Gol Samosas spiced with dry coriander and green chilies","Feel the warm, friendly conversational atmosphere that embodies Lucknow’s famous Tehzeeb","Start your heritage exploration energized with authentic local flavours"]'::jsonb, 'food', 'Heritage Tea & Breakfast Stall', '["Food","Culture","Budget Friendly","Family"]'::jsonb, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1200&q=80', '["https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1200&q=80"]'::jsonb, NULL, 'Near Novelty Cinema, Lalbagh, Lucknow, Uttar Pradesh 226001', 'Lalbagh', 26.8492, 80.9388, '06:30 AM', '07:30 PM', 'Free', 80, 'Morning', '45 Mins', '{"nearestMetro":"Hazratganj Metro (600m walk)","autoCabTips":"Short walk from Hazratganj main crossing towards Lalbagh"}'::jsonb, '["hazratganj-promenade","royal-cafe-basket-chaat"]'::jsonb, false, true, 'published', 4.8, 2600, '2026-02-05T10:00:00Z', '2026-08-20T12:00:00Z'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, short_description = EXCLUDED.short_description,
  category = EXCLUDED.category, vibes = EXCLUDED.vibes, cover_image = EXCLUDED.cover_image,
  rating = EXCLUDED.rating, reviews_count = EXCLUDED.reviews_count, updated_at = NOW();

-- ------------------------------------------------------------------------------
-- 2. LOCAL BUSINESSES (5 records)
-- ------------------------------------------------------------------------------
INSERT INTO public.local_businesses (
  id, name, category, description, address, area, contact_number, image, website_url, specialty, featured, status, created_at
) VALUES (
  'biz-ada-chikan', 'Ada Designer Chikan Studio', 'attire', 'Curating world-class GI-certified Lucknowi Chikankari, Mukaish and Zardozi garments with global authenticity certificate.', '68, Mahatma Gandhi Marg, Hazratganj, Lucknow', 'Hazratganj', '+91 99199 18888', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80', 'https://adachikan.com', 'Authentic 32-Stitch Handmade Chikankari', true, 'published', '2026-01-15T10:00:00Z'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, address = EXCLUDED.address,
  contact_number = EXCLUDED.contact_number, specialty = EXCLUDED.specialty;

INSERT INTO public.local_businesses (
  id, name, category, description, address, area, contact_number, image, website_url, specialty, featured, status, created_at
) VALUES (
  'biz-sugandh-ittar', 'Sugandh Co. Heritage Perfumers', 'handicrafts', 'Since 1850, crafting pure deg-distilled natural Shamama, Mitti, and Ruh Khus perfumes loved by royal families.', 'D-2, Janpath Market, Hazratganj, Lucknow', 'Hazratganj', '+91 522 2623344', 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80', 'https://sugandh.co', 'Traditional Natural Awadhi Attar & Incense', true, 'published', '2026-01-18T10:00:00Z'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, address = EXCLUDED.address,
  contact_number = EXCLUDED.contact_number, specialty = EXCLUDED.specialty;

INSERT INTO public.local_businesses (
  id, name, category, description, address, area, contact_number, image, website_url, specialty, featured, status, created_at
) VALUES (
  'biz-ram-asrey-sweets', 'Ram Asrey Sweets (Est. 1805)', 'sweets', 'Oldest functioning confectioner of Lucknow, legendary inventor of Malai Pan, Rasmalai, and seasonal Motichoor.', 'Banarasi Tola, Chowk & Nawal Kishore Road, Hazratganj', 'Chowk', '+91 522 2256789', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80', NULL, 'Original Malai Pan & Desi Ghee Sweets', true, 'published', '2026-01-20T10:00:00Z'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, address = EXCLUDED.address,
  contact_number = EXCLUDED.contact_number, specialty = EXCLUDED.specialty;

INSERT INTO public.local_businesses (
  id, name, category, description, address, area, contact_number, image, website_url, specialty, featured, status, created_at
) VALUES (
  'biz-awadh-heritage-walks', 'Lucknow Heritage Walk & Storytellers Guild', 'guide', 'Curated heritage walking trails guided by local historians, exploring Old Chowk havelis, poetry, architecture and hidden lanes.', 'Hussainabad Heritage Office, Lucknow', 'Hussainabad', '+91 94150 12345', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80', 'https://lucknowheritagewalk.com', 'Experiential Architectural & Food Walking Trails', true, 'published', '2026-01-22T10:00:00Z'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, address = EXCLUDED.address,
  contact_number = EXCLUDED.contact_number, specialty = EXCLUDED.specialty;

INSERT INTO public.local_businesses (
  id, name, category, description, address, area, contact_number, image, website_url, specialty, featured, status, created_at
) VALUES (
  'biz-idrees-biryani', 'Idrees Biryani Corner', 'restaurant', 'Traditional wood-fired Dum Mutton Biryani simmered in giant copper Degs in the historic alleyways of Raja Bazaar.', 'Javeed Manzil, Opposite Pata Nala, Raja Bazaar, Chowk', 'Chowk', '+91 98390 12789', 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80', NULL, 'Traditional Awadhi Dum Mutton Biryani', false, 'published', '2026-01-25T10:00:00Z'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, address = EXCLUDED.address,
  contact_number = EXCLUDED.contact_number, specialty = EXCLUDED.specialty;

-- ------------------------------------------------------------------------------
-- 3. EMERGENCY SERVICES (8 records)
-- ------------------------------------------------------------------------------
INSERT INTO public.emergency_services (
  id, service_name, number, description, category, availability, address, official_source, enabled, display_order
) VALUES (
  'emg-police-112', 'UP Police Emergency Response (Dial 112)', '112', 'Central unified emergency helpline for immediate police response, crime reporting, and instant dispatch in Lucknow.', 'police', '24 Hours / 7 Days', 'UP112 Headquarters, Shaheed Path, Gomti Nagar Extn, Lucknow', 'Uttar Pradesh Police (Verified Official)', true, 1
) ON CONFLICT (id) DO UPDATE SET
  service_name = EXCLUDED.service_name, number = EXCLUDED.number, enabled = EXCLUDED.enabled;

INSERT INTO public.emergency_services (
  id, service_name, number, description, category, availability, address, official_source, enabled, display_order
) VALUES (
  'emg-tourist-police', 'UP Tourism Police & Assistance Helpline', '1800 180 5055', 'Dedicated tourism safety, monument navigation guidance, verified tour guides support, and tourist grievance desk.', 'tourist', '09:00 AM - 08:00 PM', 'Paryatan Bhawan, C-13 Vipin Khand, Gomti Nagar, Lucknow', 'Uttar Pradesh Department of Tourism', true, 2
) ON CONFLICT (id) DO UPDATE SET
  service_name = EXCLUDED.service_name, number = EXCLUDED.number, enabled = EXCLUDED.enabled;

INSERT INTO public.emergency_services (
  id, service_name, number, description, category, availability, address, official_source, enabled, display_order
) VALUES (
  'emg-women-power-line', 'Women Power Line 1090', '1090', 'Confidential, rapid-action women safety and harassment protection service operated by specialized women police officers.', 'women', '24 Hours / 7 Days', 'Women Power Line HQ, 1090 Crossing, Gomti Nagar, Lucknow', 'Government of Uttar Pradesh', true, 3
) ON CONFLICT (id) DO UPDATE SET
  service_name = EXCLUDED.service_name, number = EXCLUDED.number, enabled = EXCLUDED.enabled;

INSERT INTO public.emergency_services (
  id, service_name, number, description, category, availability, address, official_source, enabled, display_order
) VALUES (
  'emg-ambulance-108', 'Emergency Medical Ambulance Service', '108', 'Free emergency medical transport and advanced life support ambulance network across Lucknow urban and rural zones.', 'medical', '24 Hours / 7 Days', 'King George’s Medical University & SGPGI Network', 'National Health Mission / UP Health Dept', true, 4
) ON CONFLICT (id) DO UPDATE SET
  service_name = EXCLUDED.service_name, number = EXCLUDED.number, enabled = EXCLUDED.enabled;

INSERT INTO public.emergency_services (
  id, service_name, number, description, category, availability, address, official_source, enabled, display_order
) VALUES (
  'emg-fire-101', 'Fire and Rescue Service', '101', 'Emergency fire fighting, building rescue, and hazardous situation response service.', 'fire', '24 Hours / 7 Days', 'Hazratganj Fire Station / Chowk Fire Station', 'UP Fire Service Department', true, 5
) ON CONFLICT (id) DO UPDATE SET
  service_name = EXCLUDED.service_name, number = EXCLUDED.number, enabled = EXCLUDED.enabled;

INSERT INTO public.emergency_services (
  id, service_name, number, description, category, availability, address, official_source, enabled, display_order
) VALUES (
  'emg-child-helpline', 'Childline Protection Helpline', '1098', 'Emergency assistance, rescue, and rehabilitation helpline for children in need of care and protection.', 'child', '24 Hours / 7 Days', NULL, 'Ministry of Women and Child Development', true, 6
) ON CONFLICT (id) DO UPDATE SET
  service_name = EXCLUDED.service_name, number = EXCLUDED.number, enabled = EXCLUDED.enabled;

INSERT INTO public.emergency_services (
  id, service_name, number, description, category, availability, address, official_source, enabled, display_order
) VALUES (
  'emg-kgmu-trauma', 'KGMU Trauma Center & Medical Emergency', '0522 2257540', 'Northern India’s premier government tertiary emergency trauma care facility with round-the-clock emergency medical officers.', 'medical', '24 Hours / 7 Days', 'Shah Mina Road, Chowk, Lucknow, Uttar Pradesh 226003', 'King George’s Medical University (KGMU)', true, 7
) ON CONFLICT (id) DO UPDATE SET
  service_name = EXCLUDED.service_name, number = EXCLUDED.number, enabled = EXCLUDED.enabled;

INSERT INTO public.emergency_services (
  id, service_name, number, description, category, availability, address, official_source, enabled, display_order
) VALUES (
  'emg-traffic-police', 'Lucknow Traffic Police Helpline', '94544 05155', 'Helpline for traffic congestion updates, towed vehicle inquiries, road accident reporting, and route guidance.', 'police', '24 Hours / 7 Days', 'Traffic Police Line, Mahanagar, Lucknow', 'Lucknow Police Commissionerate', true, 8
) ON CONFLICT (id) DO UPDATE SET
  service_name = EXCLUDED.service_name, number = EXCLUDED.number, enabled = EXCLUDED.enabled;

-- ------------------------------------------------------------------------------
-- 4. PLACE REVIEWS (12 records)
-- ------------------------------------------------------------------------------
INSERT INTO public.place_reviews (
  id, place_id, place_name, user_name, user_location, rating, review_text, visit_experience, visited_date, status, helpful_votes, created_at
) VALUES (
  'rev-bara-1', 'bara-imambara', 'Bara Imambara & Bhool Bhulaiya', 'Aarav Sharma', 'Delhi', 5, 'A breathtaking masterpiece of Awadhi engineering! The acoustic whispering galleries in the Bhool Bhulaiya are mind-bending. Make sure to hire an authorized local guide at the entrance to hear the historical tales of Nawab Asaf-ud-Daula.', 'Heritage Enthusiast', '2026-02-15', 'published', 24, '2026-02-16T10:30:00Z'
) ON CONFLICT (id) DO UPDATE SET
  rating = EXCLUDED.rating, review_text = EXCLUDED.review_text, helpful_votes = EXCLUDED.helpful_votes;

INSERT INTO public.place_reviews (
  id, place_id, place_name, user_name, user_location, rating, review_text, visit_experience, visited_date, status, helpful_votes, created_at
) VALUES (
  'rev-bara-2', 'bara-imambara', 'Bara Imambara & Bhool Bhulaiya', 'Fatima Zohra', 'Lucknow Resident', 5, 'As a local, I visit every monsoon. The view of Rumi Darwaza and the Husainabad clock tower from the roof of the labyrinth at sunset is unmatchable. The pillarless central hall leaves you in awe.', 'Photography Tour', '2026-02-10', 'published', 18, '2026-02-11T14:15:00Z'
) ON CONFLICT (id) DO UPDATE SET
  rating = EXCLUDED.rating, review_text = EXCLUDED.review_text, helpful_votes = EXCLUDED.helpful_votes;

INSERT INTO public.place_reviews (
  id, place_id, place_name, user_name, user_location, rating, review_text, visit_experience, visited_date, status, helpful_votes, created_at
) VALUES (
  'rev-bara-3', 'bara-imambara', 'Bara Imambara & Bhool Bhulaiya', 'Rohan Mehra', 'Mumbai', 4, 'Incredible monument. Wear comfortable slip-off shoes as you have to leave them at the counter. The Shahi Baoli stepwell on the right side is equally fascinating and often overlooked by tourists.', 'Family Trip', '2026-01-28', 'published', 12, '2026-01-29T09:45:00Z'
) ON CONFLICT (id) DO UPDATE SET
  rating = EXCLUDED.rating, review_text = EXCLUDED.review_text, helpful_votes = EXCLUDED.helpful_votes;

INSERT INTO public.place_reviews (
  id, place_id, place_name, user_name, user_location, rating, review_text, visit_experience, visited_date, status, helpful_votes, created_at
) VALUES (
  'rev-tunday-1', 'tunday-kababi-chowk', 'Tunday Kababi (Original Chowk Branch)', 'Kabir Verma', 'Bengaluru', 5, 'The Galawati kababs with Ulte Tawe Ka Paratha literally melt on your tongue. The secret blend of 160+ spices is not a myth. Head to the original Chowk branch in the evening for the most authentic Awadhi atmosphere.', 'Foodie / Culinary Walk', '2026-02-18', 'published', 35, '2026-02-19T18:00:00Z'
) ON CONFLICT (id) DO UPDATE SET
  rating = EXCLUDED.rating, review_text = EXCLUDED.review_text, helpful_votes = EXCLUDED.helpful_votes;

INSERT INTO public.place_reviews (
  id, place_id, place_name, user_name, user_location, rating, review_text, visit_experience, visited_date, status, helpful_votes, created_at
) VALUES (
  'rev-tunday-2', 'tunday-kababi-chowk', 'Tunday Kababi (Original Chowk Branch)', 'Pooja Nair', 'Kolkata', 5, 'Worth every bit of the hype. The narrow Chowk alleyway can get crowded, but the speed of service and the legendary taste make it an unforgettable culinary pilgrimage.', 'Friends Group', '2026-02-05', 'published', 15, '2026-02-06T12:20:00Z'
) ON CONFLICT (id) DO UPDATE SET
  rating = EXCLUDED.rating, review_text = EXCLUDED.review_text, helpful_votes = EXCLUDED.helpful_votes;

INSERT INTO public.place_reviews (
  id, place_id, place_name, user_name, user_location, rating, review_text, visit_experience, visited_date, status, helpful_votes, created_at
) VALUES (
  'rev-chota-1', 'chota-imambara', 'Chota Imambara (Palace of Lights)', 'Vikramaditya Rao', 'Hyderabad', 5, 'The Belgian crystal chandeliers and ornate Arabic calligraphy are magnificent. It feels much more intimate and spiritually serene than the grander Bara Imambara. Do not miss the silver pulpit.', 'Couples & Romantic', '2026-02-12', 'published', 14, '2026-02-13T11:00:00Z'
) ON CONFLICT (id) DO UPDATE SET
  rating = EXCLUDED.rating, review_text = EXCLUDED.review_text, helpful_votes = EXCLUDED.helpful_votes;

INSERT INTO public.place_reviews (
  id, place_id, place_name, user_name, user_location, rating, review_text, visit_experience, visited_date, status, helpful_votes, created_at
) VALUES (
  'rev-residency-1', 'the-british-residency', 'The British Residency', 'Meera Sengupta', 'Pune', 5, 'One of the most evocative historical sites in India. The cannonball marks on the brick ruins tell poignant stories of the 1857 Siege. The museum in the basement has exceptional archival models and oil paintings.', 'Solo Explorer', '2026-02-14', 'published', 21, '2026-02-15T16:40:00Z'
) ON CONFLICT (id) DO UPDATE SET
  rating = EXCLUDED.rating, review_text = EXCLUDED.review_text, helpful_votes = EXCLUDED.helpful_votes;

INSERT INTO public.place_reviews (
  id, place_id, place_name, user_name, user_location, rating, review_text, visit_experience, visited_date, status, helpful_votes, created_at
) VALUES (
  'rev-hazratganj-1', 'hazratganj-promenade', 'Hazratganj & Janpath Market', 'Sanya Mirza', 'Lucknow Resident', 5, '"Ganjing" in the evening is the ultimate Lucknow tradition! The uniform Victorian-style cream facades, lovely lampposts, and century-old sweet shops make it a wonderful strolling experience.', 'Local Resident', '2026-02-20', 'published', 19, '2026-02-21T20:10:00Z'
) ON CONFLICT (id) DO UPDATE SET
  rating = EXCLUDED.rating, review_text = EXCLUDED.review_text, helpful_votes = EXCLUDED.helpful_votes;

INSERT INTO public.place_reviews (
  id, place_id, place_name, user_name, user_location, rating, review_text, visit_experience, visited_date, status, helpful_votes, created_at
) VALUES (
  'rev-janeshwar-1', 'janeshwar-mishra-park', 'Janeshwar Mishra Park', 'Devansh Pandey', 'Kanpur', 4, 'Asia’s largest city park! The sprawling water bodies with paddle boats and shaded cycling tracks are fantastic. Renting a tandem cycle in the morning was the highlight for our family.', 'Family Trip', '2026-02-08', 'published', 11, '2026-02-09T08:30:00Z'
) ON CONFLICT (id) DO UPDATE SET
  rating = EXCLUDED.rating, review_text = EXCLUDED.review_text, helpful_votes = EXCLUDED.helpful_votes;

INSERT INTO public.place_reviews (
  id, place_id, place_name, user_name, user_location, rating, review_text, visit_experience, visited_date, status, helpful_votes, created_at
) VALUES (
  'rev-rumi-1', 'rumi-darwaza', 'Rumi Darwaza (Turkish Gate)', 'Ananya Roy', 'Chandigarh', 5, 'Standing in front of the Turkish Gate at golden hour gives you goosebumps. The sheer scale and delicate plaster carvings are incredible. Best photos are taken from the Husainabad side lawn.', 'Photography Tour', '2026-02-17', 'published', 28, '2026-02-18T17:50:00Z'
) ON CONFLICT (id) DO UPDATE SET
  rating = EXCLUDED.rating, review_text = EXCLUDED.review_text, helpful_votes = EXCLUDED.helpful_votes;

INSERT INTO public.place_reviews (
  id, place_id, place_name, user_name, user_location, rating, review_text, visit_experience, visited_date, status, helpful_votes, created_at
) VALUES (
  'rev-prakash-1', 'prakash-kulfi-chowk', 'Prakash Kulfi (Aminabad & Chowk)', 'Mohd. Tariq', 'Lucknow Resident', 5, 'The pure saffron Kesar Pista Falooda Kulfi is heavenly! Rich, velvety, and served with rose syrup. It is the best dessert in North India without question.', 'Foodie / Culinary Walk', '2026-02-19', 'published', 17, '2026-02-20T21:15:00Z'
) ON CONFLICT (id) DO UPDATE SET
  rating = EXCLUDED.rating, review_text = EXCLUDED.review_text, helpful_votes = EXCLUDED.helpful_votes;

INSERT INTO public.place_reviews (
  id, place_id, place_name, user_name, user_location, rating, review_text, visit_experience, visited_date, status, helpful_votes, created_at
) VALUES (
  'rev-royal-cafe-1', 'royal-cafe-basket-chaat', 'Royal Cafe & The Famous Basket Chaat', 'Ishaan Gupta', 'Jaipur', 4, 'The huge crispy potato basket stuffed with spiced peas, pomegranate, yogurt, and chutneys is an explosion of flavours! One basket chaat is enough to fill two people.', 'Friends Group', '2026-02-02', 'published', 13, '2026-02-03T19:30:00Z'
) ON CONFLICT (id) DO UPDATE SET
  rating = EXCLUDED.rating, review_text = EXCLUDED.review_text, helpful_votes = EXCLUDED.helpful_votes;

-- ------------------------------------------------------------------------------
-- 5. PLATFORM FEEDBACK (3 records)
-- ------------------------------------------------------------------------------
INSERT INTO public.platform_feedback (
  id, category, rating, message, user_name, email, status, created_at
) VALUES (
  'fb-1', 'planner', 5, 'The "Build My Day" itinerary generator is phenomenal! It created a perfectly paced 1-day Awadhi heritage and food trail for my weekend visit to Lucknow. Saved us hours of research.', 'Tanvi Saxena', 'tanvi.saxena@example.com', 'reviewed', '2026-02-18T11:20:00Z'
) ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status;

INSERT INTO public.platform_feedback (
  id, category, rating, message, user_name, email, status, created_at
) VALUES (
  'fb-2', 'map', 5, 'Love the interactive Leaflet GPS map with filterable categories! The distance calculator and custom Awadhi heritage markers made navigating Chowk so much easier.', 'Gaurav Joshi', 'gaurav.j@example.com', 'reviewed', '2026-02-14T15:40:00Z'
) ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status;

INSERT INTO public.platform_feedback (
  id, category, rating, message, user_name, email, status, created_at
) VALUES (
  'fb-3', 'design_ui', 5, 'The Nawabi royal aesthetic with gold accents and warm parchment tones is sublime. It truly feels like an official luxury tourism portal for Awadh.', 'Samarth Bhatnagar', NULL, 'reviewed', '2026-02-10T09:15:00Z'
) ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status;

-- ------------------------------------------------------------------------------
-- 6. SUGGESTIONS (3 records)
-- ------------------------------------------------------------------------------
INSERT INTO public.suggestions (
  id, category, title, description, location_area, suggested_by, contact_email, status, created_at
) VALUES (
  'sug-1', 'hidden_gem', 'Add Picture Gallery & Satkhanda Complex', 'The Husainabad Picture Gallery contains monumental life-size oil portraits of the Nawabs of Awadh where the eyes follow you from every angle. It sits right next to the incomplete Satkhanda minaret.', 'Hussainabad', 'Dr. Syed Masood (Historian)', 'masood.history@example.com', 'planned', '2026-02-15T14:30:00Z'
) ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status;

INSERT INTO public.suggestions (
  id, category, title, description, location_area, suggested_by, contact_email, status, created_at
) VALUES (
  'sug-2', 'new_place', 'Kukrail Reserve Forest & Gharial Breeding Center', 'A wonderful ecotourism spot on the outskirts of Lucknow with deer park, picnic trails, and freshwater crocodile sanctuary.', 'Indira Nagar', 'Priyanka Bajpai', NULL, 'under_review', '2026-02-12T17:00:00Z'
) ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status;

INSERT INTO public.suggestions (
  id, category, title, description, location_area, suggested_by, contact_email, status, created_at
) VALUES (
  'sug-3', 'feature_idea', 'Audio Guide Snippets for Historic Gates', 'Would be amazing to have short 30-second audio folklore stories embedded into the heritage monument pages for walking tours.', NULL, 'Nitin Kapoor', NULL, 'planned', '2026-02-08T10:10:00Z'
) ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status;

-- ------------------------------------------------------------------------------
-- 7. ISSUE REPORTS (2 records)
-- ------------------------------------------------------------------------------
INSERT INTO public.issue_reports (
  id, place_id, place_name, issue_type, description, reported_by, contact_email, status, admin_notes, created_at
) VALUES (
  'rep-1', 'the-british-residency', 'The British Residency', 'incorrect_timing', 'The entry ticket counter closes at 5:00 PM rather than 6:00 PM during the winter months, though visitors can stay inside the garden until sunset.', 'Kunal Srivastava', 'kunal.s@example.com', 'resolved', 'Timings updated in database to 07:00 AM - 05:30 PM.', '2026-02-17T12:00:00Z'
) ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status, admin_notes = EXCLUDED.admin_notes;

INSERT INTO public.issue_reports (
  id, place_id, place_name, issue_type, description, reported_by, contact_email, status, admin_notes, created_at
) VALUES (
  'rep-2', 'dastarkhwan-hazratganj', 'Dastarkhwan (Tulsi Theatre Complex)', 'incorrect_pricing', 'The average cost for two people is now around ₹700-₹800 due to updated menu prices.', 'Ayush Dubey', NULL, 'investigating', 'Verifying with the restaurant management.', '2026-02-16T19:30:00Z'
) ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status, admin_notes = EXCLUDED.admin_notes;

