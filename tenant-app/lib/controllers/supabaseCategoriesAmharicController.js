import {
    getCategoriesAmharicModel,
    getCategoryAmharicByIdModel,
    upsertCategoryAmharicModel,
    deleteCategoryAmharicModel,
    batchUpsertCategoriesAmharicModel
} from "../Models/supabaseCategoriesAmharicModel.js";

// Get all Amharic categories
export const getCategoriesAmharic = async (req, res) => {
    try {
        const restaurantId = req.user?.restaurant_id || req.restaurantId;

        if (!restaurantId) {
            return res.status(400).json({ success: false, message: "Restaurant ID is required" });
        }

        const categories = await getCategoriesAmharicModel(restaurantId);
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        console.error('Error getting Amharic categories:', error);
        res.status(500).json({ success: false, message: "Failed to fetch Amharic categories" });
    }
};

// Get Amharic category by category_id
export const getCategoryAmharicById = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const restaurantId = req.user?.restaurant_id || req.restaurantId;

        if (!restaurantId) {
            return res.status(400).json({ success: false, message: "Restaurant ID is required" });
        }

        const category = await getCategoryAmharicByIdModel(restaurantId, categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: "Amharic category not found" });
        }
        res.status(200).json({ success: true, data: category });
    } catch (error) {
        console.error('Error getting Amharic category by ID:', error);
        res.status(500).json({ success: false, message: "Failed to fetch Amharic category" });
    }
};

// Create or update Amharic category
export const upsertCategoryAmharic = async (req, res) => {
    try {
        const { name, description, id } = req.body;
        const restaurantId = req.user?.restaurant_id || req.restaurantId;

        if (!restaurantId) {
            return res.status(400).json({ success: false, message: "Restaurant ID is required" });
        }

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Name is required"
            });
        }

        // Create new Amharic category - standalone
        const category = await upsertCategoryAmharicModel(restaurantId, id || null, name, description);

        res.status(200).json({ success: true, data: category });
    } catch (error) {
        console.error('Error upserting Amharic category:', error);
        res.status(500).json({ success: false, message: "Failed to save Amharic category" });
    }
};

// Delete Amharic category
export const deleteCategoryAmharic = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const restaurantId = req.user?.restaurant_id || req.restaurantId;

        if (!restaurantId) {
            return res.status(400).json({ success: false, message: "Restaurant ID is required" });
        }

        await deleteCategoryAmharicModel(restaurantId, categoryId);
        res.status(200).json({ success: true, message: "Amharic category deleted successfully" });
    } catch (error) {
        console.error('Error deleting Amharic category:', error);
        res.status(500).json({ success: false, message: "Failed to delete Amharic category" });
    }
};

// Batch upsert Amharic categories
export const batchUpsertCategoriesAmharic = async (req, res) => {
    try {
        const { translations } = req.body;
        const restaurantId = req.user?.restaurant_id || req.restaurantId;

        if (!restaurantId) {
            return res.status(400).json({ success: false, message: "Restaurant ID is required" });
        }

        if (!translations || !Array.isArray(translations)) {
            return res.status(400).json({
                success: false,
                message: "Translations array is required"
            });
        }

        const categories = await batchUpsertCategoriesAmharicModel(restaurantId, translations);
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        console.error('Error batch upserting Amharic categories:', error);
        res.status(500).json({ success: false, message: "Failed to save Amharic categories" });
    }
};