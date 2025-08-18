-- Create sample data without requiring auth users
DO $$
DECLARE
    pahang_district_id UUID := 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc';
    demo_user_id UUID := '11111111-1111-1111-1111-111111111111';
    facility_pool_id UUID;
    facility_hall_id UUID;
BEGIN

    -- Get facility IDs
    SELECT id INTO facility_pool_id FROM facilities WHERE name = 'Kolam Renang Pahang Prima' LIMIT 1;
    SELECT id INTO facility_hall_id FROM facilities WHERE name = 'Dewan Komuniti Pahang Prima' LIMIT 1;

    -- Create bookings (without foreign key to profiles)
    INSERT INTO bookings (user_id, facility_id, booking_date, start_time, end_time, duration_hours, total_amount, status, purpose) VALUES
    (demo_user_id, facility_pool_id, CURRENT_DATE + INTERVAL '3 days', '14:00'::TIME, '16:00'::TIME, 2, 30.00, 'confirmed', 'Kenduri Keluarga'),
    (demo_user_id, facility_hall_id, CURRENT_DATE + INTERVAL '7 days', '10:00'::TIME, '12:00'::TIME, 2, 160.00, 'pending', 'Majlis Perkahwinan'),
    (demo_user_id, facility_pool_id, CURRENT_DATE - INTERVAL '2 days', '18:00'::TIME, '20:00'::TIME, 2, 40.00, 'completed', 'Latihan Badminton');

    -- Create complaints
    INSERT INTO complaints (complainant_id, district_id, title, description, category, priority, status, location) VALUES
    (demo_user_id, pahang_district_id, 'Lampu Koridor Rosak', 'Lampu di koridor tingkat 12 sudah rosak sejak 3 hari yang lalu. Kawasan menjadi gelap pada waktu malam dan tidak selamat untuk penduduk.', 'Infrastructure', 'high', 'pending', 'Blok A, Tingkat 12'),
    (demo_user_id, pahang_district_id, 'Bunyi Bising Renovasi', 'Unit sebelah melakukan kerja renovasi pada waktu malam sehingga mengganggu ketenangan. Mohon tindakan segera.', 'Noise', 'medium', 'in_progress', 'Unit A-12-04'),
    (demo_user_id, pahang_district_id, 'Paip Air Bocor', 'Paip air di bilik air utama bocor dan menyebabkan pembaziran air. Memerlukan pembaikan segera.', 'Plumbing', 'high', 'resolved', 'Unit A-12-05');

    -- Update existing announcements to ensure they show up
    UPDATE announcements SET author_id = demo_user_id WHERE author_id IS NULL;

    -- Create recent discussions
    INSERT INTO discussions (title, content, category, district_id, author_id, views_count, replies_count, created_at, last_reply_at) VALUES
    ('Cadangan Peningkatan Keselamatan', 'Saya ingin mencadangkan pemasangan lampu tambahan di kawasan parking kerana agak gelap pada waktu malam. Apa pandangan rakan-rakan semua?', 'security', pahang_district_id, demo_user_id, 25, 3, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour'),
    ('Aktiviti Gotong-Royong Bulanan', 'Aktiviti gotong-royong bulan ini dijadualkan pada hari Sabtu. Jom kita ramai-ramai menjaga kebersihan komuniti kita!', 'general', pahang_district_id, demo_user_id, 18, 5, NOW() - INTERVAL '1 day', NOW() - INTERVAL '6 hours'),
    ('Cadangan Menu Kantin', 'Ada cadangan untuk menambah menu halal di kantin komuniti. Makanan tempatan seperti nasi lemak dan mee goreng akan menjadi pilihan yang baik.', 'suggestions', pahang_district_id, demo_user_id, 12, 2, NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day');

    -- Create some maintenance requests
    INSERT INTO maintenance_requests (requested_by, district_id, title, description, category, priority, status, location) VALUES
    (demo_user_id, pahang_district_id, 'Aircond Tidak Sejuk', 'Unit penghawa dingin di bilik tidur tidak berfungsi dengan baik. Memerlukan servis dan pemeriksaan.', 'Electrical', 'medium', 'in_progress', 'Unit A-12-05 - Bilik Tidur'),
    (demo_user_id, pahang_district_id, 'Pintu Lift Rosak', 'Pintu lift tidak tertutup dengan sempurna dan berbunyi bising. Mohon pemeriksaan keselamatan.', 'Mechanical', 'high', 'pending', 'Lift Utama Blok A');

END $$;