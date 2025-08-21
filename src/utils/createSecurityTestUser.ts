import { supabase } from '@/integrations/supabase/client';

export async function createSecurityTestUser() {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No user logged in');
      return;
    }

    // First remove existing roles
    await supabase
      .from('enhanced_user_roles')
      .delete()
      .eq('user_id', user.id);

    // Add security officer role
    const { error: roleError } = await supabase
      .from('enhanced_user_roles')
      .insert({
        user_id: user.id,
        role: 'security_officer',
        is_active: true,
        assigned_by: user.id,
        notes: 'Test security user'
      });

    if (roleError) {
      console.error('Error creating security role:', roleError);
      return;
    }

    console.log('✅ Successfully created security officer test user');
    console.log('Please refresh the page to see the changes');
    
    return true;
  } catch (error) {
    console.error('Error in createSecurityTestUser:', error);
    return false;
  }
}

export async function createCommunityAdminTestUser() {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No user logged in');
      return;
    }

    // First remove existing roles
    await supabase
      .from('enhanced_user_roles')
      .delete()
      .eq('user_id', user.id);

    // Add community admin role
    const { error: roleError } = await supabase
      .from('enhanced_user_roles')
      .insert({
        user_id: user.id,
        role: 'community_admin',
        is_active: true,
        assigned_by: user.id,
        notes: 'Test community admin user'
      });

    if (roleError) {
      console.error('Error creating community admin role:', roleError);
      return;
    }

    console.log('✅ Successfully created community admin test user');
    console.log('Please refresh the page to see the changes');
    
    return true;
  } catch (error) {
    console.error('Error in createCommunityAdminTestUser:', error);
    return false;
  }
}

// Make functions available globally for testing
(window as any).createSecurityTestUser = createSecurityTestUser;
(window as any).createCommunityAdminTestUser = createCommunityAdminTestUser;