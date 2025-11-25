import { NextResponse } from 'next/server';
import { getUserFromRequest, isTenantAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

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

        const body = await request.json();
        const { name, description } = body;

        const { data, error } = await supabaseAdmin
            .from('categories')
            .update({
                name,
                description: description || null
            })
            .eq('id', id)
            .eq('restaurant_id', authResult.user.restaurant_id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: 'Category updated successfully',
            data
        });
    } catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update category' },
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
            .from('categories')
            .delete()
            .eq('id', id)
            .eq('restaurant_id', authResult.user.restaurant_id);

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to delete category' },
            { status: 500 }
        );
    }
}
