import mySqlConnection from "../Config/db.js";

// Returns a row like: { restaurant_id, connection_url }
export const getTenantDbConfigByRestaurantId = async (restaurantId) => {
  const sql = "SELECT restaurant_id, connection_url FROM tenant_databases WHERE restaurant_id = ? LIMIT 1";
  const [rows] = await mySqlConnection.query(sql, [restaurantId]);
  return rows[0] || null;
};

// Insert or update tenant DB connection URL for a restaurant
export const upsertTenantDbConfig = async (restaurantId, connectionUrl) => {
  const sql = `INSERT INTO tenant_databases (restaurant_id, connection_url, updated_at, created_at)
               VALUES (?, ?, NOW(), NOW())
               ON DUPLICATE KEY UPDATE connection_url = VALUES(connection_url), updated_at = NOW()`;
  await mySqlConnection.query(sql, [restaurantId, connectionUrl]);
  return { restaurant_id: restaurantId, connection_url: connectionUrl };
};

