import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getUserFromRequest, isSuperAdmin } from '@/lib/auth';
import { supabaseAdmin, uploadFile, getPublicUrl } from '@/lib/supabase';

export async function GET(request, { params }) {
    const { id } = await params;

    try {
        const authResult = await getUserFromRequest(request);

        if (!authResult.success) {
            return NextResponse.json(
                { success: false, message: 'Authentication required' },
                { status: 401 }
            );
        }

        const { data, error } = await supabaseAdmin
            .from('restaurants')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error fetching restaurant:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch restaurant' },
            { status: 500 }
        );
    }
}

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

        const contentType = request.headers.get('content-type') || '';
        let updateData = {};

        // Handle JSON requests (e.g., comment toggle)
        if (contentType.includes('application/json')) {
            updateData = await request.json();
        }
        // Handle FormData requests (e.g., full restaurant update with logo)
        else {
            const formData = await request.formData();
            const name = formData.get('name');
            const slug = formData.get('slug');
            const description = formData.get('description');
            const comment = formData.get('comment');
            const logoFile = formData.get('logo');

            if (name) updateData.name = name;
            if (slug) updateData.slug = slug.toLowerCase();
            if (description !== null) updateData.description = description;
            if (comment !== null) updateData.comment = comment === 'true';

            if (logoFile) {
                const fileBuffer = await logoFile.arrayBuffer();
                const fileName = `${slug || id}-${Date.now()}.${logoFile.name.split('.').pop()}`;
                await uploadFile('restaurant-logos', fileName, Buffer.from(fileBuffer), {
                    contentType: logoFile.type
                });
                updateData.logo_url = getPublicUrl('restaurant-logos', fileName);
            }
        }

        const { data, error } = await supabaseAdmin
            .from('restaurants')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: 'Restaurant updated successfully',
            data
        });
    } catch (error) {
        console.error('Error updating restaurant:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update restaurant' },
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
            .from('restaurants')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: 'Restaurant deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting restaurant:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to delete restaurant' },
            { status: 500 }
        );
    }
}
