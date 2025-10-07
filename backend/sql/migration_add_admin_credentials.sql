-- Migration: Add restaurant_admin_credentials table
-- Run this if you already have the platform database and want to add the new table

USE online_menu_platform;

CREATE TABLE IF NOT EXISTS restaurant_admin_credentials (
  restaurant_id BIGINT PRIMARY KEY,
  admin_email VARCHAR(255) NOT NULL,
  plain_password VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_admincred_rest FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

