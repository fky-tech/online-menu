import { NextResponse } from 'next/server';
import { getUserFromRequest, isTenantAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET theme for tenant restaurant
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

        const { getThemeModel } = await import('@/lib/models/supabaseThemeModel');
        const theme = await getThemeModel(restaurantId);

        return NextResponse.json({
            success: true,
            data: theme || { theme_name: 'default', primary_color: '#F97316' }
        });
    } catch (error) {
        console.error('Error fetching theme:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch theme' },
            { status: 500 }
        );
    }
}

// POST update theme
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

        const { data, error } = await supabaseAdmin
            .from('theme')
            .upsert({
                restaurant_id: restaurantId,
                ...body
            }, {
                onConflict: 'restaurant_id'
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: 'Theme updated successfully',
            data
        });
    } catch (error) {
        console.error('Error updating theme:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update theme' },
            { status: 500 }
        );
    }
}
