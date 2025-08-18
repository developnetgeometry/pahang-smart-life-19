-- Create demo users and sample data for dashboard display

DO $$
DECLARE
    pahang_district_id UUID := 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc';
    demo_resident_id UUID := 'demo-resident'::UUID;
    demo_admin_id UUID := 'demo-admin'::UUID;
    demo_manager_id UUID := 'demo-manager'::UUID;
    demo_security_id UUID := 'demo-security'::UUID;
BEGIN

    -- Create demo user profiles (insert or update)
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
    INSERT INTO bookings (user_id, facility_id, booking_date, start_time, end_time, duration_hours, total_amount, status, purpose, district_id) 
    SELECT 
        demo_resident_id,
        f.id,
        CURRENT_DATE + INTERVAL '3 days',
        '14:00'::TIME,
        '16:00'::TIME,
        2,
        30.00,
        'confirmed',
        'Kenduri Keluarga',
        pahang_district_id
    FROM facilities f WHERE f.name = 'Kolam Renang Pahang Prima' LIMIT 1;

    INSERT INTO bookings (user_id, facility_id, booking_date, start_time, end_time, duration_hours, total_amount, status, purpose, district_id) 
    SELECT 
        demo_resident_id,
        f.id,
        CURRENT_DATE + INTERVAL '7 days',
        '10:00'::TIME,
        '12:00'::TIME,
        2,
        160.00,
        'pending',
        'Majlis Perkahwinan',
        pahang_district_id
    FROM facilities f WHERE f.name = 'Dewan Komuniti Pahang Prima' LIMIT 1;

    INSERT INTO bookings (user_id, facility_id, booking_date, start_time, end_time, duration_hours, total_amount, status, purpose, district_id) 
    SELECT 
        demo_resident_id,
        f.id,
        CURRENT_DATE - INTERVAL '2 days',
        '18:00'::TIME,
        '20:00'::TIME,
        2,
        40.00,
        'completed',
        'Latihan Badminton',
        pahang_district_id
    FROM facilities f WHERE f.name = 'Gymnasium Pahang Prima' LIMIT 1;

    -- Create sample complaints for demo resident
    INSERT INTO complaints (complainant_id, district_id, title, description, category, priority, status, location) VALUES
    (demo_resident_id, pahang_district_id, 'Lampu Koridor Rosak', 'Lampu di koridor tingkat 12 sudah rosak sejak 3 hari yang lalu. Kawasan menjadi gelap pada waktu malam dan tidak selamat untuk penduduk.', 'Infrastructure', 'high', 'pending', 'Blok A, Tingkat 12'),
    (demo_resident_id, pahang_district_id, 'Bunyi Bising Renovasi', 'Unit sebelah melakukan kerja renovasi pada waktu malam sehingga mengganggu ketenangan. Mohon tindakan segera.', 'Noise', 'medium', 'in_progress', 'Unit A-12-04');

    -- Create sample maintenance requests
    INSERT INTO maintenance_requests (requested_by, district_id, title, description, category, priority, status, location) VALUES
    (demo_resident_id, pahang_district_id, 'Paip Air Bocor', 'Paip air di bilik air utama bocor dan menyebabkan kekotoran air. Memerlukan pembaikan segera.', 'Plumbing', 'high', 'pending', 'Unit A-12-05 - Bilik Air Utama'),
    (demo_resident_id, pahang_district_id, 'Aircond Tidak Sejuk', 'Unit penghawa dingin di bilik tidur tidak berfungsi dengan baik. Memerlukan servis dan pemeriksaan.', 'Electrical', 'medium', 'in_progress', 'Unit A-12-05 - Bilik Tidur');

    -- Create sample visitor records
    INSERT INTO visitors (host_id, visitor_name, visitor_phone, visitor_ic, visit_date, visit_time, purpose, status, vehicle_plate) VALUES
    (demo_resident_id, 'Aminah Binti Osman', '019-8765432', '850615-06-5678', CURRENT_DATE, '15:30'::TIME, 'Lawatan keluarga', 'checked_in', 'WYZ 1234'),
    (demo_resident_id, 'Contractor Services Sdn Bhd', '03-12345678', '', CURRENT_DATE + 1, '09:00'::TIME, 'Kerja pembaikan aircond', 'pending', 'B 5432 KL');

    -- Create sample deliveries
    INSERT INTO deliveries (recipient_id, district_id, sender_name, courier_company, package_type, delivery_date, status, tracking_number) VALUES
    (demo_resident_id, pahang_district_id, 'Shopee Malaysia', 'J&T Express', 'package', CURRENT_DATE, 'pending', 'JT1234567890MY'),
    (demo_resident_id, pahang_district_id, 'Lazada', 'Pos Laju', 'package', CURRENT_DATE - 1, 'collected', 'EL123456789MY');

    -- Update announcements to have proper author_id
    UPDATE announcements SET author_id = demo_admin_id WHERE author_id IS NULL;

    -- Create some recent discussions with replies
    INSERT INTO discussions (title, content, category, district_id, author_id, views_count, replies_count, last_reply_at) VALUES
    ('Cadangan Peningkatan Keselamatan', 'Saya ingin mencadangkan pemasangan lampu tambahan di kawasan parking kerana agak gelap pada waktu malam. Apa pandangan rakan-rakan semua?', 'security', pahang_district_id, demo_resident_id, 25, 3, NOW() - INTERVAL '2 hours'),
    ('Aktiviti Gotong-Royong Bulanan', 'Aktiviti gotong-royong bulan ini dijadualkan pada hari Sabtu. Jom kita ramai-ramai menjaga kebersihan komuniti kita!', 'general', pahang_district_id, demo_manager_id, 18, 5, NOW() - INTERVAL '1 day');

    -- Create sample payments for resident
    INSERT INTO payments (user_id, district_id, payment_type, amount, status, description, due_date) VALUES
    (demo_resident_id, pahang_district_id, 'maintenance_fee', 280.00, 'pending', 'Yuran penyelenggaraan bulan September 2025', CURRENT_DATE + 15),
    (demo_resident_id, pahang_district_id, 'facility_booking', 160.00, 'paid', 'Sewa Dewan Komuniti - Majlis Perkahwinan', CURRENT_DATE - 5);

    -- Create event registrations
    INSERT INTO event_registrations (event_id, user_id, attendance_status) 
    SELECT e.id, demo_resident_id, 'registered'
    FROM events e WHERE e.title = 'Sambutan Hari Kemerdekaan Pahang Prima' LIMIT 1;

END $$;