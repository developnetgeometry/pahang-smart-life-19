-- Insert sample data safely (checking for existing data first)

DO $$
DECLARE
    pahang_north_id UUID;
    sample_user_id UUID;
BEGIN
    -- Get IDs
    SELECT id INTO pahang_north_id FROM districts WHERE name = 'Pahang Prima North';
    SELECT id INTO sample_user_id FROM profiles LIMIT 1;

    -- Insert events only if they don't exist
    INSERT INTO events (title, description, event_type, location, start_date, start_time, end_time, max_participants, organizer_id, district_id)
    SELECT 'Sambutan Hari Kemerdekaan Pahang Prima', 'Sambutan kemerdekaan dengan aktiviti budaya dan pertandingan tradisional', 'celebration', 'Dewan Komuniti Utama', '2025-08-31', '08:00', '18:00', 200, sample_user_id, pahang_north_id
    WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Sambutan Hari Kemerdekaan Pahang Prima');

    -- Insert emergency contacts only if they don't exist
    INSERT INTO emergency_contacts (contact_type, name, phone_number, address, district_id, services)
    SELECT 'police', 'Balai Polis Kuantan', '09-513-2222', 'Jalan Mahkota, 25000 Kuantan, Pahang', pahang_north_id, ARRAY['Emergency Response', 'Crime Investigation', '24/7 Patrol']
    WHERE NOT EXISTS (SELECT 1 FROM emergency_contacts WHERE name = 'Balai Polis Kuantan');

    -- Insert staff only if they don't exist
    INSERT INTO staff (employee_id, full_name, position, department, phone, hire_date, district_id)
    SELECT 'PG001', 'Ahmad Zakaria bin Hassan', 'Pengawal Keselamatan Utama', 'security', '013-9876543', '2023-01-15', pahang_north_id
    WHERE NOT EXISTS (SELECT 1 FROM staff WHERE employee_id = 'PG001');

    -- Insert sample notifications
    INSERT INTO notifications (title, message, notification_type, recipient_type, district_id, created_by)
    SELECT 'Sambutan Hari Kemerdekaan', 'Jemputan untuk menyertai sambutan kemerdekaan pada 31 Ogos 2025 di Dewan Komuniti. Pendaftaran terbuka!', 'info', 'district', pahang_north_id, sample_user_id
    WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE title = 'Sambutan Hari Kemerdekaan');

END $$;