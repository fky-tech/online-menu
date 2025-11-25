import {
  createRestaurantModel,
  getRestaurantBySlugModel,
  listRestaurantsModel,
  listActiveRestaurantsModel,
  getRestaurantByIdModel,
  deleteRestaurantByIdModel,
  updateRestaurantModel,
  isSlugAvailable,
  getRestaurantWithSubscription
} from "../Models/supabaseRestaurantsModel.js";
import { createTenantAdmin } from "../Models/supabaseAuthModel.js";
import { createSubscriptionModel } from "../Models/supabaseSubscriptionsModel.js";
import { uploadFile, getPublicUrl, supabaseAdmin } from "../Config/supabase.js";
import crypto from "crypto";

// Util: minimal slugify and unique slug helper
function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 60) || 'restaurant';
}

async function generateUniqueSlug(baseName) {
  let slug = slugify(baseName);
  let counter = 0;
  
  while (!(await isSlugAvailable(slug))) {
    counter++;
    slug = `${slugify(baseName)}-${counter}`;
  }
  
  return slug;
}

// Package definitions
const PACKAGES = {
  basic: { label: 'Basic Package', years: 1, price: 0 },
  premium: { label: 'Premium Package', years: 2, price: 100 },
  enterprise: { label: 'Enterprise Package', years: 3, price: 500 }
};

// Create new restaurant
export const createRestaurant = async (req, res) => {
  try {
    const { name, description, admin_email, package_type, comment = false } = req.body;

    if (!name || !admin_email || !package_type) {
      return res.status(400).json({
        success: false,
        message: "Name, admin email, and package type are required"
      });
    }

    const pkgKey = package_type.toLowerCase();
    if (!PACKAGES[pkgKey]) {
      return res.status(400).json({
        success: false,
        message: "Invalid package type"
      });
    }

    // Generate unique slug
    const uniqueSlug = await generateUniqueSlug(name);

    // Handle logo upload
    let finalLogoUrl = req.body.logo_url;
    if (req.file) {
      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${req.file.originalname}`;
      const filePath = `restaurant-logos/${fileName}`;
      
      await uploadFile('restaurant-logos', filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });
      
      finalLogoUrl = getPublicUrl('restaurant-logos', filePath);
    }

    // Create restaurant
    const restaurant = await createRestaurantModel(name, uniqueSlug, description, finalLogoUrl, comment);

    // Generate random password for tenant admin
    const plainPassword = crypto.randomBytes(12).toString('base64').slice(0, 16);

    // Create tenant admin user
    await createTenantAdmin(name + ' Admin', admin_email, plainPassword, restaurant.id);

    // Store credentials for super admin reference
    await storeAdminCredentials(restaurant.id, admin_email, plainPassword);

    // Create initial subscription
    const pkg = PACKAGES[pkgKey];
    const today = new Date();
    const endDate = new Date(today);
    endDate.setFullYear(endDate.getFullYear() + pkg.years);
    
    await createSubscriptionModel(
      restaurant.id,
      pkg.label,
      today.toISOString().slice(0, 10),
      endDate.toISOString().slice(0, 10),
      'active',
      pkg.price
    );

    res.status(201).json({
      success: true,
      message: "Restaurant created successfully",
      data: {
        restaurant,
        admin_credentials: {
          email: admin_email,
          password: plainPassword
        },
        package: pkg
      }
    });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create restaurant"
    });
  }
};

// Store admin credentials (helper function)
const storeAdminCredentials = async (restaurantId, adminEmail, plainPassword) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('restaurant_admin_credentials')
      .insert({
        restaurant_id: restaurantId,
        admin_email: adminEmail,
        plain_password: plainPassword
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error storing admin credentials:', error);
    throw error;
  }
};

// List all restaurants
export const listRestaurants = async (req, res) => {
  try {
    const restaurants = await listRestaurantsModel();
    res.status(200).json({
      success: true,
      data: restaurants
    });
  } catch (error) {
    console.error('Error listing restaurants:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch restaurants"
    });
  }
};

// Get restaurant by slug (public endpoint)
export const getRestaurantPublic = async (req, res) => {
  try {
    const { slug } = req.params;
    const restaurant = await getRestaurantBySlugModel(slug);
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    console.error('Error getting restaurant:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant"
    });
  }
};

// List active restaurants (public endpoint)
export const listActiveRestaurants = async (req, res) => {
  try {
    const restaurants = await listActiveRestaurantsModel();
    res.status(200).json({
      success: true,
      data: restaurants
    });
  } catch (error) {
    console.error('Error listing active restaurants:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active restaurants"
    });
  }
};

// Get current restaurant for tenant admin
export const getMyRestaurant = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant_id;

    if (!restaurantId) {
      return res.status(404).json({
        success: false,
        message: "No restaurant assigned to this account"
      });
    }

    const restaurant = await getRestaurantByIdModel(restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    res.status(200).json({
      success: true,
      data: [restaurant] // Return as array to match listRestaurants format
    });
  } catch (error) {
    console.error('Error getting my restaurant:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant"
    });
  }
};

// Get restaurant by ID with subscription info
export const getRestaurantWithSubscriptionInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await getRestaurantWithSubscription(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    console.error('Error getting restaurant with subscription:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant"
    });
  }
};

// Delete restaurant
export const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if restaurant exists
    const restaurant = await getRestaurantByIdModel(id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    // Delete restaurant (this will cascade to related records due to foreign keys)
    await deleteRestaurantByIdModel(id);

    res.status(200).json({
      success: true,
      message: "Restaurant deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    res.status(500).json({
      success: false,
      message: "Failed to delete restaurant"
    });
  }
};

// Update restaurant
export const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Handle logo upload if present
    if (req.file) {
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${req.file.originalname}`;
      const filePath = `restaurant-logos/${fileName}`;
      
      await uploadFile('restaurant-logos', filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });
      
      updates.logo_url = getPublicUrl('restaurant-logos', filePath);
    }

    // Update slug if name changed
    if (updates.name && updates.name !== req.body.current_name) {
      updates.slug = await generateUniqueSlug(updates.name);
    }

    const restaurant = await updateRestaurantModel(id, updates);

    res.status(200).json({
      success: true,
      message: "Restaurant updated successfully",
      data: restaurant
    });
  } catch (error) {
    console.error('Error updating restaurant:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update restaurant"
    });
  }
};
