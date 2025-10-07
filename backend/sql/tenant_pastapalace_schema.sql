-- Tenant DB for Pasta Palace
DROP DATABASE IF EXISTS menu_tenant_pastapalace;
CREATE DATABASE menu_tenant_pastapalace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE menu_tenant_pastapalace;

-- categories
CREATE TABLE categories (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
CREATE INDEX idx_cat_rest_id ON categories(restaurant_id);

-- menu_items
CREATE TABLE menu_items (
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
CREATE INDEX idx_mi_rest_id ON menu_items(restaurant_id);
CREATE INDEX idx_mi_cat_id ON menu_items(category_id);

-- Seed data (restaurant_id = 2 matches platform)
INSERT INTO categories (id, restaurant_id, name, description)
VALUES
  (1, 2, 'Pastas', 'Classic Italian pastas'),
  (2, 2, 'Salads', 'Fresh salads'),
  (3, 2, 'Beverages', 'Hot and cold drinks');

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available)
VALUES
  (2, 1, 'Spaghetti Bolognese', 'Rich meat sauce', 11.99, NULL, 1),
  (2, 1, 'Fettuccine Alfredo', 'Creamy parmesan sauce', 12.49, NULL, 1),
  (2, 2, 'Caesar Salad', 'Romaine, croutons, parmesan', 7.99, NULL, 1),
  (2, 3, 'Espresso', 'Strong Italian coffee', 2.50, NULL, 1),
  (2, 3, 'Iced Tea', 'Refreshing lemon iced tea', 2.25, NULL, 1);

