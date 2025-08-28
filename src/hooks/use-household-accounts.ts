import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface HouseholdAccount {
  id: string;
  primary_account_id: string;
  linked_account_id: string;
  relationship_type: 'spouse' | 'tenant';
  permissions: {
    marketplace: boolean;
    bookings: boolean;
    announcements: boolean;
    complaints: boolean;
    discussions: boolean;
  };
  is_active: boolean;
  created_at: string;
  linked_profile?: {
    full_name: string;
    email: string;
    mobile_no: string;
  };
}

export function useHouseholdAccounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<HouseholdAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    if (!user) {
      setAccounts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('household_accounts')
        .select(`
          id,
          primary_account_id,
          linked_account_id,
          relationship_type,
          permissions,
          is_active,
          created_at,
          linked_profile:profiles!household_accounts_linked_account_id_fkey(
            full_name,
            email,
            mobile_no
          )
        `)
        .eq('primary_account_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      
      // Type cast to ensure proper typing
      const typedData = (data || []).map(account => ({
        ...account,
        relationship_type: account.relationship_type as 'spouse' | 'tenant',
        permissions: account.permissions as HouseholdAccount['permissions']
      }));
      
      setAccounts(typedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  const createSpouseAccount = async (spouseData: {
    email: string;
    password: string;
    full_name: string;
    mobile_no?: string;
  }) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Check if spouse account already exists
      const existingSpouse = accounts.find(acc => acc.relationship_type === 'spouse');
      if (existingSpouse) {
        throw new Error('Spouse account already exists');
      }

      // Create authentication account for spouse
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: spouseData.email,
        password: spouseData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: spouseData.full_name,
            mobile_no: spouseData.mobile_no || '',
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user account');

      // Get current user's profile for district and community info
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('district_id, community_id')
        .eq('id', user.id)
        .single();

      // Update the spouse profile with additional data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: spouseData.full_name,
          mobile_no: spouseData.mobile_no,
          district_id: userProfile?.district_id,
          community_id: userProfile?.community_id,
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      // Create household account link
      const { error: householdError } = await supabase
        .from('household_accounts')
        .insert({
          primary_account_id: user.id,
          linked_account_id: authData.user.id,
          relationship_type: 'spouse',
          created_by: user.id,
        });

      if (householdError) throw householdError;

      await fetchAccounts();
      return authData.user;
    } catch (error) {
      throw error;
    }
  };

  const createTenantAccount = async (tenantData: {
    email: string;
    password: string;
    full_name: string;
    mobile_no?: string;
    permissions?: Partial<HouseholdAccount['permissions']>;
  }) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Create authentication account for tenant
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: tenantData.email,
        password: tenantData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: tenantData.full_name,
            mobile_no: tenantData.mobile_no || '',
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user account');

      // Get current user's profile for district and community info
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('district_id, community_id')
        .eq('id', user.id)
        .single();

      // Update the tenant profile with additional data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: tenantData.full_name,
          mobile_no: tenantData.mobile_no,
          district_id: userProfile?.district_id,
          community_id: userProfile?.community_id,
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      // Create household account link with custom permissions
      const defaultPermissions = {
        marketplace: false,
        bookings: true,
        announcements: true,
        complaints: true,
        discussions: false,
      };

      const { error: householdError } = await supabase
        .from('household_accounts')
        .insert({
          primary_account_id: user.id,
          linked_account_id: authData.user.id,
          relationship_type: 'tenant',
          permissions: { ...defaultPermissions, ...tenantData.permissions },
          created_by: user.id,
        });

      if (householdError) throw householdError;

      await fetchAccounts();
      return authData.user;
    } catch (error) {
      throw error;
    }
  };

  const removeAccount = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('household_accounts')
        .update({ is_active: false })
        .eq('id', accountId)
        .eq('primary_account_id', user?.id);

      if (error) throw error;
      await fetchAccounts();
    } catch (error) {
      throw error;
    }
  };

  const updatePermissions = async (accountId: string, permissions: Partial<HouseholdAccount['permissions']>) => {
    try {
      const { error } = await supabase
        .from('household_accounts')
        .update({ permissions })
        .eq('id', accountId)
        .eq('primary_account_id', user?.id);

      if (error) throw error;
      await fetchAccounts();
    } catch (error) {
      throw error;
    }
  };

  const canAddSpouse = () => {
    return !accounts.some(acc => acc.relationship_type === 'spouse');
  };

  return {
    accounts,
    loading,
    error,
    createSpouseAccount,
    createTenantAccount,
    removeAccount,
    updatePermissions,
    canAddSpouse,
    refetch: fetchAccounts,
  };
}