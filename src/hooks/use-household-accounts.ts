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
    if (!user) throw new Error('Please log in to create a spouse account');

    try {
      console.log('Starting spouse account creation for:', spouseData.email);
      
      // Check current user authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Current session check:', { 
        hasSession: !!session, 
        sessionError,
        userId: session?.user?.id,
        contextUserId: user.id 
      });
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error(`Authentication error: ${sessionError.message}`);
      }
      
      if (!session?.user) {
        throw new Error('Authentication session missing! Please refresh the page and log in again.');
      }

      // Verify user.id matches session.user.id
      if (user.id !== session.user.id) {
        console.error('User ID mismatch:', { contextUserId: user.id, sessionUserId: session.user.id });
        throw new Error('User session mismatch. Please refresh the page and try again.');
      }

      // Check if spouse account already exists and is active
      const existingSpouse = accounts.find(acc => acc.relationship_type === 'spouse');
      if (existingSpouse) {
        throw new Error('A spouse account already exists for this household');
      }

      // Check if there's an inactive household account for this user
      const { data: inactiveAccounts } = await supabase
        .from('household_accounts')
        .select('id, linked_account_id')
        .eq('primary_account_id', user.id)
        .eq('relationship_type', 'spouse')
        .eq('is_active', false);

      // Check if user already exists in auth system
      const { data: existingProfiles } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', spouseData.email);

      let spouseUserId: string;

      if (existingProfiles && existingProfiles.length > 0) {
        // User already exists, use existing user ID
        spouseUserId = existingProfiles[0].id;
        
        // Update the existing profile with new data
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('district_id, community_id')
          .eq('id', user.id)
          .single();

        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: spouseData.full_name,
            mobile_no: spouseData.mobile_no,
            district_id: userProfile?.district_id,
            community_id: userProfile?.community_id,
          })
          .eq('id', spouseUserId);

        if (profileError) throw profileError;

        // Check if there's an inactive household account to reactivate
        if (inactiveAccounts && inactiveAccounts.length > 0) {
          console.log('Reactivating existing household account:', inactiveAccounts[0].id);
          
          const { error: reactivateError } = await supabase
            .from('household_accounts')
            .update({ is_active: true })
            .eq('id', inactiveAccounts[0].id);

          if (reactivateError) {
            console.error('Reactivation error:', reactivateError);
            throw new Error(`Failed to reactivate spouse account: ${reactivateError.message}`);
          }
          
          console.log('Household account reactivated successfully');
        } else {
          // Create new household account link
          console.log('Creating new household account link for existing user...', {
            primary_account_id: user.id,
            linked_account_id: spouseUserId,
            relationship_type: 'spouse',
            created_by: user.id,
          });
          
          const { error: householdError } = await supabase
            .from('household_accounts')
            .insert({
              primary_account_id: user.id,
              linked_account_id: spouseUserId,
              relationship_type: 'spouse',
              created_by: user.id,
            });

          if (householdError) {
            console.error('Household account creation error (existing user):', householdError);
            throw new Error(`Failed to link existing spouse account: ${householdError.message}`);
          }
          
          console.log('Household account link created successfully for existing user');
        }
      } else {
        // Create new authentication account for spouse
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

        if (authError) {
          console.error('Auth signup error:', authError);
          throw new Error(`Failed to create account: ${authError.message}`);
        }
        if (!authData.user) throw new Error('Failed to create user account');
        
        spouseUserId = authData.user.id;
        console.log('New user created:', { spouseUserId, email: spouseData.email });

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
          .eq('id', spouseUserId);

        if (profileError) {
          console.error('Profile update error:', profileError);
          throw new Error(`Failed to update profile: ${profileError.message}`);
        }

        // Create household account link
        console.log('Creating household account link...', {
          primary_account_id: user.id,
          linked_account_id: spouseUserId,
          relationship_type: 'spouse',
          created_by: user.id,
        });
        
        const { error: householdError } = await supabase
          .from('household_accounts')
          .insert({
            primary_account_id: user.id,
            linked_account_id: spouseUserId,
            relationship_type: 'spouse',
            created_by: user.id,
          });

        if (householdError) {
          console.error('Household account creation error:', householdError);
          console.error('Error details:', {
            code: householdError.code,
            message: householdError.message,
            details: householdError.details,
            hint: householdError.hint
          });
          throw new Error(`Failed to link spouse account: ${householdError.message}`);
        }
        
        console.log('Household account link created successfully');
      }

      await fetchAccounts();
      console.log('Spouse account creation completed successfully');
      return { id: spouseUserId };
    } catch (error) {
      console.error('Spouse account creation failed:', error);
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
    if (!user) throw new Error('Please log in to create a tenant account');

    try {
      // Check current user authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Authentication session missing! Please refresh the page and log in again.');
      }
      
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
    // Only check active accounts
    return !accounts.some(acc => acc.relationship_type === 'spouse' && acc.is_active);
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