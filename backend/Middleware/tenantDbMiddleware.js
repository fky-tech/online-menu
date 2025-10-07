import { getTenantPool } from "../Config/tenantDb.js";

// Requires req.restaurantId to be set by previous middleware
export const attachTenantDb = async (req, res, next) => {
  try {
    const rid = req.restaurantId;
    if (!rid) return res.status(400).json({ success: false, message: 'Restaurant not resolved' });
    const pool = await getTenantPool(rid);
    req.db = pool; // attach per-tenant pool
    next();
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message || 'Tenant DB not available' });
  }
};

