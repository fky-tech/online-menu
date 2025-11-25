import { NextResponse } from 'next/server';
import { getUserFromRequest, isSuperAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(request, { params }) {
    const { id } = await params;

    try {
        const authResult = await getUserFromRequest(request);

        if (!authResult.success || !isSuperAdmin(authResult.user)) {
            return NextResponse.json(
                { success: false, message: 'Super admin access required' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { plan_type, start_date, end_date, is_active } = body;

        const { data, error } = await supabaseAdmin
            .from('subscriptions')
            .update({
                plan_type,
                start_date,
                end_date,
                is_active
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: 'Subscription updated successfully',
            data
        });
    } catch (error) {
        console.error('Error updating subscription:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update subscription' },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    const { id } = await params;

    try {
        const authResult = await getUserFromRequest(request);

        if (!authResult.success || !isSuperAdmin(authResult.user)) {
            return NextResponse.json(
                { success: false, message: 'Super admin access required' },
                { status: 403 }
            );
        }

        const { error } = await supabaseAdmin
            .from('subscriptions')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: 'Subscription deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting subscription:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to delete subscription' },
            { status: 500 }
        );
    }
}
