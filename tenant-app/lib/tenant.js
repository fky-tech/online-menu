import { supabaseAdmin } from './supabase';

// Get restaurant by slug
export async function getRestaurantBySlug(slug) {
    try {
        const { data, error } = await supabaseAdmin
            .from('restaurants')
            .select('*')
            .eq('slug', slug.toLowerCase())
            .single();

        if (error) {
            console.error('Error fetching restaurant by slug:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Restaurant fetch error:', error);
        return null;
    }
}

// Get active subscription for restaurant
export async function getActiveSubscription(restaurantId) {
    try {
        const { data, error } = await supabaseAdmin
            .from('subscriptions')
            .select('*')
            .eq('restaurant_id', restaurantId)
            .eq('is_active', true)
            .gte('end_date', new Date().toISOString())
            .single();

        if (error) {
            console.error('Error fetching active subscription:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Subscription fetch error:', error);
        return null;
    }
}

// Resolve restaurant from subdomain
export async function resolveRestaurantFromHost(host, headers = {}) {
    try {
        const hostname = host.toLowerCase();
        const xfh = (headers['x-forwarded-host'] || '').toLowerCase();
        const tenantSubdomain = headers['x-tenant-subdomain'];
        const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || '').toLowerCase();

        console.log('Resolving restaurant from host:', { hostname, xfh, tenantSubdomain, rootDomain });

        let slug = null;

        // 1) Try custom header first (from frontend)
        if (tenantSubdomain && typeof tenantSubdomain === 'string') {
            const cleanSubdomain = tenantSubdomain.toLowerCase().trim();
            if (cleanSubdomain && !['api', 'admin', 'www'].includes(cleanSubdomain)) {
                slug = cleanSubdomain;
                console.log('Using slug from X-Tenant-Subdomain header:', slug);
            }
        }

        // 2) Try subdomain of ROOT_DOMAIN
        if (!slug) {
            const tryParse = (h) => {
                if (!h) return null;
                if (rootDomain && h.endsWith(rootDomain)) {
                    const withoutRoot = h.slice(0, -rootDomain.length);
                    const trimmed = withoutRoot.replace(/\.$/, '');
                    if (trimmed && !['api', 'admin', 'www'].includes(trimmed)) {
                        return trimmed;
                    }
                    return null;
                }
                // Dev: *.localhost
                const localhostIdx = h.indexOf('.localhost');
                if (localhostIdx > 0) {
                    const subdomain = h.slice(0, localhostIdx);
                    if (!['api', 'admin', 'www'].includes(subdomain)) {
                        return subdomain;
                    }
                }
                return null;
            };

            slug = tryParse(hostname) || tryParse(xfh) || null;
            console.log('Parsed slug from subdomain:', slug);
        }

        if (!slug) {
            console.log('No slug resolved');
            return null;
        }

        console.log('Final resolved slug:', slug);

        const restaurant = await getRestaurantBySlug(slug);
        return restaurant;
    } catch (error) {
        console.error('Error resolving restaurant from host:', error);
        return null;
    }
}

// Detect host type (admin, root, tenant)
export function detectHostType(hostname) {
    const host = hostname.toLowerCase();
    const adminHost = (process.env.NEXT_PUBLIC_ADMIN_HOST || '').toLowerCase();
    const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || '').toLowerCase();

    // Check for admin host
    const isAdmin = adminHost
        ? host === adminHost || host.startsWith('admin.')
        : host.startsWith('admin.') || host === 'admin.localhost';

    // Check for root domain
    const isRoot = rootDomain
        ? (host === rootDomain || host === `www.${rootDomain}`)
        : host === 'localhost';

    if (isAdmin) return 'admin';
    if (isRoot && !host.includes('.') || host === 'localhost') return 'root';
    return 'tenant';
}
