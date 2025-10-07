-- Tenant DB for Burgerizza
DROP DATABASE IF EXISTS menu_tenant_burgerizza;
CREATE DATABASE menu_tenant_burgerizza CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE menu_tenant_burgerizza;

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

-- Seed data (restaurant_id = 1 matches platform)
INSERT INTO categories (id, restaurant_id, name, description)
VALUES
  (1, 1, 'Burgers', 'Juicy grilled burgers'),
  (2, 1, 'Pizzas', 'Hand-tossed pizzas'),
  (3, 1, 'Drinks', 'Soft drinks and shakes');

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available)
VALUES
  (1, 1, 'Classic Burger', 'Beef patty, lettuce, tomato', 8.99, NULL, 1),
  (1, 1, 'Cheese Burger', 'Beef, cheddar, pickles', 9.49, NULL, 1),
  (1, 2, 'Margherita Pizza', 'Tomato, mozzarella, basil', 12.99, NULL, 1),
  (1, 2, 'Pepperoni Pizza', 'Pepperoni, mozzarella', 13.99, NULL, 1),
  (1, 3, 'Chocolate Shake', 'Rich cocoa shake', 4.50, NULL, 1),
  (1, 3, 'Cola', 'Chilled cola can', 1.99, NULL, 1);

