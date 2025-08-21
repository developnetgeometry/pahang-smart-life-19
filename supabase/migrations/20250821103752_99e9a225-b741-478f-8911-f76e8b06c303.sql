-- Fix remaining functions without search_path (Part 4)

-- Update remaining functions that don't have SET search_path
DO $$
DECLARE
    func_name text;
    func_names text[] := ARRAY[
        'handle_new_user()',
        'get_user_role(uuid,uuid)', 
        'get_user_district()',
        'has_role(user_role)',
        'get_current_user_role_safe()',
        'has_role_compat(user_role)'
    ];
BEGIN
    -- Update each function to include SET search_path
    FOREACH func_name IN ARRAY func_names
    LOOP
        BEGIN
            EXECUTE format('ALTER FUNCTION public.%s SET search_path = ''public''', func_name);
            RAISE NOTICE 'Updated search_path for function: %', func_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not update function % (may not exist): %', func_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- Also ensure the get_module_id function has proper search_path if it exists
DO $$
BEGIN
    ALTER FUNCTION public.get_module_id(text) SET search_path = 'public';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Function get_module_id may not exist: %', SQLERRM;
END $$;