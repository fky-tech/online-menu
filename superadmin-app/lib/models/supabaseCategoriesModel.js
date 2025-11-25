import { supabaseAdmin } from '../supabase.js';

// Get all categories for a restaurant with optional translations
export const getCategoriesModel = async (restaurantId, language = null) => {
  try {
    let query = supabaseAdmin
      .from('categories')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('id');

    // If language is specified and not English, get translations from Amharic table
    if (language && language !== 'en') {
      if (language === 'am') {
        // For Amharic, get from categories_amharic table
        query = supabaseAdmin
          .from('categories_amharic')
          .select(`
            id,
            restaurant_id,
            name,
            description,
            created_at,
            updated_at
          `)
          .eq('restaurant_id', restaurantId)
          .order('id');
      } else {
        // For other languages, fall back to old translation table if it exists
        query = supabaseAdmin
          .from('categories')
          .select(`
            id,
            restaurant_id,
            created_at,
            category_translation!left(
              translated_name,
              translated_description
            )
          `)
          .eq('restaurant_id', restaurantId)
          .eq('category_translation.language', language)
          .order('id');
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform data to include translated fields
    if (language && language !== 'en') {
      if (language === 'am') {
        // For Amharic, data is already in the correct format from categories_amharic table (standalone)
        return data.map(category => ({
          ...category,
          // Keep the Amharic category ID as is
        }));
      } else {
        // For other languages, use translation data
        return data.map(category => ({
          ...category,
          name: category.category_translation?.[0]?.translated_name || category.name,
          description: category.category_translation?.[0]?.translated_description || category.description,
          category_translation: undefined // Remove the translation object
        }));
      }
    }

    return data || [];
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error;
  }
};

// Get category by ID within a restaurant
export const getCategoryByIdModel = async (restaurantId, id) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting category by ID:', error);
    throw error;
  }
};

// Create new category for a restaurant
export const createCategoryModel = async (restaurantId, name, description) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({
        restaurant_id: restaurantId,
        name,
        description
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

// Update category
export const updateCategoryModel = async (restaurantId, id, updates) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .update(updates)
      .eq('restaurant_id', restaurantId)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

// Delete category
export const deleteCategoryModel = async (restaurantId, id) => {
  try {
    // First check if category has menu items
    const { data: menuItems, error: checkError } = await supabaseAdmin
      .from('menu_items')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .eq('category_id', id)
      .limit(1);

    if (checkError) throw checkError;

    if (menuItems && menuItems.length > 0) {
      throw new Error('Cannot delete category that contains menu items');
    }

    // Delete the category
    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('restaurant_id', restaurantId)
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

// Get categories count for a restaurant
export const getCategoriesCountModel = async (restaurantId) => {
  try {
    const { count, error } = await supabaseAdmin
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurantId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting categories count:', error);
    throw error;
  }
};

// Get categories with menu items count
export const getCategoriesWithItemCountModel = async (restaurantId, language = null) => {
  try {
    let query = supabaseAdmin
      .from('categories')
      .select(`
        *,
        menu_items(count)
      `)
      .eq('restaurant_id', restaurantId)
      .order('id');

    // If language is specified and not English, get translations
    if (language && language !== 'en') {
      if (language === 'am') {
        // For Amharic, get from categories_amharic table with menu items count
        query = supabaseAdmin
          .from('categories_amharic')
          .select(`
            id,
            restaurant_id,
            name,
            description,
            created_at,
            updated_at
          `)
          .eq('restaurant_id', restaurantId)
          .order('id');
      } else {
        // For other languages, fall back to old translation table if it exists
        query = supabaseAdmin
          .from('categories')
          .select(`
            id,
            restaurant_id,
            created_at,
            menu_items(count),
            category_translation!left(
              translated_name,
              translated_description
            )
          `)
          .eq('restaurant_id', restaurantId)
          .eq('category_translation.language', language)
          .order('id');
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform data to include translated fields and item count
    const result = data.map(category => {
      let itemCount = 0;

      if (language === 'am') {
        // For Amharic, count menu items from menu_items_amharic table
        // This is a simplified approach - in a real implementation, you'd do a separate query or join
        return {
          ...category,
          menu_items_count: 0, // Placeholder - would need separate query for accurate count
        };
      } else if (language && language !== 'en') {
        // For other languages, use translation data
        itemCount = Array.isArray(category.menu_items) ? category.menu_items.length : 0;
        return {
          ...category,
          name: category.category_translation?.[0]?.translated_name || category.name,
          description: category.category_translation?.[0]?.translated_description || category.description,
          menu_items_count: itemCount,
          category_translation: undefined,
          menu_items: undefined
        };
      } else {
        // For English
        itemCount = Array.isArray(category.menu_items) ? category.menu_items.length : 0;
        return {
          ...category,
          menu_items_count: itemCount,
          menu_items: undefined
        };
      }
    });

    return result || [];
  } catch (error) {
    console.error('Error getting categories with item count:', error);
    throw error;
  }
};

// Search categories within a restaurant
export const searchCategoriesModel = async (restaurantId, searchTerm) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching categories:', error);
    throw error;
  }
};

// Check if category name exists within restaurant
export const categoryNameExistsModel = async (restaurantId, name, excludeId = null) => {
  try {
    let query = supabaseAdmin
      .from('categories')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .ilike('name', name);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data.length > 0;
  } catch (error) {
    console.error('Error checking category name existence:', error);
    throw error;
  }
};

