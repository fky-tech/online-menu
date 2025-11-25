import { NextResponse } from 'next/server';
import { getUserFromRequest, isTenantAdmin } from '@/lib/auth';

export async function GET(request) {
    try {
        const authResult = await getUserFromRequest(request);

        if (!authResult.success || !isTenantAdmin(authResult.user)) {
            return NextResponse.json(
                { success: false, message: 'Tenant admin access required' },
                { status: 403 }
            );
        }

        const restaurantId = authResult.user.restaurant_id;

        const { getCurrentRestaurantSubscriptionModel } = await import('@/lib/models/supabaseSubscriptionsModel');
        const subscription = await getCurrentRestaurantSubscriptionModel(restaurantId);

        return NextResponse.json({
            success: true,
            data: subscription
        });
    } catch (error) {
        console.error('Error fetching subscription:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch subscription' },
            { status: 500 }
        );
    }
}
