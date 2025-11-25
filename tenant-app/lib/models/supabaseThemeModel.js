import { supabaseAdmin } from '../supabase.js';

// Get theme for restaurant
export const getThemeModel = async (restaurantId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('theme')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting theme:', error);
    throw error;
  }
};

// Create or update theme (upsert)
export const upsertThemeModel = async (restaurantId, themeData) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('theme')
      .upsert({
        restaurant_id: restaurantId,
        ...themeData
      }, {
        onConflict: 'restaurant_id'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error upserting theme:', error);
    throw error;
  }
};

// Update theme
export const updateThemeModel = async (restaurantId, updates) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('theme')
      .update(updates)
      .eq('restaurant_id', restaurantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating theme:', error);
    throw error;
  }
};

// Delete theme
export const deleteThemeModel = async (restaurantId) => {
  try {
    const { error } = await supabaseAdmin
      .from('theme')
      .delete()
      .eq('restaurant_id', restaurantId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting theme:', error);
    throw error;
  }
};

// List all themes (super admin)
export const listAllThemesModel = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('theme')
      .select(`
        *,
        restaurants(name, slug)
      `)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error listing all themes:', error);
    throw error;
  }
};

// Get theme by ID
export const getThemeByIdModel = async (id) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('theme')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting theme by ID:', error);
    throw error;
  }
};

// Get default theme settings
export const getDefaultThemeModel = () => {
  return {
    primary_color: '#3B82F6',
    secondary_color: '#1F2937',
    accent_color: '#F59E0B',
    background_color: '#FFFFFF',
    text_color: '#111827',
    font_family: 'Inter',
    border_radius: '8',
    button_style: 'rounded',
    layout_style: 'modern',
    header_style: 'simple',
    card_style: 'elevated',
    animation_enabled: true,
    dark_mode_enabled: false,
    custom_css: null
  };
};

// Reset theme to default
export const resetThemeToDefaultModel = async (restaurantId) => {
  try {
    const defaultTheme = getDefaultThemeModel();
    
    const { data, error } = await supabaseAdmin
      .from('theme')
      .upsert({
        restaurant_id: restaurantId,
        ...defaultTheme
      }, {
        onConflict: 'restaurant_id'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error resetting theme to default:', error);
    throw error;
  }
};

// Update specific theme property
export const updateThemePropertyModel = async (restaurantId, property, value) => {
  try {
    const updates = {};
    updates[property] = value;

    const { data, error } = await supabaseAdmin
      .from('theme')
      .update(updates)
      .eq('restaurant_id', restaurantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating theme property:', error);
    throw error;
  }
};

// Get theme statistics (super admin)
export const getThemeStatsModel = async () => {
  try {
    const { data: totalThemes, error: totalError } = await supabaseAdmin
      .from('theme')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    const { data: darkModeThemes, error: darkError } = await supabaseAdmin
      .from('theme')
      .select('*', { count: 'exact', head: true })
      .eq('dark_mode_enabled', true);

    if (darkError) throw darkError;

    const { data: customCssThemes, error: cssError } = await supabaseAdmin
      .from('theme')
      .select('*', { count: 'exact', head: true })
      .not('custom_css', 'is', null);

    if (cssError) throw cssError;

    return {
      total: totalThemes || 0,
      dark_mode_enabled: darkModeThemes || 0,
      with_custom_css: customCssThemes || 0
    };
  } catch (error) {
    console.error('Error getting theme stats:', error);
    throw error;
  }
};

// Validate theme data
export const validateThemeDataModel = (themeData) => {
  const validProperties = [
    'primary_color', 'secondary_color', 'accent_color', 'background_color', 'text_color',
    'font_family', 'border_radius', 'button_style', 'layout_style', 'header_style',
    'card_style', 'animation_enabled', 'dark_mode_enabled', 'custom_css'
  ];

  const validatedData = {};
  
  for (const [key, value] of Object.entries(themeData)) {
    if (validProperties.includes(key)) {
      validatedData[key] = value;
    }
  }

  return validatedData;
};

// Clone theme from another restaurant
export const cloneThemeModel = async (sourceRestaurantId, targetRestaurantId) => {
  try {
    const sourceTheme = await getThemeModel(sourceRestaurantId);
    
    if (!sourceTheme) {
      throw new Error('Source theme not found');
    }

    // Remove ID and restaurant_id from source theme
    const { id, restaurant_id, created_at, updated_at, ...themeData } = sourceTheme;

    const { data, error } = await supabaseAdmin
      .from('theme')
      .upsert({
        restaurant_id: targetRestaurantId,
        ...themeData
      }, {
        onConflict: 'restaurant_id'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error cloning theme:', error);
    throw error;
  }
};

