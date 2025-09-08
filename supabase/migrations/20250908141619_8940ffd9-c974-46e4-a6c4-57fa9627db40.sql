-- Check if there's a function to handle new user creation
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname LIKE '%user%' OR proname LIKE '%profile%'
LIMIT 5;