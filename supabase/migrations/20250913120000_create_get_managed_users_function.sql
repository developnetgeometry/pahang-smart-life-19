CREATE OR REPLACE FUNCTION get_managed_users(
    p_requesting_user_id UUID,
    p_search_term TEXT DEFAULT NULL,
    p_role_filter TEXT DEFAULT 'all',
    p_status_filter TEXT DEFAULT 'all',
    p_page INT DEFAULT 1,
    p_page_size INT DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    unit_number TEXT,
    role TEXT,
    account_status TEXT,
    created_at TIMESTAMPTZ,
    district_id UUID,
    community_id UUID,
    total_count BIGINT
) AS $$
DECLARE
    v_user_roles TEXT[];
    v_user_district_id UUID;
    v_user_community_id UUID;
    v_offset INT;
BEGIN
    -- Get roles and affiliations of the requesting user
    SELECT
        array_agg(eur.role),
        p.district_id,
        p.active_community_id
    INTO
        v_user_roles,
        v_user_district_id,
        v_user_community_id
    FROM
        profiles p
    LEFT JOIN
        enhanced_user_roles eur ON p.id = eur.user_id
    WHERE
        p.id = p_requesting_user_id
    GROUP BY
        p.id;

    v_offset := (p_page - 1) * p_page_size;

    RETURN QUERY
    WITH filtered_users AS (
        SELECT
            p.id,
            p.full_name,
            p.email,
            p.phone,
            p.unit_number,
            COALESCE(eur.role, 'resident') AS role,
            p.account_status,
            p.created_at,
            p.district_id,
            p.community_id
        FROM
            profiles p
        LEFT JOIN
            enhanced_user_roles eur ON p.id = eur.user_id AND eur.is_active = TRUE
        WHERE
            -- Role-based access control
            (
                'state_admin' = ANY(v_user_roles)
                OR
                ('district_coordinator' = ANY(v_user_roles) AND p.district_id = v_user_district_id)
                OR
                ('community_admin' = ANY(v_user_roles) AND p.community_id = v_user_community_id)
            )
            -- Search filter
            AND (
                p_search_term IS NULL OR
                p.full_name ILIKE '%' || p_search_term || '%' OR
                p.email ILIKE '%' || p_search_term || '%'
            )
            -- Role filter
            AND (
                p_role_filter = 'all' OR
                COALESCE(eur.role, 'resident') = p_role_filter
            )
            -- Status filter
            AND (
                p_status_filter = 'all' OR
                p.account_status = p_status_filter
            )
    )
    SELECT
        fu.id,
        fu.full_name,
        fu.email,
        fu.phone,
        fu.unit_number,
        fu.role,
        fu.account_status,
        fu.created_at,
        fu.district_id,
        fu.community_id,
        (SELECT COUNT(*) FROM filtered_users) AS total_count
    FROM
        filtered_users
    ORDER BY
        fu.created_at DESC
    LIMIT p_page_size
    OFFSET v_offset;
END;
$$ LANGUAGE plpgsql;
