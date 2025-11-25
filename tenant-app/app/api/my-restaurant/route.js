import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';


export const dynamic = 'force-dynamic';
export async function GET(request) {
    try {
        const authResult = await getUserFromRequest(request);
        if (!authResult.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = authResult.user;
        console.log('Fetching restaurant for admin_id:', user.id);

        // Get user's restaurant
        const { data: restaurant, error } = await supabaseAdmin
            .from('restaurants')
            .select('*')
            .eq('id', user.restaurant_id)
            .single();

        console.log('Restaurant query result:', { restaurant, error });

        if (error || !restaurant) {
            return NextResponse.json({ error: 'Restaurant not found for this account.' }, { status: 404 });
        }

        return NextResponse.json({ data: restaurant });
    } catch (error) {
        console.error('Error fetching my restaurant:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const authResult = await getUserFromRequest(request);
        if (!authResult.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = authResult.user;

        const body = await request.json();
        const { name, contact_email, contact_phone, address } = body;

        // Get user's restaurant
        const { data: restaurant } = await supabaseAdmin
            .from('restaurants')
            .select('id')
            .eq('id', user.restaurant_id)
            .single();

        if (!restaurant) {
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
        }

        // Update restaurant
        const { data: updated, error } = await supabaseAdmin
            .from('restaurants')
            .update({
                name,
                contact_email,
                contact_phone,
                address,
                updated_at: new Date().toISOString()
            })
            .eq('id', restaurant.id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ data: updated });
    } catch (error) {
        console.error('Error updating restaurant:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
