import {
    getMenuItemsModel,
    getMenuItemsByCategoryModel,
    getMenuItemByIdModel,
    createMenuItemModel,
    updateMenuItemModel,
    deleteMenuItemModel
} from "../Models/supabaseMenuItemsModel.js";

import {
    upsertMenuItemAmharicModel
} from "../Models/supabaseMenuItemsAmharicModel.js";
import { uploadFile, getPublicUrl } from "../Config/supabase.js";

// Get all menu items
export const getMenuItems = async (req, res) => {
    try {
        const restaurantId = req.user?.restaurant_id || req.restaurantId;
        const { language } = req.query; // Get language from query params
        
        if (!restaurantId) {
            return res.status(400).json({ success: false, message: "Restaurant ID is required" });
        }
        
        console.log('Menu items request - Language:', language, 'Restaurant ID:', restaurantId);
        const menuItems = await getMenuItemsModel(restaurantId, language);
        console.log('Menu items fetched with language:', language, 'First item name:', menuItems[0]?.name);
        res.status(200).json({ success: true, data: menuItems });
    } catch (error) {
        console.error('Error getting menu items:', error);
        res.status(500).json({ success: false, message: "Failed to fetch menu items" });
    }
};

// Get menu items by category
export const getMenuItemsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const restaurantId = req.user?.restaurant_id || req.restaurantId;
        const { language } = req.query; // Get language from query params
        
        if (!restaurantId) {
            return res.status(400).json({ success: false, message: "Restaurant ID is required" });
        }
        
        const items = await getMenuItemsByCategoryModel(restaurantId, categoryId, language);
        res.status(200).json({ success: true, data: items });
    } catch (error) {
        console.error('Error getting menu items by category:', error);
        res.status(500).json({ success: false, message: "Failed to fetch menu items" });
    }
};

// Get menu item by ID
export const getMenuItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const restaurantId = req.user?.restaurant_id || req.restaurantId;
        
        if (!restaurantId) {
            return res.status(400).json({ success: false, message: "Restaurant ID is required" });
        }
        
        const item = await getMenuItemByIdModel(restaurantId, id);
        if (!item) {
            return res.status(404).json({ success: false, message: "Menu item not found" });
        }
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        console.error('Error getting menu item by ID:', error);
        res.status(500).json({ success: false, message: "Failed to fetch menu item" });
    }
};

// Create new menu item
export const createMenuItem = async (req, res) => {
    try {
        const { category_id, name, description, price, is_available, adminLanguage } = req.body;
        const restaurantId = req.user?.restaurant_id || req.restaurantId;

        if (!restaurantId) {
            return res.status(400).json({ success: false, message: "Restaurant ID is required" });
        }

        if (!name || !category_id || !price) {
            return res.status(400).json({
                success: false,
                message: "Name, category ID, and price are required"
            });
        }

        // Handle image upload
        let imageUrl = req.body.image_url;
        if (req.file) {
            const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${req.file.originalname}`;
            const filePath = `menu-images/${fileName}`;

            await uploadFile('menu-images', filePath, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: false
            });

            imageUrl = getPublicUrl('menu-images', filePath);
        }

        // If admin language is Amharic, save to Amharic table
        if (adminLanguage === 'am') {
            // Import the Amharic model
            const { upsertMenuItemAmharicModel } = await import('../Models/supabaseMenuItemsAmharicModel.js');

            // Create new Amharic menu item - ONLY create in Amharic table
            const newItem = await upsertMenuItemAmharicModel(restaurantId, null, name, description, category_id);

            res.status(201).json({ success: true, data: newItem });
        } else {
            // Default to English table
            const newItem = await createMenuItemModel(
                restaurantId,
                category_id,
                name,
                description,
                price,
                imageUrl,
                is_available !== undefined ? is_available : true
            );

            res.status(201).json({ success: true, data: newItem });
        }
    } catch (error) {
        console.error('Error creating menu item:', error);
        res.status(500).json({ success: false, message: "Failed to create menu item" });
    }
};

// Update menu item
export const updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const restaurantId = req.user?.restaurant_id || req.restaurantId;
        
        if (!restaurantId) {
            return res.status(400).json({ success: false, message: "Restaurant ID is required" });
        }

        // Handle image upload
        if (req.file) {
            const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${req.file.originalname}`;
            const filePath = `menu-images/${fileName}`;
            
            await uploadFile('menu-images', filePath, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: false
            });
            
            updates.image_url = getPublicUrl('menu-images', filePath);
        }
        
        const updatedItem = await updateMenuItemModel(restaurantId, id, updates);
        res.status(200).json({ success: true, data: updatedItem });
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({ success: false, message: "Failed to update menu item" });
    }
};

// Delete menu item
export const deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const restaurantId = req.user?.restaurant_id || req.restaurantId;
        
        if (!restaurantId) {
            return res.status(400).json({ success: false, message: "Restaurant ID is required" });
        }
        
        await deleteMenuItemModel(restaurantId, id);
        res.status(200).json({ success: true, message: "Menu item deleted successfully" });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).json({ success: false, message: "Failed to delete menu item" });
    }
};
