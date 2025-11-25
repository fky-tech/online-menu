import {
    getCategoriesModel,
    getCategoryByIdModel,
    createCategoryModel,
    updateCategoryModel,
    deleteCategoryModel
} from "../Models/supabaseCategoriesModel.js";

import {
    getCategoriesAmharicModel,
    getCategoryAmharicByIdModel,
    upsertCategoryAmharicModel,
    deleteCategoryAmharicModel
} from "../Models/supabaseCategoriesAmharicModel.js";

// Get all categories
export const getCategories = async (req, res) => {
    try {
        const restaurantId = req.user?.restaurant_id || req.restaurantId;
        const { language } = req.query; // Get language from query params

        if (!restaurantId) {
            return res.status(400).json({ success: false, message: "Restaurant ID is required" });
        }

        const categories = await getCategoriesModel(restaurantId, language);
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        console.error('Error getting categories:', error);
        res.status(500).json({ success: false, message: "Failed to fetch categories" });
    }
};

// Get category by ID
export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const restaurantId = req.user?.restaurant_id || req.restaurantId;

        if (!restaurantId) {
            return res.status(400).json({ success: false, message: "Restaurant ID is required" });
        }

        const category = await getCategoryByIdModel(restaurantId, id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
        res.status(200).json({ success: true, data: category });
    } catch (error) {
        console.error('Error getting category by ID:', error);
        res.status(500).json({ success: false, message: "Failed to fetch category" });
    }
};

// Create new category
export const createCategory = async (req, res) => {
    try {
        const { name, description, adminLanguage } = req.body;
        const restaurantId = req.user?.restaurant_id || req.restaurantId;

        if (!restaurantId) {
            return res.status(400).json({ success: false, message: "Restaurant ID is required" });
        }

        if (!name || name.trim() === '') {
            return res.status(400).json({ success: false, message: "Category name is required" });
        }

        // If admin language is Amharic, save to Amharic table only
        if (adminLanguage === 'am') {
            return res.status(400).json({
                success: false,
                message: "Cannot create new categories in Amharic. Please create categories in English first, then add Amharic translations."
            });
        } else {
            // Default to English table
            const newCategory = await createCategoryModel(restaurantId, name, description);
            res.status(201).json({ success: true, data: newCategory });
        }
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ success: false, message: "Failed to create category" });
    }
};

// Update category
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const restaurantId = req.user?.restaurant_id || req.restaurantId;

        if (!restaurantId) {
            return res.status(400).json({ success: false, message: "Restaurant ID is required" });
        }

        const updatedCategory = await updateCategoryModel(restaurantId, id, updates);
        res.status(200).json({ success: true, data: updatedCategory });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ success: false, message: "Failed to update category" });
    }
};

// Delete category
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const restaurantId = req.user?.restaurant_id || req.restaurantId;

        if (!restaurantId) {
            return res.status(400).json({ success: false, message: "Restaurant ID is required" });
        }

        await deleteCategoryModel(restaurantId, id);
        res.status(200).json({ success: true, message: "Category deleted successfully" });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ success: false, message: "Failed to delete category" });
    }
};
