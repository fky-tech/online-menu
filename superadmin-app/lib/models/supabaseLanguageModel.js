import { supabaseAdmin } from '../supabase.js';

// Get language settings for restaurant
export const getLanguageModel = async (restaurantId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('language')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting language:', error);
    throw error;
  }
};

// Create or update language settings (upsert)
export const upsertLanguageModel = async (restaurantId, languageData) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('language')
      .upsert({
        restaurant_id: restaurantId,
        ...languageData
      }, {
        onConflict: 'restaurant_id'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error upserting language:', error);
    throw error;
  }
};

// Update language settings
export const updateLanguageModel = async (restaurantId, updates) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('language')
      .update(updates)
      .eq('restaurant_id', restaurantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating language:', error);
    throw error;
  }
};

// Delete language settings
export const deleteLanguageModel = async (restaurantId) => {
  try {
    const { error } = await supabaseAdmin
      .from('language')
      .delete()
      .eq('restaurant_id', restaurantId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting language:', error);
    throw error;
  }
};

// List all language settings (super admin)
export const listAllLanguagesModel = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('language')
      .select(`
        *,
        restaurants(name, slug)
      `)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error listing all languages:', error);
    throw error;
  }
};

// Get default language settings
export const getDefaultLanguageModel = () => {
  return {
    primary_language: 'en',
    secondary_language: 'am',
    auto_translate: false,
    show_language_switcher: true,
    fallback_to_primary: true,
    supported_languages: ['en', 'am']
  };
};

// Reset language to default
export const resetLanguageToDefaultModel = async (restaurantId) => {
  try {
    const defaultLanguage = getDefaultLanguageModel();
    
    const { data, error } = await supabaseAdmin
      .from('language')
      .upsert({
        restaurant_id: restaurantId,
        ...defaultLanguage
      }, {
        onConflict: 'restaurant_id'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error resetting language to default:', error);
    throw error;
  }
};

// Get supported languages list
export const getSupportedLanguagesModel = () => {
  return [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'am', name: 'Amharic', native: 'አማርኛ' },
    { code: 'es', name: 'Spanish', native: 'Español' },
    { code: 'fr', name: 'French', native: 'Français' },
    { code: 'de', name: 'German', native: 'Deutsch' },
    { code: 'it', name: 'Italian', native: 'Italiano' },
    { code: 'pt', name: 'Portuguese', native: 'Português' },
    { code: 'ar', name: 'Arabic', native: 'العربية' },
    { code: 'zh', name: 'Chinese', native: '中文' },
    { code: 'ja', name: 'Japanese', native: '日本語' },
    { code: 'ko', name: 'Korean', native: '한국어' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'ru', name: 'Russian', native: 'Русский' },
    { code: 'tr', name: 'Turkish', native: 'Türkçe' },
    { code: 'sw', name: 'Swahili', native: 'Kiswahili' }
  ];
};

// Validate language code
export const validateLanguageCodeModel = (languageCode) => {
  const supportedLanguages = getSupportedLanguagesModel();
  return supportedLanguages.some(lang => lang.code === languageCode);
};

// Get language statistics (super admin)
export const getLanguageStatsModel = async () => {
  try {
    const { data: totalLanguages, error: totalError } = await supabaseAdmin
      .from('language')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    const { data: autoTranslateEnabled, error: autoError } = await supabaseAdmin
      .from('language')
      .select('*', { count: 'exact', head: true })
      .eq('auto_translate', true);

    if (autoError) throw autoError;

    const { data: multiLanguage, error: multiError } = await supabaseAdmin
      .from('language')
      .select('*', { count: 'exact', head: true })
      .neq('primary_language', 'secondary_language');

    if (multiError) throw multiError;

    return {
      total: totalLanguages || 0,
      auto_translate_enabled: autoTranslateEnabled || 0,
      multi_language: multiError || 0
    };
  } catch (error) {
    console.error('Error getting language stats:', error);
    throw error;
  }
};

// Update primary language
export const updatePrimaryLanguageModel = async (restaurantId, languageCode) => {
  try {
    if (!validateLanguageCodeModel(languageCode)) {
      throw new Error('Invalid language code');
    }

    const { data, error } = await supabaseAdmin
      .from('language')
      .update({ primary_language: languageCode })
      .eq('restaurant_id', restaurantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating primary language:', error);
    throw error;
  }
};

// Update secondary language
export const updateSecondaryLanguageModel = async (restaurantId, languageCode) => {
  try {
    if (!validateLanguageCodeModel(languageCode)) {
      throw new Error('Invalid language code');
    }

    const { data, error } = await supabaseAdmin
      .from('language')
      .update({ secondary_language: languageCode })
      .eq('restaurant_id', restaurantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating secondary language:', error);
    throw error;
  }
};

// Toggle auto translate
export const toggleAutoTranslateModel = async (restaurantId) => {
  try {
    const currentSettings = await getLanguageModel(restaurantId);
    
    if (!currentSettings) {
      // Create default settings with auto_translate enabled
      return await upsertLanguageModel(restaurantId, {
        ...getDefaultLanguageModel(),
        auto_translate: true
      });
    }

    const { data, error } = await supabaseAdmin
      .from('language')
      .update({ auto_translate: !currentSettings.auto_translate })
      .eq('restaurant_id', restaurantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error toggling auto translate:', error);
    throw error;
  }
};

// Add supported language
export const addSupportedLanguageModel = async (restaurantId, languageCode) => {
  try {
    if (!validateLanguageCodeModel(languageCode)) {
      throw new Error('Invalid language code');
    }

    const currentSettings = await getLanguageModel(restaurantId);
    
    if (!currentSettings) {
      const defaultSettings = getDefaultLanguageModel();
      defaultSettings.supported_languages.push(languageCode);
      return await upsertLanguageModel(restaurantId, defaultSettings);
    }

    const supportedLanguages = currentSettings.supported_languages || [];
    
    if (!supportedLanguages.includes(languageCode)) {
      supportedLanguages.push(languageCode);
      
      const { data, error } = await supabaseAdmin
        .from('language')
        .update({ supported_languages: supportedLanguages })
        .eq('restaurant_id', restaurantId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    return currentSettings;
  } catch (error) {
    console.error('Error adding supported language:', error);
    throw error;
  }
};

// Remove supported language
export const removeSupportedLanguageModel = async (restaurantId, languageCode) => {
  try {
    const currentSettings = await getLanguageModel(restaurantId);
    
    if (!currentSettings) {
      throw new Error('Language settings not found');
    }

    const supportedLanguages = currentSettings.supported_languages || [];
    const updatedLanguages = supportedLanguages.filter(lang => lang !== languageCode);
    
    // Ensure at least one language remains
    if (updatedLanguages.length === 0) {
      throw new Error('Cannot remove all supported languages');
    }

    const { data, error } = await supabaseAdmin
      .from('language')
      .update({ supported_languages: updatedLanguages })
      .eq('restaurant_id', restaurantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error removing supported language:', error);
    throw error;
  }
};

