import { NextResponse } from 'next/server';
import { resolveRestaurantFromHost } from '@/lib/tenant';

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

        // Import language model
        const { getLanguageModel } = await import('@/lib/models/supabaseLanguageModel');

        const languageData = await getLanguageModel(restaurant.id);

        return NextResponse.json({
            success: true,
            data: languageData || { primary_language: 'en', supported_languages: ['en'] }
        });
    } catch (error) {
        console.error('Public language error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch language settings' },
            { status: 500 }
        );
    }
}
