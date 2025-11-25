import {
    getLanguageModel,
    upsertLanguageModel,
    updateLanguageModel,
    deleteLanguageModel,
    listAllLanguagesModel,
    resetLanguageToDefaultModel,
    getDefaultLanguageModel,
    getSupportedLanguagesModel
} from "../Models/supabaseLanguageModel.js";

// Get language settings for restaurant (super admin or tenant admin for their restaurant)
export const getLanguage = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const userRestaurantId = req.user?.restaurant_id;

        // Super admin can access any restaurant, tenant admin can only access their own
        if (req.user?.role !== 'super_admin' && userRestaurantId !== parseInt(restaurantId)) {
            return res.status(403).json({ success: false, message: 'Forbidden: Access denied' });
        }

        const language = await getLanguageModel(restaurantId);

        // If no language settings exist, return default settings
        if (!language) {
            const defaultLanguage = getDefaultLanguageModel();
            return res.status(200).json({
                success: true,
                data: { ...defaultLanguage, restaurant_id: parseInt(restaurantId) }
            });
        }

        res.status(200).json({
            success: true,
            data: language
        });
    } catch (error) {
        console.error('Error getting language settings:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch language settings" 
        });
    }
};

// Create or update language settings (super admin or tenant admin for their restaurant)
export const upsertLanguage = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const userRestaurantId = req.user?.restaurant_id;
        const languageData = req.body;

        // Super admin can access any restaurant, tenant admin can only access their own
        if (req.user?.role !== 'super_admin' && userRestaurantId !== parseInt(restaurantId)) {
            return res.status(403).json({ success: false, message: 'Forbidden: Access denied' });
        }

        const language = await upsertLanguageModel(restaurantId, languageData);

        res.status(200).json({
            success: true,
            message: "Language settings updated successfully",
            data: language
        });
    } catch (error) {
        console.error('Error upserting language settings:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Failed to update language settings" 
        });
    }
};

// Delete language settings (super admin only)
export const deleteLanguage = async (req, res) => {
    try {
        // Check if user is super admin
        if (req.user?.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: Super admin access required' });
        }

        const { restaurantId } = req.params;
        await deleteLanguageModel(restaurantId);

        res.status(200).json({
            success: true,
            message: "Language settings deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting language settings:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to delete language settings" 
        });
    }
};

// List all language settings (super admin only)
export const listAllLanguages = async (req, res) => {
    try {
        // Check if user is super admin
        if (req.user?.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: Super admin access required' });
        }

        const languages = await listAllLanguagesModel();

        res.status(200).json({
            success: true,
            data: languages
        });
    } catch (error) {
        console.error('Error listing language settings:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch language settings" 
        });
    }
};

// Get current restaurant language settings (for tenant admin)
export const getCurrentRestaurantLanguage = async (req, res) => {
    try {
        const restaurantId = req.user?.restaurant_id || req.restaurantId;

        if (!restaurantId) {
            return res.status(400).json({ 
                success: false, 
                message: "Restaurant ID not found" 
            });
        }

        const language = await getLanguageModel(restaurantId);

        // If no language settings exist, return default settings
        if (!language) {
            const defaultLanguage = getDefaultLanguageModel();
            return res.status(200).json({
                success: true,
                data: { ...defaultLanguage, restaurant_id: restaurantId }
            });
        }

        res.status(200).json({
            success: true,
            data: language
        });
    } catch (error) {
        console.error('Error getting current restaurant language settings:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch language settings" 
        });
    }
};

// Update current restaurant language settings (for tenant admin)
export const updateCurrentRestaurantLanguage = async (req, res) => {
    try {
        const restaurantId = req.user?.restaurant_id || req.restaurantId;
        const languageData = req.body;

        if (!restaurantId) {
            return res.status(400).json({ 
                success: false, 
                message: "Restaurant ID not found" 
            });
        }

        const language = await upsertLanguageModel(restaurantId, languageData);

        res.status(200).json({
            success: true,
            message: "Language settings updated successfully",
            data: language
        });
    } catch (error) {
        console.error('Error updating current restaurant language settings:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Failed to update language settings" 
        });
    }
};

// Get public language settings (no auth required)
export const getPublicLanguage = async (req, res) => {
    try {
        const restaurantId = req.restaurantId;

        if (!restaurantId) {
            return res.status(400).json({ 
                success: false, 
                message: "Restaurant ID not found" 
            });
        }

        const language = await getLanguageModel(restaurantId);

        // If no language settings exist, return default settings
        if (!language) {
            const defaultLanguage = getDefaultLanguageModel();
            return res.status(200).json({
                success: true,
                data: { ...defaultLanguage, restaurant_id: restaurantId }
            });
        }

        res.status(200).json({
            success: true,
            data: language
        });
    } catch (error) {
        console.error('Error getting public language settings:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch language settings" 
        });
    }
};

// Get supported languages list
export const getSupportedLanguages = async (req, res) => {
    try {
        const supportedLanguages = getSupportedLanguagesModel();

        res.status(200).json({
            success: true,
            data: supportedLanguages
        });
    } catch (error) {
        console.error('Error getting supported languages:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch supported languages" 
        });
    }
};

// Reset language settings to default (super admin or tenant admin for their restaurant)
export const resetLanguageToDefault = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const userRestaurantId = req.user?.restaurant_id;

        // Super admin can access any restaurant, tenant admin can only access their own
        if (req.user?.role !== 'super_admin' && userRestaurantId !== parseInt(restaurantId)) {
            return res.status(403).json({ success: false, message: 'Forbidden: Access denied' });
        }

        const language = await resetLanguageToDefaultModel(restaurantId);

        res.status(200).json({
            success: true,
            message: "Language settings reset to default successfully",
            data: language
        });
    } catch (error) {
        console.error('Error resetting language settings to default:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to reset language settings" 
        });
    }
};
