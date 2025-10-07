import { upsertTenantDbConfig } from "../Models/tenantDbModel.js";

// Admin-only endpoint to set or update a tenant's DB connection URL
export const setTenantDbConfig = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { connection_url } = req.body;
    if (!connection_url || typeof connection_url !== 'string') {
      return res.status(400).json({ success: false, message: 'connection_url is required' });
    }
    const rec = await upsertTenantDbConfig(Number(restaurantId), connection_url);
    return res.status(200).json({ success: true, data: rec });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to set tenant DB config' });
  }
};

