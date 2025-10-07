-- Platform (master) database schema and seed data
-- Adjust database name/credentials as needed

DROP DATABASE IF EXISTS online_menu_platform;
CREATE DATABASE online_menu_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE online_menu_platform;

-- =========================
-- restaurants (tenants)
-- =========================
CREATE TABLE restaurants (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NULL,
  logo_url VARCHAR(512) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- admin users (super + tenant admins)
-- =========================
CREATE TABLE admin (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('super_admin','tenant_admin') NOT NULL,
  restaurant_id BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_admin_restaurant
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;
CREATE INDEX idx_admin_restaurant_id ON admin(restaurant_id);

-- =========================
-- subscriptions (per tenant)
-- =========================
CREATE TABLE subscriptions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id BIGINT NOT NULL,
  package_type VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NULL,
  status ENUM('active','expired','cancelled') NOT NULL DEFAULT 'active',
  amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0,
  CONSTRAINT fk_sub_restaurant
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE INDEX idx_sub_restaurant_id ON subscriptions(restaurant_id);
CREATE INDEX idx_sub_status ON subscriptions(status);

-- =========================
-- tenant database connection map
-- =========================
CREATE TABLE tenant_databases (
  restaurant_id BIGINT PRIMARY KEY,
  connection_url VARCHAR(512) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tenantdb_rest FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- restaurant admin credentials (temporary storage for super admin to copy)
-- =========================
CREATE TABLE restaurant_admin_credentials (
  restaurant_id BIGINT PRIMARY KEY,
  admin_email VARCHAR(255) NOT NULL,
  plain_password VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_admincred_rest FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- Seed data
-- =========================

-- Tenants
INSERT INTO restaurants (id, name, slug, description, logo_url)
VALUES
  (1, 'Burgerizza', 'burgerizza', 'Burgers + Pizza fusion', NULL),
  (2, 'Pasta Palace', 'pasta-palace', 'Authentic Italian pasta', NULL);

-- Super admin (password = "password"; bcrypt 10 rounds)
-- Hash: $2b$10$CwTycUXWue0Thq9StjUM0uJ8iG7GaxmwoXmxjSPdZRhqUTrWBi3G
INSERT INTO admin (name, email, password_hash, role, restaurant_id)
VALUES ('Owner', 'owner@example.com', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8iG7GaxmwoXmxjSPdZRhqUTrWBi3G', 'super_admin', NULL);

-- Tenant admins (password = "password")
INSERT INTO admin (name, email, password_hash, role, restaurant_id)
VALUES
  ('Burg Admin', 'burg-admin@example.com', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8iG7GaxmwoXmxjSPdZRhqUTrWBi3G', 'tenant_admin', 1),
  ('Pasta Admin', 'pasta-admin@example.com', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8iG7GaxmwoXmxjSPdZRhqUTrWBi3G', 'tenant_admin', 2);

-- Subscriptions
INSERT INTO subscriptions (restaurant_id, package_type, start_date, end_date, status, amount_paid)
VALUES
  (1, 'pro-monthly', DATE_SUB(CURRENT_DATE, INTERVAL 10 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 20 DAY), 'active', 49.00),
  (2, 'basic-monthly', DATE_SUB(CURRENT_DATE, INTERVAL 60 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY), 'expired', 19.00);

-- Tenant DB connections (adjust credentials/host/ports to your environment)
INSERT INTO tenant_databases (restaurant_id, connection_url)
VALUES
  (1, 'mysql://root:password@127.0.0.1:3306/menu_tenant_burgerizza'),
  (2, 'mysql://root:password@127.0.0.1:3306/menu_tenant_pastapalace');



