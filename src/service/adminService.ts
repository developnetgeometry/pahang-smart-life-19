import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing Supabase environment variables for admin operations');
}

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function adminResetPassword(userId: string, newPassword: string) {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (error) {
      console.error('Error resetting password:', error.message);
      return { success: false, message: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Unexpected error resetting password:', error);
    return { success: false, message: error.message || 'Unexpected error occurred' };
  }
}

export async function adminUpdateUser(userId: string, updates: any) {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      updates
    );

    if (error) {
      console.error('Error updating user:', error.message);
      return { success: false, message: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Unexpected error updating user:', error);
    return { success: false, message: error.message || 'Unexpected error occurred' };
  }
}

export async function adminGetUser(userId: string) {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (error) {
      console.error('Error getting user:', error.message);
      return { success: false, message: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Unexpected error getting user:', error);
    return { success: false, message: error.message || 'Unexpected error occurred' };
  }
}

export async function adminDeleteUser(userId: string) {
  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      console.error('Error deleting user:', error.message);
      return { success: false, message: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Unexpected error deleting user:', error);
    return { success: false, message: error.message || 'Unexpected error occurred' };
  }
}

export interface CreateUserAsAdminRequest {
  email: string;
  password: string;
  fullName: string;
  userTypeId: string;
  disciplineId?: string;
}

export async function createUserAsAdmin(userData: CreateUserAsAdminRequest) {
  try {
    const { data: authData, error } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      user_metadata: {
        full_name: userData.fullName,
        user_type_id: userData.userTypeId,
        discipline_id: userData.disciplineId,
      },
      email_confirm: false,
    });

    if (error) {
      console.error('Error creating user as admin:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, user: authData.user };
  } catch (error: any) {
    console.error('Unexpected error in createUserAsAdmin:', error);
    return { success: false, error: error.message || 'Unexpected error occurred' };
  }
}
