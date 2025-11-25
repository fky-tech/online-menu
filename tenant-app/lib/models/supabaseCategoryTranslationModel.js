import { supabaseAdmin } from '../supabase.js';

// Get translation for specific category and language
export const getCategoryTranslationModel = async (restaurantId, categoryId, language) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('category_translation')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('category_id', categoryId)
      .eq('language', language)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting category translation:', error);
    throw error;
  }
};

// Get all category translations for a restaurant
export const getRestaurantCategoryTranslationsModel = async (restaurantId, language = null) => {
  try {
    let query = supabaseAdmin
      .from('category_translation')
      .select(`
        *,
        categories(name, description)
      `)
      .eq('restaurant_id', restaurantId)
      .order('category_id');

    if (language) {
      query = query.eq('language', language);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting restaurant category translations:', error);
    throw error;
  }
};

// Get all translations for a specific category
export const getCategoryTranslationsModel = async (restaurantId, categoryId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('category_translation')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('category_id', categoryId)
      .order('language');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting category translations:', error);
    throw error;
  }
};

// Create or update category translation (upsert)
export const upsertCategoryTranslationModel = async (restaurantId, categoryId, language, translatedName, translatedDescription) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('category_translation')
      .upsert({
        restaurant_id: restaurantId,
        category_id: categoryId,
        language,
        translated_name: translatedName,
        translated_description: translatedDescription
      }, {
        onConflict: 'restaurant_id,category_id,language'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error upserting category translation:', error);
    throw error;
  }
};

// Update category translation
export const updateCategoryTranslationModel = async (restaurantId, categoryId, language, updates) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('category_translation')
      .update(updates)
      .eq('restaurant_id', restaurantId)
      .eq('category_id', categoryId)
      .eq('language', language)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating category translation:', error);
    throw error;
  }
};

// Delete category translation
export const deleteCategoryTranslationModel = async (restaurantId, categoryId, language) => {
  try {
    const { error } = await supabaseAdmin
      .from('category_translation')
      .delete()
      .eq('restaurant_id', restaurantId)
      .eq('category_id', categoryId)
      .eq('language', language);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting category translation:', error);
    throw error;
  }
};

// Delete all translations for a category
export const deleteCategoryTranslationsModel = async (restaurantId, categoryId) => {
  try {
    const { error } = await supabaseAdmin
      .from('category_translation')
      .delete()
      .eq('restaurant_id', restaurantId)
      .eq('category_id', categoryId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting category translations:', error);
    throw error;
  }
};

// Batch update category translations
export const batchUpdateCategoryTranslationsModel = async (restaurantId, translations) => {
  try {
    const translationsWithRestaurantId = translations.map(translation => ({
      ...translation,
      restaurant_id: restaurantId
    }));

    const { data, error } = await supabaseAdmin
      .from('category_translation')
      .upsert(translationsWithRestaurantId, {
        onConflict: 'restaurant_id,category_id,language'
      })
      .select();

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error batch updating category translations:', error);
    throw error;
  }
};

// Get category translation statistics for restaurant
export const getCategoryTranslationStatsModel = async (restaurantId) => {
  try {
    const { data: totalTranslations, error: totalError } = await supabaseAdmin
      .from('category_translation')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurantId);

    if (totalError) throw totalError;

    const { data: languages, error: langError } = await supabaseAdmin
      .from('category_translation')
      .select('language')
      .eq('restaurant_id', restaurantId);

    if (langError) throw langError;

    const uniqueLanguages = [...new Set(languages.map(item => item.language))];

    const { data: categories, error: categoriesError } = await supabaseAdmin
      .from('categories')
      .select('id', { count: 'exact', head: true })
      .eq('restaurant_id', restaurantId);

    if (categoriesError) throw categoriesError;

    return {
      total_translations: totalTranslations || 0,
      languages_count: uniqueLanguages.length,
      languages: uniqueLanguages,
      categories_count: categories || 0,
      completion_rate: categories > 0 ? ((totalTranslations || 0) / (categories * uniqueLanguages.length)) * 100 : 0
    };
  } catch (error) {
    console.error('Error getting category translation stats:', error);
    throw error;
  }
};

// Get missing category translations for restaurant
export const getMissingCategoryTranslationsModel = async (restaurantId, targetLanguage) => {
  try {
    // Get all categories for the restaurant
    const { data: categories, error: categoriesError } = await supabaseAdmin
      .from('categories')
      .select('id, name, description')
      .eq('restaurant_id', restaurantId);

    if (categoriesError) throw categoriesError;

    // Get existing translations for the target language
    const { data: existingTranslations, error: transError } = await supabaseAdmin
      .from('category_translation')
      .select('category_id')
      .eq('restaurant_id', restaurantId)
      .eq('language', targetLanguage);

    if (transError) throw transError;

    const translatedCategoryIds = new Set(existingTranslations.map(t => t.category_id));
    const missingTranslations = categories.filter(category => !translatedCategoryIds.has(category.id));

    return missingTranslations || [];
  } catch (error) {
    console.error('Error getting missing category translations:', error);
    throw error;
  }
};

// Search category translations
export const searchCategoryTranslationsModel = async (restaurantId, searchTerm, language = null) => {
  try {
    let query = supabaseAdmin
      .from('category_translation')
      .select(`
        *,
        categories(name, description)
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
    console.error('Error searching category translations:', error);
    throw error;
  }
};

// Validate category translation data
export const validateCategoryTranslationDataModel = (translationData) => {
  const errors = [];

  if (!translationData.category_id) {
    errors.push('Category ID is required');
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

// Get category translation completion percentage for language
export const getCategoryLanguageCompletionModel = async (restaurantId, language) => {
  try {
    const { data: totalCategories, error: totalError } = await supabaseAdmin
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurantId);

    if (totalError) throw totalError;

    const { data: translatedCategories, error: transError } = await supabaseAdmin
      .from('category_translation')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurantId)
      .eq('language', language);

    if (transError) throw transError;

    const total = totalCategories || 0;
    const translated = translatedCategories || 0;
    const percentage = total > 0 ? (translated / total) * 100 : 0;

    return {
      total_categories: total,
      translated_categories: translated,
      completion_percentage: Math.round(percentage * 100) / 100
    };
  } catch (error) {
    console.error('Error getting category language completion:', error);
    throw error;
  }
};

// Copy translations from one language to another (for bulk operations)
export const copyTranslationsModel = async (restaurantId, sourceLanguage, targetLanguage) => {
  try {
    // Get all translations for source language
    const { data: sourceTranslations, error: sourceError } = await supabaseAdmin
      .from('category_translation')
      .select('category_id, translated_name, translated_description')
      .eq('restaurant_id', restaurantId)
      .eq('language', sourceLanguage);

    if (sourceError) throw sourceError;

    if (!sourceTranslations || sourceTranslations.length === 0) {
      return [];
    }

    // Create new translations for target language
    const newTranslations = sourceTranslations.map(translation => ({
      restaurant_id: restaurantId,
      category_id: translation.category_id,
      language: targetLanguage,
      translated_name: translation.translated_name,
      translated_description: translation.translated_description
    }));

    const { data, error } = await supabaseAdmin
      .from('category_translation')
      .upsert(newTranslations, {
        onConflict: 'restaurant_id,category_id,language'
      })
      .select();

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error copying category translations:', error);
    throw error;
  }
};

