import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request) {
    try {
        const authResult = await getUserFromRequest(request);
        if (!authResult.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = authResult.user;

        const { data, error } = await supabaseAdmin
            .from('categories_amharic')
            .select('*')
            .eq('restaurant_id', user.restaurant_id)
            .order('id');

        if (error) throw error;

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Error fetching Amharic categories:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const authResult = await getUserFromRequest(request);
        if (!authResult.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = authResult.user;
        const body = await request.json();
        const { id, name, description } = body;

        let query;
        if (id) {
            // Update
            query = supabaseAdmin
                .from('categories_amharic')
                .update({ name, description, updated_at: new Date().toISOString() })
                .eq('id', id)
                .eq('restaurant_id', user.restaurant_id);
        } else {
            // Create
            query = supabaseAdmin
                .from('categories_amharic')
                .insert({
                    restaurant_id: user.restaurant_id,
                    name,
                    description
                });
        }

        const { data, error } = await query.select().single();

        if (error) throw error;

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Error saving Amharic category:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
