import {
    getCategoriesModel,
    getCategoryByIdModel,
    createCategoryModel,
    updateCategoryModel,
    deleteCategoryModel
} from "../Models/categoriesModel.js";
import { getRestaurantBySlugModel } from "../Models/restaurantsModel.js";

// Get all categories
export const getCategories = async (req, res) => {
    try {
        const { restaurantId, db } = req;
        const categories = await getCategoriesModel(restaurantId, db);
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch categories" });
    }
};

// Get category by ID
export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const { restaurantId, db } = req;
        const category = await getCategoryByIdModel(restaurantId, id, db);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
        res.status(200).json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch category" });
    }
};

// Create new category
export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const { restaurantId, db } = req;
        const newCategory = await createCategoryModel(restaurantId, name, description, db);
        res.status(201).json({ success: true, data: newCategory });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to create category" });
    }
};

// Update category
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const { restaurantId, db } = req;
        const updatedCategory = await updateCategoryModel(restaurantId, id, name, description, db);
        res.status(200).json({ success: true, data: updatedCategory });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update category" });
    }
};

// Delete category
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { restaurantId, db } = req;
        await deleteCategoryModel(restaurantId, id, db);
        res.status(200).json({ success: true, message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete category" });
    }
};
