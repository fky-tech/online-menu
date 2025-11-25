import { getUserFromJWT, getUserMetadata, supabaseAdmin, createUserClient } from './supabase';

// Verify Supabase token and return user data
export async function verifySupabaseToken(token) {
    if (!token) {
        return { success: false, message: 'No token provided' };
    }

    try {
        const user = await getUserFromJWT(token);
        if (!user) {
            return { success: false, message: 'Invalid or expired token' };
        }

        // Get user metadata (role, restaurant_id)
        const userMetadata = await getUserMetadata(user.id);
        if (!userMetadata) {
            return { success: false, message: 'User metadata not found' };
        }

        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                role: userMetadata.role,
                restaurant_id: userMetadata.restaurant_id,
                name: userMetadata.name
            },
            supabaseClient: createUserClient(token)
        };
    } catch (error) {
        console.error('Supabase auth error:', error);
        return { success: false, message: 'Authentication failed' };
    }
}

// Check if user is super admin
export function isSuperAdmin(user) {
    return user && user.role === 'super_admin';
}

// Check if user is tenant admin
export function isTenantAdmin(user) {
    return user && user.role === 'tenant_admin';
}

// Check if user has access to a specific restaurant
export function hasRestaurantAccess(user, restaurantId) {
    if (!user) return false;

    // Super admins can access any restaurant
    if (user.role === 'super_admin') return true;

    // Tenant admins can only access their own restaurant
    if (user.role === 'tenant_admin' && user.restaurant_id) {
        return user.restaurant_id.toString() === restaurantId?.toString();
    }

    return false;
}

// Extract auth token from request headers
export function getAuthToken(request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

    return parts[1];
}

// Get user from request (for API routes)
export async function getUserFromRequest(request) {
    const token = getAuthToken(request);
    if (!token) {
        return { success: false, message: 'No authentication token' };
    }

    return await verifySupabaseToken(token);
}

// Helper to ensure user metadata exists
export async function ensureUserMetadata(userId, email, userMetadata) {
    try {
        // Check if user metadata already exists
        let metadata = await getUserMetadata(userId);

        if (!metadata) {
            // Create new user metadata
            const role = userMetadata?.role || 'tenant_admin';
            const restaurantId = userMetadata?.restaurant_id || null;
            const name = userMetadata?.name || email;

            const { data, error } = await supabaseAdmin
                .from('users')
                .insert({
                    id: userId,
                    email,
                    role,
                    restaurant_id: restaurantId,
                    name
                })
                .select()
                .single();

            if (error) throw error;
            metadata = data;
        }

        return metadata;
    } catch (error) {
        console.error('Error ensuring user metadata:', error);
        return null;
    }
}
