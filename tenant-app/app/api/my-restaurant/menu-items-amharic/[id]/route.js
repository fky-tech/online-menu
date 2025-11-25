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

        const { error } = await supabaseAdmin
            .from('menu_items_amharic')
            .delete()
            .eq('id', id)
            .eq('restaurant_id', user.restaurant_id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting Amharic menu item:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
