import { supabaseAdmin } from '../supabase.js';

// Create new subscription
export const createSubscriptionModel = async (restaurantId, packageName, startDate, endDate, status = 'active', price = 0) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        restaurant_id: restaurantId,
        package_name: packageName,
        start_date: startDate,
        end_date: endDate,
        status,
        price
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

// Get subscription by ID
export const getSubscriptionByIdModel = async (id) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting subscription by ID:', error);
    throw error;
  }
};

// Get active subscription for restaurant
export const getActiveSubscriptionModel = async (restaurantId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('status', 'active')
      .gte('end_date', new Date().toISOString().split('T')[0])
      .order('end_date', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting active subscription:', error);
    throw error;
  }
};

// Get all subscriptions for restaurant
export const getRestaurantSubscriptionsModel = async (restaurantId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting restaurant subscriptions:', error);
    throw error;
  }
};

// List all subscriptions (super admin)
// export const listSubscriptionsModel = async () => {
//   try {
//     const { data, error } = await supabaseAdmin
//       .from('subscriptions')
//       .select(`
//         *,
//         restaurants(name, slug)
//       `)
//       .order('created_at', { ascending: false });

//     if (error) throw error;
//     return data || [];
//   } catch (error) {
//     console.error('Error listing subscriptions:', error);
//     throw error;
//   }
// };

export const listSubscriptionsModel = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .select(`
        *,
        restaurants (
          id,
          name,
          slug,
          restaurant_admin_credentials:restaurant_admin_credentials (
            admin_email,
            plain_password
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error listing subscriptions:', error);
    throw error;
  }
};


// Update subscription
export const updateSubscriptionModel = async (id, updates) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

// Delete subscription
export const deleteSubscriptionModel = async (id) => {
  try {
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting subscription:', error);
    throw error;
  }
};

// Check if restaurant has active subscription
export const hasActiveSubscriptionModel = async (restaurantId) => {
  try {
    const subscription = await getActiveSubscriptionModel(restaurantId);
    return !!subscription;
  } catch (error) {
    console.error('Error checking active subscription:', error);
    return false;
  }
};

// Get subscription statistics (super admin)
export const getSubscriptionStatsModel = async () => {
  try {
    const { data: totalSubs, error: totalError } = await supabaseAdmin
      .from('subscriptions')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    const { data: activeSubs, error: activeError } = await supabaseAdmin
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .gte('end_date', new Date().toISOString().split('T')[0]);

    if (activeError) throw activeError;

    const { data: expiredSubs, error: expiredError } = await supabaseAdmin
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .lt('end_date', new Date().toISOString().split('T')[0]);

    if (expiredError) throw expiredError;

    return {
      total: totalSubs || 0,
      active: activeSubs || 0,
      expired: expiredSubs || 0
    };
  } catch (error) {
    console.error('Error getting subscription stats:', error);
    throw error;
  }
};

// Extend subscription
export const extendSubscriptionModel = async (restaurantId, additionalDays) => {
  try {
    const activeSubscription = await getActiveSubscriptionModel(restaurantId);
    
    if (!activeSubscription) {
      throw new Error('No active subscription found');
    }

    const currentEndDate = new Date(activeSubscription.end_date);
    const newEndDate = new Date(currentEndDate.getTime() + (additionalDays * 24 * 60 * 60 * 1000));

    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        end_date: newEndDate.toISOString().split('T')[0]
      })
      .eq('id', activeSubscription.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error extending subscription:', error);
    throw error;
  }
};

// Get expiring subscriptions (within X days)
export const getExpiringSubscriptionsModel = async (daysAhead = 30) => {
  try {
    const today = new Date();
    const futureDate = new Date(today.getTime() + (daysAhead * 24 * 60 * 60 * 1000));

    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .select(`
        *,
        restaurants(name, slug)
      `)
      .eq('status', 'active')
      .gte('end_date', today.toISOString().split('T')[0])
      .lte('end_date', futureDate.toISOString().split('T')[0])
      .order('end_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting expiring subscriptions:', error);
    throw error;
  }
};

// Count active tenants (for metrics)
export const countActiveTenantsModel = async () => {
  try {
    const { count, error } = await supabaseAdmin
      .from('subscriptions')
      .select('restaurant_id', { count: 'exact', head: true })
      .eq('status', 'active')
      .gte('end_date', new Date().toISOString().split('T')[0]);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error counting active tenants:', error);
    return 0;
  }
};

// Count expired tenants (for metrics)
export const countExpiredTenantsModel = async () => {
  try {
    const { count, error } = await supabaseAdmin
      .from('subscriptions')
      .select('restaurant_id', { count: 'exact', head: true })
      .lt('end_date', new Date().toISOString().split('T')[0]);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error counting expired tenants:', error);
    return 0;
  }
};

// Get subscription distribution by plan (for metrics)
export const distributionByPlanModel = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .select('package_name')
      .eq('status', 'active')
      .gte('end_date', new Date().toISOString().split('T')[0]);

    if (error) throw error;

    // Count occurrences of each package
    const distribution = {};
    (data || []).forEach(sub => {
      const plan = sub.package_name || 'Unknown';
      distribution[plan] = (distribution[plan] || 0) + 1;
    });

    return Object.entries(distribution).map(([plan, count]) => ({
      plan,
      count
    }));
  } catch (error) {
    console.error('Error getting distribution by plan:', error);
    return [];
  }
};

// Get revenue trends (for metrics)
export const revenueTrendsModel = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .select('price, created_at, package_name')
      .order('created_at', { ascending: false })
      .limit(100); // Last 100 subscriptions

    if (error) throw error;

    // Group by month
    const monthlyRevenue = {};
    (data || []).forEach(sub => {
      const month = new Date(sub.created_at).toISOString().slice(0, 7); // YYYY-MM
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (sub.price || 0);
    });

    return Object.entries(monthlyRevenue)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month));
  } catch (error) {
    console.error('Error getting revenue trends:', error);
    return [];
  }
};

