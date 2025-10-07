import mysql from 'mysql2/promise';
import { upsertTenantDbConfig, getTenantDbConfigByRestaurantId } from '../Models/tenantDbModel.js';

function makeDbName(slug) {
  const prefix = process.env.TENANT_DB_PREFIX || 'menu_tenant_';
  // allow only [a-z0-9_], convert hyphens to underscores
  const safe = String(slug).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 48);
  return `${prefix}${safe}`.slice(0, 64);
}

function getProvisionCreds() {
  return {
    host: process.env.PROVISION_DB_HOST || process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.PROVISION_DB_PORT || process.env.MYSQL_PORT || 3306),
    user: process.env.PROVISION_DB_USER || process.env.MYSQL_USER || 'root',
    password: process.env.PROVISION_DB_PASSWORD || process.env.MYSQL_PASSWORD || '',
  };
}

export async function provisionTenantForRestaurant(restaurant) {
  if (!restaurant?.id || !restaurant?.slug) throw new Error('Invalid restaurant input');
  const dbName = makeDbName(restaurant.slug);
  const creds = getProvisionCreds();
  const serverConn = await mysql.createConnection({ ...creds, multipleStatements: true });
  try {
    // Create database if not exists
    await serverConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);

    // Apply minimal schema
    await serverConn.query(`
      CREATE TABLE IF NOT EXISTS \`${dbName}\`.categories (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        restaurant_id BIGINT NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await serverConn.query(`
      CREATE TABLE IF NOT EXISTS \`${dbName}\`.menu_items (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        restaurant_id BIGINT NOT NULL,
        category_id BIGINT NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT NULL,
        price DECIMAL(10,2) NOT NULL DEFAULT 0,
        image_url VARCHAR(512) NULL,
        is_available TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    const connectionUrl = `mysql://${encodeURIComponent(creds.user)}:${encodeURIComponent(creds.password)}@${creds.host}:${creds.port}/${dbName}`;

    // store mapping in platform DB
    await upsertTenantDbConfig(restaurant.id, connectionUrl);

    return { dbName, connectionUrl };
  } finally {
    await serverConn.end().catch(() => {});
  }
}

export async function deprovisionTenantForRestaurant(restaurant) {
  // Attempts to drop the tenant database. Safe to call even if mapping is missing.
  if (!restaurant?.slug && !restaurant?.id) return;
  const creds = getProvisionCreds();
  let dbName = null;
  try {
    if (restaurant?.id) {
      const cfg = await getTenantDbConfigByRestaurantId(restaurant.id);
      if (cfg?.connection_url) {
        try {
          const u = new URL(cfg.connection_url);
          dbName = u.pathname.replace(/^\//, '');
        } catch {}
      }
    }
    if (!dbName && restaurant?.slug) dbName = makeDbName(restaurant.slug);
    if (!dbName) return;
    const serverConn = await mysql.createConnection({ ...creds });
    try {
      await serverConn.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
    } finally {
      await serverConn.end().catch(()=>{});
    }
  } catch {
    // swallow drop errors; deletion will continue on platform
  }
}
