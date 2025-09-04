-- DATABASE OPTIMIZATION: Add Missing Foreign Key Constraints and Indexes (Fixed)

-- 1. Add Foreign Key Constraints for Core Relationships
ALTER TABLE access_cards 
ADD CONSTRAINT fk_access_cards_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE access_cards 
ADD CONSTRAINT fk_access_cards_district_id 
FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE SET NULL;

ALTER TABLE access_logs 
ADD CONSTRAINT fk_access_logs_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE access_logs 
ADD CONSTRAINT fk_access_logs_card_id 
FOREIGN KEY (card_id) REFERENCES access_cards(id) ON DELETE SET NULL;

-- Announcements relationships
ALTER TABLE announcements 
ADD CONSTRAINT fk_announcements_author_id 
FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE announcements 
ADD CONSTRAINT fk_announcements_district_id 
FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE;

ALTER TABLE announcements 
ADD CONSTRAINT fk_announcements_community_id 
FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE;

-- Announcement related tables
ALTER TABLE announcement_bookmarks 
ADD CONSTRAINT fk_announcement_bookmarks_announcement_id 
FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE;

ALTER TABLE announcement_bookmarks 
ADD CONSTRAINT fk_announcement_bookmarks_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE announcement_comments 
ADD CONSTRAINT fk_announcement_comments_announcement_id 
FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE;

ALTER TABLE announcement_comments 
ADD CONSTRAINT fk_announcement_comments_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE announcement_comments 
ADD CONSTRAINT fk_announcement_comments_parent_id 
FOREIGN KEY (parent_comment_id) REFERENCES announcement_comments(id) ON DELETE CASCADE;

-- Bookings relationships
ALTER TABLE bookings 
ADD CONSTRAINT fk_bookings_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE bookings 
ADD CONSTRAINT fk_bookings_facility_id 
FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE;

ALTER TABLE bookings 
ADD CONSTRAINT fk_bookings_approved_by 
FOREIGN KEY (approved_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Chat system relationships
ALTER TABLE chat_rooms 
ADD CONSTRAINT fk_chat_rooms_created_by 
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE chat_room_members 
ADD CONSTRAINT fk_chat_room_members_room_id 
FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE;

ALTER TABLE chat_room_members 
ADD CONSTRAINT fk_chat_room_members_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE chat_messages 
ADD CONSTRAINT fk_chat_messages_room_id 
FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE;

ALTER TABLE chat_messages 
ADD CONSTRAINT fk_chat_messages_sender_id 
FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;