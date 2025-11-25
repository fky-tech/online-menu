import { NextResponse } from 'next/server';
import { getUserFromRequest, isTenantAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';


export const dynamic = 'force-dynamic';
// GET all translations for restaurant
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

        const { getRestaurantTranslationsModel } = await import('@/lib/models/supabaseMenuItemTranslationModel');
        const translations = await getRestaurantTranslationsModel(restaurantId);

        return NextResponse.json({
            success: true,
            data: translations || []
        });
    } catch (error) {
        console.error('Error fetching translations:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch translations' },
            { status: 500 }
        );
    }
}

// POST batch update translations
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
        const { translations } = body;

        if (!translations || !Array.isArray(translations)) {
            return NextResponse.json(
                { success: false, message: 'Translations array is required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabaseAdmin
            .from('menu_item_translations')
            .upsert(translations, {
                onConflict: 'menu_item_id,language'
            })
            .select();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: 'Translations updated successfully',
            data
        });
    } catch (error) {
        console.error('Error updating translations:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update translations' },
            { status: 500 }
        );
    }
}
