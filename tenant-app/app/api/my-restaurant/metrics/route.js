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

        if (!restaurantId) {
            return NextResponse.json(
                { success: false, message: 'Restaurant ID not found' },
                { status: 400 }
            );
        }

        // Import models dynamically
        const { getMenuItemsModel } = await import('@/lib/models/supabaseMenuItemsModel');
        const { getCategoriesModel } = await import('@/lib/models/supabaseCategoriesModel');
        const { getActiveSubscriptionModel } = await import('@/lib/models/supabaseSubscriptionsModel');

        const [menuItems, categories, subscription] = await Promise.all([
            getMenuItemsModel(restaurantId),
            getCategoriesModel(restaurantId),
            getActiveSubscriptionModel(restaurantId)
        ]);

        return NextResponse.json({
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
        return NextResponse.json(
            { success: false, message: 'Failed to load metrics' },
            { status: 500 }
        );
    }
}
