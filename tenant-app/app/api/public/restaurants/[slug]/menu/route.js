import { NextResponse } from 'next/server';
import { getRestaurantBySlug } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    try {
        const { slug } = await params;

        if (!slug) {
            return NextResponse.json(
                { success: false, message: 'Slug is required' },
                { status: 400 }
            );
        }

        const restaurant = await getRestaurantBySlug(slug);

        if (!restaurant) {
            return NextResponse.json(
                { success: false, message: 'Restaurant not found' },
                { status: 404 }
            );
        }

        // Import models dynamically
        const { getCategoriesModel } = await import('@/lib/models/supabaseCategoriesModel');
        const { getMenuItemsModel } = await import('@/lib/models/supabaseMenuItemsModel');

        const { searchParams } = new URL(request.url);
        const language = searchParams.get('language') || 'en';

        const categories = await getCategoriesModel(restaurant.id, language);
        const items = await getMenuItemsModel(restaurant.id, language);

        return NextResponse.json({
            success: true,
            data: {
                restaurant,
                categories,
                items
            }
        });
    } catch (error) {
        console.error('Public menu by slug error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch menu' },
            { status: 500 }
        );
    }
}
