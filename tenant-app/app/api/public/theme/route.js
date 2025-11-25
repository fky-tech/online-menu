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

        const { getThemeModel } = await import('@/lib/models/supabaseThemeModel');
        const theme = await getThemeModel(restaurant.id);

        return NextResponse.json({
            success: true,
            data: theme || { theme_name: 'default', primary_color: '#F97316' }
        });
    } catch (error) {
        console.error('Error fetching public theme:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch theme' },
            { status: 500 }
        );
    }
}
