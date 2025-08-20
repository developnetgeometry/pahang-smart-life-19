-- Remove admin and manager test users
DELETE FROM user_roles WHERE user_id IN ('778be4f1-f6c7-45be-9475-b238e279e257', '39388dca-f29b-4cff-b99a-40cd7f72e7bb');
DELETE FROM profiles WHERE id IN ('778be4f1-f6c7-45be-9475-b238e279e257', '39388dca-f29b-4cff-b99a-40cd7f72e7bb');