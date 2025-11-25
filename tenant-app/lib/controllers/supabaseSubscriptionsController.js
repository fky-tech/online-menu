import {
    createSubscriptionModel,
    updateSubscriptionModel,
    listSubscriptionsModel,
    getSubscriptionByIdModel,
    deleteSubscriptionModel,
    getActiveSubscriptionModel,
    getRestaurantSubscriptionsModel
} from "../Models/supabaseSubscriptionsModel.js";

// Create new subscription (super admin only)
export const createSubscription = async (req, res) => {
    try {
        // Check if user is super admin
        if (req.user?.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: Super admin access required' });
        }

        const { restaurant_id, package_name, start_date, end_date, status, price } = req.body;
        
        if (!restaurant_id || !package_name || !start_date || !end_date) {
            return res.status(400).json({ 
                success: false, 
                message: 'restaurant_id, package_name, start_date, and end_date are required' 
            });
        }

        const subscription = await createSubscriptionModel(
            restaurant_id, 
            package_name, 
            start_date, 
            end_date, 
            status || 'active', 
            price || 0
        );

        res.status(201).json({
            success: true,
            message: "Subscription created successfully",
            data: subscription
        });
    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Failed to create subscription" 
        });
    }
};

// Update subscription (super admin only)
export const updateSubscription = async (req, res) => {
    try {
        // Check if user is super admin
        if (req.user?.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: Super admin access required' });
        }

        const { id } = req.params;
        const updates = req.body;

        const subscription = await updateSubscriptionModel(id, updates);

        res.status(200).json({
            success: true,
            message: "Subscription updated successfully",
            data: subscription
        });
    } catch (error) {
        console.error('Error updating subscription:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Failed to update subscription" 
        });
    }
};

// List all subscriptions (super admin only)
export const listSubscriptions = async (req, res) => {
    try {
        // Check if user is super admin
        if (req.user?.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: Super admin access required' });
        }

        const subscriptions = await listSubscriptionsModel();

        res.status(200).json({
            success: true,
            data: subscriptions
        });
    } catch (error) {
        console.error('Error listing subscriptions:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch subscriptions" 
        });
    }
};

// Get subscription by ID (super admin only)
export const getSubscriptionById = async (req, res) => {
    try {
        // Check if user is super admin
        if (req.user?.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: Super admin access required' });
        }

        const { id } = req.params;
        const subscription = await getSubscriptionByIdModel(id);

        if (!subscription) {
            return res.status(404).json({ 
                success: false, 
                message: "Subscription not found" 
            });
        }

        res.status(200).json({
            success: true,
            data: subscription
        });
    } catch (error) {
        console.error('Error getting subscription:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch subscription" 
        });
    }
};

// Delete subscription (super admin only)
export const deleteSubscription = async (req, res) => {
    try {
        // Check if user is super admin
        if (req.user?.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: Super admin access required' });
        }

        const { id } = req.params;
        await deleteSubscriptionModel(id);

        res.status(200).json({
            success: true,
            message: "Subscription deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting subscription:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to delete subscription" 
        });
    }
};

// Get active subscription for restaurant (tenant admin can access their own)
export const getActiveSubscription = async (req, res) => {
    try {
        const { restaurant_id } = req.params;
        const userRestaurantId = req.user?.restaurant_id;

        // Super admin can access any restaurant, tenant admin can only access their own
        if (req.user?.role !== 'super_admin' && userRestaurantId !== parseInt(restaurant_id)) {
            return res.status(403).json({ success: false, message: 'Forbidden: Access denied' });
        }

        const subscription = await getActiveSubscriptionModel(restaurant_id);

        if (!subscription) {
            return res.status(404).json({ 
                success: false, 
                message: "No active subscription found" 
            });
        }

        res.status(200).json({
            success: true,
            data: subscription
        });
    } catch (error) {
        console.error('Error getting active subscription:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch active subscription" 
        });
    }
};

// Get all subscriptions for restaurant (tenant admin can access their own)
export const getRestaurantSubscriptions = async (req, res) => {
    try {
        const { restaurant_id } = req.params;
        const userRestaurantId = req.user?.restaurant_id;

        // Super admin can access any restaurant, tenant admin can only access their own
        if (req.user?.role !== 'super_admin' && userRestaurantId !== parseInt(restaurant_id)) {
            return res.status(403).json({ success: false, message: 'Forbidden: Access denied' });
        }

        const subscriptions = await getRestaurantSubscriptionsModel(restaurant_id);

        res.status(200).json({
            success: true,
            data: subscriptions
        });
    } catch (error) {
        console.error('Error getting restaurant subscriptions:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch restaurant subscriptions" 
        });
    }
};

// Get current restaurant subscription (for tenant admin)
export const getCurrentRestaurantSubscription = async (req, res) => {
    try {
        const restaurantId = req.user?.restaurant_id;

        if (!restaurantId) {
            return res.status(400).json({ 
                success: false, 
                message: "Restaurant ID not found in user context" 
            });
        }

        const subscription = await getActiveSubscriptionModel(restaurantId);

        res.status(200).json({
            success: true,
            data: subscription
        });
    } catch (error) {
        console.error('Error getting current restaurant subscription:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch subscription" 
        });
    }
};
