import { createSubscriptionModel, updateSubscriptionModel, listSubscriptionsModel } from "../Models/subscriptionsModel.js";

export const createSubscription = async (req, res) => {
  try {
    if (req.admin?.role !== 'super_admin') return res.status(403).json({ success: false, message: 'Forbidden' });
    const { restaurant_id, package_type, start_date, end_date, status, amount_paid } = req.body;
    if (!restaurant_id || !package_type || !start_date || !status) {
      return res.status(400).json({ success: false, message: 'restaurant_id, package_type, start_date, status required' });
    }
    const sub = await createSubscriptionModel(restaurant_id, package_type, start_date, end_date || null, status, amount_paid || 0);
    res.status(201).json({ success: true, data: sub });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to create subscription' });
  }
};

export const updateSubscription = async (req, res) => {
  try {
    if (req.admin?.role !== 'super_admin') return res.status(403).json({ success: false, message: 'Forbidden' });
    const { id } = req.params;
    const updated = await updateSubscriptionModel(id, req.body || {});
    res.status(200).json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to update subscription' });
  }
};

export const listSubscriptions = async (req, res) => {
  try {
    if (req.admin?.role !== 'super_admin') return res.status(403).json({ success: false, message: 'Forbidden' });
    const { restaurant_id } = req.query;
    const rows = await listSubscriptionsModel(restaurant_id);
    res.status(200).json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch subscriptions' });
  }
};


