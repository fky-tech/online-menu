import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function DELETE(request, { params }) {
    try {
        const authResult = await getUserFromRequest(request);
        if (!authResult.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = authResult.user;
        const { id } = await params;

        // Check for menu items first
        const { data: menuItems, error: checkError } = await supabaseAdmin
            .from('menu_items_amharic')
            .select('id')
            .eq('restaurant_id', user.restaurant_id)
            .eq('category_id', id)
            .limit(1);

        if (checkError) throw checkError;

        if (menuItems && menuItems.length > 0) {
            return NextResponse.json(
                { error: 'Cannot delete category that contains menu items' },
                { status: 400 }
            );
        }

        const { error } = await supabaseAdmin
            .from('categories_amharic')
            .delete()
            .eq('id', id)
            .eq('restaurant_id', user.restaurant_id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting Amharic category:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
