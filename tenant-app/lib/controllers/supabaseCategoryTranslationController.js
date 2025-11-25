import {
    getCategoryTranslationModel,
    getRestaurantCategoryTranslationsModel,
    getCategoryTranslationsModel,
    upsertCategoryTranslationModel,
    updateCategoryTranslationModel,
    deleteCategoryTranslationModel,
    batchUpdateCategoryTranslationsModel,
    getMissingCategoryTranslationsModel,
    searchCategoryTranslationsModel
} from "../Models/supabaseCategoryTranslationModel.js";

// Get translation for specific category and language
export const getCategoryTranslationController = async (req, res) => {
    try {
        const { categoryId, language } = req.params;
        const restaurantId = req.user?.restaurant_id || req.restaurantId;

        if (!restaurantId) {
            return res.status(400).json({ 
                success: false, 
                message: "Restaurant ID not found" 
            });
        }

        const translation = await getCategoryTranslationModel(restaurantId, categoryId, language);

        if (!translation) {
            return res.status(404).json({ 
                success: false, 
                message: "Category translation not found" 
            });
        }

        res.status(200).json({
            success: true,
            data: translation
        });
    } catch (error) {
        console.error('Error getting category translation:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch category translation" 
        });
    }
};

// Get all category translations for restaurant
export const getRestaurantCategoryTranslations = async (req, res) => {
    try {
        const restaurantId = req.user?.restaurant_id || req.restaurantId;
        const { language } = req.query;

        if (!restaurantId) {
            return res.status(400).json({ 
                success: false, 
                message: "Restaurant ID not found" 
            });
        }

        const translations = await getRestaurantCategoryTranslationsModel(restaurantId, language);

        res.status(200).json({
            success: true,
            data: translations
        });
    } catch (error) {
        console.error('Error getting restaurant category translations:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch category translations" 
        });
    }
};

// Get all translations for specific category
export const getCategoryTranslations = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const restaurantId = req.user?.restaurant_id || req.restaurantId;

        if (!restaurantId) {
            return res.status(400).json({ 
                success: false, 
                message: "Restaurant ID not found" 
            });
        }

        const translations = await getCategoryTranslationsModel(restaurantId, categoryId);

        res.status(200).json({
            success: true,
            data: translations
        });
    } catch (error) {
        console.error('Error getting category translations:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch category translations" 
        });
    }
};

// Create or update category translation
export const upsertCategoryTranslationController = async (req, res) => {
    try {
        const { categoryId } = req.params;
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

        const translation = await upsertCategoryTranslationModel(
            restaurantId, 
            categoryId, 
            language, 
            translated_name, 
            translated_description
        );

        res.status(200).json({
            success: true,
            message: "Category translation updated successfully",
            data: translation
        });
    } catch (error) {
        console.error('Error upserting category translation:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Failed to update category translation" 
        });
    }
};

// Update category translation
export const updateCategoryTranslation = async (req, res) => {
    try {
        const { categoryId, language } = req.params;
        const updates = req.body;
        const restaurantId = req.user?.restaurant_id || req.restaurantId;

        if (!restaurantId) {
            return res.status(400).json({ 
                success: false, 
                message: "Restaurant ID not found" 
            });
        }

        const translation = await updateCategoryTranslationModel(restaurantId, categoryId, language, updates);

        res.status(200).json({
            success: true,
            message: "Category translation updated successfully",
            data: translation
        });
    } catch (error) {
        console.error('Error updating category translation:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Failed to update category translation" 
        });
    }
};

// Delete category translation
export const deleteCategoryTranslationController = async (req, res) => {
    try {
        const { categoryId, language } = req.params;
        const restaurantId = req.user?.restaurant_id || req.restaurantId;

        if (!restaurantId) {
            return res.status(400).json({ 
                success: false, 
                message: "Restaurant ID not found" 
            });
        }

        await deleteCategoryTranslationModel(restaurantId, categoryId, language);

        res.status(200).json({
            success: true,
            message: "Category translation deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting category translation:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to delete category translation" 
        });
    }
};

// Batch update category translations
export const batchUpdateCategoryTranslations = async (req, res) => {
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

        const updatedTranslations = await batchUpdateCategoryTranslationsModel(restaurantId, translations);

        res.status(200).json({
            success: true,
            message: `${updatedTranslations.length} category translations updated successfully`,
            data: updatedTranslations
        });
    } catch (error) {
        console.error('Error batch updating category translations:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Failed to update category translations" 
        });
    }
};

// Get missing category translations for a language
export const getMissingCategoryTranslations = async (req, res) => {
    try {
        const { language } = req.params;
        const restaurantId = req.user?.restaurant_id || req.restaurantId;

        if (!restaurantId) {
            return res.status(400).json({ 
                success: false, 
                message: "Restaurant ID not found" 
            });
        }

        const missingTranslations = await getMissingCategoryTranslationsModel(restaurantId, language);

        res.status(200).json({
            success: true,
            data: missingTranslations
        });
    } catch (error) {
        console.error('Error getting missing category translations:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch missing category translations" 
        });
    }
};

// Search category translations
export const searchCategoryTranslations = async (req, res) => {
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

        const translations = await searchCategoryTranslationsModel(restaurantId, searchTerm, language);

        res.status(200).json({
            success: true,
            data: translations
        });
    } catch (error) {
        console.error('Error searching category translations:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to search category translations" 
        });
    }
};
