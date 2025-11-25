import {
    getMenuItemsAmharicModel,
    getMenuItemAmharicByIdModel,
    upsertMenuItemAmharicModel,
    deleteMenuItemAmharicModel,
    batchUpsertMenuItemsAmharicModel
} from "../Models/supabaseMenuItemsAmharicModel.js";

// Get all Amharic menu items
export const getMenuItemsAmharic = async (req, res) => {
    try {
        const restaurantId = req.user?.restaurant_id || req.restaurantId;

        if (!restaurantId) {
            return res.status(400).json({ success: false, message: "Restaurant ID is required" });
        }

        const menuItems = await getMenuItemsAmharicModel(restaurantId);
        res.status(200).json({ success: true, data: menuItems });
    } catch (error) {
        console.error('Error getting Amharic menu items:', error);
        res.status(500).json({ success: false, message: "Failed to fetch Amharic menu items" });
    }
};

// Get Amharic menu item by menu_item_id
export const getMenuItemAmharicById = async (req, res) => {
    try {
        const { menuItemId } = req.params;
        const restaurantId = req.user?.restaurant_id || req.restaurantId;

        if (!restaurantId) {
            return res.status(400).json({ success: false, message: "Restaurant ID is required" });
        }

        const menuItem = await getMenuItemAmharicByIdModel(restaurantId, menuItemId);
        if (!menuItem) {
            return res.status(404).json({ success: false, message: "Amharic menu item not found" });
        }
        res.status(200).json({ success: true, data: menuItem });
    } catch (error) {
        console.error('Error getting Amharic menu item by ID:', error);
        res.status(500).json({ success: false, message: "Failed to fetch Amharic menu item" });
    }
};

// Create or update Amharic menu item
export const upsertMenuItemAmharic = async (req, res) => {
  try {
    const { id, category_id, name, description, price, image_url, is_available } = req.body;
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

    if (!category_id) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required"
      });
    }

    // Create new Amharic menu item - standalone
    const menuItem = await upsertMenuItemAmharicModel(restaurantId, id || null, name, description, category_id, price, image_url, is_available);

    res.status(200).json({ success: true, data: menuItem });
  } catch (error) {
    console.error('Error upserting Amharic menu item:', error);
    res.status(500).json({ success: false, message: "Failed to save Amharic menu item" });
  }
};

// Delete Amharic menu item
export const deleteMenuItemAmharic = async (req, res) => {
    try {
        const { menuItemId } = req.params;
        const restaurantId = req.user?.restaurant_id || req.restaurantId;

        if (!restaurantId) {
            return res.status(400).json({ success: false, message: "Restaurant ID is required" });
        }

        await deleteMenuItemAmharicModel(restaurantId, menuItemId);
        res.status(200).json({ success: true, message: "Amharic menu item deleted successfully" });
    } catch (error) {
        console.error('Error deleting Amharic menu item:', error);
        res.status(500).json({ success: false, message: "Failed to delete Amharic menu item" });
    }
};

// Batch upsert Amharic menu items
export const batchUpsertMenuItemsAmharic = async (req, res) => {
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

        const menuItems = await batchUpsertMenuItemsAmharicModel(restaurantId, translations);
        res.status(200).json({ success: true, data: menuItems });
    } catch (error) {
        console.error('Error batch upserting Amharic menu items:', error);
        res.status(500).json({ success: false, message: "Failed to save Amharic menu items" });
    }
};