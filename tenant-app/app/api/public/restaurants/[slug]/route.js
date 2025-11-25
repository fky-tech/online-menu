import { NextResponse } from 'next/server';
import { getRestaurantBySlug } from '@/lib/tenant';

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

        return NextResponse.json({
            success: true,
            data: restaurant
        });
    } catch (error) {
        console.error('Public restaurant by slug error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch restaurant' },
            { status: 500 }
        );
    }
}
