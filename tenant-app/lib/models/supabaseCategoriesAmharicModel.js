import { supabaseAdmin } from '../supabase.js';

// Get all Amharic categories for a restaurant
export const getCategoriesAmharicModel = async (restaurantId) => {
  try {
    const { data, error } = await supabaseAdmin
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

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting Amharic categories:', error);
    throw error;
  }
};

// Get Amharic category by id
export const getCategoryAmharicByIdModel = async (restaurantId, categoryId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories_amharic')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('id', categoryId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting Amharic category by ID:', error);
    throw error;
  }
};

// Create or update Amharic category
export const upsertCategoryAmharicModel = async (restaurantId, categoryId, name, description) => {
  try {
    if (categoryId) {
      // Update existing category
      const { data, error } = await supabaseAdmin
        .from('categories_amharic')
        .update({
          name,
          description
        })
        .eq('restaurant_id', restaurantId)
        .eq('id', categoryId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new category
      const { data, error } = await supabaseAdmin
        .from('categories_amharic')
        .insert({
          restaurant_id: restaurantId,
          name,
          description
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error upserting Amharic category:', error);
    throw error;
  }
};

// Delete Amharic category
export const deleteCategoryAmharicModel = async (restaurantId, categoryId) => {
  try {
    const { error } = await supabaseAdmin
      .from('categories_amharic')
      .delete()
      .eq('restaurant_id', restaurantId)
      .eq('id', categoryId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting Amharic category:', error);
    throw error;
  }
};

// Batch upsert Amharic categories
export const batchUpsertCategoriesAmharicModel = async (restaurantId, categoriesData) => {
  try {
    const dataToUpsert = categoriesData.map(cat => ({
      restaurant_id: restaurantId,
      id: cat.id,
      name: cat.name,
      description: cat.description || ''
    }));

    const { data, error } = await supabaseAdmin
      .from('categories_amharic')
      .upsert(dataToUpsert, {
        onConflict: 'restaurant_id,id'
      })
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error batch upserting Amharic categories:', error);
    throw error;
  }
};
