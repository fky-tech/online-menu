import { getRestaurantBySlugModel } from "../Models/restaurantsModel.js";
import { getActiveSubscriptionModel } from "../Models/subscriptionsModel.js";

// Derive restaurantId from slug in route param or default slug from env
export const resolveRestaurantFromSlug = async (req, res, next) => {
  try {
    const slug = req.params.slug || req.query.slug || process.env.DEFAULT_RESTAURANT_SLUG || 'default';
    const restaurant = await getRestaurantBySlugModel(slug);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    req.restaurantId = restaurant.id;
    req.restaurant = restaurant;
    next();
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to resolve restaurant' });
  }
};

// For admin-scoped routes where restaurantId is provided explicitly in body/query
export const resolveRestaurantFromBodyOrQuery = async (req, res, next) => {
  try {
    // 1) If already resolved by earlier middleware (e.g., subdomain), honor it
    if (req.restaurantId) {
      return next();
    }

    // 2) If admin token includes tenant binding, use it
    if (req.admin && req.admin.restaurant_id) {
      req.restaurantId = Number(req.admin.restaurant_id);
      return next();
    }

    // 3) Fallback to explicit restaurant_id in body/query or slug param
    let restaurantId = req.body.restaurant_id || req.query.restaurant_id;
    if (!restaurantId && req.params.slug) {
      const restaurant = await getRestaurantBySlugModel(req.params.slug);
      if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
      restaurantId = restaurant.id;
      req.restaurant = restaurant;
    }
    if (!restaurantId) {
      return res.status(400).json({ success: false, message: 'restaurant_id is required' });
    }
    req.restaurantId = Number(restaurantId);
    next();
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to resolve restaurant' });
  }
};

// Detect tenant from request Host: supports subdomains of ROOT_DOMAIN and custom domains via TENANT_DOMAIN_MAP
export const resolveRestaurantFromSubdomain = async (req, res, next) => {
  try {
    const host = (req.headers.host || '').toLowerCase();
    const xfh = (req.headers['x-forwarded-host'] || '').toLowerCase(); // e.g., vite proxy preserves original
    const rootDomain = (process.env.ROOT_DOMAIN || '').toLowerCase();

    // 1) Try subdomain of ROOT_DOMAIN → <slug>.<rootDomain>
    let slug = null;
    const tryParse = (h) => {
      if (!h) return null;
      if (rootDomain && h.endsWith(rootDomain)) {
        const withoutRoot = h.slice(0, -rootDomain.length);
        const trimmed = withoutRoot.replace(/\.$/, '');
        return trimmed || null;
      }
      // Dev: *.localhost
      const localhostIdx = h.indexOf('.localhost');
      if (localhostIdx > 0) {
        return h.slice(0, localhostIdx);
      }
      return null;
    };

    slug = tryParse(host) || tryParse(xfh) || null;

    // 2) Try custom domains map from env: TENANT_DOMAIN_MAP='{"foodie.com":"pasta-house"}'
    if (!slug && process.env.TENANT_DOMAIN_MAP) {
      try {
        const map = JSON.parse(process.env.TENANT_DOMAIN_MAP);
        if (map && typeof map === 'object') {
          const mapped = map[host] || map[xfh];
          if (typeof mapped === 'string' && mapped.trim()) {
            slug = mapped.trim().toLowerCase();
          }
        }
      } catch (_e) {
        // ignore malformed env; fall through
      }
    }

    // 3) Local/dev fallback: allow slug via query or Referer
    if (!slug) {
      slug = req.query.slug || null;
    }
    if (!slug && req.headers.referer) {
      const ref = String(req.headers.referer).toLowerCase();
      const m = ref.match(/https?:\/\/([a-z0-9-]+)\.localhost/);
      if (m && m[1]) slug = m[1];
    }

    if (!slug) {
      return res.status(400).json({ success: false, message: 'Tenant not resolved from host' });
    }

    const restaurant = await getRestaurantBySlugModel(slug);
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    req.restaurantId = restaurant.id;
    req.restaurant = restaurant;
    next();
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to resolve tenant from host' });
  }
};

// Validate active subscription for public requests
export const validateActiveSubscription = async (req, res, next) => {
  try {
    const restaurantId = req.restaurantId;
    const active = await getActiveSubscriptionModel(restaurantId);
    if (!active) {
      return res.status(403).json({ success: false, message: 'This menu is unavailable. Please contact the restaurant.' });
    }
    next();
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Subscription check failed' });
  }
};



