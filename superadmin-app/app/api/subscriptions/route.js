import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getUserFromRequest, isSuperAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
// GET all subscriptions (super admin)
export async function GET(request) {
    try {
        const authResult = await getUserFromRequest(request);

        if (!authResult.success || !isSuperAdmin(authResult.user)) {
            return NextResponse.json(
                { success: false, message: 'Super admin access required' },
                { status: 403 }
            );
        }

        const { data, error } = await supabaseAdmin
            .from('subscriptions')
            .select('*, restaurants(name, slug, restaurant_admin_credentials(admin_email, plain_password))')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data: data || []
        });
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch subscriptions' },
            { status: 500 }
        );
    }
}

// POST create subscription
export async function POST(request) {
    try {
        const authResult = await getUserFromRequest(request);

        if (!authResult.success || !isSuperAdmin(authResult.user)) {
            return NextResponse.json(
                { success: false, message: 'Super admin access required' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { restaurant_id, plan_type, start_date, end_date, is_active } = body;

        if (!restaurant_id || !plan_type || !start_date || !end_date) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }

        const { data, error } = await supabaseAdmin
            .from('subscriptions')
            .insert({
                restaurant_id,
                package_name: plan_type, // Map plan_type to package_name
                start_date,
                end_date,
                status: is_active ? 'active' : 'expired',
                price: 0
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: 'Subscription created successfully',
            data
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating subscription:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create subscription' },
            { status: 500 }
        );
    }
}
