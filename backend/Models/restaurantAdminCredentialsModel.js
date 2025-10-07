import mySqlConnection from "../Config/db.js";

// Store plain password for super admin to copy
export const storeAdminCredentials = async (restaurantId, adminEmail, plainPassword) => {
  const sql = `
    INSERT INTO restaurant_admin_credentials (restaurant_id, admin_email, plain_password, created_at)
    VALUES (?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE admin_email = VALUES(admin_email), plain_password = VALUES(plain_password), created_at = NOW()
  `;
  await mySqlConnection.query(sql, [restaurantId, adminEmail, plainPassword]);
};

// Get credentials for a restaurant
export const getAdminCredentials = async (restaurantId) => {
  const sql = "SELECT restaurant_id, admin_email, plain_password FROM restaurant_admin_credentials WHERE restaurant_id = ?";
  const [rows] = await mySqlConnection.query(sql, [restaurantId]);
  return rows[0] || null;
};

// List all credentials (for super admin view)
export const listAllAdminCredentials = async () => {
  const sql = `
    SELECT rac.restaurant_id, rac.admin_email, rac.plain_password, r.name as restaurant_name, r.slug
    FROM restaurant_admin_credentials rac
    JOIN restaurants r ON rac.restaurant_id = r.id
    ORDER BY rac.created_at DESC
  `;
  const [rows] = await mySqlConnection.query(sql);
  return rows;
};

