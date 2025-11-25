import { NextResponse } from 'next/server';
import { resolveRestaurantFromHost } from '@/lib/tenant';

export async function GET(request) {
    try {
        const hostname = request.headers.get('host') || '';
        const headers = Object.fromEntries(request.headers.entries());

        const restaurant = await resolveRestaurantFromHost(hostname, headers);

        if (!restaurant) {
            console.log('Restaurant not found for hostname:', hostname);
            return NextResponse.json(
                { success: false, message: 'Restaurant not found' },
                { status: 404 }
            );
        }
        console.log('Found restaurant:', restaurant.name, 'ID:', restaurant.id);

        // Import models dynamically
        const { getCategoriesModel } = await import('@/lib/models/supabaseCategoriesModel');
        const { getMenuItemsModel } = await import('@/lib/models/supabaseMenuItemsModel');

        const { searchParams } = new URL(request.url);
        const language = searchParams.get('language') || 'en';

        console.log('Menu API - Language requested:', language);
        console.log('Menu API - Restaurant:', restaurant.name, 'ID:', restaurant.id);

        const categories = await getCategoriesModel(restaurant.id, language);
        const items = await getMenuItemsModel(restaurant.id, language);

        console.log('Menu API - Fetched categories:', categories.length, 'items:', items.length);

        return NextResponse.json({
            success: true,
            data: {
                restaurant,
                categories,
                items
            }
        }, {
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            },
        });
    } catch (error) {
        console.error('Public menu error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch menu' },
            { status: 500 }
        );
    }
}
