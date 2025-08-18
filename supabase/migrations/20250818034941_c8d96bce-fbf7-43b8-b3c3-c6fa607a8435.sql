-- Create demo users and sample data with proper UUIDs

DO $$
DECLARE
    pahang_district_id UUID := 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc';
    demo_resident_id UUID := '11111111-1111-1111-1111-111111111111';
    demo_admin_id UUID := '22222222-2222-2222-2222-222222222222';
    demo_manager_id UUID := '33333333-3333-3333-3333-333333333333';
    demo_security_id UUID := '44444444-4444-4444-4444-444444444444';
BEGIN

    -- Create demo user profiles
    INSERT INTO profiles (id, full_name, email, district_id, phone, unit_number) 
    VALUES 
        (demo_resident_id, 'Ahmad Bin Ali', 'demo.resident@demo.local', pahang_district_id, '013-1234567', 'A-12-05'),
        (demo_admin_id, 'Siti Fatimah Admin', 'demo.admin@demo.local', pahang_district_id, '013-2345678', 'B-15-08'),
        (demo_manager_id, 'Mohd Hafiz Manager', 'demo.manager@demo.local', pahang_district_id, '013-3456789', 'C-10-12'),
        (demo_security_id, 'Rahman Security Officer', 'demo.security@demo.local', pahang_district_id, '013-4567890', 'Staff-01')
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        district_id = EXCLUDED.district_id;

    -- Create user roles
    INSERT INTO user_roles (user_id, role, district_id) 
    VALUES 
        (demo_resident_id, 'resident', pahang_district_id),
        (demo_admin_id, 'admin', pahang_district_id),
        (demo_manager_id, 'manager', pahang_district_id),
        (demo_security_id, 'security', pahang_district_id)
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Create sample bookings for demo resident
    INSERT INTO bookings (user_id, facility_id, booking_date, start_time, end_time, duration_hours, total_amount, status, purpose) 
    SELECT 
        demo_resident_id,
        f.id,
        CURRENT_DATE + INTERVAL '3 days',
        '14:00'::TIME,
        '16:00'::TIME,
        2,
        30.00,
        'confirmed',
        'Kenduri Keluarga'
    FROM facilities f WHERE f.name = 'Kolam Renang Pahang Prima' LIMIT 1;

    INSERT INTO bookings (user_id, facility_id, booking_date, start_time, end_time, duration_hours, total_amount, status, purpose) 
    SELECT 
        demo_resident_id,
        f.id,
        CURRENT_DATE + INTERVAL '7 days',
        '10:00'::TIME,
        '12:00'::TIME,
        2,
        160.00,
        'pending',
        'Majlis Perkahwinan'
    FROM facilities f WHERE f.name = 'Dewan Komuniti Pahang Prima' LIMIT 1;

    -- Create sample complaints for demo resident
    INSERT INTO complaints (complainant_id, district_id, title, description, category, priority, status, location) VALUES
    (demo_resident_id, pahang_district_id, 'Lampu Koridor Rosak', 'Lampu di koridor tingkat 12 sudah rosak sejak 3 hari yang lalu. Kawasan menjadi gelap pada waktu malam dan tidak selamat untuk penduduk.', 'Infrastructure', 'high', 'pending', 'Blok A, Tingkat 12'),
    (demo_resident_id, pahang_district_id, 'Bunyi Bising Renovasi', 'Unit sebelah melakukan kerja renovasi pada waktu malam sehingga mengganggu ketenangan. Mohon tindakan segera.', 'Noise', 'medium', 'in_progress', 'Unit A-12-04');

    -- Update announcements to have proper author_id  
    UPDATE announcements SET author_id = demo_admin_id WHERE author_id IS NULL;

    -- Create recent discussions with proper timestamps
    INSERT INTO discussions (title, content, category, district_id, author_id, views_count, replies_count, created_at, last_reply_at) VALUES
    ('Cadangan Peningkatan Keselamatan', 'Saya ingin mencadangkan pemasangan lampu tambahan di kawasan parking kerana agak gelap pada waktu malam. Apa pandangan rakan-rakan semua?', 'security', pahang_district_id, demo_resident_id, 25, 3, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour'),
    ('Aktiviti Gotong-Royong Bulanan', 'Aktiviti gotong-royong bulan ini dijadualkan pada hari Sabtu. Jom kita ramai-ramai menjaga kebersihan komuniti kita!', 'general', pahang_district_id, demo_manager_id, 18, 5, NOW() - INTERVAL '1 day', NOW() - INTERVAL '6 hours');

END $$;