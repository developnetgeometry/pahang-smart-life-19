-- Insert sample data for new tables with Pahang-specific content

DO $$
DECLARE
    pahang_north_id UUID;
    pahang_south_id UUID;
    pahang_east_id UUID;
    pahang_west_id UUID;
    sample_user_id UUID;
BEGIN
    -- Get district IDs and a sample user
    SELECT id INTO pahang_north_id FROM districts WHERE name = 'Pahang Prima North';
    SELECT id INTO pahang_south_id FROM districts WHERE name = 'Pahang Prima South';
    SELECT id INTO pahang_east_id FROM districts WHERE name = 'Pahang Prima East';
    SELECT id INTO pahang_west_id FROM districts WHERE name = 'Pahang Prima West';
    SELECT id INTO sample_user_id FROM profiles LIMIT 1;

    -- Insert community events
    INSERT INTO events (title, description, event_type, location, start_date, start_time, end_time, max_participants, organizer_id, district_id) VALUES
    ('Sambutan Hari Kemerdekaan Pahang Prima', 'Sambutan kemerdekaan dengan aktiviti budaya dan pertandingan tradisional untuk semua penduduk komuniti', 'celebration', 'Dewan Komuniti Utama', '2025-08-31', '08:00', '18:00', 200, sample_user_id, pahang_north_id),
    ('Kelas Masakan Tradisional Pahang', 'Belajar memasak hidangan tradisional Pahang seperti gulai tempoyak dan ikan patin masak lemak cili api', 'workshop', 'Dewan Komuniti', '2025-09-05', '10:00', '15:00', 20, sample_user_id, pahang_south_id),
    ('Gotong-Royong Kebersihan Komuniti', 'Aktiviti membersihkan kawasan komuniti bersama-sama untuk menjaga persekitaran yang bersih', 'general', 'Seluruh Kawasan Komuniti', '2025-08-25', '07:00', '11:00', 100, sample_user_id, pahang_east_id),
    ('Karnival Sukan Komuniti', 'Pertandingan sukan untuk dewasa dan kanak-kanak termasuk badminton, ping pong dan renang', 'general', 'Kompleks Sukan', '2025-09-15', '08:00', '17:00', 150, sample_user_id, pahang_west_id);

    -- Insert emergency contacts for Pahang
    INSERT INTO emergency_contacts (contact_type, name, phone_number, address, district_id, services) VALUES
    ('police', 'Balai Polis Kuantan', '09-513-2222', 'Jalan Mahkota, 25000 Kuantan, Pahang', pahang_north_id, ARRAY['Emergency Response', 'Crime Investigation', '24/7 Patrol']),
    ('hospital', 'Hospital Tengku Ampuan Afzan', '09-513-3333', 'Jalan Tanah Putih, 25100 Kuantan, Pahang', pahang_north_id, ARRAY['Emergency Care', 'Ambulance Service', 'Specialist Treatment']),
    ('fire', 'Bomba dan Penyelamat Kuantan', '09-513-4444', 'Jalan Gambut, 25000 Kuantan, Pahang', pahang_north_id, ARRAY['Fire Fighting', 'Rescue Operations', 'Emergency Medical']),
    ('utility', 'Tenaga Nasional Berhad (TNB)', '15454', 'Kompleks TNB Kuantan', pahang_north_id, ARRAY['Power Outage', 'Electrical Emergency', 'Meter Issues']);

    -- Insert community polls
    INSERT INTO polls (title, description, options, district_id, end_date, created_by) VALUES
    ('Kemudahan Baharu untuk Komuniti', 'Pilih kemudahan baharu yang paling diperlukan untuk komuniti kita', 
     '{"options": [{"id": 1, "text": "Padang Futsal"}, {"id": 2, "text": "Taman Herba"}, {"id": 3, "text": "Ruang Co-working"}, {"id": 4, "text": "Mini Market"}]}', 
     pahang_north_id, '2025-09-30', sample_user_id),
    ('Jadual Aktiviti Mingguan', 'Hari manakah yang sesuai untuk aktiviti komuniti mingguan?',
     '{"options": [{"id": 1, "text": "Sabtu Pagi"}, {"id": 2, "text": "Sabtu Petang"}, {"id": 3, "text": "Ahad Pagi"}, {"id": 4, "text": "Ahad Petang"}]}',
     pahang_south_id, '2025-09-15', sample_user_id);

    -- Insert parking slots
    INSERT INTO parking_slots (slot_number, zone, district_id, hourly_rate, monthly_rate) VALUES
    ('A001', 'Zone A', pahang_north_id, 2.00, 50.00),
    ('A002', 'Zone A', pahang_north_id, 2.00, 50.00),
    ('B001', 'Zone B', pahang_north_id, 1.50, 40.00),
    ('V001', 'Visitor', pahang_north_id, 3.00, 0.00),
    ('V002', 'Visitor', pahang_north_id, 3.00, 0.00),
    ('H001', 'Handicapped', pahang_north_id, 0.00, 0.00);

    -- Insert community assets
    INSERT INTO assets (name, description, asset_type, location, district_id, purchase_date, current_value, condition_status) VALUES
    ('Sistem CCTV Kawasan Utama', 'Sistema kamera keselamatan 24/7 untuk kawasan utama komuniti', 'technology', 'Pintu Masuk Utama', pahang_north_id, '2024-01-15', 15000.00, 'excellent'),
    ('Mesin Pemotong Rumput', 'Mesin untuk menyelenggara landskap dan kawasan hijau komuniti', 'equipment', 'Stor Penyelenggaraan', pahang_south_id, '2023-06-10', 3500.00, 'good'),
    ('Van Komuniti', 'Kenderaan untuk kegunaan aktiviti komuniti dan kecemasan', 'vehicle', 'Parking Khusus', pahang_east_id, '2022-11-20', 45000.00, 'good'),
    ('Generator Backup', 'Penjana elektrik untuk keadaan kecemasan', 'equipment', 'Bilik Utiliti', pahang_west_id, '2024-03-01', 8000.00, 'excellent');

    -- Insert staff records
    INSERT INTO staff (employee_id, full_name, position, department, phone, hire_date, district_id, shift_schedule) VALUES
    ('PG001', 'Ahmad Zakaria bin Hassan', 'Pengawal Keselamatan Utama', 'security', '013-9876543', '2023-01-15', pahang_north_id, '{"monday": "7:00-19:00", "tuesday": "7:00-19:00", "wednesday": "7:00-19:00", "thursday": "7:00-19:00", "friday": "7:00-19:00", "saturday": "7:00-19:00", "sunday": "off"}'),
    ('PM001', 'Siti Aishah binti Abdullah', 'Pengurus Kemudahan', 'maintenance', '019-1234567', '2022-08-10', pahang_south_id, '{"monday": "8:00-17:00", "tuesday": "8:00-17:00", "wednesday": "8:00-17:00", "thursday": "8:00-17:00", "friday": "8:00-17:00", "saturday": "off", "sunday": "off"}'),
    ('PK001', 'Mohd Faizal bin Ibrahim', 'Pekerja Kebersihan', 'cleaning', '017-2345678', '2023-05-01', pahang_east_id, '{"monday": "6:00-14:00", "tuesday": "6:00-14:00", "wednesday": "6:00-14:00", "thursday": "6:00-14:00", "friday": "6:00-14:00", "saturday": "6:00-12:00", "sunday": "off"}');

    -- Insert inventory items
    INSERT INTO inventory (item_name, description, category, unit, current_stock, minimum_stock, storage_location, district_id, supplier) VALUES
    ('Deterjen Lantai', 'Cecair pembersih lantai untuk kemudahan awam', 'cleaning', 'botol', 15, 5, 'Stor Kebersihan Utama', pahang_north_id, 'Syarikat Bekalan Kebersihan Kuantan'),
    ('Bola Lampu LED', 'Lampu LED 15W untuk penggantian lampu rosak', 'maintenance', 'unit', 25, 10, 'Stor Penyelenggaraan', pahang_south_id, 'Kedai Elektrik Pahang'),
    ('Kertas A4', 'Kertas putih untuk kegunaan pejabat pengurusan', 'office', 'rim', 8, 3, 'Pejabat Pengurusan', pahang_east_id, 'Syarikat Alat Tulis Kuantan'),
    ('Kit Pertolongan Cemas', 'Peralatan asas pertolongan cemas', 'safety', 'set', 3, 2, 'Pos Keselamatan', pahang_west_id, 'Farmasi Kesihatan Prima');

    -- Insert financial records
    INSERT INTO financial_records (transaction_type, category, amount, description, transaction_date, district_id, recorded_by) VALUES
    ('income', 'maintenance_fee', 25000.00, 'Kutipan yuran penyelenggaraan bulanan Ogos 2025', '2025-08-01', pahang_north_id, sample_user_id),
    ('expense', 'utility', 3500.00, 'Bayaran bil elektrik dan air bulan Julai 2025', '2025-08-05', pahang_north_id, sample_user_id),
    ('expense', 'maintenance', 1200.00, 'Pembaikan pam kolam renang', '2025-08-10', pahang_north_id, sample_user_id),
    ('income', 'facility_booking', 800.00, 'Kutipan sewa dewan komuniti', '2025-08-15', pahang_south_id, sample_user_id);

    -- Insert meeting minutes
    INSERT INTO meeting_minutes (meeting_title, meeting_date, meeting_type, agenda, discussions, decisions, district_id, created_by, status) VALUES
    ('Mesyuarat Pengurusan Bulanan Ogos', '2025-08-10', 'committee', 
     'Perbincangan isu-isu semasa komuniti dan perancangan aktiviti bulan September',
     'Dibincangkan mengenai penambahbaikan kemudahan, jadual penyelenggaraan, dan aktiviti kemerdekaan',
     'Diputuskan untuk mengadakan sambutan kemerdekaan pada 31 Ogos dan meningkatkan penyelenggaraan taman',
     pahang_north_id, sample_user_id, 'published');

    -- Insert notifications
    INSERT INTO notifications (title, message, notification_type, recipient_type, district_id, created_by) VALUES
    ('Sambutan Hari Kemerdekaan', 'Jemputan untuk menyertai sambutan kemerdekaan pada 31 Ogos 2025 di Dewan Komuniti. Pendaftaran terbuka!', 'info', 'district', pahang_north_id, sample_user_id),
    ('Reminder: Yuran Penyelenggaraan', 'Peringatan bahawa yuran penyelenggaraan bulan September perlu dijelaskan sebelum 5 September 2025', 'warning', 'district', pahang_south_id, sample_user_id),
    ('Kemudahan Baharu: Gymnasium', 'Gymnasium baharu kini telah dibuka untuk kegunaan penduduk. Tempahan boleh dibuat di pejabat pengurusan', 'success', 'district', pahang_east_id, sample_user_id);

END $$;