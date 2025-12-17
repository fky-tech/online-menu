import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getUserFromRequest, isSuperAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
export async function GET(request) {
    try {
        const authResult = await getUserFromRequest(request);

        if (!authResult.success || !isSuperAdmin(authResult.user)) {
            return NextResponse.json(
                { success: false, message: 'Super admin access required' },
                { status: 403 }
            );
        }

        // Import models dynamically
        const {
            countActiveTenantsModel,
            countExpiredTenantsModel,
            distributionByPlanModel,
            revenueTrendsModel,
            getExpiringSubscriptionsModel
        } = await import('@/lib/models/supabaseSubscriptionsModel');

        const { listRestaurantsModel } = await import('@/lib/models/supabaseRestaurantsModel');

        const [active, expired, distribution, revenue, expiring, totalRestaurants] = await Promise.all([
            countActiveTenantsModel(),
            countExpiredTenantsModel(),
            distributionByPlanModel(),
            revenueTrendsModel(),
            getExpiringSubscriptionsModel(30),
            listRestaurantsModel()
        ]);

        return NextResponse.json({
            success: true,
            data: {
                activeRestaurants: active,
                expiredRestaurants: expired,
                totalRestaurants: totalRestaurants?.length || 0,
                subscriptionDistribution: distribution,
                revenueTrends: revenue,
                expiringSubscriptions: expiring
            }
        });
    } catch (error) {
        console.error('Error loading super admin metrics:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to load metrics' },
            { status: 500 }
        );
    }
}
