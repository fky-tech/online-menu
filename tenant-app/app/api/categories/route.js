import { NextResponse } from 'next/server';
import { getUserFromRequest, isTenantAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET categories for tenant admin
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
        const { searchParams } = new URL(request.url);
        const language = searchParams.get('language') || 'en';

        const { getCategoriesModel } = await import('@/lib/models/supabaseCategoriesModel');
        const categories = await getCategoriesModel(restaurantId, language);

        return NextResponse.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}

// POST create category
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
        const { name, description } = body;
        const restaurantId = authResult.user.restaurant_id;

        if (!name) {
            return NextResponse.json(
                { success: false, message: 'Name is required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabaseAdmin
            .from('categories')
            .insert({
                restaurant_id: restaurantId,
                name,
                description: description || null
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: 'Category created successfully',
            data
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create category' },
            { status: 500 }
        );
    }
}
