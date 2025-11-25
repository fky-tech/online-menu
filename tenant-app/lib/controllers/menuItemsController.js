import {
    getMenuItemsModel,
    getMenuItemsByCategoryModel,
    getMenuItemByIdModel,
    createMenuItemModel,
    updateMenuItemModel,
    deleteMenuItemModel
} from "../Models/supabaseMenuItemsModel.js";
import { uploadFile, getPublicUrl } from "../Config/supabase.js";
import { getRestaurantBySlugModel } from "../Models/restaurantsModel.js";
// Get all menu items
export const getMenuItems = async (req, res) => {
    try {
        const { restaurantId, db } = req;
        const { language } = req.query; // Get language from query params
        const items = await getMenuItemsModel(restaurantId, db, language);
        res.status(200).json({ success: true, data: items });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch menu items" });
    }
};

// Get menu items by category
export const getMenuItemsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { restaurantId, db } = req;
        const { language } = req.query; // Get language from query params
        const items = await getMenuItemsByCategoryModel(restaurantId, categoryId, db, language);

        if (!items.length) {
            return res.status(404).json({ success: false, message: "No items found for this category" });
        }

        res.status(200).json({ success: true, data: items });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch menu items by category" });
    }
};

// Get single menu item by ID
export const getMenuItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const { restaurantId, db } = req;
        const item = await getMenuItemByIdModel(restaurantId, id, db);

        if (!item) {
            return res.status(404).json({ success: false, message: "Menu item not found" });
        }

        res.status(200).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch menu item" });
    }
};

// Create new menu item
export const createMenuItem = async (req, res) => {
    try {
        const { category_id, name, description } = req.body;
        const price = Number(req.body.price);
        let image_url = req.body.image_url;
        // If file uploaded, use its path
        if (req.file) {
            image_url = `/uploads/${req.file.filename}`;
        }
        const is_available = typeof req.body.is_available !== 'undefined' ? Number(req.body.is_available) : 1;
        const { restaurantId, db } = req;
        const newItem = await createMenuItemModel(restaurantId, category_id, name, description, price, image_url, is_available, db);
        res.status(201).json({ success: true, data: newItem });
    } catch (error) {
        console.error('Create menu item error:', error);
        res.status(500).json({ success: false, message: "Failed to create menu item", error: error.message });
    }
};

// Update menu item
export const updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        let { category_id, name, description, price, image_url, is_available } = req.body;
        // If file uploaded, use its path
        if (req.file) {
            image_url = `/uploads/${req.file.filename}`;
        }
        const { restaurantId, db } = req;
        const updatedItem = await updateMenuItemModel(restaurantId, id, category_id, name, description, price, image_url, is_available, db);
        res.status(200).json({ success: true, data: updatedItem });
    } catch (error) {
        console.error('Update menu item error:', error);
        res.status(500).json({ success: false, message: "Failed to update menu item", error: error.message });
    }
};

// Delete menu item
export const deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { restaurantId, db } = req;
        await deleteMenuItemModel(restaurantId, id, db);
        res.status(200).json({ success: true, message: "Menu item deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete menu item" });
    }
};
