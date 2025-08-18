import { supabase } from '@/integrations/supabase/client';

const testUsers = [
  {
    email: 'stateadmin@test.com',
    password: 'password123',
    role: 'state_admin' as const,
    full_name: 'Dato Ahmad Rashid',
    phone: '013-1001001',
    unit_number: 'State Office',
    district_id: '00000000-0000-0000-0000-000000000001', // Pahang Prima North
  },
  {
    email: 'districtcoord@test.com',
    password: 'password123',
    role: 'district_coordinator' as const,
    full_name: 'Hajjah Siti Aminah',
    phone: '013-1001002',
    unit_number: 'District Office A',
    district_id: '00000000-0000-0000-0000-000000000001', // Pahang Prima North
  },
  {
    email: 'communityadmin@test.com',
    password: 'password123',
    role: 'community_admin' as const,
    full_name: 'Encik Lim Chee Kong',
    phone: '013-1001003',
    unit_number: 'Community Center',
    district_id: '00000000-0000-0000-0000-000000000001', // Pahang Prima North
  },
  {
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin' as const,
    full_name: 'Ahmad Rahman',
    phone: '013-1001004',
    unit_number: 'A-1-01',
    district_id: '00000000-0000-0000-0000-000000000001', // Pahang Prima North
  },
  {
    email: 'managernorth@test.com',
    password: 'password123',
    role: 'manager' as const,
    full_name: 'Siti Nurhaliza',
    phone: '013-1001005',
    unit_number: 'B-2-05',
    district_id: '00000000-0000-0000-0000-000000000001', // Pahang Prima North
  },
  {
    email: 'facilitymanager@test.com',
    password: 'password123',
    role: 'facility_manager' as const,
    full_name: 'Kumar Selvam',
    phone: '013-1001006',
    unit_number: 'Facility Office',
    district_id: '2384b1ce-dbb1-4449-8e78-136d11dbc28e', // Pahang Prima South
  },
  {
    email: 'securitynorth@test.com',
    password: 'password123',
    role: 'security' as const,
    full_name: 'Mohd Faizal',
    phone: '013-1001007',
    unit_number: 'Guard House A',
    district_id: '00000000-0000-0000-0000-000000000001', // Pahang Prima North
  },
  {
    email: 'maintenancestaff@test.com',
    password: 'password123',
    role: 'maintenance_staff' as const,
    full_name: 'Raj Kumar',
    phone: '013-1001008',
    unit_number: 'Maintenance Office',
    district_id: '0a1c51a3-55dd-46b2-b894-c39c6d75557c', // Pahang Prima East
  },
  {
    email: 'resident@test.com',
    password: 'password123',
    role: 'resident' as const,
    full_name: 'Ali bin Hassan',
    phone: '013-1001009',
    unit_number: 'A-5-12',
    district_id: '00000000-0000-0000-0000-000000000001', // Pahang Prima North
  },
  {
    email: 'serviceprovider@test.com',
    password: 'password123',
    role: 'service_provider' as const,
    full_name: 'Mary Tan',
    phone: '013-1001010',
    unit_number: 'Service Center',
    district_id: '2384b1ce-dbb1-4449-8e78-136d11dbc28e', // Pahang Prima South
  },
  {
    email: 'communityleader@test.com',
    password: 'password123',
    role: 'community_leader' as const,
    full_name: 'Fatimah binti Ahmad',
    phone: '013-1001011',
    unit_number: 'D-6-09',
    district_id: '64a08b8c-820d-40e6-910c-0fc03c45ffe5', // Pahang Prima West
  },
  {
    email: 'stateservicemgr@test.com',
    password: 'password123',
    role: 'state_service_manager' as const,
    full_name: 'David Wong',
    phone: '013-1001012',
    unit_number: 'State Service Office',
    district_id: 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc', // Pahang Prima North (different district)
  },
];

export async function createTestUsers() {
  console.log('🔧 createTestUsers function called');
  console.log('👥 Total users to create:', testUsers.length);
  
  const results = [];

  for (const user of testUsers) {
    console.log(`🔨 Creating user: ${user.email} (${user.role})`);
    try {
      // Create auth user
      console.log(`📝 Attempting signUp for: ${user.email}`);
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
        console.error(`❌ SignUp failed for ${user.email}:`, signUpError);
        results.push({
          email: user.email,
          role: user.role,
          success: false,
          error: signUpError.message
        });
        continue;
      }

      const userId = authData.user?.id;
      console.log(`🆔 User ID for ${user.email}:`, userId);
      
      if (!userId) {
        console.error(`❌ No user ID returned for ${user.email}`);
        results.push({
          email: user.email,
          role: user.role,
          success: false,
          error: 'No user ID returned'
        });
        continue;
      }

      // Update profile with user-specific details  
      console.log(`👤 Updating profile for ${user.email}`);
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
        console.error(`❌ Profile update failed for ${user.email}:`, profileError);
      } else {
        console.log(`✅ Profile updated for ${user.email}`);
      }

      // Assign role
      console.log(`🏷️ Assigning role ${user.role} to ${user.email}`);
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: user.role,
          district_id: user.district_id,
        });

      if (roleError) {
        console.error(`❌ Role assignment failed for ${user.email}:`, roleError);
        results.push({
          email: user.email,
          role: user.role,
          success: false,
          error: roleError.message
        });
        continue;
      }

      console.log(`✅ Role assigned for ${user.email}`);
      
      results.push({
        email: user.email,
        role: user.role,
        success: true,
        userId: userId
      });

      console.log(`✅ Created ${user.role}: ${user.email}`);

    } catch (error) {
      console.error(`💥 Unexpected error creating ${user.role} (${user.email}):`, error);
      results.push({
        email: user.email,
        role: user.role,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  console.log('📋 Final results:', results);
  return results;
}