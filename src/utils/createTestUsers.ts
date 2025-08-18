import { supabase } from '@/integrations/supabase/client';

const testUsers = [
  {
    email: 'admin@pahangprima.com',
    password: 'password123',
    role: 'admin' as const,
    full_name: 'Ahmad Rahman',
    phone: '013-2341234',
    unit_number: 'A-1-01',
    district_id: '00000000-0000-0000-0000-000000000001', // Pahang Prima North
  },
  {
    email: 'manager.north@pahangprima.com',
    password: 'password123',
    role: 'manager' as const,
    full_name: 'Siti Nurhaliza',
    phone: '013-3451234',
    unit_number: 'B-2-05',
    district_id: '00000000-0000-0000-0000-000000000001', // Pahang Prima North
  },
  {
    email: 'manager.south@pahangprima.com',
    password: 'password123',
    role: 'manager' as const,
    full_name: 'Lim Wei Ming',
    phone: '013-4561234',
    unit_number: 'C-3-07',
    district_id: '2384b1ce-dbb1-4449-8e78-136d11dbc28e', // Pahang Prima South
  },
  {
    email: 'security.north@pahangprima.com',
    password: 'password123',
    role: 'security' as const,
    full_name: 'Mohd Faizal',
    phone: '013-5671234',
    unit_number: 'Guard House A',
    district_id: '00000000-0000-0000-0000-000000000001', // Pahang Prima North
  },
  {
    email: 'security.south@pahangprima.com',
    password: 'password123',
    role: 'security' as const,
    full_name: 'Raj Kumar',
    phone: '013-6781234',
    unit_number: 'Guard House B',
    district_id: '2384b1ce-dbb1-4449-8e78-136d11dbc28e', // Pahang Prima South
  },
  {
    email: 'resident.ali@pahangprima.com',
    password: 'password123',
    role: 'resident' as const,
    full_name: 'Ali bin Hassan',
    phone: '013-7891234',
    unit_number: 'A-5-12',
    district_id: '00000000-0000-0000-0000-000000000001', // Pahang Prima North
  },
  {
    email: 'resident.mary@pahangprima.com',
    password: 'password123',
    role: 'resident' as const,
    full_name: 'Mary Tan',
    phone: '013-8901234',
    unit_number: 'B-7-08',
    district_id: '2384b1ce-dbb1-4449-8e78-136d11dbc28e', // Pahang Prima South
  },
  {
    email: 'resident.kumar@pahangprima.com',
    password: 'password123',
    role: 'resident' as const,
    full_name: 'Kumar Selvam',
    phone: '013-9012345',
    unit_number: 'C-4-15',
    district_id: '0a1c51a3-55dd-46b2-b894-c39c6d75557c', // Pahang Prima East
  },
  {
    email: 'resident.fatimah@pahangprima.com',
    password: 'password123',
    role: 'resident' as const,
    full_name: 'Fatimah binti Ahmad',
    phone: '013-0123456',
    unit_number: 'D-6-09',
    district_id: '64a08b8c-820d-40e6-910c-0fc03c45ffe5', // Pahang Prima West
  },
  {
    email: 'resident.david@pahangprima.com',
    password: 'password123',
    role: 'resident' as const,
    full_name: 'David Wong',
    phone: '013-1234567',
    unit_number: 'E-3-11',
    district_id: 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc', // Pahang Prima North (different from default)
  },
];

export async function createTestUsers() {
  const results = [];

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

      // Update profile with user-specific details
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          district_id: user.district_id,
          full_name: user.full_name,
          phone: user.phone,
          unit_number: user.unit_number,
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
          district_id: user.district_id,
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