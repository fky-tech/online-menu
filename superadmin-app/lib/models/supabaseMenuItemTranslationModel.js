import { supabaseAdmin } from '../supabase.js';

// Get translation for specific menu item and language
export const getTranslationModel = async (restaurantId, menuItemId, language) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('menu_item_translation')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('menu_item_id', menuItemId)
      .eq('language', language)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting translation:', error);
    throw error;
  }
};

// Get all translations for a restaurant
export const getRestaurantTranslationsModel = async (restaurantId, language = null) => {
  try {
    let query = supabaseAdmin
      .from('menu_item_translation')
      .select(`
        *,
        menu_items(name, description)
      `)
      .eq('restaurant_id', restaurantId)
      .order('menu_item_id');

    if (language) {
      query = query.eq('language', language);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting restaurant translations:', error);
    throw error;
  }
};

// Get all translations for a specific menu item
export const getMenuItemTranslationsModel = async (restaurantId, menuItemId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('menu_item_translation')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('menu_item_id', menuItemId)
      .order('language');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting menu item translations:', error);
    throw error;
  }
};

// Create or update translation (upsert)
export const upsertTranslationModel = async (restaurantId, menuItemId, language, translatedName, translatedDescription) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('menu_item_translation')
      .upsert({
        restaurant_id: restaurantId,
        menu_item_id: menuItemId,
        language,
        translated_name: translatedName,
        translated_description: translatedDescription
      }, {
        onConflict: 'restaurant_id,menu_item_id,language'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error upserting translation:', error);
    throw error;
  }
};

// Update translation
export const updateTranslationModel = async (restaurantId, menuItemId, language, updates) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('menu_item_translation')
      .update(updates)
      .eq('restaurant_id', restaurantId)
      .eq('menu_item_id', menuItemId)
      .eq('language', language)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating translation:', error);
    throw error;
  }
};

// Delete translation
export const deleteTranslationModel = async (restaurantId, menuItemId, language) => {
  try {
    const { error } = await supabaseAdmin
      .from('menu_item_translation')
      .delete()
      .eq('restaurant_id', restaurantId)
      .eq('menu_item_id', menuItemId)
      .eq('language', language);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting translation:', error);
    throw error;
  }
};

// Delete all translations for a menu item
export const deleteMenuItemTranslationsModel = async (restaurantId, menuItemId) => {
  try {
    const { error } = await supabaseAdmin
      .from('menu_item_translation')
      .delete()
      .eq('restaurant_id', restaurantId)
      .eq('menu_item_id', menuItemId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting menu item translations:', error);
    throw error;
  }
};

// Batch update translations
export const batchUpdateTranslationsModel = async (restaurantId, translations) => {
  try {
    const translationsWithRestaurantId = translations.map(translation => ({
      ...translation,
      restaurant_id: restaurantId
    }));

    const { data, error } = await supabaseAdmin
      .from('menu_item_translation')
      .upsert(translationsWithRestaurantId, {
        onConflict: 'restaurant_id,menu_item_id,language'
      })
      .select();

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error batch updating translations:', error);
    throw error;
  }
};

// Get translation statistics for restaurant
export const getTranslationStatsModel = async (restaurantId) => {
  try {
    const { data: totalTranslations, error: totalError } = await supabaseAdmin
      .from('menu_item_translation')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurantId);

    if (totalError) throw totalError;

    const { data: languages, error: langError } = await supabaseAdmin
      .from('menu_item_translation')
      .select('language')
      .eq('restaurant_id', restaurantId);

    if (langError) throw langError;

    const uniqueLanguages = [...new Set(languages.map(item => item.language))];

    const { data: menuItems, error: itemsError } = await supabaseAdmin
      .from('menu_items')
      .select('id', { count: 'exact', head: true })
      .eq('restaurant_id', restaurantId);

    if (itemsError) throw itemsError;

    return {
      total_translations: totalTranslations || 0,
      languages_count: uniqueLanguages.length,
      languages: uniqueLanguages,
      menu_items_count: menuItems || 0,
      completion_rate: menuItems > 0 ? ((totalTranslations || 0) / (menuItems * uniqueLanguages.length)) * 100 : 0
    };
  } catch (error) {
    console.error('Error getting translation stats:', error);
    throw error;
  }
};

// Get missing translations for restaurant
export const getMissingTranslationsModel = async (restaurantId, targetLanguage) => {
  try {
    // Get all menu items for the restaurant
    const { data: menuItems, error: itemsError } = await supabaseAdmin
      .from('menu_items')
      .select('id, name, description')
      .eq('restaurant_id', restaurantId);

    if (itemsError) throw itemsError;

    // Get existing translations for the target language
    const { data: existingTranslations, error: transError } = await supabaseAdmin
      .from('menu_item_translation')
      .select('menu_item_id')
      .eq('restaurant_id', restaurantId)
      .eq('language', targetLanguage);

    if (transError) throw transError;

    const translatedItemIds = new Set(existingTranslations.map(t => t.menu_item_id));
    const missingTranslations = menuItems.filter(item => !translatedItemIds.has(item.id));

    return missingTranslations || [];
  } catch (error) {
    console.error('Error getting missing translations:', error);
    throw error;
  }
};

// Search translations
export const searchTranslationsModel = async (restaurantId, searchTerm, language = null) => {
  try {
    let query = supabaseAdmin
      .from('menu_item_translation')
      .select(`
        *,
        menu_items(name, description)
      `)
      .eq('restaurant_id', restaurantId)
      .or(`translated_name.ilike.%${searchTerm}%,translated_description.ilike.%${searchTerm}%`);

    if (language) {
      query = query.eq('language', language);
    }

    const { data, error } = await query.order('translated_name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching translations:', error);
    throw error;
  }
};

// Validate translation data
export const validateTranslationDataModel = (translationData) => {
  const errors = [];

  if (!translationData.menu_item_id) {
    errors.push('Menu item ID is required');
  }

  if (!translationData.language || translationData.language.trim() === '') {
    errors.push('Language is required');
  }

  if (!translationData.translated_name || translationData.translated_name.trim() === '') {
    errors.push('Translated name is required');
  }

  if (translationData.language && translationData.language.length !== 2) {
    errors.push('Language code must be 2 characters');
  }

  if (translationData.translated_name && translationData.translated_name.length > 255) {
    errors.push('Translated name must be less than 255 characters');
  }

  if (translationData.translated_description && translationData.translated_description.length > 1000) {
    errors.push('Translated description must be less than 1000 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Get translation completion percentage for language
export const getLanguageCompletionModel = async (restaurantId, language) => {
  try {
    const { data: totalItems, error: totalError } = await supabaseAdmin
      .from('menu_items')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurantId);

    if (totalError) throw totalError;

    const { data: translatedItems, error: transError } = await supabaseAdmin
      .from('menu_item_translation')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurantId)
      .eq('language', language);

    if (transError) throw transError;

    const total = totalItems || 0;
    const translated = translatedItems || 0;
    const percentage = total > 0 ? (translated / total) * 100 : 0;

    return {
      total_items: total,
      translated_items: translated,
      completion_percentage: Math.round(percentage * 100) / 100
    };
  } catch (error) {
    console.error('Error getting language completion:', error);
    throw error;
  }
};

