import { supabaseAdmin } from '../supabase.js';

// Get all Amharic menu items for a restaurant
export const getMenuItemsAmharicModel = async (restaurantId) => {
  try {
    const { data, error } = await supabaseAdmin
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

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting Amharic menu items:', error);
    throw error;
  }
};

// Get Amharic menu item by id
export const getMenuItemAmharicByIdModel = async (restaurantId, menuItemId) => {
  try {
    const { data, error } = await supabaseAdmin
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
      .eq('id', menuItemId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting Amharic menu item by ID:', error);
    throw error;
  }
};

// Create or update Amharic menu item
export const upsertMenuItemAmharicModel = async (restaurantId, menuItemId, name, description, categoryId = null, price = null, image_url = null, is_available = 1) => {
  try {
    if (menuItemId) {
      // Update existing menu item
      const { data, error } = await supabaseAdmin
        .from('menu_items_amharic')
        .update({
          name,
          description,
          category_id: categoryId,
          price: price ? Number(price) : undefined,
          image_url,
          is_available
        })
        .eq('restaurant_id', restaurantId)
        .eq('id', menuItemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new menu item
      if (!categoryId) {
        throw new Error('category_id is required when creating new Amharic menu items');
      }

      const { data, error } = await supabaseAdmin
        .from('menu_items_amharic')
        .insert({
          restaurant_id: restaurantId,
          category_id: categoryId,
          name,
          description,
          price: price ? Number(price) : 0,
          image_url,
          is_available
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error upserting Amharic menu item:', error);
    throw error;
  }
};

// Delete Amharic menu item
export const deleteMenuItemAmharicModel = async (restaurantId, menuItemId) => {
  try {
    const { error } = await supabaseAdmin
      .from('menu_items_amharic')
      .delete()
      .eq('restaurant_id', restaurantId)
      .eq('id', menuItemId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting Amharic menu item:', error);
    throw error;
  }
};

// Batch upsert Amharic menu items
export const batchUpsertMenuItemsAmharicModel = async (restaurantId, menuItemsData) => {
  try {
    const dataToUpsert = menuItemsData.map(item => ({
      restaurant_id: restaurantId,
      id: item.id,
      category_id: item.category_id,
      name: item.name,
      description: item.description || '',
      price: item.price ? Number(item.price) : 0,
      image_url: item.image_url || '',
      is_available: item.is_available !== undefined ? item.is_available : 1
    }));

    const { data, error } = await supabaseAdmin
      .from('menu_items_amharic')
      .upsert(dataToUpsert, {
        onConflict: 'restaurant_id,id'
      })
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error batch upserting Amharic menu items:', error);
    throw error;
  }
};
