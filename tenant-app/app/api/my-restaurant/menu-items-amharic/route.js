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

        const { data, error } = await supabaseAdmin
            .from('menu_items_amharic')
            .select('*')
            .eq('restaurant_id', user.restaurant_id)
            .order('category_id', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Error fetching Amharic menu items:', error);
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

        const contentType = request.headers.get('content-type') || '';
        let id, category_id, name, description, price, image_url, is_available;

        if (contentType.includes('application/json')) {
            const body = await request.json();
            ({ id, category_id, name, description, price, image_url, is_available } = body);
        } else {
            // Handle FormData
            const formData = await request.formData();
            id = formData.get('id');
            category_id = formData.get('category_id');
            name = formData.get('name');
            description = formData.get('description');
            price = formData.get('price');
            is_available = formData.get('is_available');

            const imageFile = formData.get('image');
            const imageUrlParam = formData.get('image_url');

            if (imageFile) {
                const { uploadFile, getPublicUrl } = await import('@/lib/supabase');
                const fileBuffer = await imageFile.arrayBuffer();
                const fileName = `${user.restaurant_id}-${Date.now()}.${imageFile.name.split('.').pop()}`;
                await uploadFile('menu-images', fileName, Buffer.from(fileBuffer), {
                    contentType: imageFile.type
                });
                image_url = getPublicUrl('menu-images', fileName);
            } else {
                image_url = imageUrlParam;
            }
        }

        let query;
        if (id) {
            // Update
            query = supabaseAdmin
                .from('menu_items_amharic')
                .update({
                    category_id,
                    name,
                    description,
                    price,
                    image_url,
                    is_available,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .eq('restaurant_id', user.restaurant_id);
        } else {
            // Create
            query = supabaseAdmin
                .from('menu_items_amharic')
                .insert({
                    restaurant_id: user.restaurant_id,
                    category_id,
                    name,
                    description,
                    price,
                    image_url,
                    is_available: is_available ?? true
                });
        }

        const { data, error } = await query.select().single();

        if (error) throw error;

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Error saving Amharic menu item:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
