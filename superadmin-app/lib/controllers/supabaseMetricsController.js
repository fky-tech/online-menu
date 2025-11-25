import {
    countActiveTenantsModel,
    countExpiredTenantsModel,
    distributionByPlanModel,
    revenueTrendsModel,
    getExpiringSubscriptionsModel
} from "../Models/supabaseSubscriptionsModel.js";

import { listRestaurantsModel } from "../Models/supabaseRestaurantsModel.js";
import { getSupabaseUsage } from "../Config/supabase.js";

export const superAdminMetrics = async (req, res) => {
    try {
        // Role check - only super admin can access metrics
        if (req.user?.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: Super admin access required' });
        }

        const [active, expired, distribution, revenue, expiring, totalRestaurants, supabaseUsage] = await Promise.all([
            countActiveTenantsModel(),
            countExpiredTenantsModel(),
            distributionByPlanModel(),
            revenueTrendsModel(),
            getExpiringSubscriptionsModel(30), // Expiring in next 30 days
            listRestaurantsModel(),
            getSupabaseUsage()
        ]);

        return res.status(200).json({
            success: true,
            data: {
                activeRestaurants: active,
                expiredRestaurants: expired,
                totalRestaurants: totalRestaurants?.length || 0,
                subscriptionDistribution: distribution,
                revenueTrends: revenue,
                expiringSubscriptions: expiring,
                supabaseUsage: supabaseUsage
            }
        });
    } catch (error) {
        console.error('Error loading super admin metrics:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to load metrics' 
        });
    }
};

// Get tenant admin metrics (for their own restaurant)
export const tenantAdminMetrics = async (req, res) => {
    try {
        const restaurantId = req.user?.restaurant_id;

        if (!restaurantId) {
            return res.status(400).json({ 
                success: false, 
                message: "Restaurant ID not found" 
            });
        }

        // Import models dynamically to avoid circular dependencies
        const { getMenuItemsModel } = await import('../Models/supabaseMenuItemsModel.js');
        const { getCategoriesModel } = await import('../Models/supabaseCategoriesModel.js');
        const { getActiveSubscriptionModel } = await import('../Models/supabaseSubscriptionsModel.js');

        const [menuItems, categories, subscription] = await Promise.all([
            getMenuItemsModel(restaurantId),
            getCategoriesModel(restaurantId),
            getActiveSubscriptionModel(restaurantId)
        ]);

        return res.status(200).json({
            success: true,
            data: {
                totalMenuItems: menuItems?.length || 0,
                totalCategories: categories?.length || 0,
                activeSubscription: subscription,
                subscriptionStatus: subscription ? 'active' : 'expired'
            }
        });
    } catch (error) {
        console.error('Error loading tenant admin metrics:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to load metrics' 
        });
    }
};

export default { superAdminMetrics, tenantAdminMetrics };
