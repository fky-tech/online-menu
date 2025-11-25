import { NextResponse } from 'next/server';
import { getUserFromRequest, isTenantAdmin } from '@/lib/auth';
import { supabaseAdmin, uploadFile, getPublicUrl } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET menu items
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

        const { getMenuItemsModel } = await import('@/lib/models/supabaseMenuItemsModel');
        const items = await getMenuItemsModel(restaurantId, language);

        return NextResponse.json({
            success: true,
            data: items
        });
    } catch (error) {
        console.error('Error fetching menu items:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch menu items' },
            { status: 500 }
        );
    }
}

// POST create menu item
export async function POST(request) {
    try {
        const authResult = await getUserFromRequest(request);

        if (!authResult.success || !isTenantAdmin(authResult.user)) {
            return NextResponse.json(
                { success: false, message: 'Tenant admin access required' },
                { status: 403 }
            );
        }

        const formData = await request.formData();
        const name = formData.get('name');
        const description = formData.get('description');
        const price = formData.get('price');
        const categoryId = formData.get('category_id');
        const imageFile = formData.get('image');
        const imageUrlParam = formData.get('image_url');
        const isAvailable = formData.get('is_available') !== 'false';

        const restaurantId = authResult.user.restaurant_id;

        if (!name || !price || !categoryId) {
            return NextResponse.json(
                { success: false, message: 'Name, price, and category are required' },
                { status: 400 }
            );
        }

        let imageUrl = imageUrlParam || null;
        if (imageFile) {
            const fileBuffer = await imageFile.arrayBuffer();
            const fileName = `${restaurantId}-${Date.now()}.${imageFile.name.split('.').pop()}`;
            await uploadFile('menu-images', fileName, Buffer.from(fileBuffer), {
                contentType: imageFile.type
            });
            imageUrl = getPublicUrl('menu-images', fileName);
        }

        const { data, error } = await supabaseAdmin
            .from('menu_items')
            .insert({
                restaurant_id: restaurantId,
                category_id: parseInt(categoryId),
                name,
                description: description || null,
                price: parseFloat(price),
                image_url: imageUrl,
                is_available: isAvailable
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: 'Menu item created successfully',
            data
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating menu item:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create menu item' },
            { status: 500 }
        );
    }
}
