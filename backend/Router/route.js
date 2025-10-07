import express from "express";
import {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} from "../Controllers/categoriesController.js";
import {
        getMenuItems,
        getMenuItemsByCategory,
        getMenuItemById,
        createMenuItem,
        updateMenuItem,
        deleteMenuItem
} from "../Controllers/menuItemsController.js";
import multer from 'multer';
import path from 'path';

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(process.cwd(), 'uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage });
import { loginAdmin, registerAdmin, createTenantAdminController, whoAmI } from "../Controllers/authController.js";
import { verifyToken } from "../Middleware/authMiddleware.js";
import { resolveRestaurantFromSlug, resolveRestaurantFromBodyOrQuery, resolveRestaurantFromSubdomain, validateActiveSubscription } from "../Middleware/tenantMiddleware.js";
import { createSubscription, updateSubscription, listSubscriptions } from "../Controllers/subscriptionsController.js";
import { createRestaurant, listRestaurants, getRestaurantPublic, listActiveRestaurants, deleteRestaurant } from "../Controllers/restaurantsController.js";
import { superAdminMetrics } from "../Controllers/metricsController.js";
import { adminHostGate } from "../Middleware/hostMiddleware.js";
import { tenantRateLimit } from "../Middleware/rateLimitMiddleware.js";
import { attachTenantDb } from "../Middleware/tenantDbMiddleware.js";

const router = express.Router();


//-----Category-------//

// Public categories via subdomain (no slug in path)
router.get("/categories", resolveRestaurantFromSubdomain, attachTenantDb, tenantRateLimit, validateActiveSubscription, getCategories);

// Public category by ID via subdomain
router.get("/categories/:id", resolveRestaurantFromSubdomain, attachTenantDb, tenantRateLimit, validateActiveSubscription, getCategoryById);

// Create new category (admin) requires explicit restaurant
router.post("/categories", verifyToken, resolveRestaurantFromBodyOrQuery, attachTenantDb, createCategory);

// Update category by ID (admin)
router.put("/categories/:id", verifyToken, resolveRestaurantFromBodyOrQuery, attachTenantDb, updateCategory);

// Delete category by ID (admin)
router.delete("/categories/:id", verifyToken, resolveRestaurantFromBodyOrQuery, attachTenantDb, deleteCategory);

// Also provide slug-based admin reads (used by frontend AdminTenant)
router.get('/restaurants/:slug/categories', verifyToken, resolveRestaurantFromSlug, attachTenantDb, getCategories);


// ------- menu items --------//

// Public menu items via subdomain
router.get("/menu-items", resolveRestaurantFromSubdomain, attachTenantDb, tenantRateLimit, validateActiveSubscription, getMenuItems);

// Public menu items by category via subdomain
router.get("/menu-items/category/:categoryId", resolveRestaurantFromSubdomain, attachTenantDb, tenantRateLimit, validateActiveSubscription, getMenuItemsByCategory);

// Public single menu item by ID via subdomain
router.get("/menu-items/:id", resolveRestaurantFromSubdomain, attachTenantDb, tenantRateLimit, validateActiveSubscription, getMenuItemById);

// Create new menu item (admin) - restaurant provided explicitly
router.post("/menu-items", verifyToken, resolveRestaurantFromBodyOrQuery, attachTenantDb, upload.single('image'), createMenuItem);

// Update menu item (admin)
router.put("/menu-items/:id", verifyToken, resolveRestaurantFromBodyOrQuery, attachTenantDb, upload.single('image'), updateMenuItem);

// Delete menu item (admin)
router.delete("/menu-items/:id", verifyToken, resolveRestaurantFromBodyOrQuery, attachTenantDb, deleteMenuItem);

// Slug-based admin reads for items
router.get('/restaurants/:slug/menu-items', verifyToken, resolveRestaurantFromSlug, attachTenantDb, getMenuItems);

// ===== auth & admin ========== //

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get('/me', verifyToken, whoAmI);
router.post('/tenant-admins', verifyToken, createTenantAdminController);

// Admin restaurants mgmt
router.post('/restaurants', verifyToken, createRestaurant);
router.get('/restaurants', verifyToken, listRestaurants);
router.get('/restaurants/:slug', verifyToken, getRestaurantPublic);

router.delete('/restaurants/:id', verifyToken, deleteRestaurant);

// Public resolve restaurant by subdomain
router.get('/restaurant', resolveRestaurantFromSubdomain, (req, res) => {
    return res.status(200).json({ success: true, data: req.restaurant });
});

// Public composite menu endpoint via subdomain
router.get('/public/menu', resolveRestaurantFromSubdomain, attachTenantDb, tenantRateLimit, validateActiveSubscription, async (req, res) => {
    try {
        const { restaurantId, db } = req;
        const categoriesModel = await import('../Models/categoriesModel.js');
        const menuItemsModel = await import('../Models/menuItemsModel.js');
        const cats = await categoriesModel.getCategoriesModel(restaurantId, db);
        const items = await menuItemsModel.getMenuItemsModel(restaurantId, db);
        res.status(200).json({ success: true, data: { restaurant: req.restaurant, categories: cats, items } });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Failed to fetch menu' });
    }
});

// Public restaurant directory
router.get('/public/restaurants', tenantRateLimit, listActiveRestaurants);

// ===== subscriptions (super admin) =====
router.post('/subscriptions', verifyToken, createSubscription);
router.put('/subscriptions/:id', verifyToken, updateSubscription);
router.get('/subscriptions', verifyToken, listSubscriptions);

// ===== tenant DB config (super admin on admin host) =====
import { setTenantDbConfig } from "../Controllers/tenantDbController.js";
router.post('/tenants/:restaurantId/db', verifyToken, adminHostGate, setTenantDbConfig);

// ===== super admin metrics (host-gated) =====
router.get('/super/metrics', verifyToken, adminHostGate, superAdminMetrics);

export default router;
