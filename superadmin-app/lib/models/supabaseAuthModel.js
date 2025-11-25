import { supabaseAdmin, createUserMetadata } from '../supabase.js';

// ================== FIND USER BY EMAIL ==================
export const findUserByEmail = async (email) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw error;
  }
};

// ================== FIND USER BY ID ==================
export const findUserById = async (userId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error finding user by ID:', error);
    throw error;
  }
};

// ================== CREATE SUPER ADMIN ==================
export const createSuperAdmin = async (name, email, password) => {
  try {
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: 'super_admin' }
    });
    if (authError) throw authError;

    // Ensure metadata exists
    const userData = await createUserMetadata(authData.user.id, email, 'super_admin', null, name);
    return userData;
  } catch (error) {
    console.error('Error creating super admin:', error);
    throw error;
  }
};

// ================== CREATE TENANT ADMIN ==================
export const createTenantAdmin = async (name, email, password, restaurantId) => {
  try {
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: 'tenant_admin', restaurant_id: restaurantId }
    });
    if (authError) throw authError;

    const userData = await createUserMetadata(authData.user.id, email, 'tenant_admin', restaurantId, name);
    return userData;
  } catch (error) {
    console.error('Error creating tenant admin:', error);
    throw error;
  }
};

// ================== AUTHENTICATE USER ==================
export const authenticateUser = async (email, password) => {
  try {
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });
    if (authError) throw authError;

    // Fetch metadata
    let userData = await findUserByEmail(email);

    // If metadata missing, create default role (safety fallback)
    if (!userData) {
      const role = authData.user.user_metadata?.role || 'tenant_admin';
      const name = authData.user.user_metadata?.name || email;
      userData = await createUserMetadata(authData.user.id, email, role, null, name);
    }

    return {
      user: authData.user,
      session: authData.session,
      metadata: userData
    };
  } catch (error) {
    console.error('Error authenticating user:', error);
    throw error;
  }
};

// ================== UPDATE PASSWORD ==================
export const updateUserPassword = async (userId, newPassword) => {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    });
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error('Error updating user password:', error);
    throw error;
  }
};

// ================== UPDATE USER METADATA ==================
export const updateUserMetadata = async (userId, updates) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user metadata:', error);
    throw error;
  }
};

// ================== DELETE USER ==================
export const deleteUser = async (userId) => {
  try {
    // Delete from auth (this will cascade to users table due to foreign key)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) throw authError;

    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// ================== GET USER BY ID ==================
export const getUserById = async (userId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
};

// ================== LIST USERS ==================
export const listUsers = async (role = null, restaurantId = null) => {
  try {
    let query = supabaseAdmin.from('users').select('*').order('created_at', { ascending: false });
    if (role) query = query.eq('role', role);
    if (restaurantId) query = query.eq('restaurant_id', restaurantId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error listing users:', error);
    throw error;
  }
};

// ================== GET TENANT ADMINS FOR RESTAURANT ==================
export const getTenantAdminsForRestaurant = async (restaurantId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('role', 'tenant_admin')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting tenant admins for restaurant:', error);
    throw error;
  }
};

// ================== VERIFY USER SESSION ==================
export const verifyUserSession = async (accessToken) => {
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (error) throw error;
    
    // Get user metadata
    const userData = await getUserById(user.id);
    
    return {
      user,
      metadata: userData
    };
  } catch (error) {
    console.error('Error verifying user session:', error);
    throw error;
  }
};

// ================== RESET PASSWORD ==================
export const resetUserPassword = async (email) => {
  try {
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

// ================== INVITE USER ==================
export const inviteUser = async (email, role, restaurantId = null, name = null) => {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        role,
        restaurant_id: restaurantId,
        name
      },
      redirectTo: `${process.env.FRONTEND_URL}/accept-invite`
    });

    if (error) throw error;

    // Create user metadata record (will be populated when user accepts invite)
    if (data.user) {
      await createUserMetadata(data.user.id, email, role, restaurantId, name);
    }

    return data.user;
  } catch (error) {
    console.error('Error inviting user:', error);
    throw error;
  }
};

// ================== ENSURE USER METADATA ==================
export const ensureUserMetadata = async (userId, email, authUserMetadata = {}) => {
  try {
    let userData = await getUserById(userId);
    
    if (!userData) {
      // Create user metadata if it doesn't exist
      userData = await createUserMetadata(
        userId,
        email,
        authUserMetadata.role || 'tenant_admin',
        authUserMetadata.restaurant_id || null,
        authUserMetadata.name || email.split('@')[0]
      );
    }
    
    return userData;
  } catch (error) {
    console.error('Error ensuring user metadata:', error);
    throw error;
  }
};

// ================== LEGACY COMPATIBILITY ==================
export const findAdminByEmail = findUserByEmail;
export const createAdmin = createSuperAdmin;
export const findTenantAdminByEmail = findUserByEmail;
