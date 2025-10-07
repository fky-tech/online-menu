import { countActiveTenantsModel, countExpiredTenantsModel, distributionByPlanModel, revenueTrendsModel } from "../Models/subscriptionsModel.js";

export const superAdminMetrics = async (req, res) => {
  try {
    // Role check here; host gating should be applied at router level too
    if (req.admin?.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const [active, expired, distribution, revenue] = await Promise.all([
      countActiveTenantsModel(),
      countExpiredTenantsModel(),
      distributionByPlanModel(),
      revenueTrendsModel(),
    ]);
    return res.status(200).json({
      success: true,
      data: {
        activeRestaurants: active,
        expiredRestaurants: expired,
        subscriptionDistribution: distribution,
        revenueTrends: revenue,
      }
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to load metrics' });
  }
};

export default { superAdminMetrics };

