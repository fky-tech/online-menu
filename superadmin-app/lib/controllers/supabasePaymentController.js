import {
    getPaymentModel,
    getPaymentByIdModel,
    upsertPaymentModel,
    updatePaymentModel,
    deletePaymentModel,
    listAllPaymentModel,
    getActivePaymentMethodsModel
} from "../Models/supabasePaymentModel.js";

// Get payment info for restaurant (super admin or tenant admin for their restaurant)
export const getPayment = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const userRestaurantId = req.user?.restaurant_id;

        // Super admin can access any restaurant, tenant admin can only access their own
        if (req.user?.role !== 'super_admin' && userRestaurantId !== parseInt(restaurantId)) {
            return res.status(403).json({ success: false, message: 'Forbidden: Access denied' });
        }

        const payments = await getPaymentModel(restaurantId);

        res.status(200).json({
            success: true,
            data: payments
        });
    } catch (error) {
        console.error('Error getting payment info:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch payment information" 
        });
    }
};

// Create payment method (super admin or tenant admin for their restaurant)
export const upsertPayment = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const userRestaurantId = req.user?.restaurant_id;
        const paymentData = req.body;

        // Super admin can access any restaurant, tenant admin can only access their own
        if (req.user?.role !== 'super_admin' && userRestaurantId !== parseInt(restaurantId)) {
            return res.status(403).json({ success: false, message: 'Forbidden: Access denied' });
        }

        if (!paymentData.payment_method || !paymentData.account_details) {
            return res.status(400).json({ 
                success: false, 
                message: "Payment method and account details are required" 
            });
        }

        const payment = await upsertPaymentModel(restaurantId, paymentData, req.file);

        res.status(201).json({
            success: true,
            message: "Payment method created successfully",
            data: payment
        });
    } catch (error) {
        console.error('Error creating payment method:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Failed to create payment method" 
        });
    }
};

// Update payment method
export const updatePayment = async (req, res) => {
    try {
        const { restaurantId, id } = req.params;
        const userRestaurantId = req.user?.restaurant_id;
        const updates = req.body;

        // Super admin can access any restaurant, tenant admin can only access their own
        if (req.user?.role !== 'super_admin' && userRestaurantId !== parseInt(restaurantId)) {
            return res.status(403).json({ success: false, message: 'Forbidden: Access denied' });
        }

        const payment = await updatePaymentModel(restaurantId, id, updates, req.file);

        res.status(200).json({
            success: true,
            message: "Payment method updated successfully",
            data: payment
        });
    } catch (error) {
        console.error('Error updating payment method:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Failed to update payment method" 
        });
    }
};

// Delete payment method (super admin or tenant admin for their restaurant)
export const deletePayment = async (req, res) => {
    try {
        const { restaurantId, id } = req.params;
        const userRestaurantId = req.user?.restaurant_id;

        // Super admin can access any restaurant, tenant admin can only access their own
        if (req.user?.role !== 'super_admin' && userRestaurantId !== parseInt(restaurantId)) {
            return res.status(403).json({ success: false, message: 'Forbidden: Access denied' });
        }

        await deletePaymentModel(restaurantId, id);

        res.status(200).json({
            success: true,
            message: "Payment method deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting payment method:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to delete payment method" 
        });
    }
};

// List all payment methods (super admin only)
export const listAllPayment = async (req, res) => {
    try {
        // Check if user is super admin
        if (req.user?.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: Super admin access required' });
        }

        const payments = await listAllPaymentModel();

        res.status(200).json({
            success: true,
            data: payments
        });
    } catch (error) {
        console.error('Error listing all payment methods:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch payment methods" 
        });
    }
};

// Get current restaurant payment info (for tenant admin)
export const getCurrentRestaurantPayment = async (req, res) => {
    try {
        const restaurantId = req.user?.restaurant_id || req.restaurantId;

        if (!restaurantId) {
            return res.status(400).json({ 
                success: false, 
                message: "Restaurant ID not found" 
            });
        }

        const payments = await getPaymentModel(restaurantId);

        res.status(200).json({
            success: true,
            data: payments
        });
    } catch (error) {
        console.error('Error getting current restaurant payment info:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch payment information" 
        });
    }
};

// Update current restaurant payment info (for tenant admin)
export const updateCurrentRestaurantPayment = async (req, res) => {
    try {
        const restaurantId = req.user?.restaurant_id || req.restaurantId;
        const paymentData = req.body;

        if (!restaurantId) {
            return res.status(400).json({ 
                success: false, 
                message: "Restaurant ID not found" 
            });
        }

        if (!paymentData.payment_method || !paymentData.account_details) {
            return res.status(400).json({ 
                success: false, 
                message: "Payment method and account details are required" 
            });
        }

        const payment = await upsertPaymentModel(restaurantId, paymentData, req.file);

        res.status(200).json({
            success: true,
            message: "Payment information updated successfully",
            data: payment
        });
    } catch (error) {
        console.error('Error updating current restaurant payment info:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Failed to update payment information" 
        });
    }
};

// Get active payment methods for public display
export const getActivePaymentMethods = async (req, res) => {
    try {
        const restaurantId = req.restaurantId;

        if (!restaurantId) {
            return res.status(400).json({ 
                success: false, 
                message: "Restaurant ID not found" 
            });
        }

        const payments = await getActivePaymentMethodsModel(restaurantId);

        res.status(200).json({
            success: true,
            data: payments
        });
    } catch (error) {
        console.error('Error getting active payment methods:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch payment methods" 
        });
    }
};
