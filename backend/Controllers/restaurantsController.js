import { createRestaurantModel, getRestaurantBySlugModel, listRestaurantsModel, listActiveRestaurantsModel, getRestaurantByIdModel, deleteRestaurantByIdModel } from "../Models/restaurantsModel.js";
import { findAdminByEmail, createTenantAdmin } from "../Models/authModel.js";
import { storeAdminCredentials, listAllAdminCredentials } from "../Models/restaurantAdminCredentialsModel.js";
import { latestSubscriptionsForAllModel, createSubscriptionModel } from "../Models/subscriptionsModel.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

// Util: minimal slugify and unique slug helper
function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 60) || 'restaurant';
}

async function ensureUniqueSlug(base) {
  let candidate = base;
  let i = 1;
  while (await getRestaurantBySlugModel(candidate)) {
    i += 1;
    candidate = `${base}-${i}`;
  }
  return candidate;
}


// Admin-only create restaurant
export const createRestaurant = async (req, res) => {
    try {
        const { name, slug, description, logo_url, admin_email, package_type } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: "name is required" });
        }
        if (!admin_email) {
            return res.status(400).json({ success: false, message: "admin_email is required" });
        }
        const PACKAGES = {
            starter: { label: 'Starter Menu Package', years: 1 },
            premium: { label: 'Premium Menu Experience', years: 1 },
            ultimate: { label: 'Ultimate Brand + Website Package', years: 3 }
        };
        const pkgKey = (package_type || '').toLowerCase();
        if (!PACKAGES[pkgKey]) {
            return res.status(400).json({ success: false, message: "package_type is invalid. Use: starter | premium | ultimate" });
        }

        // Check if admin email already exists
        const existingAdmin = await findAdminByEmail(admin_email);
        if (existingAdmin) {
            return res.status(400).json({ success: false, message: "Admin email already registered" });
        }

        const requested = slug && slugify(slug);
        const base = requested || slugify(name);
        const uniqueSlug = await ensureUniqueSlug(base);
        const restaurant = await createRestaurantModel(name, uniqueSlug, description, logo_url);

        // Auto-provision tenant DB and save mapping
        try {
            const { provisionTenantForRestaurant } = await import('../Services/tenantProvisioner.js');
            await provisionTenantForRestaurant({ id: restaurant.id, slug: restaurant.slug });
        } catch (provisionErr) {
            console.error('Tenant provisioning failed:', provisionErr);
            return res.status(500).json({ success: false, message: "Restaurant created but tenant database provisioning failed. Please contact support." });
        }

        // Generate random password for tenant admin
        const plainPassword = crypto.randomBytes(12).toString('base64').slice(0, 16);
        const password_hash = await bcrypt.hash(plainPassword, 10);

        // Create tenant admin user
        await createTenantAdmin(name + ' Admin', admin_email, password_hash, restaurant.id);

        // Store credentials for super admin to copy
        await storeAdminCredentials(restaurant.id, admin_email, plainPassword);

        // Create initial subscription based on selected package
        const pkg = PACKAGES[pkgKey];
        const today = new Date();
        const endDate = new Date(today);
        endDate.setFullYear(endDate.getFullYear() + pkg.years);
        await createSubscriptionModel(
            restaurant.id,
            pkg.label,
            today.toISOString().slice(0,10),
            endDate.toISOString().slice(0,10),
            'active',
            0
        );

        res.status(201).json({
            success: true,
            data: {
                ...restaurant,
                admin_email,
                admin_password: plainPassword,
                package_type: pkg.label
            }
        });
    } catch (error) {
        console.error('Create restaurant error:', error);
        res.status(500).json({ success: false, message: "Failed to create restaurant" });
    }
};

// Admin list: if super_admin -> all with credentials, if tenant_admin -> only their restaurant
export const listRestaurants = async (req, res) => {
    try {
        const role = req.admin?.role;
        const rid = req.admin?.restaurant_id;
        const rows = await listRestaurantsModel();
        const filtered = role === 'tenant_admin' && rid
            ? rows.filter(r => r.id === Number(rid))
            : rows;

        // If super admin, attach admin credentials and latest subscription info
        if (role === 'super_admin') {
            const [credentials, subs] = await Promise.all([
                listAllAdminCredentials(),
                latestSubscriptionsForAllModel()
            ]);
            const credMap = new Map(credentials.map(c => [c.restaurant_id, c]));
            const subMap = new Map(subs.map(s => [s.restaurant_id, s]));
            const enriched = filtered.map(r => {
                const c = credMap.get(r.id);
                const s = subMap.get(r.id);
                // compute derived status and days_left
                const active = s ? (s.status === 'active' && (!s.end_date || new Date(s.end_date) >= new Date())) : false;
                let days_left = null;
                if (s && s.end_date) {
                    const diffMs = new Date(s.end_date) - new Date();
                    days_left = Math.ceil(diffMs / (1000*60*60*24));
                }
                return {
                    ...r,
                    admin_email: c?.admin_email || null,
                    admin_password: c?.plain_password || null,
                    package_type: s?.package_type || null,
                    subscription_status: active ? 'active' : 'expired',
                    days_left
                };
            });
            return res.status(200).json({ success: true, data: enriched });
        }

        res.status(200).json({ success: true, data: filtered });
    } catch (error) {
        console.error('List restaurants error:', error);
        res.status(500).json({ success: false, message: "Failed to list restaurants" });
    }
};

// Public: resolve slug to restaurant with minimal info
export const getRestaurantPublic = async (req, res) => {
    try {
        const { slug } = req.params;
        const restaurant = await getRestaurantBySlugModel(slug);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: "Restaurant not found" });
        }
        res.status(200).json({ success: true, data: restaurant });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch restaurant" });
    }
};

// Public directory: active restaurants only
export const listActiveRestaurants = async (_req, res) => {
    try {
        const rows = await listActiveRestaurantsModel();
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to list active restaurants" });
    }
};






// Super admin: delete restaurant entirely (and attempt to drop tenant DB)
export const deleteRestaurant = async (req, res) => {
  try {
    if (req.admin?.role !== 'super_admin') return res.status(403).json({ success: false, message: 'Forbidden' });
    const { id } = req.params;
    const rid = Number(id);
    if (!rid) return res.status(400).json({ success: false, message: 'Invalid id' });
    const restaurant = await getRestaurantByIdModel(rid);
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });

    try {
      const { deprovisionTenantForRestaurant } = await import('../Services/tenantProvisioner.js');
      await deprovisionTenantForRestaurant({ id: rid, slug: restaurant.slug });
    } catch (e) {
      console.warn('Deprovision tenant failed (continuing delete):', e?.message);
    }

    // Clean platform-side dependent rows first
    try {
      const { default: mySqlConnection } = await import('../Config/db.js');
      await mySqlConnection.query('DELETE FROM tenant_databases WHERE restaurant_id = ?', [rid]);
      await mySqlConnection.query('DELETE FROM restaurant_admin_credentials WHERE restaurant_id = ?', [rid]);
      await mySqlConnection.query('DELETE FROM subscriptions WHERE restaurant_id = ?', [rid]);
    } catch (e) {
      console.warn('Dependent row cleanup failed (continuing):', e?.message);
    }

    await deleteRestaurantByIdModel(rid);
    return res.status(200).json({ success: true, message: 'Restaurant deleted' });
  } catch (e) {
    console.error('Delete restaurant error:', e);
    return res.status(500).json({ success: false, message: 'Failed to delete restaurant' });
  }
};
