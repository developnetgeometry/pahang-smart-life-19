-- Insert sample community activities for slideshow
INSERT INTO public.community_activities (
    title, description, activity_type, date_time, end_time, location, 
    image_url, priority, status, district_id, is_published
) VALUES 
-- Chinese New Year Celebration
(
    'Chinese New Year Celebration',
    'Join us for a spectacular celebration with lion dance, traditional performances, and delicious food! Come together as a community to welcome the new year.',
    'event',
    '2024-02-12 19:00:00+00',
    '2024-02-12 22:00:00+00',
    'Community Hall, Level G',
    '/activity-images/chinese-new-year-celebration.jpg',
    'high',
    'upcoming',
    'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc',
    true
),
-- Badminton Tournament
(
    'Community Badminton Tournament',
    'Annual badminton championship open to all residents. Prizes for winners! Register now to participate in this exciting sports event.',
    'sports',
    '2024-02-18 09:00:00+00',
    '2024-02-18 18:00:00+00',
    'Sports Hall',
    '/activity-images/badminton-tournament.jpg',
    'medium',
    'upcoming',
    'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc',
    true
),
-- Gotong-Royong Day
(
    'Gotong-Royong Day',
    'Community cleaning and beautification day. Let''s work together to keep our neighborhood beautiful! Refreshments will be provided.',
    'community',
    '2024-02-25 08:00:00+00',
    '2024-02-25 12:00:00+00',
    'Various Areas',
    '/activity-images/gotong-royong-day.jpg',
    'high',
    'upcoming',
    'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc',
    true
),
-- Swimming Pool Hours Update
(
    'New Swimming Pool Hours',
    'Extended swimming pool hours during weekends. New facilities and equipment available! Enjoy more time for recreation and fitness.',
    'announcement',
    '2024-02-15 00:00:00+00',
    '2024-02-15 23:59:00+00',
    'Swimming Pool Area',
    '/activity-images/swimming-pool-hours.jpg',
    'medium',
    'ongoing',
    'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc',
    true
),
-- Health & Fitness Workshop
(
    'Health & Fitness Workshop',
    'Join our monthly health and wellness session with yoga, fitness demonstrations, and health screening. Free for all residents!',
    'community',
    '2024-03-05 16:00:00+00',
    '2024-03-05 18:00:00+00',
    'Community Center',
    '/activity-images/health-fitness-workshop.jpg',
    'medium',
    'upcoming',
    'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc',
    true
);

-- Insert sample dashboard metrics for residents
INSERT INTO public.dashboard_metrics (
    user_id, metric_type, metric_value, trend_text, status, icon_name, district_id
) VALUES 
-- Get the first resident user ID for sample data
(
    (SELECT id FROM auth.users WHERE email = 'resident@test.com' LIMIT 1),
    'active_complaints',
    '0',
    'All resolved',
    'positive',
    'FileText',
    'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'
),
(
    (SELECT id FROM auth.users WHERE email = 'resident@test.com' LIMIT 1),
    'upcoming_events',
    '5',
    'This month',
    'active',
    'PartyPopper',
    'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'
),
(
    (SELECT id FROM auth.users WHERE email = 'resident@test.com' LIMIT 1),
    'maintenance_requests',
    '1',
    'In progress',
    'pending',
    'AlertTriangle',
    'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'
),
(
    (SELECT id FROM auth.users WHERE email = 'resident@test.com' LIMIT 1),
    'bookings_this_month',
    '3',
    'Confirmed',
    'active',
    'Calendar',
    'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'
);

-- Insert sample community updates
INSERT INTO public.community_updates (
    update_type, title, message, priority, district_id, is_active,
    details, affected_areas, start_date, end_date
) VALUES 
(
    'maintenance',
    'Pool Maintenance Scheduled',
    'Pool maintenance scheduled for tomorrow 9AM-12PM',
    'medium',
    'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc',
    true,
    '{"description": "The swimming pool will undergo routine maintenance and cleaning. The pool area will be closed to ensure safety during the maintenance period.", "duration": "3 hours (9:00 AM - 12:00 PM)", "contact": "Management Office: +60 3-1234 5678"}',
    '["Swimming pool", "Pool deck", "Changing rooms"]',
    '2024-02-10 09:00:00+00',
    '2024-02-10 12:00:00+00'
),
(
    'event',
    'Chinese New Year Celebration',
    'Join us for Chinese New Year celebration - Feb 12, Community Hall',
    'low',
    'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc',
    true,
    '{"description": "Join our community in celebrating Chinese New Year! We will have traditional performances, delicious food, and fun activities for the whole family.", "dateTime": "February 12, 2024 - 7:00 PM to 10:00 PM", "location": "Community Hall, Level G", "activities": "Lion dance, Traditional music, Food stalls, Games for children", "contact": "Event Coordinator: Sarah +60 12-345 6789"}',
    '["Community Hall", "Parking Area"]',
    '2024-02-12 19:00:00+00',
    '2024-02-12 22:00:00+00'
),
(
    'security',
    'Security Update',
    'New security protocols implemented for visitor access',
    'high',
    'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc',
    true,
    '{"description": "Enhanced security measures have been implemented to improve the safety and security of our community. All visitors must now follow the new registration process.", "effectiveDate": "Effective immediately", "newRequirements": "Photo ID required, Pre-registration via app/phone, Security escort for contractors", "contact": "Security Hotline: +60 3-9876 5432"}',
    '["Main entrance", "Security office", "Visitor parking"]',
    '2024-02-08 00:00:00+00',
    NULL
);

-- Insert sample recent activities for residents
INSERT INTO public.recent_activities (
    user_id, activity_type, title, status, district_id
) VALUES 
(
    (SELECT id FROM auth.users WHERE email = 'resident@test.com' LIMIT 1),
    'announcement',
    'New community announcement posted',
    'completed',
    'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'
),
(
    (SELECT id FROM auth.users WHERE email = 'resident@test.com' LIMIT 1),
    'complaint',
    'Complaint resolved',
    'completed',
    'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'
),
(
    (SELECT id FROM auth.users WHERE email = 'resident@test.com' LIMIT 1),
    'booking',
    'Facility booking confirmed',
    'completed',
    'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'
),
(
    (SELECT id FROM auth.users WHERE email = 'resident@test.com' LIMIT 1),
    'announcement',
    'Security protocol updated',
    'completed',
    'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'
);