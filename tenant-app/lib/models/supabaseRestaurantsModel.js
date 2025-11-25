import { supabaseAdmin } from '../supabase.js';

// Create new restaurant
export const createRestaurantModel = async (name, slug, description, logo_url, comment = false) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('restaurants')
      .insert({
        name,
        slug,
        description: description || null,
        logo_url: logo_url || null,
        comment
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating restaurant:', error);
    throw error;
  }
};

// Get restaurant by slug
export const getRestaurantBySlugModel = async (slug) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('restaurants')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting restaurant by slug:', error);
    throw error;
  }
};

// Get restaurant by ID
export const getRestaurantByIdModel = async (id) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting restaurant by ID:', error);
    throw error;
  }
};

// List all restaurants
export const listRestaurantsModel = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('restaurants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error listing restaurants:', error);
    throw error;
  }
};

// List active restaurants (with active subscriptions)
export const listActiveRestaurantsModel = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('restaurants')
      .select(`
        *,
        subscriptions!inner(
          id,
          status,
          end_date
        )
      `)
      .eq('subscriptions.status', 'active')
      .gte('subscriptions.end_date', new Date().toISOString().split('T')[0])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error listing active restaurants:', error);
    throw error;
  }
};

// Update restaurant
export const updateRestaurantModel = async (id, updates) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('restaurants')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating restaurant:', error);
    throw error;
  }
};

// Delete restaurant by ID
export const deleteRestaurantByIdModel = async (id) => {
  try {
    const { error } = await supabaseAdmin
      .from('restaurants')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    throw error;
  }
};

// Check if slug is available
export const isSlugAvailable = async (slug, excludeId = null) => {
  try {
    let query = supabaseAdmin
      .from('restaurants')
      .select('id')
      .eq('slug', slug);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data.length === 0;
  } catch (error) {
    console.error('Error checking slug availability:', error);
    throw error;
  }
};

// Get restaurant with subscription info
export const getRestaurantWithSubscription = async (id) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('restaurants')
      .select(`
        *,
        subscriptions(
          id,
          package_name,
          start_date,
          end_date,
          status,
          price
        )
      `)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting restaurant with subscription:', error);
    throw error;
  }
};

// Search restaurants by name or slug
export const searchRestaurantsModel = async (searchTerm) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('restaurants')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching restaurants:', error);
    throw error;
  }
};

// Get restaurants count
export const getRestaurantsCountModel = async () => {
  try {
    const { count, error } = await supabaseAdmin
      .from('restaurants')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting restaurants count:', error);
    throw error;
  }
};

