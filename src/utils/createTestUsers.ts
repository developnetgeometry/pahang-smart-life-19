import { supabase } from '@/integrations/supabase/client';

// Define test users with the new 10-role hierarchical system
const testUsers = [
  {
    email: 'stateadmin@test.com',
    password: 'password123',
    role: 'state_admin' as const,
    full_name: 'State Administrator',
    phone: '+60123456789',
    unit_number: 'N/A',
    district_id: null // State admin has access to all districts
  },
  {
    email: 'district@test.com', 
    password: 'password123',
    role: 'district_coordinator' as const,
    full_name: 'District Coordinator',
    phone: '+60123456790',
    unit_number: 'DC-001',
    district_id: '550e8400-e29b-41d4-a716-446655440001'
  },
  {
    email: 'communityadmin@test.com',
    password: 'password123',
    role: 'community_admin' as const,
    full_name: 'Community Administrator',
    phone: '+60123456791',
    unit_number: 'CA-001',
    district_id: '550e8400-e29b-41d4-a716-446655440001'
  },
  {
    email: 'facility@test.com',
    password: 'password123', 
    role: 'facility_manager' as const,
    full_name: 'Facility Manager',
    phone: '+60123456792',
    unit_number: 'FM-001',
    district_id: '550e8400-e29b-41d4-a716-446655440001'
  },
  {
    email: 'securitynorth@test.com',
    password: 'password123',
    role: 'security_officer' as const,
    full_name: 'Mohd Faizal',
    phone: '+60123456793',
    unit_number: 'SEC-001', 
    district_id: '550e8400-e29b-41d4-a716-446655440001'
  },
  {
    email: 'maintenance@test.com',
    password: 'password123',
    role: 'maintenance_staff' as const,
    full_name: 'Maintenance Technician',
    phone: '+60123456794',
    unit_number: 'MT-001',
    district_id: '550e8400-e29b-41d4-a716-446655440001'
  },
  {
    email: 'resident@test.com',
    password: 'password123',
    role: 'resident' as const,
    full_name: 'Ahmad Resident',
    phone: '+60123456795',
    unit_number: 'A-12-03',
    district_id: '550e8400-e29b-41d4-a716-446655440001'
  },
  {
    email: 'serviceprovider@test.com',
    password: 'password123',
    role: 'service_provider' as const,
    full_name: 'Service Provider',
    phone: '+60123456796',
    unit_number: 'SP-001',
    district_id: '550e8400-e29b-41d4-a716-446655440001'
  },
  {
    email: 'leader@test.com',
    password: 'password123',
    role: 'community_leader' as const,
    full_name: 'Community Leader',
    phone: '+60123456797',
    unit_number: 'CL-001',
    district_id: '550e8400-e29b-41d4-a716-446655440001'
  },
  {
    email: 'servicemanager@test.com',
    password: 'password123',
    role: 'state_service_manager' as const,
    full_name: 'State Service Manager',
    phone: '+60123456798', 
    unit_number: 'SSM-001',
    district_id: null // State-wide access
  }
];

// Helper function to add delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const createTestUsers = async () => {
  const results = [];
  
  for (const testUser of testUsers) {
    try {
      console.log(`Creating user: ${testUser.email}`);
      
      // Create authentication user with retry for rate limiting
      let signUpResult;
      let retries = 3;
      
      while (retries > 0) {
        const redirectUrl = `${window.location.origin}/`;
        
        signUpResult = await supabase.auth.signUp({
          email: testUser.email,
          password: testUser.password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: testUser.full_name,
            }
          }
        });
        
        if (signUpResult.error?.message?.includes('rate limit')) {
          console.log(`Rate limited, waiting 60 seconds... (${retries} retries left)`);
          await delay(60000); // Wait 1 minute
          retries--;
        } else {
          break;
        }
      }
      
      if (signUpResult?.error) {
        console.error(`Failed to create auth user ${testUser.email}:`, signUpResult.error);
        results.push({ email: testUser.email, success: false, error: signUpResult.error.message });
        continue;
      }

      if (!signUpResult.data.user) {
        console.error(`No user returned for ${testUser.email}`);
        results.push({ email: testUser.email, success: false, error: 'No user returned' });
        continue;
      }

      const userId = signUpResult.data.user.id;
      console.log(`Auth user created with ID: ${userId}`);

      // Update the profiles table
      const profileUpdate = await supabase
        .from('profiles')
        .update({
          full_name: testUser.full_name,
          district_id: testUser.district_id,
          primary_role: testUser.role
        })
        .eq('id', userId);

      if (profileUpdate.error) {
        console.error(`Failed to update profile for ${testUser.email}:`, profileUpdate.error);
      }

      // Insert user role
      const roleInsert = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: testUser.role,
          district_id: testUser.district_id
        });

      if (roleInsert.error) {
        console.error(`Failed to insert role for ${testUser.email}:`, roleInsert.error);
      }

      results.push({ 
        email: testUser.email, 
        success: true, 
        userId: userId,
        role: testUser.role
      });
      
      console.log(`Successfully created: ${testUser.email}`);
      
      // Small delay between users
      await delay(1000);

    } catch (error) {
      console.error(`Error creating user ${testUser.email}:`, error);
      results.push({ email: testUser.email, success: false, error: String(error) });
    }
  }

  return results;
};