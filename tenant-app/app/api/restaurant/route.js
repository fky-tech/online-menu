import { NextResponse } from 'next/server';
import { resolveRestaurantFromHost } from '@/lib/tenant';


export const dynamic = 'force-dynamic';
export async function GET(request) {
    try {
        const hostname = request.headers.get('host') || '';
        const headers = Object.fromEntries(request.headers.entries());

        const restaurant = await resolveRestaurantFromHost(hostname, headers);

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
        console.error('Error fetching restaurant:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch restaurant' },
            { status: 500 }
        );
    }
}
