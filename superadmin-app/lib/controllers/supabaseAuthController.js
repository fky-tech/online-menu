import { supabaseAdmin, createUserClient } from "../Config/supabase.js";
import { 
  findUserByEmail, 
  createSuperAdmin, 
  createTenantAdmin, 
  updateUserPassword, 
  ensureUserMetadata 
} from "../Models/supabaseAuthModel.js";
import { getRestaurantByIdModel } from "../Models/supabaseRestaurantsModel.js";

// ================== REGISTER SUPER ADMIN ==================
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Name, email, and password are required" 
      });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "User already exists" 
      });
    }

    const admin = await createSuperAdmin(name, email, password);

    res.status(201).json({
      success: true,
      message: "Super admin created successfully",
      data: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Error registering admin:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to create admin" 
    });
  }
};

// ================== LOGIN ==================
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('Auth error:', authError);
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Ensure user metadata exists
    const userMetadata = await ensureUserMetadata(
      authData.user.id, 
      authData.user.email, 
      authData.user.user_metadata
    );

    if (!userMetadata) {
      return res.status(404).json({ 
        success: false, 
        message: "User metadata not found" 
      });
    }

    // Get restaurant data if tenant admin
    let restaurant = null;
    if (userMetadata.role === 'tenant_admin' && userMetadata.restaurant_id) {
      restaurant = await getRestaurantByIdModel(userMetadata.restaurant_id);
    }

    // SUCCESS RESPONSE - Consistent structure
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          role: userMetadata.role,
          restaurant_id: userMetadata.restaurant_id,
          name: userMetadata.name
        },
        session: {
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
          expires_at: authData.session.expires_at
        },
        restaurant: restaurant
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Login failed" 
    });
  }
};

// ================== TENANT LOGIN ==================
export const loginTenantAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Ensure user metadata exists
    const userMetadata = await ensureUserMetadata(
      authData.user.id, 
      authData.user.email, 
      authData.user.user_metadata
    );

    if (!userMetadata) {
      return res.status(404).json({ 
        success: false, 
        message: "User metadata not found" 
      });
    }

    // Check if user has tenant admin role
    if (userMetadata.role !== "tenant_admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Tenant admin role required." 
      });
    }

    let restaurant = null;
    if (userMetadata.restaurant_id) {
      restaurant = await getRestaurantByIdModel(userMetadata.restaurant_id);
    }

    // SUCCESS RESPONSE - Same structure as loginAdmin
    res.status(200).json({
      success: true,
      message: "Tenant login successful",
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          role: userMetadata.role,
          restaurant_id: userMetadata.restaurant_id,
          name: userMetadata.name
        },
        session: {
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
          expires_at: authData.session.expires_at
        },
        restaurant: restaurant
      }
    });
  } catch (error) {
    console.error('Error in tenant login:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Login failed" 
    });
  }
};

// ================== WHO AM I ==================
export const whoAmI = async (req, res) => {
  try {
    const supabase = req.supabase;
    let userMetadata = await supabase
      .from("users")
      .select("*")
      .eq("id", req.user.id)
      .maybeSingle();

    if (!userMetadata.data) {
      // If no metadata found, create it from auth data
      userMetadata = await ensureUserMetadata(
        req.user.id,
        req.user.email,
        req.user
      );
      
      if (!userMetadata) {
        return res.status(404).json({ 
          success: false, 
          message: "User metadata not found" 
        });
      }
    } else {
      userMetadata = userMetadata.data;
    }

    let restaurant = null;
    if (userMetadata.role === "tenant_admin" && userMetadata.restaurant_id) {
      const { data: rest } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", userMetadata.restaurant_id)
        .maybeSingle();
      restaurant = rest || null;
    }

    res.status(200).json({
      success: true,
      data: {
        id: userMetadata.id,
        email: userMetadata.email,
        role: userMetadata.role,
        restaurant_id: userMetadata.restaurant_id,
        name: userMetadata.name,
        restaurant
      }
    });
  } catch (error) {
    console.error("Error in whoAmI:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get user information" 
    });
  }
};

// Other controller functions remain the same...
export const createTenantAdminController = async (req, res) => {
  try {
    const { name, email, password, restaurant_id } = req.body;

    if (!name || !email || !password || !restaurant_id) {
      return res.status(400).json({ 
        success: false, 
        message: "Name, email, password, and restaurant_id are required" 
      });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "User already exists" 
      });
    }

    const restaurant = await getRestaurantByIdModel(restaurant_id);
    if (!restaurant) {
      return res.status(404).json({ 
        success: false, 
        message: "Restaurant not found" 
      });
    }

    const tenantAdmin = await createTenantAdmin(name, email, password, restaurant_id);

    res.status(201).json({
      success: true,
      message: "Tenant admin created successfully",
      data: {
        id: tenantAdmin.id,
        name: tenantAdmin.name,
        email: tenantAdmin.email,
        role: tenantAdmin.role,
        restaurant_id: tenantAdmin.restaurant_id
      }
    });
  } catch (error) {
    console.error('Error creating tenant admin:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to create tenant admin" 
    });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const userId = req.user.id;

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required"
      });
    }

    const { error: verifyError } = await supabaseAdmin.auth.signInWithPassword({
      email: req.user.email,
      password: current_password
    });

    if (verifyError) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    await updateUserPassword(userId, new_password);

    // Update plain password in restaurant_admin_credentials for super admin visibility
    if (req.user.restaurant_id) {
      const { error: updateCredsError } = await supabaseAdmin
        .from('restaurant_admin_credentials')
        .update({ plain_password: new_password })
        .eq('restaurant_id', req.user.restaurant_id);

      if (updateCredsError) {
        console.error('Error updating plain password in credentials:', updateCredsError);
        // Don't fail the whole operation if this update fails
      }
    }

    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update password"
    });
  }
};

export const logout = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      await supabaseAdmin.auth.admin.signOut(token);
    }

    res.status(200).json({ 
      success: true, 
      message: "Logged out successfully" 
    });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(200).json({ 
      success: true, 
      message: "Logged out successfully" 
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ 
        success: false, 
        message: "Refresh token is required" 
      });
    }

    const { data, error } = await supabaseAdmin.auth.refreshSession({
      refresh_token
    });

    if (error) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid refresh token" 
      });
    }

    res.status(200).json({
      success: true,
      data: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      }
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to refresh token" 
    });
  }
};