-- Create sample data that will display in demo mode

DO $$
DECLARE
    pahang_district_id UUID := 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc';
    facility_id UUID;
BEGIN

    -- Get a facility ID
    SELECT id INTO facility_id FROM facilities WHERE name = 'Kolam Renang Pahang Prima' LIMIT 1;

    -- Create sample bookings (without specific user_id for demo)
    INSERT INTO bookings (facility_id, booking_date, start_time, end_time, duration_hours, total_amount, status, purpose) 
    VALUES 
        (facility_id, CURRENT_DATE + INTERVAL '3 days', '14:00'::TIME, '16:00'::TIME, 2, 30.00, 'confirmed', 'Kenduri Keluarga'),
        (facility_id, CURRENT_DATE + INTERVAL '7 days', '10:00'::TIME, '12:00'::TIME, 2, 160.00, 'pending', 'Majlis Perkahwinan'),
        (facility_id, CURRENT_DATE - INTERVAL '2 days', '18:00'::TIME, '20:00'::TIME, 2, 40.00, 'completed', 'Latihan Badminton');

    -- Create sample complaints
    INSERT INTO complaints (district_id, title, description, category, priority, status, location) VALUES
    (pahang_district_id, 'Lampu Koridor Rosak', 'Lampu di koridor tingkat 12 sudah rosak sejak 3 hari yang lalu. Kawasan menjadi gelap pada waktu malam dan tidak selamat untuk penduduk.', 'Infrastructure', 'high', 'pending', 'Blok A, Tingkat 12'),
    (pahang_district_id, 'Bunyi Bising Renovasi', 'Unit sebelah melakukan kerja renovasi pada waktu malam sehingga mengganggu ketenangan. Mohon tindakan segera.', 'Noise', 'medium', 'in_progress', 'Unit A-12-04'),
    (pahang_district_id, 'Paip Air Bocor', 'Paip air di taman permainan bocor dan menyebabkan kawasan berlumpur.', 'Maintenance', 'high', 'resolved', 'Taman Permainan');

    -- Update existing discussions to have recent timestamps
    UPDATE discussions SET 
        created_at = NOW() - INTERVAL '2 hours',
        last_reply_at = NOW() - INTERVAL '1 hour'
    WHERE title = 'Cadangan Penambahbaikan Taman Permainan';

    UPDATE discussions SET 
        created_at = NOW() - INTERVAL '1 day',
        last_reply_at = NOW() - INTERVAL '6 hours'
    WHERE title = 'Isu Tempat Letak Kereta';

END $$;