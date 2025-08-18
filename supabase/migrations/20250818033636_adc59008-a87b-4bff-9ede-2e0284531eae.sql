-- Insert sample Pahang-specific data for the community management system

-- Get the district IDs for Pahang districts
DO $$
DECLARE
    pahang_north_id UUID;
    pahang_south_id UUID;
    pahang_east_id UUID;
    pahang_west_id UUID;
BEGIN
    -- Get district IDs
    SELECT id INTO pahang_north_id FROM districts WHERE name = 'Pahang Prima North';
    SELECT id INTO pahang_south_id FROM districts WHERE name = 'Pahang Prima South';
    SELECT id INTO pahang_east_id FROM districts WHERE name = 'Pahang Prima East';
    SELECT id INTO pahang_west_id FROM districts WHERE name = 'Pahang Prima West';

    -- Insert facilities for Pahang communities
    INSERT INTO facilities (id, name, description, district_id, capacity, hourly_rate, operating_hours, amenities, rules, is_available) VALUES
    (gen_random_uuid(), 'Kolam Renang Pahang Prima', 'Modern swimming pool with separate lanes for adults and children', pahang_north_id, 50, 15.00, '{"monday": "6:00-22:00", "tuesday": "6:00-22:00", "wednesday": "6:00-22:00", "thursday": "6:00-22:00", "friday": "6:00-22:00", "saturday": "6:00-22:00", "sunday": "8:00-20:00"}', ARRAY['Swimming lanes', 'Children pool', 'Changing rooms', 'Showers'], ARRAY['No running around pool area', 'Children must be accompanied by adults', 'No food or drinks in pool area'], true),
    (gen_random_uuid(), 'Dewan Komuniti Pahang Prima', 'Multi-purpose community hall for events and gatherings', pahang_south_id, 150, 80.00, '{"monday": "8:00-23:00", "tuesday": "8:00-23:00", "wednesday": "8:00-23:00", "thursday": "8:00-23:00", "friday": "8:00-23:00", "saturday": "8:00-23:00", "sunday": "8:00-23:00"}', ARRAY['Sound system', 'Air conditioning', 'Stage', 'Kitchen facilities', 'Tables and chairs'], ARRAY['Must be booked 3 days in advance', 'No smoking', 'Clean up after use', 'Report any damages immediately'], true),
    (gen_random_uuid(), 'Gymnasium Pahang Prima', 'Fully equipped gymnasium with modern facilities', pahang_east_id, 30, 20.00, '{"monday": "6:00-22:00", "tuesday": "6:00-22:00", "wednesday": "6:00-22:00", "thursday": "6:00-22:00", "friday": "6:00-22:00", "saturday": "6:00-22:00", "sunday": "8:00-20:00"}', ARRAY['Weight training equipment', 'Cardio machines', 'Basketball court', 'Badminton court', 'Changing rooms'], ARRAY['Proper sports attire required', 'Wipe equipment after use', 'Maximum 2 hours per session', 'No outside food or drinks'], true),
    (gen_random_uuid(), 'Taman Kanak-Kanak', 'Safe playground area for children with modern equipment', pahang_west_id, 25, 0.00, '{"monday": "6:00-19:00", "tuesday": "6:00-19:00", "wednesday": "6:00-19:00", "thursday": "6:00-19:00", "friday": "6:00-19:00", "saturday": "6:00-19:00", "sunday": "6:00-19:00"}', ARRAY['Swings', 'Slides', 'Climbing frames', 'Soft play area', 'Benches for parents'], ARRAY['Children must be supervised', 'Age limit 12 years', 'No pets allowed', 'Keep area clean'], true),
    (gen_random_uuid(), 'Surau Pahang Prima', 'Prayer hall for Muslim community members', pahang_north_id, 100, 0.00, '{"monday": "5:00-22:00", "tuesday": "5:00-22:00", "wednesday": "5:00-22:00", "thursday": "5:00-22:00", "friday": "5:00-22:00", "saturday": "5:00-22:00", "sunday": "5:00-22:00"}', ARRAY['Prayer mats', 'Ablution area', 'Air conditioning', 'Sound system for Azan'], ARRAY['Remove shoes before entering', 'Maintain silence', 'Proper attire required', 'Clean up after use'], true);

    -- Insert announcements
    INSERT INTO announcements (id, title, content, type, is_urgent, district_id, author_id, is_published, publish_at) VALUES
    (gen_random_uuid(), 'Jadual Penyelenggaraan Kolam Renang', 'Kolam renang akan ditutup untuk penyelenggaraan rutin pada 25 Ogos 2025 dari jam 8:00 pagi hingga 5:00 petang. Mohon maaf atas kesulitan yang dialami.', 'maintenance', false, pahang_north_id, (SELECT id FROM profiles LIMIT 1), true, now()),
    (gen_random_uuid(), 'Gotong-Royong Komuniti', 'Jemputan kepada semua penduduk untuk menyertai aktiviti gotong-royong pada hari Sabtu, 30 Ogos 2025 jam 7:00 pagi. Mari kita berganding bahu untuk menjaga kebersihan komuniti kita.', 'general', false, pahang_south_id, (SELECT id FROM profiles LIMIT 1), true, now()),
    (gen_random_uuid(), 'Peningkatan Keselamatan', 'Sistem CCTV baharu telah dipasang di kawasan utama komuniti. Langkah ini diambil untuk meningkatkan keselamatan penduduk. Terima kasih atas kerjasama semua.', 'security', true, pahang_east_id, (SELECT id FROM profiles LIMIT 1), true, now()),
    (gen_random_uuid(), 'Program Kanak-Kanak', 'Pendaftaran terbuka untuk program aktiviti kanak-kanak bulan September. Program termasuk seni dan kraf, sukan, dan aktiviti pembelajaran. Daftar di pejabat pengurusan sebelum 28 Ogos.', 'event', false, pahang_west_id, (SELECT id FROM profiles LIMIT 1), true, now()),
    (gen_random_uuid(), 'Gangguan Bekalan Air', 'Akan berlaku gangguan bekalan air pada 22 Ogos 2025 dari jam 9:00 pagi hingga 3:00 petang akibat kerja-kerja pembaikan paip utama. Mohon simpan air secukupnya.', 'maintenance', true, pahang_north_id, (SELECT id FROM profiles LIMIT 1), true, now());

    -- Insert discussions
    INSERT INTO discussions (id, title, content, category, district_id, author_id, is_pinned, views_count, replies_count) VALUES
    (gen_random_uuid(), 'Cadangan Penambahbaikan Taman Permainan', 'Saya ingin mencadangkan beberapa penambahbaikan untuk taman permainan kanak-kanak. Antaranya ialah penambahan ayunan baru dan kawasan teduh yang lebih besar. Apa pendapat semua?', 'suggestions', pahang_west_id, (SELECT id FROM profiles LIMIT 1), true, 45, 8),
    (gen_random_uuid(), 'Isu Tempat Letak Kereta', 'Adakah sesiapa menghadapi masalah kekurangan tempat letak kereta terutama pada waktu petang? Boleh kita bincangkan penyelesaian yang sesuai untuk masalah ini.', 'general', pahang_north_id, (SELECT id FROM profiles LIMIT 1), false, 32, 12),
    (gen_random_uuid(), 'Aktiviti Komuniti Bulan Merdeka', 'Mari kita rancang aktiviti sempena bulan kemerdekaan! Saya cadangkan kita ada pertandingan masak, permainan tradisional, dan sambutan rasmi. Siapa nak join committee?', 'events', pahang_south_id, (SELECT id FROM profiles LIMIT 1), false, 28, 15),
    (gen_random_uuid(), 'Masalah Bunyi Bising Malam', 'Sejak kebelakangan ini ada bunyi bising yang mengganggu pada waktu malam dari kawasan pembinaan berhampiran. Adakah pihak pengurusan boleh ambil tindakan?', 'complaints', pahang_east_id, (SELECT id FROM profiles LIMIT 1), false, 19, 6);

    -- Insert complaints for realistic data
    INSERT INTO complaints (id, title, description, category, priority, district_id, complainant_id, location, status) VALUES
    (gen_random_uuid(), 'Lampu Jalan Rosak', 'Lampu jalan di hadapan blok A sudah rosak sejak seminggu yang lalu. Kawasan menjadi gelap dan tidak selamat pada waktu malam.', 'Infrastructure', 'high', pahang_north_id, (SELECT id FROM profiles LIMIT 1), 'Blok A, Hadapan Pintu Masuk', 'pending'),
    (gen_random_uuid(), 'Paip Air Bocor', 'Terdapat kebocoran paip air di taman permainan yang menyebabkan kawasan menjadi berlumpur dan tidak selamat untuk kanak-kanak bermain.', 'Maintenance', 'medium', pahang_west_id, (SELECT id FROM profiles LIMIT 1), 'Taman Permainan Utama', 'in_progress'),
    (gen_random_uuid(), 'Bunyi Bising Pembinaan', 'Kerja-kerja pembinaan bermula terlalu awal pagi (6:00 AM) dan mengganggu ketenangan penduduk, terutama ibu yang mempunyai bayi.', 'Noise', 'medium', pahang_east_id, (SELECT id FROM profiles LIMIT 1), 'Kawasan Pembinaan Baharu', 'resolved'),
    (gen_random_uuid(), 'Tempat Sampah Penuh', 'Tempat sampah komuniti di kawasan blok C sentiasa penuh dan tidak dikutip mengikut jadual. Ini menyebabkan bau busuk dan menarik serangga.', 'Cleanliness', 'high', pahang_south_id, (SELECT id FROM profiles LIMIT 1), 'Blok C, Kawasan Tempat Sampah', 'pending');

    -- Insert CCTV cameras for security monitoring
    INSERT INTO cctv_cameras (id, name, location, district_id, is_active, camera_type, resolution, stream_url) VALUES
    (gen_random_uuid(), 'Kamera Pintu Masuk Utama', 'Pintu masuk utama komuniti', pahang_north_id, true, 'Fixed Dome', '1080p', 'rtsp://camera1.pahangprima.my/stream'),
    (gen_random_uuid(), 'Kamera Taman Permainan', 'Kawasan taman permainan kanak-kanak', pahang_west_id, true, 'PTZ', '4K', 'rtsp://camera2.pahangprima.my/stream'),
    (gen_random_uuid(), 'Kamera Tempat Letak Kereta', 'Kawasan tempat letak kereta utama', pahang_south_id, true, 'Fixed Bullet', '1080p', 'rtsp://camera3.pahangprima.my/stream'),
    (gen_random_uuid(), 'Kamera Kolam Renang', 'Kawasan sekitar kolam renang', pahang_north_id, true, 'Fixed Dome', '1080p', 'rtsp://camera4.pahangprima.my/stream'),
    (gen_random_uuid(), 'Kamera Perimeter', 'Kawasan perimeter komuniti', pahang_east_id, true, 'PTZ', '4K', 'rtsp://camera5.pahangprima.my/stream');

    -- Insert sensors for smart monitoring
    INSERT INTO sensors (id, name, type, location, district_id, unit, min_threshold, max_threshold) VALUES
    (gen_random_uuid(), 'Sensor Kualiti Udara Utama', 'Air Quality', 'Kawasan tengah komuniti', pahang_north_id, 'AQI', 0, 100),
    (gen_random_uuid(), 'Sensor Suhu Kolam', 'Temperature', 'Kolam renang', pahang_north_id, '°C', 26, 30),
    (gen_random_uuid(), 'Sensor Kelembapan Dewan', 'Humidity', 'Dewan komuniti', pahang_south_id, '%', 40, 70),
    (gen_random_uuid(), 'Sensor Bunyi Bising', 'Noise', 'Kawasan perumahan', pahang_east_id, 'dB', 0, 55),
    (gen_random_uuid(), 'Sensor Tahap Air', 'Water Level', 'Tangki air komuniti', pahang_west_id, 'L', 1000, 5000);

    -- Insert recent sensor readings
    INSERT INTO sensor_readings (sensor_id, value, is_alert) 
    SELECT 
        s.id,
        CASE 
            WHEN s.type = 'Air Quality' THEN 45 + (random() * 30)::int
            WHEN s.type = 'Temperature' THEN 27 + (random() * 3)::int
            WHEN s.type = 'Humidity' THEN 55 + (random() * 20)::int
            WHEN s.type = 'Noise' THEN 35 + (random() * 15)::int
            WHEN s.type = 'Water Level' THEN 3000 + (random() * 1500)::int
        END,
        false
    FROM sensors s;

END $$;