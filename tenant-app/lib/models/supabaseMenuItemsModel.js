import { supabaseAdmin } from '../supabase.js';

// Get all menu items for a restaurant with optional translations
export const getMenuItemsModel = async (restaurantId, language = null) => {
  try {
    let query = supabaseAdmin
      .from('menu_items')
      .select(`
        id,
        restaurant_id,
        category_id,
        name,
        description,
        price,
        image_url,
        is_available,
        created_at,
        categories(id, name, description)
      `)
      .eq('restaurant_id', restaurantId)
      .order('id');

    // If language is specified and not English, get translations
    if (language && language !== 'en') {
      if (language === 'am') {
        // For Amharic, get from menu_items_amharic table (standalone)
        query = supabaseAdmin
          .from('menu_items_amharic')
          .select(`
            id,
            restaurant_id,
            category_id,
            name,
            description,
            price,
            image_url,
            is_available,
            created_at,
            updated_at
          `)
          .eq('restaurant_id', restaurantId)
          .order('id');
      } else {
        // For other languages, fall back to old translation table if it exists
        query = supabaseAdmin
          .from('menu_items')
          .select(`
            id,
            restaurant_id,
            category_id,
            price,
            image_url,
            is_available,
            created_at,
            categories(id, name, description),
            menu_item_translation!left(
              translated_name,
              translated_description
            )
          `)
          .eq('restaurant_id', restaurantId)
          .eq('menu_item_translation.language', language)
          .order('id');
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform data to include translated fields
    if (language && language !== 'en') {
      if (language === 'am') {
        // For Amharic, data comes from menu_items_amharic table (standalone)
        return data.map(item => ({
          ...item,
          // Keep the Amharic item ID as is
        }));
      } else {
        // For other languages, use translation data
        return data.map(item => ({
          ...item,
          name: item.menu_item_translation?.[0]?.translated_name || item.name,
          description: item.menu_item_translation?.[0]?.translated_description || item.description,
          menu_item_translation: undefined // Remove the translation object
        }));
      }
    }

    return data || [];
  } catch (error) {
    console.error('Error getting menu items:', error);
    throw error;
  }
};

// Get menu items by category
export const getMenuItemsByCategoryModel = async (restaurantId, categoryId, language = null) => {
  try {
    let query = supabaseAdmin
      .from('menu_items')
      .select(`
        id,
        restaurant_id,
        category_id,
        name,
        description,
        price,
        image_url,
        is_available,
        created_at
      `)
      .eq('restaurant_id', restaurantId)
      .eq('category_id', categoryId)
      .order('id');

    // If language is specified and not English, get translations
    if (language && language !== 'en') {
      query = supabaseAdmin
        .from('menu_items')
        .select(`
          id,
          restaurant_id,
          category_id,
          price,
          image_url,
          is_available,
          created_at,
          menu_item_translation!left(
            translated_name,
            translated_description
          )
        `)
        .eq('restaurant_id', restaurantId)
        .eq('category_id', categoryId)
        .eq('menu_item_translation.language', language)
        .order('id');
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform data to include translated fields
    if (language && language !== 'en') {
      return data.map(item => ({
        ...item,
        name: item.menu_item_translation?.[0]?.translated_name || item.name,
        description: item.menu_item_translation?.[0]?.translated_description || item.description,
        menu_item_translation: undefined
      }));
    }

    return data || [];
  } catch (error) {
    console.error('Error getting menu items by category:', error);
    throw error;
  }
};

// Get menu item by ID
export const getMenuItemByIdModel = async (restaurantId, id) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting menu item by ID:', error);
    throw error;
  }
};

// Create new menu item
export const createMenuItemModel = async (restaurantId, category_id, name, description, price, image_url, is_available = true) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('menu_items')
      .insert({
        restaurant_id: restaurantId,
        category_id,
        name,
        description,
        price,
        image_url,
        is_available
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating menu item:', error);
    throw error;
  }
};

// Update menu item
export const updateMenuItemModel = async (restaurantId, id, updates) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('menu_items')
      .update(updates)
      .eq('restaurant_id', restaurantId)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating menu item:', error);
    throw error;
  }
};

// Delete menu item
export const deleteMenuItemModel = async (restaurantId, id) => {
  try {
    const { error } = await supabaseAdmin
      .from('menu_items')
      .delete()
      .eq('restaurant_id', restaurantId)
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting menu item:', error);
    throw error;
  }
};

// Get menu items count for a restaurant
export const getMenuItemsCountModel = async (restaurantId) => {
  try {
    const { count, error } = await supabaseAdmin
      .from('menu_items')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurantId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting menu items count:', error);
    throw error;
  }
};

// Search menu items within a restaurant
export const searchMenuItemsModel = async (restaurantId, searchTerm) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('menu_items')
      .select(`
        *,
        categories(id, name, description)
      `)
      .eq('restaurant_id', restaurantId)
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching menu items:', error);
    throw error;
  }
};

// Toggle menu item availability
export const toggleMenuItemAvailabilityModel = async (restaurantId, id) => {
  try {
    // First get current availability
    const { data: currentItem, error: fetchError } = await supabaseAdmin
      .from('menu_items')
      .select('is_available')
      .eq('restaurant_id', restaurantId)
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Toggle availability
    const { data, error } = await supabaseAdmin
      .from('menu_items')
      .update({ is_available: !currentItem.is_available })
      .eq('restaurant_id', restaurantId)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error toggling menu item availability:', error);
    throw error;
  }
};

// Get available menu items for public display
export const getAvailableMenuItemsModel = async (restaurantId, language = null) => {
  try {
    let query = supabaseAdmin
      .from('menu_items')
      .select(`
        id,
        restaurant_id,
        category_id,
        name,
        description,
        price,
        image_url,
        created_at,
        categories(id, name, description)
      `)
      .eq('restaurant_id', restaurantId)
      .eq('is_available', true)
      .order('id');

    // If language is specified and not English, get translations
    if (language && language !== 'en') {
      query = supabaseAdmin
        .from('menu_items')
        .select(`
          id,
          restaurant_id,
          category_id,
          price,
          image_url,
          created_at,
          categories(id, name, description),
          menu_item_translation!left(
            translated_name,
            translated_description
          )
        `)
        .eq('restaurant_id', restaurantId)
        .eq('is_available', true)
        .eq('menu_item_translation.language', language)
        .order('id');
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform data to include translated fields
    if (language && language !== 'en') {
      return data.map(item => ({
        ...item,
        name: item.menu_item_translation?.[0]?.translated_name || item.name,
        description: item.menu_item_translation?.[0]?.translated_description || item.description,
        menu_item_translation: undefined
      }));
    }

    return data || [];
  } catch (error) {
    console.error('Error getting available menu items:', error);
    throw error;
  }
};

