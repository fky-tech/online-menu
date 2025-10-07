import mysql from 'mysql2/promise';
import { getTenantDbConfigByRestaurantId } from '../Models/tenantDbModel.js';

// Cache tenant pools by restaurant_id
const tenantPools = new Map();

export const getTenantPool = async (restaurantId) => {
  const key = String(restaurantId);
  if (tenantPools.has(key)) return tenantPools.get(key);

  const cfg = await getTenantDbConfigByRestaurantId(restaurantId);
  if (!cfg || !cfg.connection_url) {
    throw new Error('Tenant DB is not configured for this restaurant');
  }
  // Create a pool using the URL (mysql2 supports mysql://user:pass@host:port/db)
  const pool = mysql.createPool(cfg.connection_url);
  tenantPools.set(key, pool);
  return pool;
};

export const closeAllTenantPools = async () => {
  const tasks = [];
  for (const pool of tenantPools.values()) {
    tasks.push(pool.end().catch(()=>{}));
  }
  await Promise.all(tasks);
  tenantPools.clear();
};

