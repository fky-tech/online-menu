import mySqlConnection from "../Config/db.js";

// Get all categories for a restaurant
export const getCategoriesModel = async (restaurantId, conn = mySqlConnection) => {
    const sql = "SELECT * FROM categories WHERE restaurant_id = ? ORDER BY id";
    const [result] = await conn.query(sql, [restaurantId]);
    return result;
};

// Get category by ID within a restaurant
export const getCategoryByIdModel = async (restaurantId, id, conn = mySqlConnection) => {
    const sql = "SELECT * FROM categories WHERE id = ? AND restaurant_id = ?";
    const [result] = await conn.query(sql, [id, restaurantId]);
    return result[0];
};

// Create new category for a restaurant
export const createCategoryModel = async (restaurantId, name, description, conn = mySqlConnection) => {
    const sql = "INSERT INTO categories (restaurant_id, name, description, created_at) VALUES (?, ?, ?, NOW())";
    const [result] = await conn.query(sql, [restaurantId, name, description]);
    return { id: result.insertId, restaurant_id: restaurantId, name, description };
};

// Update category within a restaurant
export const updateCategoryModel = async (restaurantId, id, name, description, conn = mySqlConnection) => {
    const sql = "UPDATE categories SET name = ?, description = ? WHERE id = ? AND restaurant_id = ?";
    await conn.query(sql, [name, description, id, restaurantId]);
    return { id, restaurant_id: restaurantId, name, description };
};

// Delete category within a restaurant
export const deleteCategoryModel = async (restaurantId, id, conn = mySqlConnection) => {
    const sql = "DELETE FROM categories WHERE id = ? AND restaurant_id = ?";
    await conn.query(sql, [id, restaurantId]);
    return true;
};
