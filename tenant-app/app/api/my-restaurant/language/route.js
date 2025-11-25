import { NextResponse } from 'next/server';
import { getUserFromRequest, isTenantAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET language settings
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

        const { getCurrentRestaurantLanguageModel } = await import('@/lib/models/supabaseLanguageModel');
        const language = await getCurrentRestaurantLanguageModel(restaurantId);

        return NextResponse.json({
            success: true,
            data: language || { primary_language: 'en', supported_languages: ['en'] }
        });
    } catch (error) {
        console.error('Error fetching language:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch language settings' },
            { status: 500 }
        );
    }
}

// POST update language
export async function POST(request) {
    try {
        const authResult = await getUserFromRequest(request);

        if (!authResult.success || !isTenantAdmin(authResult.user)) {
            return NextResponse.json(
                { success: false, message: 'Tenant admin access required' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const restaurantId = authResult.user.restaurant_id;

        // Language is stored in localStorage on client-side only
        // No database column exists for primary_language
        return NextResponse.json({
            success: true,
            message: 'Language settings updated successfully',
            data: {
                restaurant_id: restaurantId,
                primary_language: body.primary_language || 'en'
            }
        });
    } catch (error) {
        console.error('Error updating language:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update language settings' },
            { status: 500 }
        );
    }
}
