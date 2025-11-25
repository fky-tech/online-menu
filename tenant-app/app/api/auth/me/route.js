import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';


export const dynamic = 'force-dynamic';
export async function GET(request) {
    try {
        const authResult = await getUserFromRequest(request);

        if (!authResult.success) {
            return NextResponse.json(
                { success: false, message: authResult.message },
                { status: 401 }
            );
        }

        const { user, supabaseClient } = authResult;

        // Get full user metadata
        const { data: userMetadata } = await supabaseClient
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        let restaurant = null;
        if (userMetadata?.role === 'tenant_admin' && userMetadata?.restaurant_id) {
            const { data: rest } = await supabaseClient
                .from('restaurants')
                .select('*')
                .eq('id', userMetadata.restaurant_id)
                .single();
            restaurant = rest;
        }

        return NextResponse.json({
            success: true,
            data: {
                id: userMetadata.id,
                email: userMetadata.email,
                role: userMetadata.role,
                restaurant_id: userMetadata.restaurant_id,
                name: userMetadata.name,
                restaurant
            }
        });
    } catch (error) {
        console.error('Error in whoAmI:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to get user information' },
            { status: 500 }
        );
    }
}
