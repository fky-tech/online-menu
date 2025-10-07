import mySqlConnection from "../Config/db.js";

// ================== FIND ADMIN BY EMAIL ==================
export const findAdminByEmail = async (email) => {
    const sql = "SELECT * FROM admin WHERE email = ?";
    const [rows] = await mySqlConnection.query(sql, [email]);
    return rows[0]; // return single admin or undefined
};

// ================== CREATE ADMIN ==================
export const createAdmin = async (name, email, password_hash) => {
    const sql = `
        INSERT INTO admin (name, email, password_hash, role, created_at)
        VALUES (?, ?, ?, 'super_admin', NOW())
    `;
    const [result] = await mySqlConnection.query(sql, [name, email, password_hash]);
    return { id: result.insertId, name, email, role: 'super_admin' };
};

export const createTenantAdmin = async (name, email, password_hash, restaurant_id) => {
    const sql = `
        INSERT INTO admin (name, email, password_hash, role, restaurant_id, created_at)
        VALUES (?, ?, ?, 'tenant_admin', ?, NOW())
    `;
    const [result] = await mySqlConnection.query(sql, [name, email, password_hash, restaurant_id]);
    return { id: result.insertId, name, email, role: 'tenant_admin', restaurant_id };
};
