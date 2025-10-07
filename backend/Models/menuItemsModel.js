import mySqlConnection from "../Config/db.js";

// Get all menu items for a restaurant
export const getMenuItemsModel = async (restaurantId, conn = mySqlConnection) => {
    const sql = `
        SELECT mi.*, c.name AS category_name
        FROM menu_items mi
        JOIN categories c ON mi.category_id = c.id AND c.restaurant_id = mi.restaurant_id
        WHERE mi.restaurant_id = ?
        ORDER BY mi.id
    `;
    const [result] = await conn.query(sql, [restaurantId]);
    return result;
};

// Get menu items by category ID (scoped to restaurant)
export const getMenuItemsByCategoryModel = async (restaurantId, categoryId, conn = mySqlConnection) => {
    const sql = `
        SELECT mi.*, c.name AS category_name
        FROM menu_items mi
        JOIN categories c ON mi.category_id = c.id AND c.restaurant_id = mi.restaurant_id
        WHERE c.id = ? AND mi.restaurant_id = ?
        ORDER BY mi.id
    `;
    const [result] = await conn.query(sql, [categoryId, restaurantId]);
    return result;
};


// Get menu item by ID within a restaurant
export const getMenuItemByIdModel = async (restaurantId, id, conn = mySqlConnection) => {
    const sql = `
        SELECT mi.*, c.name AS category_name
        FROM menu_items mi
        JOIN categories c ON mi.category_id = c.id AND c.restaurant_id = mi.restaurant_id
        WHERE mi.id = ? AND mi.restaurant_id = ?
    `;
    const [result] = await conn.query(sql, [id, restaurantId]);
    return result[0];
};

// Create new menu item for a restaurant
export const createMenuItemModel = async (restaurantId, category_id, name, description, price, image_url, is_available = 1, conn = mySqlConnection) => {
    const sql = `
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    const [result] = await conn.query(sql, [
        restaurantId, category_id, name, description, price, image_url, is_available
    ]);
    return { id: result.insertId, restaurant_id: restaurantId, category_id, name, description, price, image_url, is_available };
};

// Update menu item within a restaurant
export const updateMenuItemModel = async (restaurantId, id, category_id, name, description, price, image_url, is_available, conn = mySqlConnection) => {
    const sql = `
        UPDATE menu_items
        SET category_id = ?, name = ?, description = ?, price = ?, image_url = ?, is_available = ?
        WHERE id = ? AND restaurant_id = ?
    `;
    await conn.query(sql, [
        category_id, name, description, price, image_url, is_available, id, restaurantId
    ]);
    return { id, restaurant_id: restaurantId, category_id, name, description, price, image_url };
};

// Delete menu item within a restaurant
export const deleteMenuItemModel = async (restaurantId, id, conn = mySqlConnection) => {
    const sql = "DELETE FROM menu_items WHERE id = ? AND restaurant_id = ?";
    await conn.query(sql, [id, restaurantId]);
    return true;
};
