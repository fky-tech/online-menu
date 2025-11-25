import {
    getTranslationModel,
    getRestaurantTranslationsModel,
    getMenuItemTranslationsModel,
    upsertTranslationModel,
    updateTranslationModel,
    deleteTranslationModel,
    batchUpdateTranslationsModel,
    getMissingTranslationsModel,
    searchTranslationsModel
} from "../Models/supabaseMenuItemTranslationModel.js";

// Get translation for specific menu item and language
export const getTranslation = async (req, res) => {
    try {
        const { menuItemId, language } = req.params;
        const restaurantId = req.user?.restaurant_id || req.restaurantId;

        if (!restaurantId) {
            return res.status(400).json({ 
                success: false, 
                message: "Restaurant ID not found" 
            });
        }

        const translation = await getTranslationModel(restaurantId, menuItemId, language);

        if (!translation) {
            return res.status(404).json({ 
                success: false, 
                message: "Translation not found" 
            });
        }

        res.status(200).json({
            success: true,
            data: translation
        });
    } catch (error) {
        console.error('Error getting translation:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch translation" 
        });
    }
};

// Get all translations for restaurant
export const getRestaurantTranslations = async (req, res) => {
    try {
        const restaurantId = req.user?.restaurant_id || req.restaurantId;
        const { language } = req.query;

        if (!restaurantId) {
            return res.status(400).json({ 
                success: false, 
                message: "Restaurant ID not found" 
            });
        }

        const translations = await getRestaurantTranslationsModel(restaurantId, language);

        res.status(200).json({
            success: true,
            data: translations
        });
    } catch (error) {
        console.error('Error getting restaurant translations:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch translations" 
        });
    }
};

// Get all translations for specific menu item
export const getMenuItemTranslations = async (req, res) => {
    try {
        const { menuItemId } = req.params;
        const restaurantId = req.user?.restaurant_id || req.restaurantId;

        if (!restaurantId) {
            return res.status(400).json({ 
                success: false, 
                message: "Restaurant ID not found" 
            });
        }

        const translations = await getMenuItemTranslationsModel(restaurantId, menuItemId);

        res.status(200).json({
            success: true,
            data: translations
        });
    } catch (error) {
        console.error('Error getting menu item translations:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch menu item translations" 
        });
    }
};

// Create or update translation
export const upsertTranslation = async (req, res) => {
    try {
        const { menuItemId } = req.params;
        const { language, translated_name, translated_description } = req.body;
        const restaurantId = req.user?.restaurant_id || req.restaurantId;

        if (!restaurantId) {
            return res.status(400).json({ 
                success: false, 
                message: "Restaurant ID not found" 
            });
        }

        if (!language || !translated_name) {
            return res.status(400).json({ 
                success: false, 
                message: "Language and translated name are required" 
            });
        }

        const translation = await upsertTranslationModel(
            restaurantId, 
            menuItemId, 
            language, 
            translated_name, 
            translated_description
        );

        res.status(200).json({
            success: true,
            message: "Translation updated successfully",
            data: translation
        });
    } catch (error) {
        console.error('Error upserting translation:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Failed to update translation" 
        });
    }
};

// Update translation
export const updateTranslation = async (req, res) => {
    try {
        const { menuItemId, language } = req.params;
        const updates = req.body;
        const restaurantId = req.user?.restaurant_id || req.restaurantId;

        if (!restaurantId) {
            return res.status(400).json({ 
                success: false, 
                message: "Restaurant ID not found" 
            });
        }

        const translation = await updateTranslationModel(restaurantId, menuItemId, language, updates);

        res.status(200).json({
            success: true,
            message: "Translation updated successfully",
            data: translation
        });
    } catch (error) {
        console.error('Error updating translation:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Failed to update translation" 
        });
    }
};

// Delete translation
export const deleteTranslation = async (req, res) => {
    try {
        const { menuItemId, language } = req.params;
        const restaurantId = req.user?.restaurant_id || req.restaurantId;

        if (!restaurantId) {
            return res.status(400).json({ 
                success: false, 
                message: "Restaurant ID not found" 
            });
        }

        await deleteTranslationModel(restaurantId, menuItemId, language);

        res.status(200).json({
            success: true,
            message: "Translation deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting translation:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to delete translation" 
        });
    }
};

// Batch update translations
export const batchUpdateTranslations = async (req, res) => {
    try {
        const { translations } = req.body;
        const restaurantId = req.user?.restaurant_id || req.restaurantId;

        if (!restaurantId) {
            return res.status(400).json({ 
                success: false, 
                message: "Restaurant ID not found" 
            });
        }

        if (!Array.isArray(translations) || translations.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Translations array is required and cannot be empty" 
            });
        }

        const updatedTranslations = await batchUpdateTranslationsModel(restaurantId, translations);

        res.status(200).json({
            success: true,
            message: `${updatedTranslations.length} translations updated successfully`,
            data: updatedTranslations
        });
    } catch (error) {
        console.error('Error batch updating translations:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Failed to update translations" 
        });
    }
};

// Get missing translations for a language
export const getMissingTranslations = async (req, res) => {
    try {
        const { language } = req.params;
        const restaurantId = req.user?.restaurant_id || req.restaurantId;

        if (!restaurantId) {
            return res.status(400).json({ 
                success: false, 
                message: "Restaurant ID not found" 
            });
        }

        const missingTranslations = await getMissingTranslationsModel(restaurantId, language);

        res.status(200).json({
            success: true,
            data: missingTranslations
        });
    } catch (error) {
        console.error('Error getting missing translations:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch missing translations" 
        });
    }
};

// Search translations
export const searchTranslations = async (req, res) => {
    try {
        const { q: searchTerm, language } = req.query;
        const restaurantId = req.user?.restaurant_id || req.restaurantId;

        if (!restaurantId) {
            return res.status(400).json({ 
                success: false, 
                message: "Restaurant ID not found" 
            });
        }

        if (!searchTerm) {
            return res.status(400).json({ 
                success: false, 
                message: "Search term is required" 
            });
        }

        const translations = await searchTranslationsModel(restaurantId, searchTerm, language);

        res.status(200).json({
            success: true,
            data: translations
        });
    } catch (error) {
        console.error('Error searching translations:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to search translations" 
        });
    }
};
