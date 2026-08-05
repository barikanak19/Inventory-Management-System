-- =========================================================
-- Inventory Management System - MySQL Schema
-- =========================================================

CREATE DATABASE IF NOT EXISTS inventory_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE inventory_management;

-- =========================================================
-- TABLE: users
-- =========================================================
CREATE TABLE IF NOT EXISTS users (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT uq_users_email UNIQUE (email)
) ENGINE=InnoDB;

-- =========================================================
-- TABLE: categories
-- =========================================================
CREATE TABLE IF NOT EXISTS categories (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT uq_categories_name UNIQUE (name)
) ENGINE=InnoDB;

CREATE INDEX idx_categories_name ON categories (name);

-- =========================================================
-- TABLE: products
-- =========================================================
CREATE TABLE IF NOT EXISTS products (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(200) NOT NULL,
  image_path    VARCHAR(500) DEFAULT NULL,
  price         DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  category_id   BIGINT UNSIGNED NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT chk_products_price CHECK (price >= 0)
) ENGINE=InnoDB;

CREATE INDEX idx_products_name ON products (name);
CREATE INDEX idx_products_category_id ON products (category_id);
CREATE INDEX idx_products_price ON products (price);

-- =========================================================
-- Seed data (optional - for local testing)
-- =========================================================
-- INSERT INTO categories (name) VALUES ('Electronics'), ('Groceries'), ('Stationery');