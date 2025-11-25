import { NextResponse } from 'next/server';
import { getUserFromRequest, isTenantAdmin } from '@/lib/auth';
import { supabaseAdmin, uploadFile, getPublicUrl } from '@/lib/supabase';

export async function PUT(request, { params }) {
    const { id } = await params;

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
        const isAvailable = formData.get('is_available') !== 'false';

        const restaurantId = authResult.user.restaurant_id;

        const updateData = {
            name,
            description: description || null,
            price: parseFloat(price),
            category_id: parseInt(categoryId),
            is_available: isAvailable
        };

        if (imageFile) {
            const fileBuffer = await imageFile.arrayBuffer();
            const fileName = `${restaurantId}-${Date.now()}.${imageFile.name.split('.').pop()}`;
            await uploadFile('menu-items', fileName, Buffer.from(fileBuffer), {
                contentType: imageFile.type
            });
            updateData.image_url = getPublicUrl('menu-items', fileName);
        }

        const { data, error } = await supabaseAdmin
            .from('menu_items')
            .update(updateData)
            .eq('id', id)
            .eq('restaurant_id', restaurantId)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: 'Menu item updated successfully',
            data
        });
    } catch (error) {
        console.error('Error updating menu item:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update menu item' },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    const { id } = await params;

    try {
        const authResult = await getUserFromRequest(request);

        if (!authResult.success || !isTenantAdmin(authResult.user)) {
            return NextResponse.json(
                { success: false, message: 'Tenant admin access required' },
                { status: 403 }
            );
        }

        const { error } = await supabaseAdmin
            .from('menu_items')
            .delete()
            .eq('id', id)
            .eq('restaurant_id', authResult.user.restaurant_id);

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: 'Menu item deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to delete menu item' },
            { status: 500 }
        );
    }
}
