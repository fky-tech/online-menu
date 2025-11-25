import {
    getThemeModel,
    upsertThemeModel,
    updateThemeModel,
    deleteThemeModel,
    listAllThemesModel,
    resetThemeToDefaultModel,
    getDefaultThemeModel
} from "../Models/supabaseThemeModel.js";

// Get theme for restaurant (super admin or tenant admin for their restaurant)
export const getTheme = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const userRestaurantId = req.user?.restaurant_id;

        // Super admin can access any restaurant, tenant admin can only access their own
        if (req.user?.role !== 'super_admin' && userRestaurantId !== parseInt(restaurantId)) {
            return res.status(403).json({ success: false, message: 'Forbidden: Access denied' });
        }

        const theme = await getThemeModel(restaurantId);

        // If no theme exists, return default theme
        if (!theme) {
            const defaultTheme = getDefaultThemeModel();
            return res.status(200).json({
                success: true,
                data: { ...defaultTheme, restaurant_id: parseInt(restaurantId) }
            });
        }

        res.status(200).json({
            success: true,
            data: theme
        });
    } catch (error) {
        console.error('Error getting theme:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch theme" 
        });
    }
};

// Create or update theme (super admin or tenant admin for their restaurant)
export const upsertTheme = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const userRestaurantId = req.user?.restaurant_id;
        const themeData = req.body;

        // Super admin can access any restaurant, tenant admin can only access their own
        if (req.user?.role !== 'super_admin' && userRestaurantId !== parseInt(restaurantId)) {
            return res.status(403).json({ success: false, message: 'Forbidden: Access denied' });
        }

        const theme = await upsertThemeModel(restaurantId, themeData);

        res.status(200).json({
            success: true,
            message: "Theme updated successfully",
            data: theme
        });
    } catch (error) {
        console.error('Error upserting theme:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Failed to update theme" 
        });
    }
};

// Delete theme (super admin only)
export const deleteTheme = async (req, res) => {
    try {
        // Check if user is super admin
        if (req.user?.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: Super admin access required' });
        }

        const { restaurantId } = req.params;
        await deleteThemeModel(restaurantId);

        res.status(200).json({
            success: true,
            message: "Theme deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting theme:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to delete theme" 
        });
    }
};

// List all themes (super admin only)
export const listAllThemes = async (req, res) => {
    try {
        // Check if user is super admin
        if (req.user?.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: Super admin access required' });
        }

        const themes = await listAllThemesModel();

        res.status(200).json({
            success: true,
            data: themes
        });
    } catch (error) {
        console.error('Error listing themes:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch themes" 
        });
    }
};

// Get current restaurant theme (for tenant admin)
export const getCurrentRestaurantTheme = async (req, res) => {
    try {
        const restaurantId = req.user?.restaurant_id || req.restaurantId;

        if (!restaurantId) {
            return res.status(400).json({ 
                success: false, 
                message: "Restaurant ID not found" 
            });
        }

        const theme = await getThemeModel(restaurantId);

        // If no theme exists, return default theme
        if (!theme) {
            const defaultTheme = getDefaultThemeModel();
            return res.status(200).json({
                success: true,
                data: { ...defaultTheme, restaurant_id: restaurantId }
            });
        }

        res.status(200).json({
            success: true,
            data: theme
        });
    } catch (error) {
        console.error('Error getting current restaurant theme:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch theme" 
        });
    }
};

// Update current restaurant theme (for tenant admin)
export const updateCurrentRestaurantTheme = async (req, res) => {
    try {
        const restaurantId = req.user?.restaurant_id || req.restaurantId;
        const themeData = req.body;

        if (!restaurantId) {
            return res.status(400).json({ 
                success: false, 
                message: "Restaurant ID not found" 
            });
        }

        const theme = await upsertThemeModel(restaurantId, themeData);

        res.status(200).json({
            success: true,
            message: "Theme updated successfully",
            data: theme
        });
    } catch (error) {
        console.error('Error updating current restaurant theme:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Failed to update theme" 
        });
    }
};

// Reset theme to default (super admin or tenant admin for their restaurant)
export const resetThemeToDefault = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const userRestaurantId = req.user?.restaurant_id;

        // Super admin can access any restaurant, tenant admin can only access their own
        if (req.user?.role !== 'super_admin' && userRestaurantId !== parseInt(restaurantId)) {
            return res.status(403).json({ success: false, message: 'Forbidden: Access denied' });
        }

        const theme = await resetThemeToDefaultModel(restaurantId);

        res.status(200).json({
            success: true,
            message: "Theme reset to default successfully",
            data: theme
        });
    } catch (error) {
        console.error('Error resetting theme to default:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to reset theme" 
        });
    }
};

// Get default theme settings
export const getDefaultTheme = async (req, res) => {
    try {
        const defaultTheme = getDefaultThemeModel();

        res.status(200).json({
            success: true,
            data: defaultTheme
        });
    } catch (error) {
        console.error('Error getting default theme:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch default theme" 
        });
    }
};
