import mySqlConnection from "../Config/db.js";

export const createRestaurantModel = async (name, slug, description, logo_url) => {
    const sql = `
        INSERT INTO restaurants (name, slug, description, logo_url, created_at)
        VALUES (?, ?, ?, ?, NOW())
    `;
    const [result] = await mySqlConnection.query(sql, [name, slug, description || null, logo_url || null]);
    return { id: result.insertId, name, slug, description, logo_url };
};

export const getRestaurantBySlugModel = async (slug) => {
    const sql = `SELECT * FROM restaurants WHERE slug = ?`;
    const [rows] = await mySqlConnection.query(sql, [slug]);
    return rows[0];
};

export const getRestaurantByIdModel = async (id) => {
    const sql = `SELECT * FROM restaurants WHERE id = ?`;
    const [rows] = await mySqlConnection.query(sql, [id]);
    return rows[0];
};

export const listRestaurantsModel = async () => {
    const sql = `SELECT id, name, slug, description, logo_url, created_at FROM restaurants ORDER BY id DESC`;
    const [rows] = await mySqlConnection.query(sql);
    return rows;
};

export const listActiveRestaurantsModel = async () => {
    // Active = has an active subscription
    const sql = `
      SELECT r.id, r.name, r.slug, r.description, r.logo_url, r.created_at
      FROM restaurants r
      WHERE EXISTS (
        SELECT 1 FROM subscriptions s
        WHERE s.restaurant_id = r.id
          AND s.status = 'active'
          AND (s.end_date IS NULL OR s.end_date >= CURRENT_DATE)
      )
      ORDER BY r.id DESC
    `;
    const [rows] = await mySqlConnection.query(sql);
    return rows;
};





export const deleteRestaurantByIdModel = async (id) => {
  const sql = `DELETE FROM restaurants WHERE id = ?`;
  await mySqlConnection.query(sql, [id]);
};
