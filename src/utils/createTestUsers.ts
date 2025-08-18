import { supabase } from '@/integrations/supabase/client';

const testUsers = [
  {
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin' as const,
    full_name: 'System Administrator',
  },
  {
    email: 'manager@test.com',
    password: 'password123',
    role: 'manager' as const,
    full_name: 'Community Manager',
  },
  {
    email: 'security@test.com',
    password: 'password123',
    role: 'security' as const,
    full_name: 'Security Officer',
  },
  {
    email: 'resident@test.com',
    password: 'password123',
    role: 'resident' as const,
    full_name: 'Resident User',
  },
];

export async function createTestUsers() {
  const results = [];
  const districtId = '00000000-0000-0000-0000-000000000001';

  for (const user of testUsers) {
    try {
      // Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            full_name: user.full_name,
          }
        }
      });

      if (signUpError) {
        console.error(`Failed to create ${user.role}:`, signUpError);
        results.push({
          email: user.email,
          role: user.role,
          success: false,
          error: signUpError.message
        });
        continue;
      }

      const userId = authData.user?.id;
      if (!userId) {
        results.push({
          email: user.email,
          role: user.role,
          success: false,
          error: 'No user ID returned'
        });
        continue;
      }

      // Update profile with district
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          district_id: districtId,
          full_name: user.full_name,
          phone: '013-1234567',
        })
        .eq('id', userId);

      if (profileError) {
        console.error(`Failed to update profile for ${user.role}:`, profileError);
      }

      // Assign role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: user.role,
          district_id: districtId,
        });

      if (roleError) {
        console.error(`Failed to assign role for ${user.role}:`, roleError);
        results.push({
          email: user.email,
          role: user.role,
          success: false,
          error: roleError.message
        });
        continue;
      }

      results.push({
        email: user.email,
        role: user.role,
        success: true,
        userId: userId
      });

      console.log(`✅ Created ${user.role}: ${user.email}`);

    } catch (error) {
      console.error(`Unexpected error creating ${user.role}:`, error);
      results.push({
        email: user.email,
        role: user.role,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return results;
}